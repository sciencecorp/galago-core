import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  FormLabel,
  HStack,
  Input,
  Button,
  useToast,
  FormControl,
  Select,
  TabList,
  Tab,
  Tabs,
  TabPanels,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Divider,
  InputGroup,
  InputRightElement,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { authAxios } from "@/hooks/useAuth";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useCommonColors } from "@/components/ui/Theme";

// API Key types
interface ApiKey {
  id: number;
  service: string;
  key_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiKeyFormData {
  service: string;
  key_name: string;
  key_value?: string;
  description: string;
}

// User types
interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserFormData {
  username: string;
  email: string;
  password?: string;
  is_admin: boolean;
}

export const Settings: React.FC = () => {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const colors = useCommonColors();

  // State for API keys
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [apiKeyFormData, setApiKeyFormData] = useState<ApiKeyFormData>({
    service: "slack",
    key_name: "",
    key_value: "",
    description: "",
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    is_admin: false,
  });

  // Add error state
  const [adminError, setAdminError] = useState<string | null>(null);

  // Modal states
  const {
    isOpen: isApiKeyModalOpen,
    onOpen: onApiKeyModalOpen,
    onClose: onApiKeyModalClose,
  } = useDisclosure();

  const {
    isOpen: isUserModalOpen,
    onOpen: onUserModalOpen,
    onClose: onUserModalClose,
  } = useDisclosure();

  // Delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "apiKey" | "user"; id: number } | null>(
    null,
  );
  const cancelDeleteRef = React.useRef<HTMLButtonElement>(null);

