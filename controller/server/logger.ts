import { z } from "zod";
import axios from "axios";
import { procedure, router } from "@/server/trpc";
import { post } from "@/server/utils/api";
import { Log } from "@/types/api";

export const logAction = async (log: Partial<Log>) => {
  try {
    await post<Log>(`/logs`, log);
  } catch (error) {
    console.error("Failed to log action:", error);
  }
};
