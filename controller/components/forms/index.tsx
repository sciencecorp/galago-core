import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Box, 
  VStack, 
  HStack, 
  Button, 
  Text, 
  Input, 
  Textarea, 
  Select, 
  Checkbox, 
  FormControl, 
  FormLabel, 
  Switch, 
  Badge, 
  IconButton, 
  Card, 
  CardBody, 
  CardHeader, 
  Heading, 
  Divider, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Spacer,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { 
  AddIcon, 
  DeleteIcon, 
  EditIcon, 
  CopyIcon, 
  LockIcon, 
  UnlockIcon,
  DragHandleIcon,
  SettingsIcon 
} from '@chakra-ui/icons';

// Mock data for demonstration
const mockForms = [
  {
    id: 1,
    name: "Contact Form",
    description: "This should not work if form is locked",
    fields: [
      { type: "text", name: "name", label: "Name", required: true },
      { type: "email", name: "email", label: "Email", required: true },
      { type: "textarea", name: "message", label: "Message", required: true }
    ],
    background_color: null,
    background_image: null,
    size: "small",
    is_locked: true,
    created_at: "2025-06-26T22:21:30",
    updated_at: "2025-06-26T22:21:30"
  },
  {
    id: 2,
    name: "Event Registration",
    description: "Complete event registration form",
    fields: [
      { type: "text", name: "first_name", label: "First Name", required: true },
      { type: "text", name: "last_name", label: "Last Name", required: true },
      { type: "email", name: "email", label: "Email Address", required: true },
      { type: "select", name: "ticket_type", label: "Ticket Type", required: true, options: [
        { value: "standard", label: "Standard - $50" },
        { value: "premium", label: "Premium - $100" },
        { value: "vip", label: "VIP - $200" }
      ]}
    ],
    background_color: "#ffffff",
    background_image: "/images/event-bg.jpg",
    size: "large",
    is_locked: false,
    created_at: "2025-06-26T22:21:30",
    updated_at: "2025-06-26T22:21:30"
  }
];

// Available field types
const fieldTypes = [
  { value: 'text', label: 'Text Input' },
  { value: 'email', label: 'Email Input' },
  { value: 'tel', label: 'Phone Input' },
  { value: 'number', label: 'Number Input' },
  { value: 'date', label: 'Date Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Select Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkbox' },
];

