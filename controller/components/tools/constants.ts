export const commandFields: CommandFields = {
  toolbox: {
    run_python_script: [
      {
        name: "name",
        type: "text",
      },
      {
        name: "blocking",
        type: "boolean",
      },
    ],
    send_slack_alert: [
      {
        name: "workcell",
        type: "text",
      },
      {
        name: "tool",
        type: "text",
      },
      {
        name: "protocol",
        type: "text",
      },
      {
        name: "error_message",
        type: "text",
      },
    ],

    timer: [
      {
        name: "time_seconds",
        type: "number",
      },
      {
        name: "message",
        type: "text",
      },
    ],
    user_message: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "message",
        type: "text",
      },
      {
        name: "message_type",
        type: "text",
      },
    ],
    show_image: [
      {
        name: "file",
        type: "text",
      },
      {
        name: "title",
        type: "text",
      },
      {
        name: "width",
        type: "number",
      },
      {
        name: "height",
        type: "number",
      },
    ],
    slack_message: [
      {
        name: "message",
        type: "text",
      },
    ],
    log_media_exchange: [
      {
        name: "source_barcode",
        type: "text",
      },
      {
        name: "destination_name",
        type: "text",
      },
      {
        name: "destination_barcode",
        type: "text",
      },
      {
        name: "source_wells",
        type: "text",
      },
      {
        name: "destination_wells",
        type: "text",
      },
      {
        name: "percent_exchange",
        type: "number",
      },
      {
        name: "new_tips",
        type: "boolean",
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
      { name: "duration", type: "number", defaultValue: 10 },
    ],
    stop_shake: [],
    wait_for_shake_to_finish: [{ name: "timeout", type: "number" }],
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
      { name: "program_name", type: "text" },
      { name: "params", type: "text" },
    ],
    sleep: [{ name: "seconds", type: "number" }],
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
      { name: "name", type: "text" },
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
      { name: "approach_height", type: "number", defaultValue: 0 },
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
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
    ],
    dropoff_plate: [
      { name: "labware", type: "text" },
      { name: "location", type: "text" },
      { name: "motion_profile_id", type: "number", defaultValue: 1 },
      { name: "approach_height", type: "number", defaultValue: 0 },
    ],
    engage: [],
    release: [],
    retract: [],
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
    retract: [],
    go_to: [{ name: "stack_id", type: "number", defaultValue: 1 }],
    send_raw_command: [{ name: "command", type: "text" }],
  },
};
