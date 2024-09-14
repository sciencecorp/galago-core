import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';
import HelixClient, { helixClient } from "@/server/utils/HelixClient";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { mirage } from 'ldrs';
import {
    Box,
    Button,
    FormControl,
    Input,
    Tooltip,
    Progress,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Stack,
    IconButton,
    Text,
    Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon, DownloadIcon, ArrowForwardIcon, ArrowDownIcon, ArrowUpIcon, CloseIcon, SearchIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons';
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css';
import styles from './ImagesPage.module.css';
import { useDisclosure, Switch } from "@chakra-ui/react";
import DataSideBar from "@/components/data/DataSideBar";

// if (typeof document !== 'undefined') {
//     Modal.setAppElement('#__next');
// }

interface PlateData {
    type: any;
    wells: { [key: string]: any[] };
}

//mirage.register(); 

const getPlateDimensions = (type: string): { rows: number, columns: number } => {
    switch (type) {
        case '6 well':
            return { rows: 2, columns: 3 };
        case '24 well':
            return { rows: 4, columns: 6 };
        case '48 well':
            return { rows: 6, columns: 8 };
        case '96 well':
            return { rows: 8, columns: 12 };
        case '384 well':
            return { rows: 16, columns: 24 };
        default:
            return { rows: 8, columns: 12 }; // Default to 96-well
    }
};

const CellImaging: React.FC = () => {
    const [selectedWell, setSelectedWell] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [plateData, setPlateData] = useState<PlateData | null>(null);
    const [searchResult, setSearchResult] = useState<any | null>(null);
    const [dataObjects, setDataObjects] = useState<{ id: number, date: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false); // Loading state
    const [selectedImages, setSelectedImages] = useState<any[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedPlateInfo, setSelectedPlateInfo] = useState<any | null>(null); // Add state for selected plate info
    const [selectedDataObjectID, setSelectedDataObjectID] = useState<number | null>(null);
    const [isAnnotationMode, setIsAnnotationMode] = useState<boolean>(false);
    const [annotations, setAnnotations] = useState<{ well: string, image: string, label: string }[]>([]); // Annotation state
    const [annotationLabel, setAnnotationLabel] = useState<string>(''); // Annotation label state
    const [circleCoordinates, setCircleCoordinates] = useState<{ x: number, y: number }[]>([]); // Coordinates for drawing
    const [undoStack, setUndoStack] = useState<{ x: number, y: number }[]>([]); // Stack for undo
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [savingAnnotation, setSavingAnnotation] = useState<boolean>(false);
    const [helixDataObject, setHelixDataObject] = useState<any | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [colorMapOpen, setColorMapOpen] = useState(false);
    const [greenWells, setGreenWells] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);
    const [isApplied, setIsApplied] = useState(false);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isBioLensActive, setIsBioLensActive] = useState(false);
    const [isManualAnnotationActive, setIsManualAnnotationActive] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.document) {
            Modal.setAppElement('#__next');
        }
    }, []);


    useEffect(() => {
        if (typeof window !== 'undefined' && window.document) {
            Modal.setAppElement('#__next');
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowUp':
                    handleArrowClick('up');
                    break;
                case 'ArrowDown':
                    handleArrowClick('down');
                    break;
                case 'ArrowLeft':
                    handleArrowClick('left');
                    break;
                case 'ArrowRight':
                    handleArrowClick('right');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedWell, plateData]);

    interface Metadata {
        size: number;
        filename: string;
        mime_type: string;
    }

    interface FileData {
        id: string;
        metadata: Metadata;
    }

    interface DataObject {
        bucket: string;
        created_at: string;
        data_object_id: number;
        data_object_tag: string;
        discarded_at: string | null;
        file_data: FileData;
        storage: string;
        id: number;
        local_source_path: string;
        updated_at: string;
        object_data?: {
            annotations?: { well: string, coordinates: { x: number, y: number }[], label: string }[]
        };
    }

    function findFileDataByWellName(dataObjects: DataObject[], row: number, col: number): { url: string, filename: string }[] {
        const matchedFiles: { url: string, filename: string }[] = [];

        for (const dataObject of dataObjects) {
            const filename = dataObject.file_data.metadata.filename;
            const wellNameMatch = filename.match(/_(\w\d{1,2})_/);
            if (wellNameMatch && wellNameMatch[1] === `${String.fromCharCode(65 + row)}${col + 1}`) {
                matchedFiles.push({
                    url: `https://app.science.xyz/api/data_object_files/preview_file?data_object_file_id=${dataObject.id}&file_key=${dataObject.file_data.id}`,
                    filename: dataObject.file_data.metadata.filename
                });
            }
        }

        return matchedFiles;
    }

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query: string = e.target.value;
        setSearchQuery(query);
        setErrorMessage(null); // Clear error message

        if (query.length >= 4) {
            try {
                const result = await helixClient.getWP(Number(query));
                setSearchResult(result || null);
            } catch (error) {
                console.error("Error fetching search result:", error);
                setSearchResult(null);
            }
        } else {
            setSearchResult(null);
            setPlateData(null); // Clear plate data when search bar is emptied
            setDataObjects([]); // Clear data objects when search bar is emptied
        }
    };

    const getDataObjectsFromWellPlateID = async (wellPlateID: number) => {
        try {
            const DataObjectsIDs = await helixClient.getDataObjectIDsFromWellPlateID(wellPlateID);
            if (DataObjectsIDs === null || DataObjectsIDs.length === 0) {
                setErrorMessage(`No data objects found for well plate ID: ${wellPlateID}`);
                return null;
            }
            const detailedDataObjects = await Promise.all(DataObjectsIDs.map(async (obj: { id: number; }) => {
                const dataObject = await getDataObjectsFromID(obj.id);
                return { id: obj.id, date: dataObject.acquired_at }; // Adjust this based on the actual date field
            }));
            return detailedDataObjects;
        } catch (error) {
            setErrorMessage(`Error fetching data for well plate ID: ${wellPlateID}`);
            console.error('Error fetching data:', error);
            return null;
        }
    };

    const getDataObjectsFromID = async (dataObjectID: number) => {
        const DataObjects = await helixClient.getDataObjectFromID(dataObjectID);
        return DataObjects;
    }

    const handlePlateClick = async (plate: any) => {
        setSelectedWell(null);
        setSelectedImage(null);
        setLoading(true);
        try {
            const response = plate;
            if (!response.id) {
                console.error('No data found for plate:', plate);
                return;
            }
            const detailedDataObjects = await getDataObjectsFromWellPlateID(response.id);

            setDataObjects(detailedDataObjects || []); // Store detailed data objects
            setSelectedPlateInfo(response); // Store plate info

            // Fetch and display images for the first data object by default
            if (detailedDataObjects && detailedDataObjects.length > 0) {
                handleDataObjectClick(detailedDataObjects[0].id, response);
            }
        } catch (error) {
            console.error('Error fetching plate data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDataObjectClick = async (dataObjectID: number, plateInfo: any) => {
        try {
            setSelectedDataObjectID(dataObjectID); // Track selected data object ID
            const helix_data_object = await getDataObjectsFromID(dataObjectID);
            setHelixDataObject(helix_data_object);
            const wells = plateInfo.wells.reduce((acc: { [key: string]: { url: string, filename: string }[] }, well: any) => {
                const parsedData = findFileDataByWellName(helix_data_object.data_object_files, well.row_index, well.column_index);
                const row = String.fromCharCode(65 + well.row_index);
                const col = well.column_index + 1;
                acc[`${row}${col}`] = parsedData;
                return acc;
            }, {});
            setPlateData({
                type: plateInfo.well_plate_type.name,
                wells,
            });
            setIsBioLensActive(false);
            setIsManualAnnotationActive(false);
            setPredictions([]);
        } catch (error) {
            console.error('Error fetching data object:', error);
        }
    };

    useEffect(() => {
        if (plateData && helixDataObject) {
            const wells = Object.keys(plateData.wells);
            const annotatedWells = wells.filter(well => {
                const annotations = helixDataObject.object_data?.annotations || [];
                const wellAnnotation = annotations.find((a: any) => a.well === well);
                return wellAnnotation && wellAnnotation.coordinates.length === 1;
            });
            setGreenWells(annotatedWells);
        }
    }, [plateData, helixDataObject]);

    const copyGreenWellsToClipboard = () => {
        let greenWells: string[] = [];
    
        if (isBioLensActive && predictions.length > 0) {
            greenWells = predictions
                .filter(p => p.colony_count === 1)
                .map(p => p.well_address);
        } else if (isManualAnnotationActive && helixDataObject && helixDataObject.object_data && helixDataObject.object_data.annotations) {
            greenWells = helixDataObject.object_data.annotations
                .filter((annotation: any) => annotation.coordinates.length === 1)
                .map((annotation: any) => annotation.well);
        }
    
        const wellList = greenWells.join(', ');
        navigator.clipboard.writeText(wellList).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };

    const toggleManualAnnotation = () => {
        setIsManualAnnotationActive(!isManualAnnotationActive);
        setIsBioLensActive(false); // Turn off BioLens when manual annotation is toggled on
    };

    const toggleBioLens = () => {
        const newBioLensState = !isBioLensActive;
        setIsBioLensActive(newBioLensState);
        setIsManualAnnotationActive(false); // Turn off manual annotations when BioLens is toggled on
        if (newBioLensState) {
            handleApplyBioLens();
        }
    };

    const handleApplyBioLens = async () => {
        setIsApplied(true);
        try {
            if (helixDataObject && helixDataObject.object_data && helixDataObject.object_data.predictions) {
                setPredictions(helixDataObject.object_data.predictions);
            } else {
                console.error("Predictions not found in the data object");
            }
        } catch (error) {
            console.error("Error applying BioLens:", error);
        } 
    };

    const getWellColor = (well: string) => {
        if (isBioLensActive && predictions.length > 0) {
            const prediction = predictions.find(p => p.well_address === well);
            if (prediction) {
                if (prediction.colony_count > 1) return 'orange';
                if (prediction.colony_count === 1) return 'green';
                return 'gray';
            }
        }
    
        if (isManualAnnotationActive && helixDataObject && helixDataObject.object_data && helixDataObject.object_data.annotations) {
            const wellAnnotations = helixDataObject.object_data.annotations.filter((annotation: any) => annotation.well === well);
            for (const annotation of wellAnnotations) {
                if (annotation.label === 'inconclusive' || String(annotation.label) === 'i'.toLowerCase()) return 'red';
                if (annotation.coordinates.length >= 2) return 'orange';
                if (annotation.coordinates.length === 1) return 'green';
            }
        }
        return 'gray'; // Default color
    };

    const handleWellClick = (well: string) => {
        if (plateData) {
            setSelectedWell(well);
            setCircleCoordinates([]); // Clear the coordinates when switching wells
            const images = plateData.wells[well].sort((a, b) => {
                const nameA = a.filename.slice(0, 10).toLowerCase();
                const nameB = b.filename.slice(0, 10).toLowerCase();
                return nameA.localeCompare(nameB);
            }) || [{ url: 'https://via.placeholder.com/150', filename: 'Placeholder' }];
            setSelectedImages(images);
            setSelectedImage(images[currentImageIndex].url);
            //setCurrentImageIndex(0);
            <Box
            key={well}
            className={`${styles.well} ${well === selectedWell ? styles.selected : ''}`}>
            {well === selectedWell && (
                <Text fontSize="xs" fontWeight="bold">
                    {well}
                </Text>
            )}
        </Box>
        }

    };

    useEffect(() => {
        if(selectedImages.length > 0 && currentImageIndex > 0){
            setSelectedImage(selectedImages[currentImageIndex].url)}
        }
      ,[currentImageIndex]
    )

    const handleImageButtonClick = (index: number) => {
        setCurrentImageIndex(index);
        setSelectedImage(selectedImages[index].url);
    };

    const handleDownload = async () => {
        if (selectedImage) {
            try {
                const response = await fetch(selectedImage);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedWell}_${currentImageIndex + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error downloading image:', error);
            }
        }
    };

    const closeModal = () => {
        setSelectedWell(null);
        setSelectedImage(null);
        setIsAnnotationMode(false);
        // re-render the plate
        setSelectedPlateInfo(selectedPlateInfo!);
    };

    const getAdjacentWell = (currentWell: string, direction: 'up' | 'down' | 'left' | 'right'): string | null => {
        const row = currentWell.charAt(0);
        const col = parseInt(currentWell.slice(1), 10);
    
        let newRow = row;
        let newCol = col;
    
        if (direction === 'up' && row > 'A') {
            newRow = String.fromCharCode(row.charCodeAt(0) - 1);
        } else if (direction === 'down' && row < String.fromCharCode('A'.charCodeAt(0) + getPlateDimensions(plateData?.type || '96 well').rows - 1)) {
            newRow = String.fromCharCode(row.charCodeAt(0) + 1);
        } else if (direction === 'left' && col > 1) {
            newCol = col - 1;
        } else if (direction === 'right' && col < getPlateDimensions(plateData?.type || '96-well').columns) {
            newCol = col + 1;
        } else if (direction === 'right' && col === getPlateDimensions(plateData?.type || '96-well').columns) {
            // Move to the first well of the next row
            if (row < String.fromCharCode('A'.charCodeAt(0) + getPlateDimensions(plateData?.type || '96-well').rows - 1)) {
                newRow = String.fromCharCode(row.charCodeAt(0) + 1);
                newCol = 1;
            }
        } else {
            return null;
        }
        return `${newRow}${newCol}`;
    };
    

    const handleArrowClick = (direction: 'up' | 'down' | 'left' | 'right') => {
        if (!selectedWell || !plateData) return;

        const newWell = getAdjacentWell(selectedWell, direction);
        if (newWell && plateData.wells[newWell]) {
            setSelectedWell(newWell);
            setCircleCoordinates([]); // Clear the coordinates when switching wells
            const newImages = plateData.wells[newWell].
                    sort((a, b) => {
                        const nameA = a.filename.slice(0, 10).toLowerCase();
                        const nameB = b.filename.slice(0, 10).toLowerCase();
                        return nameA.localeCompare(nameB);
                    });
            setSelectedImage(newImages[currentImageIndex].url); // Access the URL property correctly
            setSelectedImages(newImages);
           // setCurrentImageIndex(0);
        }
    };

    const loadImageToCanvas = (imageSrc: string) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            // Load existing annotations if any
            if (helixDataObject?.object_data?.annotations) {
                const wellAnnotations = helixDataObject.object_data.annotations.find((annotation: any) => annotation.well === selectedWell);
                if (wellAnnotations) {
                    wellAnnotations.coordinates.forEach((coordinate: { x: number, y: number }) => {
                        ctx.fillStyle = 'red'; // Customize your circle color
                        ctx.beginPath();
                        ctx.arc(coordinate.x, coordinate.y, 5, 0, 2 * Math.PI);
                        ctx.fill();
                    });
                }
            }
        };
    };

    useEffect(() => {
        if (isAnnotationMode && selectedImage) {
            loadImageToCanvas(selectedImage);
        }
    }, [isAnnotationMode, selectedImage]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const offsetX = rect.left;
        const offsetY = rect.top;
        const scaleX = canvas.width / rect.width;    // Consider the scale factor
        const scaleY = canvas.height / rect.height;  // Consider the scale factor
        const x = (e.clientX - offsetX) * scaleX;
        const y = (e.clientY - offsetY) * scaleY;

        const radius = 5; // Customize your circle radius
        ctx.fillStyle = 'red'; // Customize your circle color

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();

        setCircleCoordinates([...circleCoordinates, { x, y }]); // Store the coordinates
        setUndoStack([...undoStack, { x, y }]); // Add to undo stack
    };

    const saveAnnotations = async () => {
        if (!canvasRef.current || !selectedWell || !selectedDataObjectID) return;
        setSavingAnnotation(true); // Set loading state to true
        try {
            // Step 1: Get the existing data object
            const existingDataObject = await helixClient.getDataObjectFromID(selectedDataObjectID);
    
            // Step 2: Check if the well already exists in annotations
            const existingAnnotations = existingDataObject.object_data.annotations || [];
            const wellIndex = existingAnnotations.findIndex((annotation: any) => annotation.well === selectedWell);
    
            if (wellIndex !== -1) {
                // Step 3: If the well exists, append the new coordinates to the existing annotations
                existingAnnotations[wellIndex].coordinates.push(...circleCoordinates);
            } else {
                // Step 4: If the well doesn't exist, add a new annotation for that well
                const newAnnotation = { well: selectedWell, coordinates: circleCoordinates, label: annotationLabel };
                existingAnnotations.push(newAnnotation);
            }
    
            const updatedObjectData = {
                ...existingDataObject.object_data,
                annotations: existingAnnotations,
            };
    
            // Step 5: Update the data object with the new object_data
            await axios.put("/api/dataObject", { selectedDataObjectID, updatedObjectData });
    
            // Step 6: Update the local state with the new annotations
            const updatedHelixDataObject = {
                ...helixDataObject,
                object_data: updatedObjectData,
            };
            setHelixDataObject(updatedHelixDataObject); // Update the helixDataObject state
            setAnnotations(updatedObjectData.annotations); // Update the annotations state
            setCircleCoordinates([]); // Clear the coordinates
            setUndoStack([]); // Clear the undo stack
            setIsAnnotationMode(false); // Turn off annotation mode after saving
            setAnnotationLabel(''); // Clear the annotation label
        } catch (error) {
            console.error('Error saving annotation:', error);
        } finally {
            setSavingAnnotation(false); // Reset loading state
        }
    };
    

    const undoLastAnnotation = () => {
        if (undoStack.length === 0) return;

        const newUndoStack = [...undoStack];
        const lastCoordinate = newUndoStack.pop();
        setUndoStack(newUndoStack);

        const newCircleCoordinates = circleCoordinates.filter(coordinate => coordinate !== lastCoordinate);
        setCircleCoordinates(newCircleCoordinates);

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && selectedImage) {
            loadImageToCanvas(selectedImage);
            newCircleCoordinates.forEach(({ x, y }) => {
                ctx.fillStyle = 'red'; // Customize your circle color
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    };

    const clearAnnotations = async () => {
        if (!selectedWell || !selectedDataObjectID) return;
        try {
            // Step 1: Get the existing data object
            const existingDataObject = await helixClient.getDataObjectFromID(selectedDataObjectID);
    
            // Step 2: Filter out the annotations that match the specified well
            const updatedAnnotations = (existingDataObject.object_data.annotations || []).filter(
                (annotation: any) => annotation.well !== selectedWell
            );
    
            // Step 3: Update the data object with the new object_data
            const updatedObjectData = {
                ...existingDataObject.object_data,
                annotations: updatedAnnotations,
            };
    
            // Step 4: Save the updated data object
            await axios.put("/api/dataObject", { selectedDataObjectID, updatedObjectData });
    
            // Step 5: Update the local state with the new annotations
            const updatedHelixDataObject = {
                ...helixDataObject,
                object_data: updatedObjectData,
            };
            setHelixDataObject(updatedHelixDataObject); // Update the helixDataObject state
            setAnnotations(updatedObjectData.annotations); // Update the annotations state
            setCircleCoordinates([]); // Clear the coordinates
            setUndoStack([]); // Clear the undo stack
    
            // Step 6: Clear the canvas
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && selectedImage) {
                loadImageToCanvas(selectedImage);
            }
        } catch (error) {
            console.error('Error clearing annotations:', error);
        } finally {
            setIsAnnotationMode(false); // Turn off annotation mode after clearing
        }
    };
    

    const renderWell = (well: string) => {
        const wellColor = getWellColor(well);

        return (
            <Box
                key={well}
                className={`${styles.well} ${well === selectedWell ? styles.selected : ''}`}
                onClick={() => handleWellClick(well)}
                backgroundColor={wellColor}
            >
                {well}
            </Box>
        );
    };

    const renderPlate = () => {
        if (loading) {
            return <Progress size="xs" isIndeterminate />;
        }
        if (!plateData) return null;
        const { rows, columns } = getPlateDimensions(plateData.type);
        const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, rows).split('');
        const columnNumbers = Array.from({ length: columns }, (_, i) => i + 1);
        return (
            <Box className={styles.wellPlate} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {rowLabels.map(row => columnNumbers.map(col => renderWell(`${row}${col}`)))}
            </Box>
        );
    };

    return (
        <Box width='85%'>
            <Flex left={0} top={0}>
                <DataSideBar/>
                <Box flex="1" p={3}>
                </Box>
            </Flex>
            <FormControl isInvalid={!!errorMessage}>
                <InputGroup>
                    <InputLeftElement pointerEvents="none" children={<SearchIcon color="gray.300" />} />
                    <Input
                        type="text"
                        placeholder="Search Well Plate ID"
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                    <InputRightElement>
                        <CloseIcon
                            cursor="pointer"
                            color="gray.300"
                            onClick={() => {
                                setSearchQuery("");
                                setSearchResult(null);
                                setPlateData(null);
                                setErrorMessage(null);
                                setDataObjects([]);
                            }}
                        />
                    </InputRightElement>
                </InputGroup>
                {errorMessage && <Text color="red.500" mt={2}>{errorMessage}</Text>}
            </FormControl>
            <Box mt={4} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                {searchQuery && !searchResult ? (
                    <Text>No result found</Text>
                ) : (
                    searchResult && (
                        <Stack spacing={3}>
                            <Box
                                key={searchResult.id}
                                onClick={() => handlePlateClick(searchResult)}
                                p={3}
                                border="1px"
                                borderColor="gray.300"
                                borderRadius="md"
                                _hover={{ bg: "gray.500", cursor: "pointer" }}
                            >
                                <Text fontWeight="bold">{searchResult.id}</Text>
                                <Text fontSize="sm"> {searchResult.well_plate_type.name}</Text>
                            </Box>
                        </Stack>
                    ))}
            </Box>

            <Box>
                {dataObjects.map(dataObject => (
                    <Button
                        key={dataObject.id}
                        onClick={() => handleDataObjectClick(dataObject.id, selectedPlateInfo!)}
                        m={2}
                        backgroundColor={dataObject.id === selectedDataObjectID ? 'blue.500' : 'gray.200'}
                        color={dataObject.id === selectedDataObjectID ? 'white' : 'black'}
                    >
                        {`Data Object ${dataObject.id} - ${new Date(dataObject.date).toLocaleDateString()}`}
                    </Button>
                ))}
            </Box>

            {plateData && (
                <>
                    <Button onClick={() => setColorMapOpen(true)} mt={4} ml={4}>
                        Show Color Map
                    </Button>
                    <Button 
                        onClick={copyGreenWellsToClipboard} 
                        mt={4} 
                        ml={4}
                        leftIcon={isCopied ? <CheckIcon /> : <CopyIcon />}
                        colorScheme={isCopied ? "green" : "gray"}
                    >
                        {isCopied ? "Copied!" : "Copy Green Wells"}
                    </Button>
                    <Flex align="center" mt={4} ml={4}>
                        <Switch
                            isChecked={isBioLensActive}
                            onChange={toggleBioLens}
                            colorScheme="purple"
                        />
                        <Text ml={2}>✨BioLens</Text>
                    </Flex>
                    <Flex align="center" mt={4} ml={4}>
                        <Switch
                            isChecked={isManualAnnotationActive}
                            onChange={toggleManualAnnotation}
                            colorScheme="blue"
                        />
                        <Text ml={2}>Manual Annotations</Text>
                    </Flex>
                </>
            )}

            <Modal
                isOpen={colorMapOpen}
                onRequestClose={() => setColorMapOpen(false)}
                contentLabel="Color Map"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <Box className={styles.modalContent} p={6}>
                    <Button onClick={() => setColorMapOpen(false)} mb={4} size="lg">
                        Close
                    </Button>
                    <Box mt={6}>
                        <Text fontSize="xl" fontWeight="bold" mb={4}>Color Map Legend</Text>
                        <Stack spacing={4}>
                            <Flex alignItems="center">
                                <Box width="30px" height="30px" bg="red" mr={4} borderRadius="md" />
                                <Text fontSize="lg">Inconclusive</Text>
                            </Flex>
                            <Flex alignItems="center">
                                <Box width="30px" height="30px" bg="orange" mr={4} borderRadius="md" />
                                <Text fontSize="lg">More than one Cell</Text>
                            </Flex>
                            <Flex alignItems="center">
                                <Box width="30px" height="30px" bg="green" mr={4} borderRadius="md" />
                                <Text fontSize="lg">Single Cells</Text>
                            </Flex>
                            <Flex alignItems="center">
                                <Box width="30px" height="30px" bg="gray" mr={4} borderRadius="md" />
                                <Text fontSize="lg">No Cells</Text>
                            </Flex>
                        </Stack>
                    </Box>
                </Box>
            </Modal>

            <Box className={styles.wellPlateContainer}>
                <Box width="80%" ml="20">
                    {renderPlate()}
                </Box>
            </Box>
            <Modal
                isOpen={!!selectedImage}
                onRequestClose={closeModal}
                shouldCloseOnOverlayClick={true}
                contentLabel="Well Image"
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <Box className={styles.modalContent}>
                    <Button backgroundColor="orange.500"
                        color="white"
                        marginBottom={2}
                        marginTop={2}
                        _hover={{ backgroundColor: "orange.600" }} onClick={() => setIsAnnotationMode(!isAnnotationMode)}>
                        {isAnnotationMode ? 'Exit Labeling Mode' : 'Enter Labeling Mode'}
                    </Button>
                    {selectedImage && (
                        <>
                            {selectedWell && (
                                <div className={styles.wellNameOverlay}>
                                    {selectedWell}
                                </div>
                            )}
                            {!isAnnotationMode && (
                                <InnerImageZoom
                                    src={selectedImage}
                                    zoomSrc={selectedImage}
                                    zoomType="click"
                                    className={styles.modalImage}
                                />                            )}
                            {isAnnotationMode && (
                                <>
                                    <canvas
                                        ref={canvasRef}
                                        width={1000}
                                        height={1000}
                                        className={styles.modalImage}
                                        onMouseDown={startDrawing}
                                    />
                                    <Box mt={4}>
                                        <Button onClick={undoLastAnnotation} colorScheme="blue" mr={3}>Undo</Button>
                                        <Button onClick={clearAnnotations} colorScheme="red">Clear All</Button>
                                    </Box>
                                </>
                            )}

                            {isAnnotationMode && (
                                <Box mt={4}>
                                    <Input
                                        placeholder="Enter metric label - Optional"
                                        value={annotationLabel}
                                        onChange={(e) => setAnnotationLabel(e.target.value)}
                                    />
                                </Box>                            )}
                            {isAnnotationMode && (
                                <Button mt={0} marginLeft={10} marginTop={2} onClick={saveAnnotations}
                                >
                                    Save Annotation</Button>
                            )}

                            {savingAnnotation && (
                                <Box display="flex" justifyContent="center" mt={2}>
                                    <l-mirage size="45"
                                        speed="2.5"
                                        color="black" />
                                </Box>
                            )}

                            <Box display="flex" justifyContent="center" mt={2} flexWrap="wrap">
                                {selectedImages
                                    .slice()
                                    .sort((a, b) => {
                                        const nameA = a.filename.slice(0, 10).toLowerCase();
                                        const nameB = b.filename.slice(0, 10).toLowerCase();
                                        return nameA.localeCompare(nameB);
                                    })
                                    .map((image, index) => {
                                        const filename = image.filename;
                                        let buttonLabel = '';
                                        let buttonColor = 'gray.600'; // Default color

                                        // Check for specific fluorescent protein names using includes
                                        if (filename.includes("gfp")) {
                                            buttonLabel = "GFP";
                                            buttonColor = 'green.500';
                                        } else if (filename.includes("bfp")) {
                                            buttonLabel = "BFP";
                                            buttonColor = 'blue.500';
                                        } else if (filename.includes("rfp")) {
                                            buttonLabel = "RFP";
                                            buttonColor = 'red.500';
                                        } else if (filename.includes("pc")) {
                                            buttonLabel = "PC";
                                            buttonColor = 'gray.600';
                                        } else {
                                            // Extract the number after the well coordinate
                                            const wellNumberMatch = filename.match(/_(\d+)_(\d+)\.png$/);
                                            if (wellNumberMatch) {
                                                buttonLabel = wellNumberMatch[1];
                                            } else {
                                                buttonLabel = filename.split('_').pop()?.split('.')[0] || '';
                                            }
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                onClick={() => handleImageButtonClick(index)}
                                                m={1}
                                                size="xs" // Make buttons smaller
                                                backgroundColor={index === currentImageIndex ? buttonColor : 'gray.400'}
                                                color={index === currentImageIndex ? 'white' : 'black'}
                                            >
                                                {buttonLabel}
                                            </Button>
                                        );

                                    })}

                            </Box>

                        </>
                    )}
                    <IconButton
                        onClick={handleDownload}
                        icon={<DownloadIcon color="black" w={6} h={6} />}
                        aria-label="Download"
                        size="md"
                        variant="ghost"
                        marginLeft={500}
                    />

                    <button className={`${styles.arrowButton} ${styles.left}`} onClick={() => handleArrowClick('left')}>
                        <ArrowBackIcon className={styles.arrowIcon} />
                    </button>
                    <button className={`${styles.arrowButton} ${styles.right}`} onClick={() => handleArrowClick('right')}>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                    </button>
                    <button className={`${styles.arrowButton} ${styles.up}`} onClick={() => handleArrowClick('up')}>
                        <ArrowUpIcon className={styles.arrowIcon} />
                    </button>
                    <button className={`${styles.arrowButton} ${styles.down}`} onClick={() => handleArrowClick('down')}>
                        <ArrowDownIcon className={styles.arrowIcon} />
                    </button>

                </Box>
            </Modal>
        </Box>
    );
};

export default CellImaging;