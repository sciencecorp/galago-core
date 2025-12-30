import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// ============================================================================
// Reusable timestamp fields
// ============================================================================
export const timestamps = {
  created_at: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => sql`(datetime('now'))`),
};

// ============================================================================
// Workcells Table
// ============================================================================
export const workcells = sqliteTable("workcells", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  location: text("location"),
  description: text("description"),
  ...timestamps,
});

// ============================================================================
// Tools Table
// ============================================================================
export const tools = sqliteTable("tools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  ip: text("ip").notNull(),
  port: integer("port").notNull(),
  config: text("config", { mode: "json" }), // JSON stored as text
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Hotels Table
// ============================================================================
export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  image_url: text("image_url"),
  rows: integer("rows").notNull(),
  columns: integer("columns").notNull(),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Nests Table
// ============================================================================
export const nests = sqliteTable("nests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  row: integer("row"),
  column: integer("column"),
  tool_id: integer("tool_id").references(() => tools.id),
  hotel_id: integer("hotel_id").references(() => hotels.id),
  status: text("status").notNull().default("empty"), // enum: empty, occupied, reserved, error
  ...timestamps,
});

// ============================================================================
// Plates Table
// ============================================================================
export const plates = sqliteTable("plates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  barcode: text("barcode").notNull(),
  plate_type: text("plate_type").notNull(),
  nest_id: integer("nest_id").references(() => nests.id),
  status: text("status").notNull().default("stored"), // enum: stored, checked_out, completed, disposed
  ...timestamps,
});

// ============================================================================
// Wells Table
// ============================================================================
export const wells = sqliteTable("wells", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  row: text("row").notNull(),
  column: integer("column").notNull(),
  plate_id: integer("plate_id").references(() => plates.id),
  ...timestamps,
});

// ============================================================================
// Reagents Table
// ============================================================================
export const reagents = sqliteTable("reagents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  expiration_date: text("expiration_date").notNull(), // Store as ISO date string
  volume: real("volume").notNull(),
  well_id: integer("well_id").references(() => wells.id),
  ...timestamps,
});

// ============================================================================
// Plate Nest History Table
// ============================================================================
export const plate_nest_history = sqliteTable("plate_nest_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plate_id: integer("plate_id").references(() => plates.id),
  nest_id: integer("nest_id").references(() => nests.id),
  action: text("action").notNull(), // enum: check_in, check_out, transfer
  timestamp: text("timestamp")
    .notNull()
    .default(sql`(datetime('now'))`),
  ...timestamps,
});

// ============================================================================
// Variables Table
// ============================================================================
export const variables = sqliteTable("variables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull(), // string, number, boolean, array, json
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Labware Table
// ============================================================================
export const labware = sqliteTable("labware", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  image_url: text("image_url"),
  description: text("description").notNull(),
  number_of_rows: integer("number_of_rows").notNull(),
  number_of_columns: integer("number_of_columns").notNull(),
  z_offset: real("z_offset").notNull().default(0),
  width: real("width").default(127.8),
  height: real("height").default(14.5),
  plate_lid_offset: real("plate_lid_offset").default(0),
  lid_offset: real("lid_offset").default(0),
  stack_height: real("stack_height").default(0),
  has_lid: integer("has_lid", { mode: "boolean" }).default(false),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Script Folders Table
// ============================================================================
export const script_folders = sqliteTable("script_folders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parent_id: integer("parent_id").references((): any => script_folders.id),
  description: text("description"),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Scripts Table
// ============================================================================
export const scripts = sqliteTable("scripts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  content: text("content").notNull().default(""),
  language: text("language").notNull().default("python"),
  is_blocking: integer("is_blocking", { mode: "boolean" }).notNull().default(true),
  folder_id: integer("folder_id").references(() => script_folders.id),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// Protocols Table
// ============================================================================
export const protocols = sqliteTable("protocols", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  description: text("description"),
  commands: text("commands", { mode: "json" }).notNull(), // JSON array
  ...timestamps,
});

// ============================================================================
// Forms Table
// ============================================================================
export const forms = sqliteTable("forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  fields: text("fields", { mode: "json" }).notNull(), // JSON array
  background_color: text("background_color"),
  font_color: text("font_color"),
  workcell_id: integer("workcell_id").references(() => workcells.id),
  ...timestamps,
});

// ============================================================================
// App Settings Table
// ============================================================================
export const app_settings = sqliteTable("app_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  is_active: integer("is_active", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

// ============================================================================
// Robot Arm Location Table
// ============================================================================
export const robot_arm_locations = sqliteTable("robot_arm_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location_type: text("location_type").notNull(), // 'j' or 'c'
  coordinates: text("coordinates").notNull(),
  tool_id: integer("tool_id").references(() => tools.id),
  orientation: text("orientation").notNull(), // 'portrait' or 'landscape'
  ...timestamps,
});

// ============================================================================
// Robot Arm Sequences Table
// ============================================================================
export const robot_arm_sequences = sqliteTable("robot_arm_sequences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  commands: text("commands", { mode: "json" }).notNull(),
  tool_id: integer("tool_id").references(() => tools.id),
  labware: text("labware"),
  ...timestamps,
});

// ============================================================================
// Robot Arm Motion Profiles Table
// ============================================================================
export const robot_arm_motion_profiles = sqliteTable("robot_arm_motion_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  speed: real("speed").notNull(),
  speed2: real("speed2").notNull(),
  acceleration: real("acceleration").notNull(),
  deceleration: real("deceleration").notNull(),
  accel_ramp: real("accel_ramp").notNull(),
  decel_ramp: real("decel_ramp").notNull(),
  inrange: real("inrange").notNull(),
  straight: integer("straight").notNull(),
  tool_id: integer("tool_id").references(() => tools.id),
  ...timestamps,
});

