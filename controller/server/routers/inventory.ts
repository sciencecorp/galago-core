import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import { get, post, put, del } from "../utils/api";
import { Hotel } from "@/types/api";

const zNest = z.object({
  id: z.number().optional(),
  name: z.string(),
  row: z.number(),
  column: z.number(),
  tool_id: z.number().optional(),
  hotel_id: z.number().optional(),
  status: z.enum(["empty", "occupied", "reserved", "error"]).optional(),
});

const zPlate = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  barcode: z.string(),
  plate_type: z.string(),
  nest_id: z.number().nullable(),
  status: z.enum(["stored", "checked_out", "completed", "disposed"]).optional(),
});

const zReagent = z.object({
  id: z.number().optional(),
  name: z.string(),
  expiration_date: z.string(),
  volume: z.number(),
  well_id: z.number(),
});

const zHotel = z.object({
  id: z.number().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  workcell_id: z.number(),
  rows: z.number(),
  columns: z.number(),
});

export const inventoryRouter = router({
  getNests: procedure.input(z.string()).query(async ({ input: workcellName }) => {
    // Explicitly set cache-control headers to no-cache
    const response = await get(`/nests?workcell_name=${workcellName}`, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
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
    const response = await get(`/plates?workcell_name=${encodedName}`);
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

  // Add getHotels procedure
  getHotels: procedure.input(z.string().optional()).query(async ({ input: workcellName }) => {
    let url = `/hotels`;
    if (workcellName) {
      url += `?workcell_name=${encodeURIComponent(workcellName)}`;
    }
    const response = await get<Hotel[]>(url);
    return response;
  }),

  // Add getHotelById procedure
  getHotelById: procedure.input(z.number()).query(async ({ input }) => {
    const response = await get<Hotel>(`/hotels/${input}`);
    return response;
  }),

  // Add createHotel procedure with proper typing
  createHotel: procedure.input(zHotel.omit({ id: true })).mutation(async ({ input }) => {
    const response = await post<Hotel>(`/hotels`, input);
    return response;
  }),

  // Add updateHotel procedure with proper typing
  updateHotel: procedure.input(zHotel).mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const response = await put<Hotel>(`/hotels/${id}`, updateData);
    return response;
  }),

  // Add deleteHotel procedure
  deleteHotel: procedure.input(z.number()).mutation(async ({ input }) => {
    await del(`/hotels/${input}`);
    return { message: "Hotel deleted successfully" };
  }),
});
