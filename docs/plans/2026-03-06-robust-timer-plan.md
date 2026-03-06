# Robust Timer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix premature timer completion by eliminating the polling race condition and making the server the sole timer authority.

**Architecture:** Combine two separate polling endpoints into one atomic `modalState` query, remove frontend auto-skip logic from TimerModal, and clear stale message state during modal transitions.

**Tech Stack:** tRPC router, React Query polling, Chakra UI modal

**Design doc:** `docs/plans/2026-03-06-robust-timer-design.md`

---

### Task 1: Clear stale message in `_ensureModalReady`

**Files:**
- Modify: `controller/server/command_queue.ts:315-336`

**Step 1: Add message reset to `_ensureModalReady`**

In `controller/server/command_queue.ts`, find the `_ensureModalReady` method (line 315). After `this._isWaitingForInput = false;` (line 331), add a line to reset `_currentMessage`:

```typescript
private async _ensureModalReady(): Promise<void> {
  if (this._isWaitingForInput) {
    // Clear any active timer
    if (this._timerTimeout) {
      clearTimeout(this._timerTimeout);
      this._timerTimeout = undefined;
    }

    // If there's a pending promise, resolve it to prevent memory leaks
    if (this._messageResolve) {
      this._messageResolve();
      this._messageResolve = undefined;
    }

    // Reset the state
    this._isWaitingForInput = false;
    this._currentMessage = { type: "pause", message: "" };

    // Add a small delay to ensure all state updates have propagated
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
```

The only change is adding `this._currentMessage = { type: "pause", message: "" };` after line 331.

**Step 2: Verify build**

Run: `cd controller && npm run test`
Expected: PASS (tsc --noEmit succeeds)

**Step 3: Commit**

```bash
git add controller/server/command_queue.ts
git commit -m "fix: clear stale message data in _ensureModalReady"
```

---

### Task 2: Add combined `modalState` endpoint

**Files:**
- Modify: `controller/server/routers/command_queue.ts:98-131`

**Step 1: Add `modalState` query to the router**

In `controller/server/routers/command_queue.ts`, add a new endpoint after the existing `currentMessage` endpoint (after line 131). This combines `isWaitingForInput` and `currentMessage` into a single atomic response:

```typescript
modalState: procedure.query(async () => {
  const message = CommandQueue.global.currentMessage;
  return {
    isWaiting: CommandQueue.global.isWaitingForInput,
    message: {
      ...message,
      ...(message.formName ? { formName: message.formName } : {}),
    },
  };
}),
```

Keep the existing `isWaitingForInput` and `currentMessage` endpoints — they may be used elsewhere and removing them is out of scope.

**Step 2: Verify build**

Run: `cd controller && npm run test`
Expected: PASS

**Step 3: Commit**

```bash
git add controller/server/routers/command_queue.ts
git commit -m "feat: add combined modalState endpoint for atomic polling"
```

---

### Task 3: Switch frontend to combined `modalState` endpoint

**Files:**
- Modify: `controller/components/runs/RunsComponent.tsx:118-204`

**Step 1: Replace separate queries with combined query**

In `controller/components/runs/RunsComponent.tsx`, remove the two separate queries (lines 118-126):

```typescript
// REMOVE these two queries:
const isWaitingForInputQuery = trpc.commandQueue.isWaitingForInput.useQuery(undefined, {
  refetchInterval: 1000,
});

const currentMessageQuery = trpc.commandQueue.currentMessage.useQuery(undefined, {
  refetchInterval: 1000,
});
```

Replace them with a single combined query:

```typescript
// Combined modal state query — atomic to prevent race conditions
const modalStateQuery = trpc.commandQueue.modalState.useQuery(undefined, {
  refetchInterval: 1000,
});
```

**Step 2: Update the useEffect that derives modal state**

Replace the `useEffect` at lines 168-204 with:

```typescript
useEffect(() => {
  if (!modalStateQuery.data) return;

  const { isWaiting, message } = modalStateQuery.data;

  const newMessageData = {
    type: message.type,
    message: message.message,
    ...(message.title ? { title: message.title } : {}),
    ...(message.pausedAt ? { pausedAt: message.pausedAt } : {}),
    ...(message.timerDuration ? { timerDuration: message.timerDuration } : {}),
    ...(message.timerEndTime ? { timerEndTime: message.timerEndTime } : {}),
    ...(message.formName ? { formName: message.formName } : {}),
  };

  setMessageData(newMessageData);

  const shouldShowUserForm = isWaiting && message.type === "user_form";
  setIsModalOpen(isWaiting && message.type !== "user_form");
  setIsUserFormModalOpen(shouldShowUserForm);

  // Reset form state when message type changes
  if (message.type !== "user_form") {
    setCurrentForm(null);
    setUserFormError(null);
  }
}, [modalStateQuery.data]);
```

