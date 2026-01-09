import { procedure, router } from "@/server/trpc";
import { post } from "@/server/utils/api";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const integrationsRouter = router({
  slackTest: procedure
    .input(
      z
        .object({
          message: z.string().optional(),
          channel: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      try {
        return await post<{ ok: boolean }>(`/integrations/slack/test`, input ?? {});
      } catch (e: any) {
        const status = e?.status;
        const msg = typeof e?.message === "string" ? e.message : "Slack test failed";
        const cleanMsg = msg.replace(/^\d+\s*-\s*/, "");

        if (status === 400) throw new TRPCError({ code: "BAD_REQUEST", message: cleanMsg });
        if (status === 401) throw new TRPCError({ code: "UNAUTHORIZED", message: cleanMsg });
        if (status === 403) throw new TRPCError({ code: "FORBIDDEN", message: cleanMsg });
        if (status === 404) throw new TRPCError({ code: "NOT_FOUND", message: cleanMsg });
        if (status === 409) throw new TRPCError({ code: "CONFLICT", message: cleanMsg });

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: cleanMsg });
      }
    }),

  emailTest: procedure
    .input(
      z
        .object({
          subject: z.string().optional(),
          message: z.string().optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => {
      try {
        return await post<{ ok: boolean }>(`/integrations/email/test`, input ?? {});
      } catch (e: any) {
        const status = e?.status;
        const msg = typeof e?.message === "string" ? e.message : "Email test failed";
        const cleanMsg = msg.replace(/^\d+\s*-\s*/, "");

        if (status === 400) throw new TRPCError({ code: "BAD_REQUEST", message: cleanMsg });
        if (status === 401) throw new TRPCError({ code: "UNAUTHORIZED", message: cleanMsg });
        if (status === 403) throw new TRPCError({ code: "FORBIDDEN", message: cleanMsg });
        if (status === 404) throw new TRPCError({ code: "NOT_FOUND", message: cleanMsg });
        if (status === 409) throw new TRPCError({ code: "CONFLICT", message: cleanMsg });

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: cleanMsg });
      }
    }),
});
