import { relations } from "drizzle-orm";
import {
  workcells,
  tools,
  protocols,
  hotels,
  scripts,
  variables,
  labware,
  forms,
  scriptFolders,
} from "./index";

export const workcellsRelations = relations(workcells, ({ many }) => ({
  tools: many(tools),
  protocols: many(protocols),
  hotels: many(hotels),
  scripts: many(scripts),
  variables: many(variables),
  labware: many(labware),
  forms: many(forms),
  scriptFolders: many(scriptFolders),
}));

export const toolsRelations = relations(tools, ({ one }) => ({
  workcell: one(workcells, {
    fields: [tools.workcellId],
    references: [workcells.id],
  }),
}));
