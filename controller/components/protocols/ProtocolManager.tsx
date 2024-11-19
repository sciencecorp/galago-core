import { Protocol } from "@/types/api";
import { Protocols } from "@/server/protocols";
import { mockProtocols } from "@/mocks/protocolMocks";

export class ProtocolManager {
  private onSuccess?: () => void;
  private onError?: (error: Error | unknown) => void;

  constructor({ onSuccess, onError }: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
    this.onSuccess = onSuccess;
    this.onError = (error: unknown) => onError?.(error as Error);
  }

  useGetProtocols(workcellName: string) {
    return {
      data: Protocols.filter(p => !workcellName || p.workcell === workcellName).map(protocol => ({
        id: protocol.protocolId,
        name: protocol.name,
        category: protocol.category,
        workcell: protocol.workcell,
        description: protocol.description,
        commands: protocol.preview(),
        number_of_commands: protocol.preview()?.length || 0
      })),
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }

  useGetProtocol(id: string) {
    const protocol = Protocols.find(p => p.protocolId === id);
    if (!protocol) return { data: null, isLoading: false, isError: false };
    
    return {
      data: {
        name: protocol.name,
        id: protocol.protocolId,
        category: protocol.category,
        workcell: protocol.workcell,
        description: protocol.description,
        commands: protocol._generateCommands({}),
        icon: protocol.icon,
        number_of_commands: protocol._generateCommands({}).length
      },
      isLoading: false,
      isError: false,
    };
  }

  useCreateProtocol() {
    return {
      mutateAsync: async (newProtocol: Partial<Protocol>) => {
        // Creating new protocols would require additional implementation
        // as protocols are defined as classes
        throw new Error("Creating new protocols is not supported");
      },
    };
  }

  useDeleteProtocol() {
    return {
      mutateAsync: async (id: string) => {
        // Deleting protocols would require additional implementation
        // as protocols are defined in the codebase
        throw new Error("Deleting protocols is not supported");
      },
    };
  }
}