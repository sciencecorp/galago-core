import { sqliteTable, text, integer, real, unique, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => sql`(datetime('now'))`),
};

export const workcells = sqliteTable("workcells", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  location: text("location"),
  description: text("description"),
  ...timestamps,
});

export const tools = sqliteTable("tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  ip: text("ip").notNull(),
  port: integer("port").notNull(),
  config: text("config", { mode: "json" }),
  workcellId: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  rows: integer("rows").notNull(),
  columns: integer("columns").notNull(),
  workcellId: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

export const nests = sqliteTable("nests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  row: integer("row"),
  column: integer("column"),
  toolId: integer("tool_id").references(() => tools.id),
  hotelId: integer("hotel_id").references(() => hotels.id),
  status: text("status").notNull().default("empty"),
  ...timestamps,
});

export const plates = sqliteTable("plates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  barcode: text("barcode").notNull(),
  plateType: text("plate_type").notNull(),
  nestId: integer("nest_id").references(() => nests.id),
  status: text("status").notNull().default("stored"),
  ...timestamps,
});

export const wells = sqliteTable("wells", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  row: text("row").notNull(),
  column: integer("column").notNull(),
  plateId: integer("plate_id").references(() => plates.id),
  ...timestamps,
});

export const reagents = sqliteTable("reagents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  expirationDate: text("expiration_date").notNull(),
  volume: real("volume").notNull(),
  wellId: integer("well_id").references(() => wells.id),
  ...timestamps,
});

export const plateNestHistory = sqliteTable("plate_nest_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plateId: integer("plate_id").references(() => plates.id),
  nestId: integer("nest_id").references(() => nests.id),
  action: text("action").notNull(),
  timestamp: text("timestamp")
    .notNull()
    .default(sql`(datetime('now'))`),
  ...timestamps,
});

export const variables = sqliteTable(
  "variables",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    value: text("value").notNull(),
    type: text("type", { enum: ["string", "number", "boolean", "array", "json"] })
      .$type<"string" | "number" | "boolean" | "array" | "json">()
      .notNull(),
    workcellId: integer("workcell_id").references(() => workcells.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    nameWorkcellIdx: index("unique_variable_name_per_workcell").on(table.name, table.workcellId),
  }),
);

export const labware = sqliteTable(
  "labware",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    numberOfRows: integer("number_of_rows").notNull(),
    numberOfColumns: integer("number_of_columns").notNull(),
    zOffset: real("z_offset").notNull().default(0),
    width: real("width").default(127.8),
    height: real("height").default(14.5),
    plateLidOffset: real("plate_lid_offset").default(0),
    lidOffset: real("lid_offset").default(0),
    stackHeight: real("stack_height").default(0),
    hasLid: integer("has_lid", { mode: "boolean" }).default(false),
    workcellId: integer("workcell_id").references(() => workcells.id),
    ...timestamps,
  },
  (t) => [unique("unique_labware_name_per_workcell").on(t.name, t.workcellId)],
);

export const scriptFolders = sqliteTable(
  "script_folders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    parentId: integer("parent_id").references((): any => scriptFolders.id),
    workcellId: integer("workcell_id")
      .references(() => workcells.id)
      .notNull(),
    ...timestamps,
  },
  (t) => [unique("unique_folder_name_per_workcell").on(t.name, t.parentId, t.workcellId)],
);

export const scripts = sqliteTable(
  "scripts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    content: text("content").notNull().default(""),
    language: text("language").notNull().default("python"),
    folderId: integer("folder_id").references(() => scriptFolders.id),
    workcellId: integer("workcell_id").references(() => workcells.id),
    ...timestamps,
  },
  (t) => [unique("unique_script_name_per_workcell").on(t.name, t.workcellId)],
);

export const protocols = sqliteTable("protocols", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  workcellId: integer("workcell_id").references(() => workcells.id),
  description: text("description"),
  commands: text("commands", { mode: "json" }).notNull(),
  ...timestamps,
});

