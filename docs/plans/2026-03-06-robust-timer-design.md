# Robust Timer Design

## Problem

The Tool Box timer command intermittently completes early during protocol execution. Two observed failure modes:

1. Timer modal appears with "00:00" and immediately dismisses (never counts down)
2. Timer starts counting but skips after a few seconds instead of the full duration

## Root Causes

### 1. Stale message data race condition

The frontend polls two independent endpoints at 1-second intervals:
- `isWaitingForInput` (boolean) — controls whether the modal opens
- `currentMessage` (UIMessage) — provides timer data including `timerEndTime`

These can return out of sync. When a new timer starts after a previous modal, the frontend may receive `isWaitingForInput = true` while `currentMessage` still contains stale data from the previous timer (whose `timerEndTime` has already passed). The TimerModal opens, sees `Date.now() >= endTime`, and immediately auto-skips.

### 2. Frontend auto-skip acts as unauthorized timer authority

TimerModal.tsx contains logic that calls `handleSkip()` -> `resumeMutation.mutate()` when it calculates `secondsLeft <= 0`. This means the frontend can unilaterally end a server-side timer via the resume endpoint. The server's `setTimeout` (the canonical timer) becomes just a backup. Any stale data, React re-render, or timing glitch triggers premature completion.

## Design

### Change 1: Combined `modalState` endpoint

Replace the two separate polling endpoints with a single atomic query.

**Server** (`server/routers/command_queue.ts`):
- New `modalState` query returning `{ isWaiting: boolean, message: UIMessage }` in one response

**Frontend** (`components/runs/RunsComponent.tsx`):
- Single `trpc.commandQueue.modalState.useQuery` replaces both `isWaitingForInput` and `currentMessage` queries
- `useEffect` derives `isModalOpen` and `messageData` from the same query result

### Change 2: Remove frontend auto-skip from TimerModal

**TimerModal.tsx**:
- Remove `if (now >= endTime) { handleSkip() }` block (the "show 0 and dismiss" path)
- Remove `if (secondsLeft <= 0) { handleSkip() }` in `updateTimer` (the "skip after a few seconds" path)
- When countdown reaches 0, display "00:00" and wait for next poll to show `isWaiting: false`
- Keep manual "Skip Timer" button for intentional user action

Server's `setTimeout` in `startTimer()` becomes the sole authority on timer completion. Worst case: ~1 second visual lag between "00:00" display and modal closing (one poll cycle).

### Change 3: Clear stale message in `_ensureModalReady`

**Server** (`server/command_queue.ts`):
- In `_ensureModalReady`, reset `_currentMessage` to a neutral state when clearing a previous modal
- Prevents stale timer data from being served during the 1-second transition gap between modals

## Files to Modify

1. `controller/server/routers/command_queue.ts` — add `modalState` endpoint
2. `controller/components/runs/RunsComponent.tsx` — use combined endpoint, remove separate queries
3. `controller/components/runs/TimerModal.tsx` — remove auto-skip logic
4. `controller/server/command_queue.ts` — clear `_currentMessage` in `_ensureModalReady`
