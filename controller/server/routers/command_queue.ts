import { z } from "zod";
import CommandQueue from "../command_queue";
import { procedure, router } from "@/server/trpc";
import { ToolCommandExecutionError } from "../tools";
import { ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
// type NonEmptyArray<T> = [T, ...T[]];
// const zToolStatus = z.enum(Object.values(ToolStatus) as NonEmptyArray<ToolStatus>);

export const commandQueueRouter = router({
  state: procedure.query(async () => {
    return CommandQueue.global.state;
  }),
  restart: procedure.mutation(() => {
    CommandQueue.global._start();
  }),
  stop: procedure.mutation(() => {
    CommandQueue.global.stop();
  }),
  getError: procedure.query(async () => {
    const error = CommandQueue.global.getError();
    if (!error) return null;

    // If the error is a ToolCommandExecutionError, enhance it with a user-friendly message
    if (error instanceof ToolCommandExecutionError) {
      // Get a user-friendly message based on the error code
      let userFriendlyMessage = error.message;

      // Add specific messages for different error codes
      if (error.code === ResponseCode.UNRECOGNIZED_COMMAND) {
        userFriendlyMessage =
          "This command is not recognized by the tool. Please verify that the command is supported.";
      } else if (error.code === ResponseCode.INVALID_ARGUMENTS) {
        userFriendlyMessage =
          "Invalid arguments provided for this command. Please check the parameters.";
      } else if (error.code === ResponseCode.WRONG_TOOL) {
        userFriendlyMessage =
          "The command was sent to the wrong tool type. Please check that you're using the correct tool for this operation.";
      } else if (error.code === ResponseCode.NOT_READY) {
        userFriendlyMessage =
          "The tool is not ready. Please check its status and try again.";
      }

      // Return enhanced error information
      return {
        message: error.message,
        userFriendlyMessage,
        code: error.code,
        codeString: error.code.toString(),
        name: error.name,
        stack: error.stack,
      };
    }

    // For other types of errors, return as is
    return error;
  }),
  skipCommand: procedure.input(z.number()).mutation(async ({ input }) => {
    CommandQueue.global.skipCommand(input);
  }),
  skipCommandsUntil: procedure.input(z.number()).mutation(async ({ input }) => {
    // Skip all commands previous to the given command ID
    CommandQueue.global.skipCommandsUntil(input);
  }),
  clearCompleted: procedure.mutation(() => {
    CommandQueue.global.clearCompleted();
  }),
  clearAll: procedure.mutation(() => {
    CommandQueue.global.clearAll();
  }),
  clearByRunId: procedure.input(z.string()).mutation(async ({ input }) => {
    CommandQueue.global.clearByRunId(input);
  }),
  getRunsTotal: procedure.query(async () => {
    return CommandQueue.global.getRunsTotal();
  }),
  getRun: procedure.input(z.string()).mutation(async ({ input }) => {
    CommandQueue.global.getRun(input);
  }),
  getAllRuns: procedure.query(async () => {
    return CommandQueue.global.getAllRuns();
  }),
  getAll: procedure.query(async ({}) => {
    return await CommandQueue.global.allCommands();
  }),
  commands: procedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { limit = 20000, offset = 0 } = input; // default values if not provided
      return await CommandQueue.global.getPaginated(offset, limit);
      // const allCommands = await CommandQueue.global.allCommands();
    }),
  // Unified waiting-for-input status query
  isWaitingForInput: procedure.query(async () => {
    return CommandQueue.global.isWaitingForInput;
  }),
  gotoCommandByRunIndex: procedure
    .input(
      z.object({
        runId: z.string(),
        index: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return CommandQueue.global.gotoCommandByRunIndex(
        input.runId,
        input.index,
      );
    }),
  gotoCommand: procedure.input(z.number()).mutation(async ({ input }) => {
    return CommandQueue.global.gotoCommand(input);
  }),
  // Get current message data (type, message text, title)

  // Resume command (works for both pause and show_message)
  resume: procedure.mutation(() => {
    CommandQueue.global.resume();
    return { success: true };
  }),

  // Update the currentMessage procedure in commandQueueRouter to include formName
  currentMessage: procedure.query(async () => {
    const message = CommandQueue.global.currentMessage;
    return {
      ...message,
      // Ensure formName is included if it exists
      ...(message.formName ? { formName: message.formName } : {}),
    };
  }),
});