// FormList Component
export const FormList = ({ selectedFormId, onSelectForm, onCreateForm }) => {
  const [forms, setForms] = useState(mockForms);
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [formToDelete, setFormToDelete] = useState(null);
  const cancelRef = React.useRef();

  const filteredForms = forms.filter(form => 
    form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (form.description && form.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteForm = (form) => {
    setFormToDelete(form);
    onDeleteOpen();
  };

  const confirmDelete = () => {
    if (formToDelete) {
      setForms(forms.filter(f => f.id !== formToDelete.id));
      toast({
        title: "Form deleted",
        description: `${formToDelete.name} has been deleted.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      if (selectedFormId === formToDelete.id) {
        onSelectForm(null);
      }
    }
    onDeleteClose();
    setFormToDelete(null);
  };

  const handleDuplicateForm = (form) => {
    const newForm = {
      ...form,
      id: Math.max(...forms.map(f => f.id)) + 1,
      name: `${form.name} (Copy)`,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setForms([...forms, newForm]);
    toast({
      title: "Form duplicated",
      description: `${newForm.name} has been created.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleToggleLock = (form) => {
    const updatedForms = forms.map(f => 
      f.id === form.id ? { ...f, is_locked: !f.is_locked } : f
    );
    setForms(updatedForms);
    toast({
      title: form.is_locked ? "Form unlocked" : "Form locked",
      description: `${form.name} has been ${form.is_locked ? 'unlocked' : 'locked'}.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box width="100%" height="100%" p={4}>
      <VStack spacing={4} align="stretch">
        <HStack>
          <Heading size="md">Forms</Heading>
          <Spacer />
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            size="sm"
            onClick={onCreateForm}
          >
            New Form
          </Button>
        </HStack>
        
        <Input
          placeholder="Search forms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />

        <VStack spacing={2} align="stretch">
          {filteredForms.map((form) => (
            <Card
              key={form.id}
              variant={selectedFormId === form.id ? "filled" : "outline"}
              cursor="pointer"
              _hover={{ bg: "gray.50" }}
              onClick={() => onSelectForm(form.id)}
            >
              <CardBody p={3}>
                <VStack align="stretch" spacing={2}>
                  <HStack>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Text fontWeight="medium" fontSize="sm">
                          {form.name}
                        </Text>
                        {form.is_locked && (
                          <Badge colorScheme="red" size="sm">
                            <LockIcon boxSize={2} mr={1} />
                            Locked
                          </Badge>
                        )}
                        <Badge colorScheme="gray" size="sm">
                          {form.size}
                        </Badge>
                      </HStack>
                      {form.description && (
                        <Text fontSize="xs" color="gray.600" noOfLines={2}>
                          {form.description}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.500">
                        {form.fields.length} fields
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={1} onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      icon={<EditIcon />}
                      size="xs"
                      variant="ghost"
                      aria-label="Edit form"
                      onClick={() => onSelectForm(form.id)}
                    />
                    <IconButton
                      icon={<CopyIcon />}
                      size="xs"
                      variant="ghost"
                      aria-label="Duplicate form"
                      onClick={() => handleDuplicateForm(form)}
                    />
                    <IconButton
                      icon={form.is_locked ? <UnlockIcon /> : <LockIcon />}
                      size="xs"
                      variant="ghost"
                      aria-label={form.is_locked ? "Unlock form" : "Lock form"}
                      onClick={() => handleToggleLock(form)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Delete form"
                      onClick={() => handleDeleteForm(form)}
                    />
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Form
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete "{formToDelete?.name}"? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

// Field Editor Component
const FieldEditor = ({ field, onUpdateField, onDeleteField }) => {
  const [editedField, setEditedField] = useState(field);
  const [options, setOptions] = useState(field.options || []);

  useEffect(() => {
    setEditedField(field);
    setOptions(field.options || []);
  }, [field]);

  const handleSave = () => {
    onUpdateField({ ...editedField, options });
  };

  const addOption = () => {
    setOptions([...options, { value: '', label: '', disabled: false }]);
  };

  const updateOption = (index, key, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [key]: value };
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const needsOptions = ['select', 'radio', 'checkbox'].includes(editedField.type);

  return (
    <VStack align="stretch" spacing={4}>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Field Type</FormLabel>
            <Select
              value={editedField.type}
              onChange={(e) => setEditedField({ ...editedField, type: e.target.value })}
              size="sm"
            >
              {fieldTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        
        <GridItem>
          <FormControl>
            <FormLabel fontSize="sm">Field Name</FormLabel>
            <Input
              value={editedField.name}
              onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
              size="sm"
            />
          </FormControl>
        </GridItem>
      </Grid>

      <FormControl>
        <FormLabel fontSize="sm">Label</FormLabel>
        <Input
          value={editedField.label}
          onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
          size="sm"
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Placeholder</FormLabel>
        <Input
          value={editedField.placeholder || ''}
          onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
          size="sm"
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Description</FormLabel>
        <Textarea
          value={editedField.description || ''}
          onChange={(e) => setEditedField({ ...editedField, description: e.target.value })}
          size="sm"
          rows={2}
        />
      </FormControl>

      <HStack>
        <Checkbox
          isChecked={editedField.required}
          onChange={(e) => setEditedField({ ...editedField, required: e.target.checked })}
        >
          Required
        </Checkbox>
      </HStack>

      {needsOptions && (
        <Box>
          <FormLabel fontSize="sm">Options</FormLabel>
          <VStack align="stretch" spacing={2}>
            {options.map((option, index) => (
              <HStack key={index}>
                <Input
                  placeholder="Value"
                  value={option.value}
                  onChange={(e) => updateOption(index, 'value', e.target.value)}
                  size="sm"
                />
                <Input
                  placeholder="Label"
                  value={option.label}
                  onChange={(e) => updateOption(index, 'label', e.target.value)}
                  size="sm"
                />
                <Checkbox
                  isChecked={option.disabled}
                  onChange={(e) => updateOption(index, 'disabled', e.target.checked)}
                >
                  Disabled
                </Checkbox>
                <IconButton
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => removeOption(index)}
                />
              </HStack>
            ))}
            <Button leftIcon={<AddIcon />} size="sm" variant="ghost" onClick={addOption}>
              Add Option
            </Button>
          </VStack>
        </Box>
      )}

      <HStack>
        <Button colorScheme="blue" size="sm" onClick={handleSave}>
          Save Changes
        </Button>
        <Button colorScheme="red" size="sm" variant="outline" onClick={onDeleteField}>
          Delete Field
        </Button>
      </HStack>
    </VStack>
  );
};

// FormBuilder Component
export const FormBuilder = ({ formId }) => {
  const [form, setForm] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const { isOpen: isFieldModalOpen, onOpen: onFieldModalOpen, onClose: onFieldModalClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (formId) {
      const foundForm = mockForms.find(f => f.id === formId);
      if (foundForm) {
        setForm({ ...foundForm });
      }
    } else {
      // Create new form
      setForm({
        id: null,
        name: 'New Form',
        description: '',
        fields: [],
        background_color: '#ffffff',
        background_image: '',
        size: 'medium',
        is_locked: false
      });
    }
  }, [formId]);

  const handleDragEnd = (result) => {
    if (!result.destination || form.is_locked) return;

    const items = Array.from(form.fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setForm({ ...form, fields: items });
  };

  const addField = () => {
    if (form.is_locked) return;
    
    const newField = {
      type: 'text',
      name: `field_${form.fields.length + 1}`,
      label: 'New Field',
      required: false,
      placeholder: '',
      description: '',
      validation: null,
      options: null,
      default_value: null,
      mapped_variable: null
    };
    
    setForm({ ...form, fields: [...form.fields, newField] });
  };

  const updateField = (index, updatedField) => {
    const newFields = [...form.fields];
    newFields[index] = updatedField;
    setForm({ ...form, fields: newFields });
    setEditingField(null);
    onFieldModalClose();
    toast({
      title: "Field updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const deleteField = (index) => {
    if (form.is_locked) return;
    
    const newFields = form.fields.filter((_, i) => i !== index);
    setForm({ ...form, fields: newFields });
    setEditingField(null);
    onFieldModalClose();
    toast({
      title: "Field deleted",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const saveForm = () => {
    // Here you would typically call your API
    toast({
      title: "Form saved",
      description: `${form.name} has been saved successfully.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  if (!form) {
    return (
      <Box p={8} textAlign="center">
        <Text>Select a form to edit or create a new one.</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <HStack>
          <Heading size="lg">
            {form.id ? `Edit Form: ${form.name}` : 'Create New Form'}
          </Heading>
          <Spacer />
          {form.is_locked && (
            <Badge colorScheme="red">
              <LockIcon boxSize={3} mr={1} />
              Locked
            </Badge>
          )}
          <Button colorScheme="blue" onClick={saveForm}>
            Save Form
          </Button>
        </HStack>

        <Tabs>
          <TabList>
            <Tab>Fields</Tab>
            <Tab>Settings</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={addField}
                    isDisabled={form.is_locked}
                  >
                    Add Field
                  </Button>
                  <Text fontSize="sm" color="gray.600">
                    {form.fields.length} fields
                  </Text>
                </HStack>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="fields">
                    {(provided) => (
                      <VStack
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        align="stretch"
                        spacing={2}
                      >
                        {form.fields.map((field, index) => (
                          <Draggable
                            key={`${field.name}-${index}`}
                            draggableId={`${field.name}-${index}`}
                            index={index}
                            isDragDisabled={form.is_locked}
                          >
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                bg={snapshot.isDragging ? "blue.50" : "white"}
                                shadow={snapshot.isDragging ? "lg" : "sm"}
                              >
                                <CardBody>
                                  <HStack>
                                    <Box {...provided.dragHandleProps}>
                                      <DragHandleIcon color="gray.400" />
                                    </Box>
                                    <VStack align="start" flex={1} spacing={1}>
                                      <HStack>
                                        <Text fontWeight="medium">{field.label}</Text>
                                        <Badge colorScheme="blue" size="sm">
                                          {field.type}
                                        </Badge>
                                        {field.required && (
                                          <Badge colorScheme="red" size="sm">
                                            Required
                                          </Badge>
                                        )}
                                      </HStack>
                                      <Text fontSize="sm" color="gray.600">
                                        Name: {field.name}
                                      </Text>
                                      {field.description && (
                                        <Text fontSize="xs" color="gray.500">
                                          {field.description}
                                        </Text>
                                      )}
                                    </VStack>
                                    <IconButton
                                      icon={<EditIcon />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingField({ field, index });
                                        onFieldModalOpen();
                                      }}
                                      isDisabled={form.is_locked}
                                    />
                                  </HStack>
                                </CardBody>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </VStack>
                    )}
                  </Droppable>
                </DragDropContext>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Form Name</FormLabel>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        isDisabled={form.is_locked}
                      />
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Size</FormLabel>
                      <Select
                        value={form.size}
                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                        isDisabled={form.is_locked}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    isDisabled={form.is_locked}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Background Color</FormLabel>
                  <Input
                    type="color"
                    value={form.background_color || '#ffffff'}
                    onChange={(e) => setForm({ ...form, background_color: e.target.value })}
                    isDisabled={form.is_locked}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Background Image URL</FormLabel>
                  <Input
                    value={form.background_image || ''}
                    onChange={(e) => setForm({ ...form, background_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    isDisabled={form.is_locked}
                  />
                </FormControl>

                <HStack>
                  <Switch
                    isChecked={form.is_locked}
                    onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
                  />
                  <Text>Lock Form</Text>
                </HStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <Modal isOpen={isFieldModalOpen} onClose={onFieldModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit Field: {editingField?.field.label}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingField && (
              <FieldEditor
                field={editingField.field}
                onUpdateField={(updatedField) => updateField(editingField.index, updatedField)}
                onDeleteField={() => deleteField(editingField.index)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Main App Component
export default function FormBuilderApp() {
  const [selectedFormId, setSelectedFormId] = useState(null);

  const handleCreateForm = () => {
    setSelectedFormId(null);
  };

  return (
    <Box height="100vh" display="flex">
      <Box width="300px" borderRight="1px solid" borderColor="gray.200" bg="gray.50">
        <FormList
          selectedFormId={selectedFormId}
          onSelectForm={setSelectedFormId}
          onCreateForm={handleCreateForm}
        />
      </Box>
      <Box flex={1} overflow="auto">
        <FormBuilder formId={selectedFormId} />
      </Box>
    </Box>
  );
}