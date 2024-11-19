import { Protocol } from "@/types/api";
import { useToast } from "@chakra-ui/react";
import { mockProtocols } from "@/mocks/protocolMocks";

export class ProtocolManager {
  private toast;
  private onSuccess?: () => void;
  private onError?: (error: Error | unknown) => void;

  constructor({ onSuccess, onError }: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
    this.toast = useToast();
    this.onSuccess = onSuccess;
    this.onError = (error: unknown) => onError?.(error as Error);
  }

  useGetProtocols(workcellName: string) {
    // Mock implementation
    return {
      data: mockProtocols.filter(p => !workcellName || p.workcell === workcellName),
      isLoading: false,
      isError: false,
      refetch: () => {},
    };
  }

  useGetProtocol(id: string) {
    // Mock implementation
    return {
      data: mockProtocols.find(p => p.id === parseInt(id)),
      isLoading: false,
      isError: false,
    };
  }

  useCreateProtocol() {
    return {
      mutateAsync: async (newProtocol: Partial<Protocol>) => {
        // Simulate API call
        const protocol = {
          ...newProtocol,
          id: mockProtocols.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockProtocols.push(protocol as Protocol);
        this.onSuccess?.();
        return protocol;
      },
    };
  }

  useDeleteProtocol() {
    return {
      mutateAsync: async (id: string) => {
        const index = mockProtocols.findIndex(p => p.id === parseInt(id));
        if (index > -1) {
          mockProtocols.splice(index, 1);
        }
        this.onSuccess?.();
      },
    };
  }
}
