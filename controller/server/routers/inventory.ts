import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";


// Zod schemas for validation
const zNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  row: z.number(),
  column: z.number(),
  tool_id: z.string(),
});

const zPlate = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  barcode: z.string(),
  plate_type: z.string(),
  nest_id: z.number().nullable(),
});

const zReagent = z.object({
  id: z.number().optional(),
  name: z.string(),
  expiration_date: z.string(),
  volume: z.number(),
  well_id: z.number(),
});

export const inventoryRouter = router({
  // Nest endpoints
  getNests: procedure.input(z.string()).query(async ({ input: workcellName }) => {
    const response = await get(`/nests?workcell_name=${workcellName}`);
    return response;
  }),
  getNest: procedure.input(z.number()).query(async ({ input: nestId }) => {
    const response = await get(`/nests/${nestId}`);
    return response;
  }),

  createNest: procedure.input(zNest.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post(`/nests`, input);
    return response;
  }),

  updateNest: procedure.input(zNest).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const response = await put(`/nests/${id}`, updateData);
    return response;
  }),

  deleteNest: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/nests/${input}`);
    return { message: "Nest deleted successfully" };
  }),

  // Plate endpoints
  getPlates: procedure.input(z.string()).query(async ({ input: workcellName }) => {
    const encodedName = encodeURIComponent(workcellName);
    const response = await get(`/plates?workcell=${encodedName}`);
    return response;
  }),

  getPlate: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const response = await get(`/plates/${plateId}`);
    return response;
  }),

  getPlateInfo: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const response = await get(`/plates/${plateId}/info`);
    return response;
  }),

  createPlate: procedure.input(zPlate.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post(`/plates`, input);
    return response;
  }),

  updatePlate: procedure.input(zPlate).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const response = await put(`/plates/${id}`, updateData);
    return response;
  }),

  deletePlate: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/plates/${input}`);
    return { message: "Plate deleted successfully" };
  }),

  // Well endpoints
  getWells: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const response = await get(`/wells?plate_id=${plateId}`);
    return response;
  }),

  // Reagent endpoints
  getReagents: procedure.input(z.number()).query(async ({ input: plateId }) => {
    const response = await get(`/reagents?plate_id=${plateId}`);
    return response;
  }),

  getWorkcellReagents: procedure.input(z.string()).query(async ({ input: workcellName }) => {
    const response = await get(`/reagents?workcell_name=${workcellName}`);
    return response;
  }),

  createReagent: procedure.input(zReagent.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post(`/reagents`, input);
    return response;
  }),

  updateReagent: procedure.input(zReagent).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const response = await put(`/reagents/${id}`, updateData);
    return response;
  }),

  deleteReagent: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/reagents/${input}`);
    return { message: "Reagent deleted successfully" };
  }),
});
