import { z } from "zod";

export const zInitialize = z.object({
  profile: z.string(),
});

export const zMix = z.object({
  volume: z.number(),
  pre_aspirate_volume: z.number(),
  blow_out_volume: z.number(),
  cycles: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number(),
  retract_distance_per_microliter: z.number(),
});

export const zWash = z.object({
  volume: z.number(),
  empty_tips: z.boolean(),
  pre_aspirate_volume: z.number(),
  blow_out_volume: z.number(),
  cycles: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number(),
  retract_distance_per_microliter: z.number(),
  pump_in_flow_speed: z.number(),
  pump_out_flow_speed: z.number(),
});

export const zAspirate = z.object({
  volume: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number().optional(),
  pre_aspirate_volume: z.number().optional(),
  post_aspirate_volume: z.number().optional(),
  retract_distance_per_microliter: z.number().optional(),
});

export const zDispense = z.object({
  volume: z.number(),
  empty_tips: z.boolean(),
  blow_out_volume: z.number(),
  plate_location: z.number(),
  distance_from_well_bottom: z.number().optional(),
  retract_distance_per_microliter: z.number().optional(),
});

export const zTipsOn = z.object({
  plate_location: z.number(),
});

export const zTipsOff = z.object({
  plate_location: z.number(),
});

export const zMoveToLocation = z.object({
  plate_location: z.number(),
  only_z: z.boolean().optional(),
});

export const zSetLabwareAtLocation = z.object({
  plate_location: z.number(),
  labware_type: z.string(),
});

export const zSetLiquidClass = z.object({
  liquid_class: z.string(),
});

export const zPickAndPlace = z.object({
  source_location: z.number(),
  dest_location: z.number(),
  gripper_offset: z.number(),
  labware_thickness: z.number(),
});

export const zHome = z.object({
  axis: z.enum(["X", "Y", "Z", "W", "G", "Zg"]),
});

const zDeckLayout = z.object({
  "1": z.string().nullish(),
  "2": z.string().nullish(),
  "3": z.string().nullish(),
  "4": z.string().nullish(),
  "5": z.string().nullish(),
  "6": z.string().nullish(),
  "7": z.string().nullish(),
  "8": z.string().nullish(),
  "9": z.string().nullish(),
});

export const zBravoDeckConfig = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required"),
  deck_layout: zDeckLayout,
  workcell_id: z.number(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const zBravoDeckConfigCreate = z.object({
  name: z.string().min(1, "Name is required"),
  deck_layout: zDeckLayout,
});

export const zBravoDeckConfigUpdate = z.object({
  name: z.string().min(1, "Name is required").optional(),
  deck_layout: zDeckLayout.optional(),
});

const zBravoProtocolCommand = z.object({
  id: z.number().optional(),
  command_type: z.enum([
    "home",
    "mix",
    "aspirate",
    "dispense",
    "tips_on",
    "tips_off",
    "move_to_location",
    "configure_deck",
    "show_diagnostics",
    "loop",
    "group",
  ]),
  label: z.string().min(1, "Label is required"),
  params: z.record(z.any()),
  position: z.number(),
  protocol_id: z.number(),
  parent_command_id: z.number().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Zod schema for Bravo sequence
const zBravoProtocol = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().nullish(),
  tool_id: z.number(),
  commands: z
    .array(z.lazy(() => zBravoProtocolCommand))
    .optional()
    .default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export const zBravoProtocolCreate = zBravoProtocol.omit({
  id: true,
  commands: true,
  created_at: true,
  updated_at: true,
});

export const zBravoProtocolUpdate = zBravoProtocol
  .partial()
  .omit({ created_at: true, updated_at: true, commands: true });

export const zBravoProtocolCommandCreate = zBravoProtocolCommand.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const zBravoProtocolCommandUpdate = zBravoProtocolCommand
  .partial()
  .omit({ created_at: true, updated_at: true });

//Export types used by components (transform schemas to types)
export type BravoDeckConfig = z.infer<typeof zBravoDeckConfig>;
export type BravoDeckConfigCreate = z.infer<typeof zBravoDeckConfigCreate>;
export type BravoDeckConfigUpdate = z.infer<typeof zBravoDeckConfigUpdate>;
export type DeckLayout = z.infer<typeof zDeckLayout>;

export type BravoProtocol = z.infer<typeof zBravoProtocol>;
export type BravoProtocolCreate = z.infer<typeof zBravoProtocolCreate>;
export type BravoProtocolUpdate = z.infer<typeof zBravoProtocolUpdate>;
export type BravoProtocolCommandCreate = z.infer<typeof zBravoProtocolCommandCreate>;
export type BravoProtocolCommandUpdate = z.infer<typeof zBravoProtocolCommandUpdate>;
export type BravoProtocolCommand = z.infer<typeof zBravoProtocolCommand> & {
  child_commands?: BravoProtocolCommand[];
};
