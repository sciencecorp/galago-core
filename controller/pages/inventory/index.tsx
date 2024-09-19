import React, { useEffect, useState } from "react";
import axios from "axios";
import { Progress, Spinner } from "@chakra-ui/react";
import {
  inventoryApiClient,
  Inventory,
  Plate,
  Nest,
  PlateUpdate,
  Well,
  Reagent,
} from "@/server/utils/InventoryClient";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  CloseButton,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightElement,
  List,
  ListItem,
  Select,
  Switch,
  Text,
  Tooltip,
  useColorMode,
  VStack,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody, 
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import InventoryVisualizer from "@/components/inventory/InventoryVisualizer";
import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import Fuse from "fuse.js";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";
import InteractivePlateVisualizer from "@/components/inventory/PlateVisualizer";

export default function Page() {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshFlag, setRefreshFlag] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<
    "error" | "info" | "warning" | "success" | "loading"
  >("success");
  const [alertDescription, setAlertDescription] = useState<string>("");

  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [mode, setMode] = useState<"checkin" | "checkout" | "" | "move" | "delete">(
    "checkin"
  );

  const [selectedPlate, setSelectedPlate] = useState<Plate | null>(null);
  const [selectedNest, setSelectedNest] = useState<Nest | null>(null);
  const [destinationNest, setDestinationNest] = useState<Nest| null>(null);
  const [dPlate, setdPlate] = useState<Plate|null>(null);

  const [selectedWells, setSelectedWells] = useState<Well[]>([]);
  const [selectedReagents, setSelectedReagents] = useState<Reagent[]>([]);

  const [inputPlateName, setInputPlateName] = useState<string>("");
  const [inputNestName, setInputNestName] = useState<string>("");
  const [inputPlateType, setInputPlateType] = useState<string>("96 well");

  const [search, setSearch] = useState<string>("");
  const [searchResults, setSearchResults] = useState<(Plate | Reagent)[]>([]);
  const [platesFuseInstance, setPlatesFuseInstance] = useState<Fuse<Plate> | null>(null);
  const [reagentsFuseInstance, setReagentsFuseInstance] = useState<Fuse<Reagent> | null>(null);
  const { isLoading } = trpc.tool.runCommand.useMutation();
  const availableIDsQuery = trpc.tool.availableIDs.useQuery();
  const availableIDs = availableIDsQuery.data;
  const vcodeId = availableIDs?.filter((id) => id.includes("vcode"))[0];

  const commandMutation = trpc.tool.runCommand.useMutation();
  const pf400ID = availableIDs?.filter((id) => id.includes("pf400"))[0];
  
  const liconicID = availableIDs?.filter((id) => id.includes("Liconic"))[0];

  const workcellData = trpc.tool.getWorkcellName.useQuery();
  const workcellName = workcellData.data;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {isOpen: isLoadLiconicModalOpen, onOpen: onLiconicModalOpen, onClose: onLiconicModalClose} = useDisclosure();

  useEffect(() => {
    const fetchInventoryData = async() => {
      try {
        if (workcellName === undefined) {
          return;
        }
        const inventoryData = await inventoryApiClient.getInventory(workcellName);
        setInventory(inventoryData);
  
        const platesFuse = new Fuse(inventoryData.plates, { keys: ["name"], threshold: 0.3 });
        setPlatesFuseInstance(platesFuse);
  
        const reagentsFuse = new Fuse(inventoryData.reagents, { keys: ["name"], threshold: 0.3 });
        setReagentsFuseInstance(reagentsFuse);
  
        if (selectedNest && selectedNest.name) {
          setInputNestName(selectedNest.name);
        }
        if (selectedPlate && selectedPlate.name) {
          const plate_wells = inventoryData?.wells.filter((well) => well.plate_id === selectedPlate.id) || [];
          setSelectedWells(plate_wells);
          const well_ids: number[] = plate_wells.map((well) => well.id) || [];
          setSelectedReagents(inventoryData?.reagents.filter((reagent) => well_ids.includes(reagent.well_id)) || []);
          setInputPlateName(selectedPlate.name);
        }
      } catch (error) {
        console.warn("Error fetching data:", error);
      }
    }
    fetchInventoryData();
  }, [workcellName, selectedNest, selectedPlate, refreshFlag]);

  useEffect(() => {
    if (selectedNest && selectedNest.name) {
      setInputNestName(selectedNest.name);
    }
  }, [selectedNest, refreshFlag]);

  const launchAlert = (
    status: "error" | "info" | "warning" | "success" | "loading",
    description: string
  ) => {
    setAlertStatus(status);
    setAlertDescription(description);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
    }, 4000);
  };

  const getNextAvailableNest = (instrumentName: string, zones: number[]): Nest | undefined => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }

    const instrument = inventory.instruments.filter(
      (instrument) => instrument.name === instrumentName
    )[0];

    if (!instrument) {
      launchAlert("error", "No instrument with this name in inventory");
      return;
    }
    const nests = inventory.nests.filter((nest) => nest.instrument_id === instrument.id);
    if (nests.length === 0) {
      launchAlert("error", "No nests available");
      return;
    }
    for(var i=0; i < zones.length; i++) {
      const zone : number = zones[i];
      const filtered_nests = nests.filter((nest)=> nest.column === zone)
      if(filtered_nests) {
        for (const nest of filtered_nests) {
          let nest_plates = inventory.plates.filter((plate) => plate.nest_id === nest.id);
          if (nest_plates.length === 0) {
            return nest;
          }
        }
      }
    }
    launchAlert("error", "No available nest found");
    return;
  };

  const convertTimestampToDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  const handlePrintAndApply = async () => {
    if (!vcodeId) {
      return;
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var yyyy = today.getFullYear();

    let todayString = mm + '/' + dd + '/' + yyyy;
    const barcode = dPlate?.barcode;
    const labwareType = dPlate?.plate_type
    const plateName  = dPlate?.name;

    const toolCommand: ToolCommandInfo = {
      toolId: vcodeId,
      toolType: "vcode" as ToolType,
      command: "print_and_apply",
      params: {
        format_name: "1",
        side: "west",
        drop_stage: true,
        field_0: `WP-${plateName}`,
        field_1: barcode,
        field_2: labwareType,
        field_3: todayString, 
        field_4: "", 
        field_5: "", 
      },
    };
    const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
      toolCommand
    );
    if(response?.response != ResponseCode.SUCCESS){
      launchAlert("error", `Error printing label ${response?.error_message}`);
    }
    setLoading(false);
    onClose();
    onLiconicModalOpen();
  }

  const handlePrintLabelCloseModal= () => {
    onClose();
    onLiconicModalOpen();
  }

  const handleLiconicLoadCloseModal = () => {
    onLiconicModalClose();
    setLoading(false);
  }

  const loadLiconicModal = () => {
    return(
      <Modal isOpen={isLoadLiconicModalOpen} onClose={handleLiconicLoadCloseModal} isCentered={true}>
        <ModalContent>
          <ModalHeader>Liconic Load Plate?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Please place plate on liconic transfer station and click Accept.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={()=>{loadPlateToLiconic(dPlate, destinationNest)}}>
              Accept
            </Button>
            <Button variant="ghost" onClick={handleLiconicLoadCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  const printAndLabelPlateModal = () => {
    return(
      <Modal isOpen={isOpen} onClose={handlePrintLabelCloseModal} isCentered={true}>
        <ModalContent>
          <ModalHeader>Label Plate?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Would you like to print and apply label to this plate?</Text>
            <Text>Click Print to label plate. Click Cancel to skip labeling.</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handlePrintAndApply}>
              Print
            </Button>
            <Button variant="ghost" onClick={handlePrintLabelCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  const handleCheckInPlate = async () => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }
    let destination_nest = inventory.nests.filter((nest) => nest.name === inputNestName)[0];
    setDestinationNest(destination_nest);
    let plate = inventory.plates.filter((plate) => plate.name === inputPlateName)[0];    
    
    if (!plate) {
      plate = await inventoryApiClient.createPlate({
        name: inputPlateName,
        plate_type: inputPlateType,
        nest_id: null,
        barcode: generateBarcode(),
      } as Plate);
    }

    if (plate && plate.nest_id) {
      launchAlert("warning", "Plate already checked in");
      return;
    }

    if (!destination_nest) {
      if (!liconicID) {
        launchAlert("error", "No liconic ID available");
        return;
      }
      let available_nest = getNextAvailableNest("Liconic", [1, 2, 3, 4, 5]);
      if (!available_nest) {
        launchAlert("error", "No available nest in liconic found");
        return;
      }
      setDestinationNest(available_nest);
      destination_nest = available_nest;
    }
    setLoading(true);
    
    try {
      if (!liconicID) {
        launchAlert("error", "No liconic ID available");
        return;
      }
      const toolCommand: ToolCommandInfo = {
        toolId: liconicID,
        toolType: "liconic" as ToolType,
        command: "store_plate",
        params: {
          cassette: destination_nest.name.split("_")[2],
          level: destination_nest.name.split("_")[1],
        },
      };

      await commandMutation.mutateAsync(toolCommand);

      await inventoryApiClient.updatePlate(plate.id, {
        nest_id: destination_nest.id,
      } as PlateUpdate);

      setRefreshFlag(!refreshFlag);
      launchAlert(
        "success",
        `Plate ${inputPlateName} checked in successfully into nest ${destination_nest.name}`
      );
    } catch (error) {
      launchAlert("error", "Error checking in plate");
    } finally {
      setLoading(false);
    }
  };

  const loadPlateToLiconic = async (plate:Plate | null, destinationNest:Nest|null) => {
    if(!plate){
      launchAlert("error", "Plate can't be null");
      onLiconicModalClose();
      setLoading(false);
      return;
    }
    if(!destinationNest){
      launchAlert("error", "Destination Nest can't be null");
      onLiconicModalClose();
      setLoading(false);
      return;
    }
    if (!inventory) {
      launchAlert("error", "No inventory available");
      setLoading(false);
      return;
    }
    setLoading(true);
    if (plate) {
      onLiconicModalClose();
      if (inventory.plates.filter((plate) => plate.nest_id === destinationNest.id).length > 0) {
        launchAlert("error", "Nest already has a plate");
        return;
      }
      if (destinationNest.name.includes("liconic")) {
        if (!liconicID) {
          launchAlert("error", "No liconic ID available");
          return;
        }
        const destination_cassette = destinationNest.name.split("_")[2];
        const destination_level = destinationNest.name.split("_")[1];

        const toolCommand: ToolCommandInfo = {
          toolId: liconicID,
          toolType: "liconic" as ToolType,
          command: "store_plate",
          params: {
            cassette: destination_cassette,
            level: destination_level,
          },
        };
        try{
          await commandMutation.mutateAsync(
            toolCommand
          );
        }
        catch (error) {
          setLoading(false);
          launchAlert("error", "Error loading plate into liconic");
          return;
        }

        await inventoryApiClient.updatePlate(plate.id, {
          nest_id: destinationNest.id,
        } as PlateUpdate);
        setRefreshFlag(!refreshFlag);
        launchAlert(
          "success",
          `Plate ${inputPlateName} checked in successfully into nest ${destinationNest.name}`
        );
        setLoading(false);

      }
      setLoading(false);
      return;
    }
  }
  const handleCheckOutPlate = async () => {
    
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }

    const plate = inventory.plates.filter((plate) => plate.name === inputPlateName)[0];
    if (!plate) {
      launchAlert("warning", "No plate with this name in inventory");
      return;
    }
    if (!plate.nest_id) {
      launchAlert("warning", "Plate already checked out");
      return;
    }

    try {
      const source_nest = inventory.nests.filter((nest) => nest.id === plate.nest_id)[0];
      if (source_nest.name.includes("liconic")) {
        if (!liconicID) {
          launchAlert("error", "No liconic ID available");
          return;
        }
        setLoading(true);
        const source_cassette = source_nest.name.split("_")[2];
        const source_level = source_nest.name.split("_")[1];
        const toolCommand: ToolCommandInfo = {
          toolId: liconicID,
          toolType: "liconic" as ToolType,
          command: "fetch_plate",
          params: {
            cassette: source_cassette,
            level: source_level,
          },
        };
      try{ await commandMutation.mutateAsync(
          toolCommand
        );
      }
      catch (error) {
        launchAlert("error", `Failed to unload plate into liconic: ${error}`);
        setLoading(false);
        return;
      }
        await inventoryApiClient.updatePlate(plate.id, {
          nest_id: null,
        } as PlateUpdate);
        launchAlert("success", `Plate ${inputPlateName} checked out successfully`);
        setLoading(false);
    }
    } catch (error) {
      setLoading(false);
      launchAlert("error", "Error checking out plate");
    }
  };

  function generateBarcode(): string {
    const min = 100000000000;
    const max = 999999999999;
    const randomInt = Math.floor(Math.random() * (max - min + 1) + min);
    return randomInt.toString();
  }

  const handlePlate = async () => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }

    const plate = inventory.plates.filter((plate) => plate.name === inputPlateName)[0];
    if (plate) {
      launchAlert("warning", "Plate already exists");
      return;
    }

    const destination_nest = inventory.nests.filter((nest) => nest.name === inputNestName)[0];
    if (inputPlateName && inputPlateType && destination_nest) {
      const dPlate = await inventoryApiClient.createPlate({
        name: inputPlateName,
        nest_id: destination_nest.id,
        plate_type: inputPlateType,
        barcode: generateBarcode(),
      } as Plate);
      setSelectedPlate(dPlate);
      setRefreshFlag(!refreshFlag);
      launchAlert("success", `Plate ${inputPlateName} d successfully`);
    } else {
      launchAlert("error", "Error creating plate");
    }
  };

  const handleMovePlate = async () => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }
    if (!pf400ID) {
      launchAlert("error", "No pf400 ID available");
      return;
    }

    const plate = inventory.plates.filter((plate) => plate.name === inputPlateName)[0];
    if (!plate) {
      launchAlert("warning", "No plate with this name in inventory");
      return;
    }
    if (!plate.nest_id) {
      launchAlert("warning", "Plate is not checked in");
      return;
    }
    const destination_nest = inventory.nests.filter((nest) => nest.name === inputNestName)[0];
    if (!destination_nest) {
      launchAlert("warning", "No nest with this name in inventory");
      return;
    }
    if (destination_nest.name.includes("liconic")) {
      launchAlert("warning", "Cannot move plate into liconic");
      return;
    }

    try {
      const source_nest = inventory.nests.filter((nest) => nest.id === plate.nest_id)[0];

      const toolCommand: ToolCommandInfo = {
        toolId: pf400ID,
        toolType: "pf400" as ToolType,
        command: "smart_transfer",
        params: {
          source_nest: { nest: source_nest.name },
          destination_nest: { nest: destination_nest.name },
          motion_profile_id: 3,
        },
      };

      const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
        toolCommand
      );

      if (response && response.response === ResponseCode.SUCCESS) {
        await inventoryApiClient.updatePlate(plate.id, {
          nest_id: destination_nest.id,
        } as PlateUpdate);
        setRefreshFlag(!refreshFlag);
        launchAlert(
          "success",
          `Plate ${inputPlateName} moved successfully to nest ${destination_nest.name}`
        );
      } else {
        launchAlert("error", "Error moving plate");
      }
    } catch (error) {
      launchAlert("error", "Error moving plate");
    };
  };

  const handleDeletePlate = async () => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }

    const plate = inventory.plates.filter((plate) => plate.name === inputPlateName)[0];

    if (!plate) {
      launchAlert("warning", "No plate with this name in inventory");
      return;
    }

    try {
      await inventoryApiClient.deletePlate(plate.id);
      setRefreshFlag(!refreshFlag);
      setSelectedPlate(null);
      launchAlert("success", `Plate ${inputPlateName} deleted successfully`);
    } catch (error) {
      launchAlert("error", "Error deleting plate");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query: string = e.target.value;
    setSearch(query);
    if (query && platesFuseInstance && reagentsFuseInstance) {
      const plateResults = platesFuseInstance.search(query);
      const reagentResults = reagentsFuseInstance.search(query);
      if (plateResults || reagentResults) {
        const results = [
          ...plateResults.map((result) => result.item),
          ...reagentResults.map((result) => result.item),
        ];
        setSearchResults(results);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleReagentResultClick = (reagent: Reagent) => {
    if (!inventory) {
      launchAlert("error", "No inventory available");
      return;
    }
    try {
      const well = inventory.wells.filter((well) => well.id === reagent.well_id)[0];
      const plate = inventory.plates.filter((plate) => plate.id === well.plate_id)[0];
      if (plate) {
        setSelectedPlate(plate);
      }
    } catch (error) {
      launchAlert("error", "Error finding plate");
    }
  };

  function isPlate(element: Plate | Reagent): element is Plate {
    return (element as Plate).plate_type !== undefined;
  }

  function isReagent(element: Plate | Reagent): element is Reagent {
    return (element as Reagent).volume !== undefined;
  }

  const isNumber = (str: string): boolean => {
    return !Number.isNaN(Number(str));
  };


  return (
    <Box maxWidth="1800px" margin="auto">
      {printAndLabelPlateModal()}
      {loadLiconicModal()}
      <Box display="flex" justifyContent="center" alignItems="center" width="100%">
        <VStack spacing={2} align="start" width="50%">
          <FormControl>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                type="text"
                placeholder="Search Inventory"
                value={search}
                onChange={handleSearch}
              />
              <InputRightElement>
                <CloseIcon
                  cursor="pointer"
                  color="gray.300"
                  onClick={() => {
                    setSearch("");
                    setSearchResults([]);
                  }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Box maxH="200px" overflowY="auto">
            <List spacing={2}>
              {searchResults.map((result, index) => (
                <ListItem
                  key={`${result.id}-${result.name}`}
                  bg={
                    isDarkMode
                      ? index % 2 === 0
                        ? "gray.800"
                        : "gray.700"
                      : index % 2 === 0
                      ? "white"
                      : "gray.100"
                  }>
                  {isPlate(result) && (
                    <Tooltip label="Click to find corresponding plate">
                      <Text onClick={() => setSelectedPlate(result)} cursor="pointer">
                        Plate: {result.name} | {result.plate_type} | {result.barcode} |{" "}
                        {result.nest_id ? "Checked in" : "Not checked in"}
                      </Text>
                    </Tooltip>
                  )}
                  {isReagent(result) && (
                    <Tooltip label="Click to find corresponding plate">
                      <Text onClick={() => handleReagentResultClick(result)} cursor="pointer">
                        {isNumber(result.name)
                          ? `Culture: ${result.name} | creation: ${result.expiration_date} | `
                          : `Reagent: ${result.name} | ${result.volume} µL | expiry: ${result.expiration_date} | `}
                        inventory well ID {result.well_id}
                      </Text>
                    </Tooltip>
                  )}
                </ListItem>
              ))}
            </List>
          </Box>
        </VStack>
      </Box>
      <HStack spacing="8" py="16">
        <VStack align="center" spacing="4">
          <Text fontSize="xl">Plates</Text>
          <Button
            colorScheme="gray"
            variant={mode === "checkin" ? "solid" : "outline"}
            width="100%"
            onClick={() => setMode("checkin")}>
            Check In Plate
          </Button>
          <Button
            colorScheme="gray"
            variant={mode === "checkout" ? "solid" : "outline"}
            width="100%"
            onClick={() => setMode("checkout")}>
            Check Out Plate
          </Button>
          <Button
            colorScheme="gray"
            variant={mode === "move" ? "solid" : "outline"}
            width="100%"
            onClick={() => setMode("move")}>
            Move Plate
          </Button>
          {isLoading && <Spinner ml={2} />} {/* Spinner appears next to the button when loading */}
          <Button
            colorScheme="gray"
            variant={mode === "" ? "solid" : "outline"}
            width="100%"
            onClick={() => setMode("")}>
             Plate
          </Button>
          <Button
            colorScheme="gray"
            variant={mode === "delete" ? "solid" : "outline"}
            width="100%"
            onClick={() => setMode("delete")}>
            Delete Plate
          </Button>
        </VStack>
        {mode === "checkin" && (
          <VStack align="center" spacing="4">
          <Text fontSize="xl">Check In Plate</Text>
          <InputGroup>
          </InputGroup>
            <InputGroup>
  
              {<Select
                  placeholder="Select plate"
                  value={inputPlateName}
                  onChange={(e) => setInputPlateName(e.target.value)}
                >
                  {inventory?.plates
                  .filter((plate) => plate.nest_id) // only include plates that are checked-in
                  .map((plate) => (
                    <option key={plate.id} value={plate.name !== null ? plate.name : ""}>
                      {plate.name} ({plate.barcode}) - {plate.plate_type} - Nest: {plate.nest_id}
                    </option>
                  ))}
                </Select>
              }

            </InputGroup>
            <InputGroup>
              <InputLeftAddon>
              Nest ID
              </InputLeftAddon>
              <Input
                placeholder="(optional) Click a nest"
                value={inputNestName}
                onChange={(e) => setInputNestName(e.target.value)}
              />
            </InputGroup>
            <Text fontSize="xs">
              Will default to next available nest in liconic if no nest specified
            </Text>
            <Button colorScheme="gray" variant="outline" width="100%" onClick={handleCheckInPlate}>
              Check In
            </Button>
            
          </VStack>
        )}
        {mode == "checkout" && (
          <VStack align="center" spacing="4">
            <Text fontSize="xl">Check Out Plate</Text>
            <InputGroup>
              <InputLeftAddon >
              Name
              </InputLeftAddon>
              <Input
                placeholder="Type plate name or click plate"
                value={inputPlateName}
                onChange={(e) => setInputPlateName(e.target.value)}
              />
            </InputGroup>
            <Button colorScheme="gray" variant="outline" width="100%" onClick={handleCheckOutPlate}>
              Check Out
            </Button>
          </VStack>
        )}
        {mode == "" && (
          <VStack align="center" spacing="4">
            <Text fontSize="xl"> Reagent Plate</Text>
            <InputGroup>
              <InputLeftAddon>
              Plate Name
              </InputLeftAddon>
              <Input
                placeholder="Type name of plate"
                value={inputPlateName}
                onChange={(e) => setInputPlateName(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>
                Plate Type
              </InputLeftAddon>
              <Select
                placeholder="Select type of plate"
                value={inputPlateType}
                onChange={(e) => setInputPlateType(e.target.value)}>
                <option key="96 well" value="96 well">
                  96 well
                </option>
              </Select>
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>
              Destination Nest
              </InputLeftAddon>
              <Input
                placeholder="Type nest name or click nest"
                value={inputNestName}
                onChange={(e) => setInputNestName(e.target.value)}
              />
            </InputGroup>
            <Button colorScheme="green" variant="outline" width="100%" onClick={handlePlate}>
               Plate
            </Button>
          </VStack>
        )}
        {mode == "move" && (
          <VStack align="center" spacing="4">
            <Text fontSize="xl">Move Plate</Text>
            <Text fontSize="xs">
              Note, cannot move plates into liconic. Must use Checkout/Checkin to control liconic.
            </Text>
            <InputGroup>
              <InputLeftAddon >
                Source Plate
              </InputLeftAddon>
              <Input
                placeholder="Type plate name or click plate"
                value={inputPlateName}
                onChange={(e) => setInputPlateName(e.target.value)}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>
              Destination Nest
              </InputLeftAddon>
              <Input
                placeholder="Type nest name or click nest"
                value={inputNestName}
                onChange={(e) => setInputNestName(e.target.value)}
              />
            </InputGroup>
            <Button colorScheme="gray" variant="outline" width="100%" onClick={handleMovePlate}>
              Move plate
            </Button>
          </VStack>
        )}
        {mode == "delete" && (
          <VStack align="center" spacing="4">
            <Text fontSize="xl">Delete Plate</Text>
            <InputGroup>
              <InputLeftAddon>
              Name
              </InputLeftAddon>
              <Input
                placeholder="Type plate name or click plate"
                value={inputPlateName}
                onChange={(e) => setInputPlateName(e.target.value)}
              />
            </InputGroup>
            <Button colorScheme="red" variant="outline" width="100%" onClick={handleDeletePlate}>
              Delete
            </Button>
          </VStack>
        )}
        {selectedPlate && (
          <VStack align="stretch" spacing="4">



        <InteractivePlateVisualizer
          plate={selectedPlate}
          wells={selectedWells}
          reagents={selectedReagents}
          refreshOnChange={() => setRefreshFlag(!refreshFlag)}
        />
        </VStack>
        
      )}
      </HStack>
      
      {showAlert && (
        <Alert status={alertStatus}>
          <AlertIcon />
          <AlertTitle mr={2}>
            {alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}!
          </AlertTitle>
          <AlertDescription>{alertDescription}</AlertDescription>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setShowAlert(false)}
          />
        </Alert>
      )}
      {loading && <Progress hasStripe colorScheme='yellow' size="sm" isIndeterminate />}
      <Box h="2px" bg="gray.200" width="100%" my="12px" />
      {!inventory && <Alert status="info">No inventory available. Reference documentation on how to build inventory</Alert>}
      {inventory && (
        <InventoryVisualizer
          inventory={inventory}
          onSelectedNestChange={(nest) => setSelectedNest(nest)}
          onSelectedPlateChange={(plate) => setSelectedPlate(plate)}
        />
      )}
    </Box>
  );
}