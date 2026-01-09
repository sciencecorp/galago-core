import { useState } from "react";
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
} from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Protocol } from "@/types";
import { successToast, errorToast } from "../ui/Toast";

type ProtocolFormData = Omit<
  Protocol,
  "version" | "id" | "createdAt" | "updatedAt" | "params" | "numberOfCommands" | "workcellId"
>;

export const NewProtocolForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<ProtocolFormData>({
    name: "",
    category: "development",
    description: "",
    commands: [],
  });

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
      name: formData.name.trim(),
      category: formData.category.trim(),
      description: formData.description?.trim() || "",
      commands: formData.commands || [],
    };

    await createProtocol.mutateAsync(protocolData);
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
          isDisabled={!formData.name || !formData.category}
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