// ============================================================================
// Robot Arm Grip Params Table
// ============================================================================
export const robot_arm_grip_params = sqliteTable("robot_arm_grip_params", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  speed: integer("speed").notNull(),
  force: integer("force").notNull(),
  tool_id: integer("tool_id").references(() => tools.id),
  ...timestamps,
});

// ============================================================================
// Logs Table (already created)
// ============================================================================
export const logs = sqliteTable("logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: text("level").notNull(),
  action: text("action").notNull(),
  details: text("details").notNull(),
  ...timestamps,
});

// ============================================================================
// TypeScript Types - Auto-generated from schema
// ============================================================================

// Workcells
export type Workcell = typeof workcells.$inferSelect;
export type NewWorkcell = typeof workcells.$inferInsert;

// Tools
export type Tool = typeof tools.$inferSelect;
export type NewTool = typeof tools.$inferInsert;

// Hotels
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;

// Nests
export type Nest = typeof nests.$inferSelect;
export type NewNest = typeof nests.$inferInsert;

// Plates
export type Plate = typeof plates.$inferSelect;
export type NewPlate = typeof plates.$inferInsert;

// Wells
export type Well = typeof wells.$inferSelect;
export type NewWell = typeof wells.$inferInsert;

// Reagents
export type Reagent = typeof reagents.$inferSelect;
export type NewReagent = typeof reagents.$inferInsert;

// Plate Nest History
export type PlateNestHistory = typeof plate_nest_history.$inferSelect;
export type NewPlateNestHistory = typeof plate_nest_history.$inferInsert;

// Variables
export type Variable = typeof variables.$inferSelect;
export type NewVariable = typeof variables.$inferInsert;

// Labware
export type Labware = typeof labware.$inferSelect;
export type NewLabware = typeof labware.$inferInsert;

// Script Folders
export type ScriptFolder = typeof script_folders.$inferSelect;
export type NewScriptFolder = typeof script_folders.$inferInsert;

// Scripts
export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;

// Protocols
export type Protocol = typeof protocols.$inferSelect;
export type NewProtocol = typeof protocols.$inferInsert;

// Forms
export type Form = typeof forms.$inferSelect;
export type NewForm = typeof forms.$inferInsert;

// App Settings
export type AppSettings = typeof app_settings.$inferSelect;
export type NewAppSettings = typeof app_settings.$inferInsert;

// Robot Arm Location
export type RobotArmLocation = typeof robot_arm_locations.$inferSelect;
export type NewRobotArmLocation = typeof robot_arm_locations.$inferInsert;

// Robot Arm Sequences
export type RobotArmSequence = typeof robot_arm_sequences.$inferSelect;
export type NewRobotArmSequence = typeof robot_arm_sequences.$inferInsert;

// Robot Arm Motion Profiles
export type RobotArmMotionProfile = typeof robot_arm_motion_profiles.$inferSelect;
export type NewRobotArmMotionProfile = typeof robot_arm_motion_profiles.$inferInsert;

// Robot Arm Grip Params
export type RobotArmGripParams = typeof robot_arm_grip_params.$inferSelect;
export type NewRobotArmGripParams = typeof robot_arm_grip_params.$inferInsert;

// Logs
export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;

// ============================================================================
// Export all schemas for Drizzle
// ============================================================================
export const schema = {
  workcells,
  tools,
  hotels,
  nests,
  plates,
  wells,
  reagents,
  plate_nest_history,
  variables,
  labware,
  script_folders,
  scripts,
  protocols,
  forms,
  app_settings,
  robot_arm_locations,
  robot_arm_sequences,
  robot_arm_motion_profiles,
  robot_arm_grip_params,
  logs,
};