Key differences from the old code:
- Single dependency (`modalStateQuery.data`) instead of two separate query results
- `isWaiting` and `message` are always from the same server snapshot
- No more race where `isWaiting=true` pairs with stale message data

**Step 3: Verify build**

Run: `cd controller && npm run test`
Expected: PASS

**Step 4: Commit**

```bash
git add controller/components/runs/RunsComponent.tsx
git commit -m "fix: use atomic modalState query to prevent timer race condition"
```

---

### Task 4: Remove frontend auto-skip from TimerModal

**Files:**
- Modify: `controller/components/runs/TimerModal.tsx:70-141`

**Step 1: Replace the timer useEffect**

In `controller/components/runs/TimerModal.tsx`, replace the entire `useEffect` (lines 70-141) with a version that never auto-skips:

```typescript
// Initialize and update timer
useEffect(() => {
  // Handle component mounting/unmounting
  isActiveRef.current = true;
  hasSkippedRef.current = false;

  // Don't do anything if not open
  if (!isOpen || !messageData.timerEndTime) {
    return () => {
      isActiveRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }

  // Calculate initial state
  const endTime = messageData.timerEndTime;
  const duration = messageData.timerDuration || 0;

  // Set up the update function — display only, no auto-skip
  const updateTimer = () => {
    if (!isActiveRef.current) return;

    const currentTime = Date.now();
    const timeLeft = Math.max(0, endTime - currentTime);
    const secondsLeft = Math.ceil(timeLeft / 1000);
    const totalDuration = Math.ceil(duration / 1000);
    const progressPercent = duration > 0 ? Math.max(0, Math.min(100, (timeLeft / duration) * 100)) : 0;

    setRemainingSeconds(secondsLeft);
    setTotalSeconds(totalDuration);
    setProgress(progressPercent);
  };

  // Initial update
  updateTimer();

  // Set up interval for updates
  timerRef.current = setInterval(updateTimer, 100);

  // Cleanup function
  return () => {
    isActiveRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
}, [isOpen, messageData.timerEndTime, messageData.timerDuration]);
```

Key changes from original:
- Removed `if (now >= endTime) { handleSkip() }` block that auto-skipped when timer appeared already expired
- Removed `if (secondsLeft <= 0) { handleSkip() }` in `updateTimer` that auto-skipped during countdown
- Removed `onSkip` from useEffect dependency array (it's no longer called inside)
- Timer reaches 00:00 and stays there; modal closes when the next poll returns `isWaiting: false`

**Step 2: Verify build**

Run: `cd controller && npm run test`
Expected: PASS

**Step 3: Commit**

```bash
git add controller/components/runs/TimerModal.tsx
git commit -m "fix: remove frontend auto-skip — server is sole timer authority"
```

---

### Task 5: Manual verification

**Step 1: Start the dev environment**

Run: `docker-compose -f docker-compose.dev.yml up --build`

**Step 2: Test timer behavior**

1. Create or import a protocol with a Tool Box timer command (e.g., 60 seconds)
2. Queue a run and observe the timer modal
3. Verify: timer modal opens with correct countdown (not 00:00)
4. Verify: timer counts down fully to 00:00
5. Verify: modal closes within ~1 second after countdown reaches 00:00
6. Verify: "Skip Timer" button still works to manually skip

**Step 3: Test back-to-back timers**

1. Create a protocol with two consecutive timer commands (e.g., 30s then 30s)
2. Queue and run
3. Verify: first timer counts down fully
4. Verify: second timer starts with correct duration (not stale data from first)

**Step 4: Test timer after other modal types**

1. Create a protocol with: show_message -> timer -> pause
2. Queue and run
3. Verify: clicking Continue on the message leads to the timer starting correctly
4. Verify: timer completes and pause modal appears correctly

**Step 5: Final commit**

```bash
git add -A
git commit -m "fix: robust timer — prevent premature completion via atomic polling and server-only authority"
```