  // Check authentication and admin status
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!isAdmin) {
      // Only redirect if we're sure the user is not admin
      if (!loading) {
        setAdminError("You need admin privileges to access settings");
        toast({
          title: "Access denied",
          description: "You need admin privileges to access settings",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        // Don't redirect immediately - give a chance to show the error
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } else {
      // Clear any previous admin errors when admin status is confirmed
      setAdminError(null);
    }
  }, [isAuthenticated, isAdmin, router, toast, loading]);

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const response = await authAxios.get("/api-keys");
      setApiKeys(response.data);
    } catch (error: any) {
      console.error("Error fetching API keys:", error);
      // Don't show toast for auth errors - they're handled separately
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        toast({
          title: "Error",
          description: "Failed to fetch API keys",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setApiKeys([]); // Set empty array for auth errors
      }
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await authAxios.get("/users");
      console.log("Users response data:", response.data);
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      console.error("Error details:", error.response?.data || "No response data");
      console.error("Error status:", error.response?.status || "No status code");
      
      // Don't show toast for auth errors - they're handled separately
      if (error?.response?.status !== 401 && error?.response?.status !== 403) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        setUsers([]); // Set empty array for auth errors
      }
    }
  };

  // Load data when component mounts
  useEffect(() => {
    if (isAdmin && !adminError) {
      fetchApiKeys();
      fetchUsers();
    }
  }, [isAdmin, adminError]);

  // API Key handlers
  const handleApiKeyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setApiKeyFormData({
      ...apiKeyFormData,
      [name]: value,
    });
  };

  const openAddApiKeyModal = () => {
    setSelectedApiKey(null);
    setApiKeyFormData({
      service: "slack",
      key_name: "",
      key_value: "",
      description: "",
    });
    setShowApiKey(false);
    onApiKeyModalOpen();
  };

  const openEditApiKeyModal = (apiKey: ApiKey) => {
    setSelectedApiKey(apiKey);
    setApiKeyFormData({
      service: apiKey.service,
      key_name: apiKey.key_name,
      description: apiKey.description || "",
      key_value: "", // Don't show the actual key value when editing
    });
    setShowApiKey(false);
    onApiKeyModalOpen();
  };

  const handleApiKeySubmit = async () => {
    try {
      if (selectedApiKey) {
        // Update existing API key
        const payload = { ...apiKeyFormData };
        if (!payload.key_value) {
          delete payload.key_value; // Don't update key if not changed
        }

        await authAxios.put(`/api-keys/${selectedApiKey.id}`, payload);
        toast({
          title: "Success",
          description: "API key updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new API key
        await authAxios.post("/api-keys", apiKeyFormData);
        toast({
          title: "Success",
          description: "API key created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onApiKeyModalClose();
      fetchApiKeys();
    } catch (error) {
      console.error("Error saving API key:", error);
      toast({
        title: "Error",
        description: "Failed to save API key",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openDeleteConfirmation = (type: "apiKey" | "user", id: number) => {
    setItemToDelete({ type, id });
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "apiKey") {
        await authAxios.delete(`/api-keys/${itemToDelete.id}`);
        toast({
          title: "Success",
          description: "API key deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchApiKeys();
      } else if (itemToDelete.type === "user") {
        // Don't allow deleting yourself
        if (user && user.id === itemToDelete.id) {
          toast({
            title: "Error",
            description: "You cannot delete your own account",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setIsDeleteDialogOpen(false);
          return;
        }

        await authAxios.delete(`/users/${itemToDelete.id}`);
        toast({
          title: "Success",
          description: "User deleted successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }

    setIsDeleteDialogOpen(false);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  // User handlers
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle checkbox for is_admin
    if (name === "is_admin") {
      setUserFormData({
        ...userFormData,
        is_admin: (e.target as HTMLInputElement).checked,
      });
      return;
    }

    setUserFormData({
      ...userFormData,
      [name]: value,
    });
  };

  const openAddUserModal = () => {
    setSelectedUser(null);
    setUserFormData({
      username: "",
      email: "",
      password: "",
      is_admin: false,
    });
    onUserModalOpen();
  };

  const openEditUserModal = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't show the password when editing
      is_admin: user.is_admin,
    });
    onUserModalOpen();
  };

  const handleUserSubmit = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        const payload = { ...userFormData };
        if (!payload.password) {
          delete payload.password; // Don't update password if not changed
        }

        await authAxios.put(`/users/${selectedUser.id}`, payload);
        toast({
          title: "Success",
          description: "User updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new user
        await authAxios.post("/users", userFormData);
        toast({
          title: "Success",
          description: "User created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onUserModalClose();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Failed to save user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <Box p={6}>
      <Heading as="h1" mb={6}>
        Settings
      </Heading>

      {adminError && (
        <Box mb={6} p={4} bg="red.100" color="red.800" borderRadius="md">
          <Heading size="md" mb={2}>
            Access Error
          </Heading>
          <Text>{adminError}</Text>
        </Box>
      )}

      <Tabs isLazy variant="enclosed">
        <TabList>
          <Tab>API Keys</Tab>
          <Tab>User Management</Tab>
          <Tab>General Settings</Tab>
        </TabList>

        <TabPanels>
          {/* API Keys Panel */}
          <TabPanel>
            <Box mb={4}>
              <HStack justifyContent="space-between">
                <Heading size="md" mb={4}>
                  API Keys
                </Heading>
                <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openAddApiKeyModal}>
                  Add New API Key
                </Button>
              </HStack>
              <Text mb={4}>
                Manage API keys for integrations with external services like Slack, Microsoft Teams,
                and email providers. All keys are stored encrypted for security.
              </Text>
            </Box>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Service</Th>
                  <Th>Key Name</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {apiKeys.map((apiKey) => (
                  <Tr key={apiKey.id}>
                    <Td textTransform="capitalize">{apiKey.service}</Td>
                    <Td>{apiKey.key_name}</Td>
                    <Td>{apiKey.description || "-"}</Td>
                    <Td>
                      <Badge colorScheme={apiKey.is_active ? "green" : "red"}>
                        {apiKey.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit API Key"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => openEditApiKeyModal(apiKey)}
                        />
                        <IconButton
                          aria-label="Delete API Key"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => openDeleteConfirmation("apiKey", apiKey.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {apiKeys.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No API keys found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TabPanel>

          {/* User Management Panel */}
          <TabPanel>
            <Box mb={4}>
              <HStack justifyContent="space-between">
                <Heading size="md" mb={4}>
                  User Management
                </Heading>
                <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openAddUserModal}>
                  Add New User
                </Button>
              </HStack>
              <Text mb={4}>
                Manage user accounts and their permissions. Admin users have access to settings and
                can manage other users.
              </Text>
            </Box>

            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((userInList) => (
                  <Tr
                    key={userInList.id}
                    bg={user?.id === userInList.id ? colors.selectedBg : undefined}>
                    <Td>{userInList.username}</Td>
                    <Td>{userInList.email}</Td>
                    <Td>
                      <Badge colorScheme={userInList.is_admin ? "purple" : "gray"}>
                        {userInList.is_admin ? "Admin" : "User"}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={userInList.is_active ? "green" : "red"}>
                        {userInList.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          aria-label="Edit User"
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => openEditUserModal(userInList)}
                        />
                        <IconButton
                          aria-label="Delete User"
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => openDeleteConfirmation("user", userInList.id)}
                          isDisabled={user?.id === userInList.id}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
                {users.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No users found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TabPanel>

          {/* General Settings Panel */}
          <TabPanel>
            <Heading size="md" mb={4}>
              General Settings
            </Heading>
            <VStack width="100%" spacing={5} align="self-start">
              <HStack width="80%">
                <Text fontSize="md" width="20%">
                  Workspace Folder
                </Text>
                <Input />
              </HStack>
              <HStack width="80%">
                <Text as="b" fontSize="md" width="20%">
                  Host IP
                </Text>
                <Input />
              </HStack>
              <HStack width="80%">
                <Text as="b" fontSize="md" width="20%">
                  Redis IP
                </Text>
                <Input />
              </HStack>
              <Button colorScheme="teal">Save</Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* API Key Modal */}
      <Modal isOpen={isApiKeyModalOpen} onClose={onApiKeyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedApiKey ? "Edit API Key" : "Add New API Key"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Service</FormLabel>
                <Select
                  name="service"
                  value={apiKeyFormData.service}
                  onChange={handleApiKeyInputChange}>
                  <option value="slack">Slack</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Key Name</FormLabel>
                <Input
                  name="key_name"
                  value={apiKeyFormData.key_name}
                  onChange={handleApiKeyInputChange}
                  placeholder="e.g. API Token, Bot Token"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Key Value</FormLabel>
                <InputGroup>
                  <Input
                    name="key_value"
                    value={apiKeyFormData.key_value}
                    onChange={handleApiKeyInputChange}
                    placeholder={
                      selectedApiKey ? "Enter new key value or leave blank" : "Enter key value"
                    }
                    type={showApiKey ? "text" : "password"}
                    autoComplete="new-password"
                    required={!selectedApiKey}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                      icon={showApiKey ? <ViewOffIcon /> : <ViewIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={toggleApiKeyVisibility}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={apiKeyFormData.description}
                  onChange={handleApiKeyInputChange}
                  placeholder="Optional description"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onApiKeyModalClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleApiKeySubmit}>
              {selectedApiKey ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* User Modal */}
      <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedUser ? "Edit User" : "Add New User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  value={userFormData.username}
                  onChange={handleUserInputChange}
                  placeholder="Enter username"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  placeholder="Enter email"
                />
              </FormControl>

              <FormControl isRequired={!selectedUser}>
                <FormLabel>
                  {selectedUser ? "New Password (leave blank to keep current)" : "Password"}
                </FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={userFormData.password}
                  onChange={handleUserInputChange}
                  placeholder={
                    selectedUser ? "Enter new password or leave blank" : "Enter password"
                  }
                  autoComplete="new-password"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Admin Privileges</FormLabel>
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={userFormData.is_admin as boolean}
                  onChange={handleUserInputChange}
                />
                <Text ml={2} display="inline">
                  Grant admin access (can manage settings and users)
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onUserModalClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleUserSubmit}>
              {selectedUser ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={() => setIsDeleteDialogOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete {itemToDelete?.type === "apiKey" ? "API Key" : "User"}
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? This action cannot be undone.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};
