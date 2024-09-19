import React, { useState, useEffect } from "react";
import { Toast, useToast, Select } from "@chakra-ui/react";
import { Plate, Reagent, ReagentCreate, Well } from "@/server/utils/InventoryClient";
import axios from "axios";
import {
  Box,
  Text,
  Grid,
  Spacer,
  Flex,
  Button,
  VStack,
  Input,
  Stack,
  InputGroup,
  InputLeftAddon,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { inventoryApiClient } from "@/server/utils/InventoryClient";
import { GrPrint } from "react-icons/gr";
import { Icon } from '@chakra-ui/react'
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { ToolType } from "gen-interfaces/controller";
import Barcode from "../../components/barcode";

import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
type PlateProps = {
  plate: Plate;
  wells: Well[];
  reagents: Reagent[];
  fillable?: boolean;
  mini?: boolean;
  refreshOnChange?: (flag: boolean) => void;
};
type APIResponse = {
  results: {
    id: number;
    name: string; // The "name" property containing the reagent name
    compound_type: string;
    company: string;
    catalog_number: string;
    // Add other properties as needed
  }[];
};

const InteractivePlateVisualizer: React.FC<PlateProps> = ({
  plate,
  wells,
  reagents,
  fillable = true,
  mini = false,
  refreshOnChange = () => {},
}) => {
  const [selectedWells, setSelectedWells] = useState<Well[]>([]);
  const [selectedReagents, setSelectedReagents] = useState<Reagent[]>([]);

  const handleSelectAllWells = () => {
    setSelectedWells(wells); // Set selectedWells to all the wells from the wells prop
  };
  // Function to handle selecting all wells in a specific column
  const handleSelectColumn = (columnIndex: number) => {
    const wellsInColumn = wells.filter((well) => well.column === columnIndex);
    const allWellsInColumnSelected = wellsInColumn.every((well) => selectedWells.includes(well));

    if (allWellsInColumnSelected) {
      setSelectedWells(selectedWells.filter((well) => !wellsInColumn.includes(well)));
    } else {
      setSelectedWells([...selectedWells, ...wellsInColumn]);
    }
  };

  // Function to handle selecting all wells in a specific row
  const handleSelectRow = (rowIndex: number) => {
    const wellsInRow = wells.filter((well) => well.row === String.fromCharCode(65 + rowIndex));
    const allWellsInRowSelected = wellsInRow.every((well) => selectedWells.includes(well));

    if (allWellsInRowSelected) {
      setSelectedWells(selectedWells.filter((well) => !wellsInRow.includes(well)));
    } else {
      setSelectedWells([...selectedWells, ...wellsInRow]);
    }
  };
  const [reagentName, setReagentName] = useState("");
  const [reagentList, setReagentList] = useState<string[]>([]); // State to hold the list of reagent names from the API
  const [expirationDate, setExpirationDate] = useState("2023-12-31");
  const [volume, setVolume] = useState("1000");
  const [mouseIsDown, setMouseIsDown] = useState<boolean>(false);
  const [lastSelectedWell, setLastSelectedWell] = useState<Well | null>(null);
  const [isBarcodePrinting, setIsBarcodePrinting] = useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertStatus, setAlertStatus] = useState<
    "error" | "info" | "warning" | "success" | "loading"
  >("success");
  const [alertDescription, setAlertDescription] = useState<string>("");
  const availableIDsQuery = trpc.tool.availableIDs.useQuery();
  const availableIDs = availableIDsQuery.data;
  const vcodeId = availableIDs?.filter((id) => id.includes("vcode"))[0];
  const commandMutation = trpc.tool.runCommand.useMutation();
  const domain = "https://app.science.xyz";
  const fetchReagentList = async () => {
    try {
      const response = await axios.get<APIResponse>(`${domain}/api/compounds`, {
        params: {
          "q[compound_type_in]": ["Complete Media", "Basement Membrane", "Dissociation Reagent","Pipette Tip", "Reagent"], // Include "Basement Membrane" as a compound type
          per_page: -1,
        },
      });
      setReagentList(response.data.results.map((reagent) => reagent.name));
    } catch (error) {
      console.error("Error while fetching reagent list", error);
      // Handle error or show a toast to the user
    }
  };
  

  useEffect(() => {
    fetchReagentList();
    const handleGlobalMouseUp = () => {
      setMouseIsDown(false);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const handleReagentNameChange = (selectedName: string) => {
    setReagentName(selectedName);
  };

  const toast = useToast();

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

  const handlePrintAndApply = async () => {
    if (!vcodeId) {
      return;
    }
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    let todayString = mm + '/' + dd + '/' + yyyy;
    const barcode = plate.barcode;
    const labwareType = plate.plate_type
    const plateName  = plate.name;
    console.log("Vcode ID is" + vcodeId);
    const toolCommand: ToolCommandInfo = {
      toolId: vcodeId,
      toolType: "vcode" as ToolType,
      command: "print_and_apply",
      params: {
        format_name: "1",
        side: "west",
        drop_stage: false,
        field_0: `WP-${plateName}`,
        field_1: barcode,
        field_2: plateName,
        field_3:todayString, 
        field_4: "", 
        field_5: "", 
      },
    };
    const response: ExecuteCommandReply | undefined = await commandMutation.mutateAsync(
      toolCommand
    );
    console.log("Printing barcode", barcode);
    console.log("Plate types is" + plate.plate_type);
  }

  const handlePrintBarcode = async () => {
    
    try {
      const barcodeData = plate.barcode;
      setIsBarcodePrinting(true);
      await axios.post("http://10.20.1.86:8425/print", { code: barcodeData });
      setIsBarcodePrinting(false);
      toast({
        title: "Barcode printed",
        description: "Barcode printed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setIsBarcodePrinting(false);
      toast({
        title: "Error",
        description: "Failed to print the barcode. Please check the printer connection.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleWellClick = (well: Well) => {
    const isSelected = selectedWells.includes(well);
    const updatedSelectedWells = isSelected
      ? selectedWells.filter((w) => w !== well)
      : [...selectedWells, well];

    setSelectedWells(updatedSelectedWells);
  };

  const handleAddReagent = async () => {
    for (const well of selectedWells) {
      const reagent = {
        name: reagentName,
        expiration_date: expirationDate,
        volume: Number(volume),
        well_id: well.id,
      } as ReagentCreate;
      await inventoryApiClient.createReagent(reagent);
    }
    setSelectedWells([]);
    refreshOnChange(true);
  };

  const handleClearReagents = async () => {
    for (const well of selectedWells) {
      const wellReagents = reagents.filter((reagent) => reagent.well_id === well.id);
      for (const reagent of wellReagents) {
        await inventoryApiClient.deleteReagent(reagent.id);
      }
    }
    setSelectedWells([]);
    setSelectedReagents([]);
    refreshOnChange(true);
  };

  const calculateRowsAndColumns = () => {
    let rows = new Set();
    let maxColumn = 0;

    wells.forEach((well) => {
      rows.add(well.row);
      if (well.column > maxColumn) {
        maxColumn = well.column;
      }
    });

    return {
      numberOfRows: rows.size,
      numberOfColumns: maxColumn,
    };
  };

  const getReagentsInWell = (well: Well) => {
    return reagents.filter((reagent) => reagent.well_id === well.id);
  };
  const [tipSize, setTipSize] = useState(""); // State to manage selected tip size
  const handleRefillTips = async () => {
    setSelectedWells(wells); // Automatically select all wells before refilling
    await new Promise(r => setTimeout(r, 100)); // Short delay to ensure state update before proceeding

    for (const well of wells) {
      const reagent = {
        name: `${tipSize} tip`, // Dynamically set the name based on the selected tip size
        expiration_date: "2024-12-31", // Static value as per your request
        volume: 1, // Assuming the volume is static as per your example
        well_id: well.id, // Dynamically assign the well ID from each well in the loop
      } as ReagentCreate;
      await inventoryApiClient.createReagent(reagent);
    }
    setSelectedWells([]); // Optionally clear selection after refill
    refreshOnChange(true); // Refresh or update the UI as necessary
  };


  const createWellGrid = () => {
    const rows = "ABCDEFGHIJKLMNOP";
    const columns = 12;
    const { numberOfRows, numberOfColumns } = calculateRowsAndColumns();

    const rowButtons = Array.from({ length: numberOfRows }, (_, index) => (
      <VStack key={`row-${index}`} spacing={mini ? "0" : "0.125rem"}>
        <Button
          onClick={() => handleSelectRow(index)}
          size="xs"
          width={mini ? "1rem" : "2.5rem"}
          height={mini ? "1rem" : "2.5rem"}
          colorScheme="gray"
          variant="solid">
          {rows[index]}
        </Button>
      </VStack>
    ));

    const columnButtons = Array.from({ length: numberOfColumns }, (_, index) => (
      <Button
        key={`column-${index}`}
        onClick={() => handleSelectColumn(index + 1)}
        size="xs"
        width={mini ? "1rem" : "2.5rem"}
        height={mini ? "1rem" : "2.5rem"}
        colorScheme="gray"
        variant="solid">
        {index + 1}
      </Button>
    ));
    const gridItems = wells.map((well, index) => {
      const rowIndex = rows.indexOf(well.row);
      const columnIndex = well.column - 1;
      const wellReagents = getReagentsInWell(well);
      const hasReagents = wellReagents.length > 0;

      const wellButton = (
        <Button key={index}
          style={{
            padding: mini ? "1px" : "8px",
            minWidth: mini ? "1rem" : "2.5rem",
            minHeight: mini ? "1rem" : "2.5rem",
            width: mini ? "1rem" : "2.5rem",
            height: mini ? "1rem" : "2.5rem",
          }}
          colorScheme={
            selectedWells.includes(well) ? "red" : rowIndex % 2 === 0 ? "blue" : "blue"
          }
          
          variant={hasReagents ? "solid" : "outline"}
          onMouseDown={() => {
            setMouseIsDown(true);
            handleWellClick(well);
          }}
          onMouseUp={() => setMouseIsDown(false)}
          onMouseEnter={() => {
            if (mouseIsDown) {
              handleWellClick(well);
            }
          }}>
          {!mini && (
            <>
              {well.row}
              {well.column}
            </>
          )}
        </Button>
      );

      const reagentTooltipContent = hasReagents
        ? wellReagents
            .map(
              (reagent) =>
                `${reagent.name} - ${reagent.volume}µl - Expiry: ${reagent.expiration_date}`
            )
            .join("\n")
        : "";

      return (
        <Box
          key={`well-${well.id}`}
          gridColumnStart={columnIndex + 1}
          gridRowStart={rowIndex + 1}
          textAlign="center"
          style={mini ? { display: "inline-flex" } : {}}>
          {hasReagents ? (
            <Tooltip label={reagentTooltipContent} hasArrow>
              {wellButton}
            </Tooltip>
          ) : (
            wellButton
          )}
        </Box>
      );
    });

    return (
      <Flex direction="row" alignItems="flex-start">
        {/* Row buttons */}
        <VStack spacing={mini ? "0" : "0.125rem"} alignItems="flex-start">
          {rowButtons}
        </VStack>

        {/* Well grid and column buttons */}
        <Flex direction="column" justifyContent="flex-start">
          <Box
            display="grid"
            gap={mini ? "0" : "0.125rem"}
            gridTemplateColumns={`min-content repeat(${numberOfColumns}, 1fr)`}
            gridTemplateRows={`repeat(${numberOfRows}, 1fr)`}
            alignItems={mini ? "start" : "stretch"}
            width="min-content">
            {gridItems}
          </Box>

          {/* Column buttons */}
          <HStack spacing={mini ? "0" : "0.125rem"}>{columnButtons}</HStack>
        </Flex>
      </Flex>
    );
  };

  return (
    <HStack>
      <VStack>
        <HStack>
          <Button colorScheme='blue' onClick={handlePrintAndApply} isLoading={isBarcodePrinting} loadingText="Printing...">
            <Icon as ={GrPrint}></Icon><Text marginLeft={2}>Label Plate</Text> 
          </Button>
          <Barcode value={plate.barcode} /> 
        </HStack>

          <Box>
          {/* Row buttons */}
          {createWellGrid()}
          {/* Column buttons */}
        </Box>
      </VStack>


      {fillable && (
        <VStack>
          <InputGroup>
          <InputLeftAddon  />
            <Input
              value={reagentName}
              onChange={(e) => setReagentName(e.target.value)}
              placeholder="Reagent name"
              // Implement autocomplete by filtering the reagentList based on user input
              autoComplete="off" // Disable browser's default autocomplete
              list="reagent-suggestions" // Create a data list element with suggestions
            />
            <datalist id="reagent-suggestions">
              {reagentList.map((name, index) => (
                <option key={`reagent-${index}`} value={name} />
              ))}
            </datalist>
          </InputGroup>
          <InputGroup>
            <InputLeftAddon  />
            <Input
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              placeholder="Expiration date"
            />
          </InputGroup>
          <InputGroup>
            <InputLeftAddon  />
            <Input
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="Volume"
            />
          </InputGroup>
          <HStack>
          <Select placeholder="Select tip size" value={tipSize} onChange={(e) => setTipSize(e.target.value)}>
            <option value="10 ul">10 µl</option>
            <option value="20 ul">20 µl</option>
            <option value="200 ul">200 µl</option>
            <option value="1000 ul">1000 µl</option>
            {/* Add more tip sizes as needed */}
          </Select>
          <Button onClick={handleRefillTips} isDisabled={!tipSize}>Refill Tips</Button>
        </HStack>
          <Button
            onClick={() => handleAddReagent()}
            disabled={!reagentName && !expirationDate && !volume}>
            Add reagent to well(s)
          </Button>
          <Button onClick={handleSelectAllWells}>Select All</Button>
          <Button onClick={handleClearReagents} colorScheme="red">
            Clear reagents
          </Button>
          <Button onClick={() => setSelectedWells([])}>Unselect wells</Button>
        </VStack>
      )}
    </HStack>
  );
};

export default InteractivePlateVisualizer;