import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "@/components/ui/Toast";

export type TutorialDemoData = {
  workcell?: { id?: number; name: string };
  tools?: Array<{ id?: number; name: string; type: string; toolId: string }>;
  variables?: Array<{ id?: number; name: string }>;
  scripts?: Array<{ id?: number; name: string }>;
  protocols?: Array<{ id?: number; name: string }>;
  labware?: Array<{ id?: number; name: string }>;
  forms?: Array<{ id?: number; name: string }>;
  inventory?: {
    hotel?: { id?: number; name: string };
    nests?: Array<{ id?: number; name: string }>;
    plates?: Array<{ id?: number; name: string; barcode: string }>;
  };
};

type TutorialTool = NonNullable<TutorialDemoData["tools"]>[number];
type TutorialVariable = NonNullable<TutorialDemoData["variables"]>[number];
type IdName = { id?: number; name?: string };

export type TutorialStep = {
  id: string;
  route: string;
  title: string;
  body: React.ReactNode;
};

type TutorialContextValue = {
  isOpen: boolean;
  isMinimized: boolean;
  stepIndex: number;
  steps: TutorialStep[];
  isBusy: boolean;
  useDemoData: boolean;
  demoData?: TutorialDemoData;
  hasQueuedTutorialRun: boolean;
  open: () => void;
  start: (opts?: { useDemoData?: boolean }) => Promise<void>;
  close: () => void;
  minimize: () => void;
  resume: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  resetDemoData: () => Promise<void>;
  queueTutorialRun: (opts?: { numberOfRuns?: number; force?: boolean }) => Promise<void>;
  setUseDemoData: (v: boolean) => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

const TUTORIAL_STORAGE_KEY = "galago_tutorial_v1";

function safeToIdSuffix() {
  try {
    const arr = new Uint32Array(1);
    globalThis.crypto?.getRandomValues?.(arr);
    const n = Number(arr[0] % 1000);
    return String(n).padStart(3, "0");
  } catch {
    const n = Math.floor(Math.random() * 1000);
    return String(n).padStart(3, "0");
  }
}

export function TutorialProvider({
  children,
  steps,
}: {
  children: React.ReactNode;
  steps: TutorialStep[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [useDemoData, setUseDemoData] = useState(true);
  const [demoData, setDemoData] = useState<TutorialDemoData | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [hasQueuedTutorialRun, setHasQueuedTutorialRun] = useState(false);
  const lastNavRef = useRef<string | null>(null);
  const isQueueingTutorialRunRef = useRef(false);

  const addWorkcell = trpc.workcell.add.useMutation();
  const setSelectedWorkcell = trpc.workcell.setSelectedWorkcell.useMutation();
  const addVariable = trpc.variable.add.useMutation();
  const addScript = trpc.script.add.useMutation();
  const createProtocol = trpc.protocol.create.useMutation();
  const addTool = trpc.tool.add.useMutation();
  const addLabware = trpc.labware.add.useMutation();
  const addForm = trpc.form.add.useMutation();
  const createHotel = trpc.inventory.createHotel.useMutation();
  const createNest = trpc.inventory.createNest.useMutation();
  const createPlate = trpc.inventory.createPlate.useMutation();
  const createRun = trpc.run.create.useMutation();

  const deleteWorkcell = trpc.workcell.delete.useMutation();
  const deleteVariable = trpc.variable.delete.useMutation();
  const deleteScript = trpc.script.delete.useMutation();
  const deleteProtocol = trpc.protocol.delete.useMutation();
  const deleteTool = trpc.tool.delete.useMutation();
  const deleteLabware = trpc.labware.delete.useMutation();
  const deleteForm = trpc.form.delete.useMutation();
  const deleteHotel = trpc.inventory.deleteHotel.useMutation();
  const deleteNest = trpc.inventory.deleteNest.useMutation();
  const deletePlate = trpc.inventory.deletePlate.useMutation();

  const navigateTo = useCallback(
    (route: string) => {
      if (router.pathname === route) return;
      if (lastNavRef.current === route) return;
      lastNavRef.current = route;
      router.push(route).finally(() => {
        // allow future navigations
        setTimeout(() => {
          if (lastNavRef.current === route) lastNavRef.current = null;
        }, 250);
      });
    },
    [router],
  );

  const open = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const seedDemoData = useCallback(async (): Promise<TutorialDemoData | undefined> => {
    const suffix = safeToIdSuffix();
    try {
      const workcell = await addWorkcell.mutateAsync({
        name: `Tutorial Workcell ${suffix}`,
        location: "Tutorial",
        description: "Auto-created for the in-app walkthrough. Safe to delete.",
      });

      if (workcell?.name) {
        await setSelectedWorkcell.mutateAsync(workcell.name);
      }

      // Tools for the tutorial workcell
      const toolSpecs = [
        { type: "pf400", name: `Tutorial PF400 ${suffix}`, imageUrl: "/tool_icons/pf400.png" },
        {
          type: "opentrons2",
          name: `Tutorial Opentrons ${suffix}`,
          imageUrl: "/tool_icons/opentrons2.png",
        },
        {
          type: "cytation",
          name: `Tutorial Cytation ${suffix}`,
          imageUrl: "/tool_icons/cytation.png",
        },
        {
          type: "liconic",
          name: `Tutorial Liconic ${suffix}`,
          imageUrl: "/tool_icons/liconic.png",
        },
      ];

      const tools: TutorialTool[] = [];
      for (const spec of toolSpecs) {
        const hardcodedConfigByType: Record<string, any> = {
          pf400: {
            host: "127.0.0.1",
            port: 10000,
            joints: 6,
            gpl_version: "v2",
          },
          opentrons2: {
            robot_ip: "127.0.0.1",
            // Common OT-2 HTTP API port; drivers may ignore this when simulated
            robot_port: 31950,
          },
          cytation: {
            protocol_dir: "C://protocols",
            experiment_dir: "C://experiments",
            reader_type: "CYTATION_READER_CYTATION5",
          },
          liconic: {
            // Serial port is driver-specific; keep a clear placeholder for demo/sim
            com_port: "SIMULATED",
          },
        };

        const created = (await addTool.mutateAsync({
          type: spec.type as any,
          name: spec.name,
          imageUrl: spec.imageUrl,
          description: "Auto-created for the in-app walkthrough. Safe to delete.",
          ip: "localhost",
          config: {
            toolId: spec.name,
            simulated: true,
            [spec.type]: hardcodedConfigByType[spec.type] ?? {},
          },
        })) as IdName & { type?: string };
        tools.push({
          id: created?.id,
          name: created?.name ?? spec.name,
          type: created?.type ?? spec.type,
          toolId: created?.name ?? spec.name,
        });
      }

      // Inventory: a static hotel with nests and a sample plate
      const hotel = await createHotel.mutateAsync({
        name: `Tutorial Static Hotel ${suffix}`,
        rows: 4,
        columns: 6,
      });

      const nests: Array<{ id?: number; name: string }> = [];
      for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 6; c++) {
          const nest = (await createNest.mutateAsync({
            name: `H${r}-${c}`,
            row: r,
            column: c,
            hotelId: hotel?.id,
          })) as IdName;
          nests.push({ id: nest?.id, name: nest?.name ?? `H${r}-${c}` });
        }
      }

      const firstNestId = nests[0]?.id ?? null;
      const plateBarcode = `TUTORIAL-PLATE-${suffix}`;
      const plate = firstNestId
        ? await createPlate.mutateAsync({
            name: `Tutorial Culture Plate ${suffix}`,
            barcode: plateBarcode,
            plateType: "96_well_plate",
            nestId: firstNestId,
          })
        : null;

      // Variables used across scripts/protocols
      const variableSpecs = [
        { name: `tutorial_plate_barcode_${suffix}`, value: plateBarcode, type: "string" as const },
        { name: `tutorial_media_volume_ul_${suffix}`, value: "200", type: "number" as const },
        { name: `tutorial_exchange_fraction_${suffix}`, value: "0.5", type: "number" as const },
        { name: `tutorial_liconic_cassette_${suffix}`, value: "1", type: "number" as const },
        { name: `tutorial_liconic_level_${suffix}`, value: "1", type: "number" as const },
        {
          name: `tutorial_opentrons_program_${suffix}`,
          value: "media_exchange_demo.py",
          type: "string" as const,
        },
        {
          name: `tutorial_cytation_protocol_${suffix}`,
          value: "C://protocols//media_exchange.prt",
          type: "string" as const,
        },
      ];

      const variables: TutorialVariable[] = [];
      for (const v of variableSpecs) {
        const created = (await addVariable.mutateAsync(v)) as IdName;
        variables.push({ id: created?.id, name: created?.name ?? v.name });
      }

      // Unused helper function - commented out
      // const __varName = (prefix: string) =>
      //   variables.find((v) => v.name.startsWith(prefix + "_"))?.name ?? `${prefix}_${suffix}`;

      // Scripts
      const createVariablesScript = await addScript.mutateAsync({
        name: "create_variables",
        language: "python",
        folderId: null,
        content: [
          "from tools.toolbox.variables import get_variable, update_variable, create_variable",
          "",
          "variables_to_create = [",
          "    {",
          '        "name":"counter",',
          '        "value":"0",',
          '        "type":"number",',
          "    },",
          "    {",
          '        "name":"confirm_message",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"total_plates",',
          '        "value":"0",',
          '        "type":"number",',
          "    },",
          "    {",
          '        "name":"tmp_file",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"current_barcode",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"all_barcodes",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"plate_type",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"media_lot",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"media_type",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"label_date",',
          '        "value":"",',
          '        "type":"string",',
          "    },",
          "    {",
          '        "name":"seal_plate",',
          '        "value":"False",',
          '        "type":"boolean",',
          "    },",
          "    {",
          '        "name":"fill_plate",',
          '        "value":"False",',
          '        "type":"boolean",',
          "    },",
          "    {",
          '        "name":"dispense_volume",',
          '        "value":"100",',
          '        "type":"number",',
          "    },",
          "    {",
          '        "name":"current_source_stack",',
          '        "value":"1",',
          '        "type":"number"',
          "    },",
          "    {",
          '        "name":"current_dest_stack",',
          '        "value":"14",',
          '        "type":"number"',
          "    },",
          "    {",
          '        "name":"plate_height",',
          '        "value":"14",',
          '        "type":"number"',
          "    },",
          "    {",
          '        "name":"stack_height",',
          '        "value":"14",',
          '        "type":"number"',
          "    },",
          "    {",
          '        "name":"stack_thickness",',
          '        "value":"14",',
          '        "type":"number"',
          "    }",
          "]",
          "",
          "for var in variables_to_create:",
          '    exists = get_variable(var["name"])',
          "    if not exists:",
          "        print(f\"Variable {var['name']} does not exist. Will create it\")",
          "        create_variable(var)",
        ].join("\n"),
      });

      const scripts = [
        { id: createVariablesScript?.id, name: createVariablesScript?.name ?? "create_variables" },
      ];

      // Labware: a simple 96-well plate definition (safe to delete)
      const tutorialLabware = await addLabware.mutateAsync({
        name: `Tutorial 96 Well Plate ${suffix}`,
        description: "Tutorial labware definition (safe to delete).",
        numberOfRows: 8,
        numberOfColumns: 12,
        zOffset: 0,
        width: 0,
        height: 0,
        plateLidOffset: 0,
        lidOffset: 0,
        stackHeight: 0,
        hasLid: false,
      });
      const labware = [
        {
          id: tutorialLabware?.id,
          name: tutorialLabware?.name ?? `Tutorial 96 Well Plate ${suffix}`,
        },
      ];

      // Forms: a simple operator input form (safe to delete)
      const tutorialForm = await addForm.mutateAsync({
        name: `Tutorial Operator Check-in ${suffix}`,
        backgroundColor: null,
        fontColor: null,
        fields: [
          {
            type: "label",
            label: "Tutorial form: confirm setup before running.",
            required: false,
            placeholder: null,
            options: null,
            default_value: null,
            mapped_variable: null,
          },
          {
            type: "text",
            label: "Operator initials",
            required: true,
            placeholder: "e.g. MM",
            options: null,
            default_value: null,
            mapped_variable: null,
          },
          {
            type: "checkbox",
            label: "Plate sealed",
            required: false,
            placeholder: null,
            options: null,
            default_value: null,
            mapped_variable: null,
          },
        ],
      });
      const forms = [
        {
          id: tutorialForm?.id,
          name: tutorialForm?.name ?? `Tutorial Operator Check-in ${suffix}`,
        },
      ];

      // Protocol: Media Exchange (uses real command schema + variable references like {{var}})
      const toolIdByType = (type: string) => tools.find((t) => t.type === type)?.toolId ?? type;

      // Protocol: keep it self-contained so the tutorial is functional even without instrument programs/files.
      const protocolCommands = [
        {
          toolId: "Tool Box",
          toolType: "toolbox",
          command: "show_message",
          params: {
            title: "Tutorial: Create Variables",
            message: "This run will create a small set of demo variables (if they do not exist).",
          },
          label: "Tutorial: overview",
        },
        {
          toolId: toolIdByType("liconic"),
          toolType: "liconic",
          command: "reset",
          params: {},
          label: "Liconic: reset (demo)",
        },
        {
          toolId: toolIdByType("pf400"),
          toolType: "pf400",
          command: "move",
          params: { location: "home", motion_profile: "Default" },
          label: "PF400: move home (demo)",
        },
        {
          toolId: toolIdByType("cytation"),
          toolType: "cytation",
          command: "open_carrier",
          params: {},
          label: "Cytation: open carrier (demo)",
        },
        {
          toolId: "Tool Box",
          toolType: "toolbox",
          command: "run_script",
          params: { name: scripts[0].name, blocking: true },
          label: "Create variables",
        },
        {
          toolId: toolIdByType("cytation"),
          toolType: "cytation",
          command: "close_carrier",
          params: {},
          label: "Cytation: close carrier (demo)",
        },
        {
          toolId: "Tool Box",
          toolType: "toolbox",
          command: "note",
          params: {
            message: "Tutorial protocol complete. Check Variables / Runs / Logs for details.",
          },
          label: "Finish note",
        },
      ];

      const mediaExchangeProtocol = await createProtocol.mutateAsync({
        name: `Tutorial Create Variables ${suffix}`,
        category: "development",
        description:
          "Tutorial walkthrough protocol that creates demo variables via Tool Box (safe to delete).",
        workcellId: workcell?.id,
        commands: protocolCommands,
      });

      const protocols = [
        {
          id: mediaExchangeProtocol?.id,
          name: mediaExchangeProtocol?.name ?? `Tutorial Media Exchange ${suffix}`,
        },
      ];

      return {
        workcell: { id: workcell?.id, name: workcell?.name ?? `Tutorial Workcell ${suffix}` },
        tools,
        variables,
        scripts,
        protocols,
        labware,
        forms,
        inventory: {
          hotel: { id: hotel?.id, name: hotel?.name ?? `Tutorial Static Hotel ${suffix}` },
          nests,
          plates: plate
            ? [
                {
                  id: (plate as any)?.id,
                  name: (plate as any)?.name ?? `Tutorial Culture Plate ${suffix}`,
                  barcode: plateBarcode,
                },
              ]
            : [],
        },
      };
    } catch (e: any) {
      errorToast("Tutorial demo data", e?.message ?? "Failed to create demo data");
      return undefined;
    }
  }, [
    addForm,
    addLabware,
    addScript,
    addTool,
    addVariable,
    addWorkcell,
    createHotel,
    createNest,
    createPlate,
    createProtocol,
    setSelectedWorkcell,
  ]);

  const queueTutorialRun = useCallback(
    async (opts?: { numberOfRuns?: number; force?: boolean }) => {
      const numberOfRuns = Math.max(1, opts?.numberOfRuns ?? 1);

      if (!demoData?.protocols?.length) {
        errorToast("Queue tutorial run", "No tutorial protocol found. Enable demo data first.");
        return;
      }

      if (hasQueuedTutorialRun && !opts?.force) return;
      if (isQueueingTutorialRunRef.current) return;

      const protocolIdRaw = demoData.protocols[0]?.id;
      if (protocolIdRaw == null) {
        errorToast("Queue tutorial run", "Tutorial protocol is missing an id.");
        return;
      }

      setIsBusy(true);
      isQueueingTutorialRunRef.current = true;
      try {
        if (!opts?.force) setHasQueuedTutorialRun(true);

        await createRun.mutateAsync({
          protocolId: protocolIdRaw,
          numberOfRuns,
        });
        setHasQueuedTutorialRun(true);
        successToast(
          "Tutorial run queued",
          `Queued ${numberOfRuns} run${numberOfRuns > 1 ? "s" : ""}.`,
        );
      } catch (e: any) {
        // If this was an auto-queue attempt, allow a later retry.
        if (!opts?.force) setHasQueuedTutorialRun(false);
        errorToast("Queue tutorial run", e?.message ?? "Failed to queue tutorial run");
      } finally {
        isQueueingTutorialRunRef.current = false;
        setIsBusy(false);
      }
    },
    [createRun, demoData, hasQueuedTutorialRun],
  );

  const resetDemoData = useCallback(async () => {
    if (!demoData) return;
    setIsBusy(true);
    try {
      // Best-effort cleanup; order matters for foreign keys in some systems.
      if (demoData.protocols?.length) {
        for (const p of demoData.protocols) {
          if (p.id != null) await deleteProtocol.mutateAsync(p.id);
        }
      }

      if (demoData.forms?.length) {
        for (const f of demoData.forms) {
          if (f.id != null) await deleteForm.mutateAsync(f.id);
        }
      }

      if (demoData.scripts?.length) {
        for (const s of demoData.scripts) {
          if (s.id != null) await deleteScript.mutateAsync(s.id);
        }
      }

      if (demoData.variables?.length) {
        for (const v of demoData.variables) {
          if (v.id != null) await deleteVariable.mutateAsync(v.id);
        }
      }

      if (demoData.labware?.length) {
        for (const lw of demoData.labware) {
          if (lw.id != null) await deleteLabware.mutateAsync(lw.id);
        }
      }

      if (demoData.inventory?.plates?.length) {
        for (const p of demoData.inventory.plates) {
          if (p.id != null) await deletePlate.mutateAsync(p.id);
        }
      }
      if (demoData.inventory?.nests?.length) {
        for (const n of demoData.inventory.nests) {
          if (n.id != null) await deleteNest.mutateAsync(n.id);
        }
      }
      if (demoData.inventory?.hotel?.id != null)
        await deleteHotel.mutateAsync(demoData.inventory.hotel.id);

      if (demoData.tools?.length) {
        for (const t of demoData.tools) {
          await deleteTool.mutateAsync(t.toolId);
        }
      }

      if (demoData.workcell?.id != null) await deleteWorkcell.mutateAsync(demoData.workcell.id);
      setDemoData(undefined);
      setHasQueuedTutorialRun(false);
      successToast("Tutorial demo data removed", "");
    } catch (e: any) {
      errorToast("Tutorial cleanup", e?.message ?? "Failed to remove demo data");
    } finally {
      setIsBusy(false);
    }
  }, [
    deleteHotel,
    deleteForm,
    deleteLabware,
    deleteNest,
    deletePlate,
    deleteProtocol,
    deleteScript,
    deleteTool,
    deleteVariable,
    deleteWorkcell,
    demoData,
  ]);

  const start = useCallback(
    async (opts?: { useDemoData?: boolean }) => {
      setIsOpen(true);
      setIsMinimized(false);
      setStepIndex(0);
      setHasQueuedTutorialRun(false);

      const shouldSeed = opts?.useDemoData ?? useDemoData;
      setUseDemoData(shouldSeed);

      setIsBusy(true);
      try {
        if (shouldSeed) {
          const data = await seedDemoData();
          if (data) setDemoData(data);
        }
        const startIndex = steps.length > 1 ? 1 : 0;
        setStepIndex(startIndex);
        navigateTo(steps[startIndex]?.route ?? "/");
      } finally {
        setIsBusy(false);
      }
    },
    [navigateTo, seedDemoData, steps, useDemoData],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const resume = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      const nextIndex = Math.min(i + 1, steps.length - 1);
      const step = steps[nextIndex];
      if (step) navigateTo(step.route);
      return nextIndex;
    });
  }, [navigateTo, steps]);

  const back = useCallback(() => {
    setStepIndex((i) => {
      const prevIndex = Math.max(i - 1, 0);
      const step = steps[prevIndex];
      if (step) navigateTo(step.route);
      return prevIndex;
    });
  }, [navigateTo, steps]);

  const skip = useCallback(() => {
    try {
      localStorage.setItem(
        TUTORIAL_STORAGE_KEY,
        JSON.stringify({ completed: true, at: Date.now() }),
      );
    } catch {
      // ignore
    }
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const value = useMemo<TutorialContextValue>(
    () => ({
      isOpen,
      isMinimized,
      stepIndex,
      steps,
      isBusy,
      useDemoData,
      demoData,
      hasQueuedTutorialRun,
      open,
      start,
      close,
      minimize,
      resume,
      next,
      back,
      skip,
      resetDemoData,
      queueTutorialRun,
      setUseDemoData,
    }),
    [
      back,
      close,
      demoData,
      hasQueuedTutorialRun,
      isBusy,
      isMinimized,
      isOpen,
      minimize,
      next,
      open,
      resume,
      resetDemoData,
      queueTutorialRun,
      skip,
      start,
      stepIndex,
      steps,
      useDemoData,
    ],
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within TutorialProvider");
  return ctx;
}
