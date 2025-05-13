import { SequenceCommand } from "../../types";

export interface DefaultSequenceTemplate {
  id: string;
  description: string;
  commands: SequenceCommand[];
}

// Default sequence templates
export const DefaultSequences: DefaultSequenceTemplate[] = [
  {
    id: "pick_plate",
    description: "Pick up a plate from the specified location",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 0,
      },
      {
        command: "retrieve_plate",
        params: {
          labware: "default",
          location: "",
          approach_height: 10,
          motion_profile: "Default",
        },
        order: 1,
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 2,
      },
    ],
  },
  {
    id: "place_plate",
    description: "Place a plate at the specified location",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 0,
      },
      {
        command: "dropoff_plate",
        params: {
          labware: "default",
          location: "",
          approach_height: 10,
          motion_profile: "Default",
        },
        order: 1,
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 2,
      },
    ],
  },
  {
    id: "pick_lid",
    description: "Pick up a lid from the specified location or plate",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 0,
      },
      {
        command: "pick_lid",
        params: {
          labware: "default",
          location: "",
          approach_height: 0,
          motion_profile: "Default",
          pick_from_plate: true,
        },
        order: 1,
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 2,
      },
    ],
  },
  {
    id: "place_lid",
    description: "Place a lid on the specified location or plate",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 0,
      },
      {
        command: "dropoff_lid",
        params: {
          labware: "default",
          location: "",
          approach_height: 10,
          motion_profile: "Default",
          place_on_plate: true,
        },
        order: 1,
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
        order: 2,
      },
    ],
  },
];


export const generateSequenceFromTemplate = (
  id: string,
  safeLocation: string,
  nestLocation: string,
  labwareId: string = "default"
): SequenceCommand[] => {
  const template = DefaultSequences.find(seq => seq.id === id);
  if (!template) {
    console.error(`Template "${id}" not found.`);
    return [];
  }
  const commands = JSON.parse(JSON.stringify(template.commands)) as SequenceCommand[];
  commands.forEach(cmd => {
    if (cmd.command === "move") {
      cmd.params.location = safeLocation;
    }
    if (["dropoff_plate", "retrieve_plate", "pick_lid", "place_lid"].includes(cmd.command)) {
      cmd.params.location = nestLocation;
      cmd.params.labware = labwareId;
    }
  });
  return commands;
};