export const forms = sqliteTable(
  "forms",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    fields: text("fields", { mode: "json" }).notNull(), // JSON array of FormField objects
    backgroundColor: text("background_color"),
    fontColor: text("font_color"),
    workcellId: integer("workcell_id").references(() => workcells.id),
    ...timestamps,
  },
  (t) => [unique("unique_form_name_per_workcell").on(t.name, t.workcellId)],
);

export const appSettings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const robotArmLocations = sqliteTable("robot_arm_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  locationType: text("location_type").notNull(),
  coordinates: text("coordinates").notNull(),
  toolId: integer("tool_id").references(() => tools.id),
  orientation: text("orientation").notNull(),
  ...timestamps,
});

export const robotArmSequences = sqliteTable("robot_arm_sequences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  commands: text("commands", { mode: "json" }).notNull(),
  toolId: integer("tool_id").references(() => tools.id),
  labware: text("labware"),
  ...timestamps,
});

export const robotArmMotionProfiles = sqliteTable("robot_arm_motion_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  speed: real("speed").notNull(),
  speed2: real("speed2").notNull(),
  acceleration: real("acceleration").notNull(),
  deceleration: real("deceleration").notNull(),
  accelRamp: real("accel_ramp").notNull(),
  decelRamp: real("decel_ramp").notNull(),
  inrange: real("inrange").notNull(),
  straight: integer("straight").notNull(),
  toolId: integer("tool_id").references(() => tools.id),
  ...timestamps,
});

export const robotArmGripParams = sqliteTable("robot_arm_grip_params", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  speed: integer("speed").notNull(),
  force: integer("force").notNull(),
  toolId: integer("tool_id").references(() => tools.id),
  ...timestamps,
});

export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ...timestamps,
});

// TypeScript Types
export type Workcell = typeof workcells.$inferSelect;
export type NewWorkcell = typeof workcells.$inferInsert;
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
export type Nest = typeof nests.$inferSelect;
export type NewNest = typeof nests.$inferInsert;
export type Plate = typeof plates.$inferSelect;
export type NewPlate = typeof plates.$inferInsert;
export type Well = typeof wells.$inferSelect;
export type NewWell = typeof wells.$inferInsert;
export type Reagent = typeof reagents.$inferSelect;
export type NewReagent = typeof reagents.$inferInsert;
export type PlateNestHistory = typeof plateNestHistory.$inferSelect;
export type NewPlateNestHistory = typeof plateNestHistory.$inferInsert;
export type Variable = typeof variables.$inferSelect;
export type NewVariable = typeof variables.$inferInsert;
export type Labware = typeof labware.$inferSelect;
export type NewLabware = typeof labware.$inferInsert;
export type ScriptFolder = typeof scriptFolders.$inferSelect;
export type NewScriptFolder = typeof scriptFolders.$inferInsert;
export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;
export type Protocol = typeof protocols.$inferSelect;
export type NewProtocol = typeof protocols.$inferInsert;
export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
export type RobotArmLocation = typeof robotArmLocations.$inferSelect;
export type NewRobotArmLocation = typeof robotArmLocations.$inferInsert;
export type RobotArmSequence = typeof robotArmSequences.$inferSelect;
export type NewRobotArmSequence = typeof robotArmSequences.$inferInsert;
export type RobotArmMotionProfile = typeof robotArmMotionProfiles.$inferSelect;
export type NewRobotArmMotionProfile = typeof robotArmMotionProfiles.$inferInsert;
export type RobotArmGripParams = typeof robotArmGripParams.$inferSelect;
export type NewRobotArmGripParams = typeof robotArmGripParams.$inferInsert;
export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;

export const schema = {
  workcells,
  tools,
  hotels,
  nests,
  plates,
  wells,
  reagents,
  plateNestHistory,
  variables,
  labware,
  scriptFolders,
  scripts,
  protocols,
  forms,
  appSettings,
  robotArmLocations,
  robotArmSequences,
  robotArmMotionProfiles,
  robotArmGripParams,
  logs,
};
