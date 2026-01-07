import { AppSettings, Protocol, Workcell } from "@/types/api";
import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import axios from "axios";
import { logAction } from "@/server/logger";
import { get, post } from "../utils/api";

const API_BASE_URL = (process.env.API_BASE_URL || "http://127.0.0.1:8000").replace(/\/api\/?$/, "");

const protocolSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  // Optional here because some UI flows don't provide it; we'll infer from selected workcell.
  workcell_id: z.number().optional(),
  description: z.string().optional(),
  commands: z.array(z.any()),
});

export const protocolRouter = router({
  all: procedure.input(z.object({})).query(async () => {
    const response = await get<Protocol[]>("/protocols");
    return response;
  }),

  allNames: procedure.input(z.object({ workcellName: z.string() })).query(async ({ input }) => {
    const { workcellName } = input;
    const response = await get<Protocol[]>(`protocols`, {
      params: { workcell_name: workcellName },
    });
    return response;
  }),

  get: procedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { id } = input;
    const response = await get<Protocol>(`/protocols/${id}`);
    return response;
  }),

  create: procedure.input(protocolSchema).mutation(async ({ input }) => {
    let workcell_id = input.workcell_id;
    if (workcell_id == null) {
      // Infer from selected workcell setting
      const selected = await get<AppSettings>(`/settings/workcell`);
      const selectedName = (selected?.value ?? "").toString();
      if (selectedName) {
        const wc = await get<Workcell>(`/workcells/${encodeURIComponent(selectedName)}`);
        workcell_id = wc?.id;
      }
    }

    const protocolData = {
      ...input,
      workcell_id,
      commands: input.commands || [],
    };
    const response = await post<Protocol>(`${API_BASE_URL}/protocols`, protocolData);
    logAction({
      level: "info",
      action: "New Protocol Added",
      details: `Protocol ${input.name} added successfully.`,
    });
    return response;
  }),

  update: procedure
    .input(
      z.object({
        id: z.number(),
        data: protocolSchema.partial(),
      }),
    )
    .mutation(async ({ input }) => {
      const response = await axios.put(`${API_BASE_URL}/protocols/${input.id}`, input.data);
      logAction({
        level: "info",
        action: "Protocol Updated",
        details: `Protocol ${input.data.name} updated successfully.`,
      });
      return response.data;
    }),

  delete: procedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await axios.delete(`${API_BASE_URL}/protocols/${input.id}`);
    logAction({
      level: "info",
      action: "Protocol Deleted",
      details: `Protocol ${input.id} deleted successfully.`,
    });
    return { success: true };
  }),

  getById: procedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const response = await axios.get(`${API_BASE_URL}/protocols/${input.id}`);
    return response.data;
  }),
});
