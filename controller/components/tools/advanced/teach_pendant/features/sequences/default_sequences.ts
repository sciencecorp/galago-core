export const DefuaultSequences = [
  {
    name: "Pick Plate From <nest>",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
      {
        command: "retrieve",
        params: {
          labware: "default",
          location: "",
          approach_height: 0,
          motion_profile: "",
        },
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
    ],
  },
  {
    name: "Place Plate at <nest>",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "",
        },
      },
      {
        command: "retrieve",
        params: {
          labware: "default",
          location: "",
          approach_height: 0,
          motion_profile: "Default",
        },
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "",
        },
      },
    ],
  },
  {
    name: "Pick Lid from <nest>",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
      {
        command: "pick_lid",
        params: {
          labware: "default",
          location: "",
          approach_height: 0,
          motion_profile: "",
          pick_from_plate: true,
        },
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
    ],
  },
  {
    name: "Place Lid On <nest>",
    commands: [
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
      {
        command: "place_lid",
        params: {
          labware: "default",
          location: "",
          approach_height: 0,
          motion_profile: "Default",
          place_on_plate: true,
        },
      },
      {
        command: "move",
        params: {
          location: "",
          motion_profile: "Default",
        },
      },
    ],
  },
];
