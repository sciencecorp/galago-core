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
  useToast,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Protocol } from "@/types/api";

type ProtocolFormData = Omit<Protocol, "id" | "created_at" | "updated_at" | "number_of_commands">;

export const NewProtocolForm = () => {
  const router = useRouter();
  const toast = useToast();
  const [isCheckingId, setIsCheckingId] = useState(false);

  // Get selected workcell
  const { data: workcellName } = trpc.workcell.getSelectedWorkcell.useQuery();
  const { data: workcells } = trpc.workcell.getAll.useQuery();
  const selectedWorkcell = workcells?.find((w) => w.name === workcellName);

  // Add query to check existing protocols
  const { data: existingProtocols } = trpc.protocol.allNames.useQuery(
    { workcellName: workcellName || "" },
    { staleTime: 5000 },
  );

  const [formData, setFormData] = useState<ProtocolFormData>({
    name: "",
    category: "development",
    workcell_id: selectedWorkcell?.id || 1,
    description: "",
    parameters_schema: {},
    commands_template: [],
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
      toast({
        title: "Protocol created",
        description: "Successfully created new protocol",
        status: "success",
        duration: 3000,
      });
      router.push(`/protocols/${data.id}`);
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

      toast({
        title: "Error creating protocol",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProtocolFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const protocolData = {
      ...formData,
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description?.trim() || "",
      parameters_schema: formData.parameters_schema || {},
      commands_template: formData.commands_template || [],
      version: 1,
      is_active: true,
      workcell_id: Number(formData.workcell_id),
    };

    try {
      const result = await createProtocol.mutateAsync(protocolData);
      console.log("Protocol creation result:", result);
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
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Protocol name"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.category}>
          <FormLabel>Category</FormLabel>
          <Select name="category" value={formData.category} onChange={handleChange}>
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
          />
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={createProtocol.isLoading}
          loadingText="Creating..."
          disabled={createProtocol.isLoading}>
          Create Protocol
        </Button>
      </VStack>
    </Box>
  );
};
