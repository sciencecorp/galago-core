export const commandFields: CommandFields = {
  pyhamilton: {
    run_script: [
      {
        name: "name",
        type: "text",
      },
    ],
    run_local_script: [
      {
        name: "path",
        type: "text",
      },
    ],
  },
  plr: {
    run_script: [
      {
        name: "name",
        type: "text",
      },
    ],
    run_local_script: [
      {
        name: "path",
        type: "text",
      },
    ],
  },
  toolbox: {
    user_form: [
      {
        name: "name",
        type: "text",
      },
    ],
    run_script: [
      {
        name: "name",
        type: "text",
      },
      // {
      //   name: "blocking",
      //   type: "boolean",
      // },
    ],
    pause: [
      {
        name: "message",
        type: "text",
        defaultValue: "Run is paused. Click Continue to resume.",
      },
    ],
    timer: [
      {
        name: "minutes",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "seconds",
        type: "number",
        defaultValue: 30,
      },
      {
        name: "message",
        type: "text",
        defaultValue: "Timer in progress...",
      },
    ],
    note: [
      {
        name: "message",
        type: "text",
        defaultValue: "Note: This is a note.",
      },
    ],
    show_message: [
      {
        name: "message",
        type: "text",
        defaultValue: "Please review and click Continue to proceed.",
      },
      {
        name: "title",
        type: "text",
        defaultValue: "Message",
      },
    ],
    stop_run: [
      {
        name: "message",
        type: "text",
        defaultValue: "Stopping run...",
      },
    ],
    goto: [
      {
        name: "targetIndex",
        type: "number",
        defaultValue: 0,
      },
    ],
    variable_assignment: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "value",
        type: "text",
      },
    ],
    text_to_speech: [
      {
        name: "text",
        type: "text",
        defaultValue: "This is a text to speech message.",
      },
    ],
  },
  plateloc: {
    seal: [],
    set_temperature: [{ name: "temperature", type: "text" }],
    set_seal_time: [{ name: "sealTime", type: "text" }],
    get_actual_temperature: [],
    stage_in: [],
    stage_out: [],
    show_diagnostics: [],
  },
  bravo: {
    run_protocol: [{ name: "protocol_file", type: "text" }],
    run_runset: [{ name: "runset_file", type: "text" }],
  },
  vprep: {
    run_protocol: [{ name: "protocol_file", type: "text" }],
    run_runset: [{ name: "runset_file", type: "text" }],
  },
  hamilton: {
    run_protocol: [{ name: "protocol", type: "text" }],
    load_protocol: [{ name: "runset_file", type: "text" }],
  },
  vcode: {
    home: [],
    print_and_apply: [
      { name: "format_name", type: "text", defaultValue: "1" },
      { name: "side", type: "text", defaultValue: "west" },
      { name: "drop_stage", type: "boolean", defaultValue: true },
      { name: "field_0", type: "text", defaultValue: "Well Plate ID/Name" },
      { name: "field_1", type: "text", defaultValue: "" },
      { name: "field_2", type: "text", defaultValue: "" },
      { name: "field_3", type: "text", defaultValue: "" },
      { name: "field_4", type: "text", defaultValue: "" },
      { name: "field_5", type: "text", defaultValue: "" },
    ],
    print: [
      { name: "format_name", type: "text" },
      { name: "field_0", type: "text" },
      { name: "field_1", type: "text" },
      { name: "field_2", type: "text" },
      { name: "field_3", type: "text" },
      { name: "field_4", type: "text" },
      { name: "field_5", type: "text" },
    ],
    show_diagnostics: [],
    rotate_180: [],
    rotate_stage: [{ name: "angle", type: "number" }],
  },
  xpeel: {
    peel: [],
    check_status: [],
    reset: [],
    restart: [],
    get_remaining_tape: [],
  },
  hig_centrifuge: {
    home: [],
    close_shield: [],
    open_shield: [{ name: "bucket_id", type: "number" }],
    spin: [
      { name: "speed", type: "number" },
      { name: "acceleration", type: "number" },
      { name: "decceleration", type: "number" },
      { name: "duration", type: "number" },
    ],
  },
  bioshake: {
    grip: [],
    ungrip: [],
    home: [],
    reset: [],
    start_shake: [
      { name: "speed", type: "number", defaultValue: 1000 },
      { name: "acceleration", type: "number", defaultValue: 10 },
      { name: "duration", type: "number", defaultValue: 10 },
    ],
    stop_shake: [],
    wait_for_shake_to_finish: [{ name: "timeout", type: "number" }],
    set_temperature: [{ name: "temperature", type: "number" }],
    temperature_on: [],
    temperature_off: [],
  },
  cytation: {
    open_carrier: [],
    close_carrier: [],
    start_read: [
      { name: "protocol_file", type: "text", defaultValue: "C://protocols" },
      { name: "experiment_name", type: "text", defaultValue: "C://experiments" },
      { name: "well_addresses", type: "text_array", defaultValue: ["A1", "B2"] },
    ],
  },
  dataman70: {
    reset: [],
    assert_barcode: [{ name: "barcode", type: "text" }],
  },
  alps3000: {
    seal_plate: [],
  },
  liconic: {
    fetch_plate: [
      { name: "cassette", type: "number", defaultValue: 1 },
      { name: "level", type: "number", defaultValue: 1 },
    ],
    store_plate: [
      { name: "cassette", type: "number", defaultValue: 1 },
      { name: "level", type: "number", defaultValue: 1 },
    ],
    reset: [],
    raw_command: [{ name: "cmd", type: "text", defaultValue: "ST 1900" }],
  },
  opentrons2: {
    run_program: [
      { name: "script_name", type: "text" },
      // { name: "params", type: "text" },
    ],
    pause: [],
    resume: [],
    cancel: [],
    toggle_light: [],
  },
  pf400: {
    run_sequence: [
      { name: "sequence_name", type: "text" },
      { name: "labware", type: "text" },
    ],
    move: [
      { name: "location", type: "text" },
      { name: "motion_profile", type: "text", defaultValue: "Default" },
    ],
    grasp_plate: [
      { name: "width", type: "number", defaultValue: 122 },
      { name: "speed", type: "number", defaultValue: 10 },
      { name: "force", type: "number", defaultValue: 20 },
    ],
    release_plate: [
      { name: "width", type: "number", defaultValue: 130 },
      { name: "speed", type: "number", defaultValue: 10 },
    ],
    retrieve_plate: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "approach_height", type: "number", defaultValue: 0 },
      { name: "motion_profile", type: "text", defaultValue: "Default" },
    ],
    dropoff_plate: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "motion_profile", type: "text", defaultValue: "Default" },
      { name: "approach_height", type: "number", defaultValue: 0 },
    ],
    pick_lid: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "motion_profile", type: "text", defaultValue: "Default" },
      { name: "pick_from_plate", type: "boolean", defaultValue: true },
      { name: "approach_height", type: "number", defaultValue: 10 },
    ],
    place_lid: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "motion_profile", type: "text", defaultValue: "Default" },
      { name: "place_on_plate", type: "boolean", defaultValue: true },
      { name: "approach_height", type: "number", defaultValue: 10 },
    ],
    unwind: [],
  },
  microserve: {
    load: [
      { name: "stack_id", type: "number", defaultValue: 1 },
      { name: "plate_height", type: "number", defaultValue: 14 },
      { name: "stack_height", type: "number", defaultValue: 14 },
      { name: "plate_thickness", type: "number", defaultValue: 12 },
    ],
    unload: [
      { name: "stack_id", type: "number", defaultValue: 1 },
      { name: "plate_height", type: "number", defaultValue: 14 },
      { name: "stack_height", type: "number", defaultValue: 14 },
      { name: "plate_thickness", type: "number", defaultValue: 12 },
    ],
    home: [],
    abort: [],
    unwind: [],
    go_to: [{ name: "stack_id", type: "number", defaultValue: 1 }],
    send_raw_command: [{ name: "command", type: "text" }],
  },
  benchcel: {
    pick_and_place: [
      { name: "pick_from", type: "text" },
      { name: "place_to", type: "text" },
      { name: "lidded", type: "boolean", defaultValue: false },
      { name: "retraction_code", type: "number", defaultValue: 0 },
    ],
    delid: [
      { name: "delid_from", type: "text" },
      { name: "delid_to", type: "text" },
      { name: "retraction_code", type: "number", defaultValue: 0 },
    ],
    relid: [
      { name: "relid_from", type: "text" },
      { name: "relid_to", type: "text" },
      { name: "retraction_code", type: "number", defaultValue: 0 },
    ],
    load_stack: [{ name: "stack", type: "number", defaultValue: 1 }],
    release_stack: [{ name: "stack", type: "number", defaultValue: 1 }],
    open_clamp: [{ name: "stack", type: "number", defaultValue: 1 }],
    is_stack_loaded: [{ name: "stack", type: "number", defaultValue: 1 }],
    is_plate_present: [{ name: "stack", type: "number", defaultValue: 1 }],
    set_labware: [{ name: "labware", type: "text" }],
    get_stack_count: [],
    get_teachpoint_names: [],
    get_labware_names: [],
    protocol_start: [],
    protocol_finish: [],
    move_to_home_position: [],
    pause: [],
    unpause: [],
    show_diagnostics: [],
    show_labware_editor: [
      { name: "modal", type: "boolean", defaultValue: true },
      { name: "labware", type: "text" },
    ],
  },
  minihub: {
    abort: [],
    close: [],
    disable_motor: [],
    enable_motor: [],
    jog: [
      { name: "degree", type: "number", defaultValue: 0 },
      { name: "clockwise", type: "boolean", defaultValue: true },
    ],
    rotate_to_cassette: [{ name: "cassette_index", type: "number", defaultValue: 1 }],
    rotate_to_degree: [{ name: "degree", type: "number", defaultValue: 0 }],
    rotate_to_home_position: [],
    set_speed: [{ name: "speed", type: "number", defaultValue: 100 }],
    show_diagnostics: [],
    teach_home: [],
  },
  vstack: {
    abort: [],
    close: [],
    downstack: [],
    home: [],
    jog: [{ name: "increment", type: "number", defaultValue: 0 }],
    load_stack: [],
    open_gripper: [{ name: "open", type: "boolean", defaultValue: true }],
    release_stack: [],
    set_button_mode: [
      { name: "run_mode", type: "boolean", defaultValue: true },
      { name: "reply", type: "text", defaultValue: "" },
    ],
    set_labware: [
      { name: "labware", type: "text" },
      { name: "plate_dimension_select", type: "number", defaultValue: 0 },
    ],
    show_diagnostics: [],
    upstack: [],
  },
};
