import { z } from "zod";
import { procedure, router } from "@/server/trpc";
import Tool from "@/server/tools";
import { ToolType } from "gen-interfaces/controller";

const TodoRecordZod = z.object({
  id: z.number().optional(),
  user_id: z.number().optional(),
  workflow_run_id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  scheduled_at: z.string().optional(),
  completed_at: z.string().optional(),
  workflow_step_definition_id: z.number().optional(),
  starred: z.boolean().optional(),
  will_delete: z.boolean().optional(),
  state: z.string().optional(),
  started_at: z.string().optional(),
  skipped_at: z.string().optional(),
  failed_at: z.string().optional(),
});

export const scicloneRouter = router({
  todo: procedure.input(TodoRecordZod).mutation(async ({ input }) => {
    return await Tool.executeCommand({
      toolId: Tool.helixToolId(),
      toolType: ToolType.helix_tool,
      command: "handle_todo_completion",
      params: {
        todo_id: input.id,
        workflow_run_id: input.workflow_run_id,
        todo_state: input.state,
      },
    });
  }),
});
