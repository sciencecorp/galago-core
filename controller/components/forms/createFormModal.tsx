import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
} from '@chakra-ui/react';
import { trpc } from '@/utils/trpc';
import { successToast, errorToast } from '../ui/Toast';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({ isOpen, onClose }) => {
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  const createForm = trpc.form.add.useMutation();
  const {refetch} = trpc.form.getAll.useQuery();

  const handleSave = async () => {
    try {
      await createForm.mutateAsync({ name: formName, description: formDescription });
      successToast('Success', 'Form created successfully');
      onClose();
      setFormName('');
      setFormDescription('');
    } catch (error) {
      errorToast('Error', 'Failed to create form');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Form</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Form Name</FormLabel>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSave} mr={3}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
