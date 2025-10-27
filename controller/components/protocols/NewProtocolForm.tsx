import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Protocol } from "@/types/api";
import { successToast, errorToast } from "../ui/Toast";

type ProtocolFormData = Omit<
  Protocol,
  "version" | "id" | "created_at" | "updated_at" | "params" | "number_of_commands"
>;

export const NewProtocolForm = () => {
  const router = useRouter();

  const { data: workcellName } = trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const selectedWorkcell = workcells?.find((w) => w.name === workcellName);
  const hasWorkcells = workcells && workcells.length > 0;

  const [formData, setFormData] = useState<ProtocolFormData>({
    name: "",
    category: "development",
    workcell_id: selectedWorkcell?.id || 1,
    description: "",
    processes: [],
    params: {},
    version: 1,
    is_active: true,
  });

  // Update workcell_id when selected workcell changes
  useEffect(() => {
    if (selectedWorkcell?.id) {
      setFormData((prev) => ({ ...prev, workcell_id: selectedWorkcell.id }));
    }
  }, [selectedWorkcell]);

  const [errors, setErrors] = useState<Partial<Record<keyof ProtocolFormData, string>>>({});

  const createProtocol = trpc.protocol.create.useMutation({
    onSuccess: (data) => {
      if (data) {
        successToast("Protocol created", "");
        router.push(`/protocols/${data.id}`);
      }
    },
    onError: (error: any) => {
      console.error("Protocol creation error:", error);
      let errorMessage = error.message;

      if (error.message.includes("UNIQUE constraint failed")) {
        errorMessage =
          "A protocol with this ID already exists. Please choose a different protocol ID.";
      } else if (error.data?.zodError) {
        errorMessage = "Validation error in the form data";
      } else if (error.data?.httpStatus === 400) {
        errorMessage = "Invalid protocol data";
      } else if (error.data?.httpStatus === 500) {
        errorMessage = "Server error while creating protocol";
      }

      errorToast("Error creating protocol", errorMessage);
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProtocolFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!selectedWorkcell) {
      newErrors.workcell_id = "A workcell must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      errorToast("Validation Error", "Please check the form for errors");
      return;
    }

    const protocolData = {
      ...formData,
      params: formData.params || {},
    };

    try {
      const result = await createProtocol.mutateAsync(protocolData);
    } catch (error: any) {
      console.error("Error details:", {
        message: error.message,
        cause: error.cause,
        data: error.data,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    let finalValue = value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Clear error when field is modified
    if (errors[name as keyof ProtocolFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={4}>
      <VStack spacing={4} align="stretch">
        {!hasWorkcells && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>No Workcell Available</AlertTitle>
              <AlertDescription>
                You need to create a workcell before you can create a protocol. Please create a
                workcell first.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {!selectedWorkcell && hasWorkcells && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>No Workcell Selected</AlertTitle>
              <AlertDescription>
                Please select a workcell from the workcell selector before creating a protocol.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Protocol name"
            isDisabled={!selectedWorkcell}
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.category}>
          <FormLabel>Category</FormLabel>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            isDisabled={!selectedWorkcell}>
            <option value="development">Development</option>
            <option value="production">Production</option>
            <option value="qc">QC</option>
          </Select>
          <FormErrorMessage>{errors.category}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Protocol description"
            isDisabled={!selectedWorkcell}
          />
        </FormControl>

        <Button
          isDisabled={!selectedWorkcell || !formData.name || !formData.category}
          type="submit"
          colorScheme="teal"
          isLoading={createProtocol.isLoading}
          loadingText="Creating...">
          Create Protocol
        </Button>
      </VStack>
    </Box>
  );
};
