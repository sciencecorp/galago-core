// components/bravo/BravoDeckConfigSelector.tsx
import React, { useState, useEffect } from "react";
import { HStack, Button, Select, Text, ButtonGroup, Spacer } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { successToast, errorToast } from "@/components/ui/Toast";
import { RiSaveLine } from "react-icons/ri";
import { BravoDeckConfig } from "@/types";
import { DeleteWithConfirmation } from "@/components/ui/Delete";

interface BravoDeckConfigSelectorProps {
  currentDeckPositions: Array<{
    position: number;
    labwareType: string;
  }>;
  onConfigLoaded?: (config: BravoDeckConfig) => void;
}

export const BravoDeckConfigSelector: React.FC<BravoDeckConfigSelectorProps> = ({
  currentDeckPositions,
  onConfigLoaded,
}) => {
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: configs, refetch: refetchConfigs } = trpc.bravoDeckConfig.getAll.useQuery();

  const updateConfig = trpc.bravoDeckConfig.update.useMutation();
  const deleteConfig = trpc.bravoDeckConfig.delete.useMutation();

  const selectedConfig = configs?.find((c) => c.id === selectedConfigId);

  // Load config when selection changes - only trigger on selectedConfigId change
  useEffect(() => {
    if (selectedConfig && onConfigLoaded) {
      onConfigLoaded(selectedConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConfigId]);

  const handleSaveConfig = async () => {
    if (!selectedConfig) {
      errorToast("Error", "Please select a configuration to update");
      return;
    }

    try {
      setIsSaving(true);

      // Convert current deck positions to the required format
      const deckLayout: Record<string, string | null> = {};
      for (let i = 1; i <= 9; i++) {
        const position = currentDeckPositions.find((p) => p.position === i);
        deckLayout[i.toString()] =
          position?.labwareType && position.labwareType !== "Empty" ? position.labwareType : null;
      }

      await updateConfig.mutateAsync({
        id: selectedConfig.id,
        data: {
          deck_layout: deckLayout,
        },
      });

      successToast(
        "Config updated",
        `Deck configuration "${selectedConfig.name}" has been updated`,
      );
      await refetchConfigs();
    } catch (error) {
      console.error("Failed to update config:", error);
      errorToast("Error", `Failed to update configuration. ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!selectedConfigId) return;

    try {
      await deleteConfig.mutateAsync(selectedConfigId);
      successToast("Config deleted", "Deck configuration has been deleted");
      await refetchConfigs();
      setSelectedConfigId(null);
    } catch (error) {
      console.error("Failed to delete config:", error);
      errorToast("Error", "Failed to delete configuration");
    }
  };

  return (
    <HStack spacing={2} justifyContent="space-between" alignItems="center" w="full">
      <HStack>
        <Text whiteSpace="nowrap" fontWeight="bold" fontSize="md">
          Deck Config:
        </Text>
        <Select
          placeholder="Select a configuration"
          value={selectedConfigId || ""}
          onChange={(e) => {
            const configId = e.target.value ? Number(e.target.value) : null;
            setSelectedConfigId(configId);
          }}
          width="300px"
          size="sm">
          {configs?.map((config) => (
            <option key={config.id} value={config.id}>
              {config.name} ({Object.values(config.deck_layout).filter(Boolean).length} positions)
            </option>
          ))}
        </Select>
      </HStack>

      <Spacer />

      <ButtonGroup spacing={2}>
        <Button
          leftIcon={<RiSaveLine />}
          colorScheme="teal"
          onClick={handleSaveConfig}
          isLoading={isSaving}
          loadingText="Saving..."
          isDisabled={!selectedConfig}
          size="sm">
          Save
        </Button>
        {selectedConfig && (
          <DeleteWithConfirmation
            label={selectedConfig.name}
            onDelete={handleDeleteConfig}
            variant="button"
          />
        )}
      </ButtonGroup>
    </HStack>
  );
};
