import { procedure, router } from "@/server/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendEmailMessage, sendSlackMessage } from "@/server/utils/integrationsLocal";

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
        await sendSlackMessage({
          message: input?.message || "Galago: Slack test message ✅",
          channel: input?.channel,
          auditAction: "integrations.slack.test",
        });
        return { ok: true };
      } catch (e: any) {
        const msg = typeof e?.message === "string" ? e.message : "Slack test failed";
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
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
        await sendEmailMessage({
          subject: input?.subject || "Galago: Email test",
          message: input?.message || "This is a test email from Galago.",
          auditAction: "integrations.email.test",
        });
        return { ok: true };
      } catch (e: any) {
        const msg = typeof e?.message === "string" ? e.message : "Email test failed";
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
      }
    }),

  slackSend: procedure
    .input(z.object({ message: z.string().min(1), channel: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        await sendSlackMessage({
          message: input.message,
          channel: input.channel,
          auditAction: "integrations.slack.send",
        });
        return { ok: true };
      } catch (e: any) {
        const msg = typeof e?.message === "string" ? e.message : "Slack send failed";
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
      }
    }),

  emailSend: procedure
    .input(z.object({ subject: z.string().min(1), message: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        await sendEmailMessage({
          subject: input.subject,
          message: input.message,
          auditAction: "integrations.email.send",
        });
        return { ok: true };
      } catch (e: any) {
        const msg = typeof e?.message === "string" ? e.message : "Email send failed";
        throw new TRPCError({ code: "BAD_REQUEST", message: msg });
      }
    }),
});
