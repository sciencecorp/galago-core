// src/ImageSlider.js

import React, { useEffect, useState } from "react";
import { Box, IconButton, Image, Flex, Text, Button, useToast } from "@chakra-ui/react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

import { ToolType } from "gen-interfaces/controller";
import { ExecuteCommandReply, ResponseCode } from "gen-interfaces/tools/grpc_interfaces/tool_base";
import { trpc } from "@/utils/trpc";
import { ToolCommandInfo } from "@/types";
import { RetrievePlate } from "gen-interfaces/protocol";

type ImageSliderProps = {
  date: string;
  images: string[];
};

function formatDatetime(datetime: any, return_type: string): string {
  const date = new Date(datetime);
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  if (return_type === "HH:MM:SS") {
    return `${hours}:${minutes}:${seconds}`;
  } else if (return_type === "YYYY-MM-DD") {
    return `${year}-${month}-${day}`;
  } else if (return_type === "YYYY:MM:DD") {
    return `${year}:${month}:${day}`;
  } else {
    return "";
  }
}

const ImageSlider: React.FC<ImageSliderProps> = ({ date, images }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const commandMutation = trpc.tool.runCommand.useMutation({});
  const [selectedImageBytes, setSelectedImageBytes] = useState("");
  const [selectedImageTimeStamp, setSelectedImageTimeStamp] = useState("");
  const [showLabeledImage, setshowLabeledImage] = useState<boolean>(false);
  const toast = useToast();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      nextSlide();
    } else if (event.key === "ArrowLeft") {
      prevSlide();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const GetImageBytes = async (): Promise<ExecuteCommandReply | undefined> => {
    if (images.length == 0) {
      return;
    }
    let image_name = images[currentIndex];
    if (showLabeledImage) {
      image_name = `${image_name.replace(".jpg", "")}_predicted.jpg`;
    }
    const toolCommand: ToolCommandInfo = {
      toolId: "toolbox",
      toolType: "toolbox" as ToolType,
      command: "get_ot2_image_bytes",
      params: {
        date: date,
        image_file: image_name,
      },
    };

    const response: ExecuteCommandReply | undefined =
      await commandMutation.mutateAsync(toolCommand);

    return response;
  };

  //Reset the index when the date changes
  useEffect(() => {
    setCurrentIndex(0);
    setshowLabeledImage(false);
  }, [date]);

  useEffect(() => {
    const fetchImageBytes = async () => {
      const response = await GetImageBytes();
      if (response?.meta_data) {
        let imgBytes = response.meta_data["img_bytes"];
        if (imgBytes === "null") {
          if (showLabeledImage) {
            toast({
              title: "Data Not Found",
              description: "Prediction not available for this image.",
              status: "warning",
              duration: 2000,
              isClosable: true,
              position: "top",
            });
          }
          return;
        }
        setSelectedImageBytes(imgBytes);
        setSelectedImageTimeStamp(response.meta_data["created_on"]);
      }
    };
    fetchImageBytes();
  }, [currentIndex, showLabeledImage, images]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  return (
    <Box position="relative" width="full" maxWidth="600px" margin="auto" mt="4">
      <Flex direction="column" alignItems="center">
        <Box
          borderRadius={4}
          bg="white"
          color="black"
          padding={1}
          border="1px solid lightgray"
          mb={2}>
          <Text size="sm" as="b">
            {currentIndex + 1}/{images.length}
          </Text>
        </Box>
        <Box mb="2">
          <Text>
            <Text as="b">Time:</Text>
            {selectedImageTimeStamp}
          </Text>
        </Box>

        <Flex justifyContent="center" alignItems="center">
          <IconButton
            aria-label=""
            icon={<FaArrowLeft />}
            onClick={prevSlide}
            position="absolute"
            left="5px"
            zIndex="1"
            colorScheme="blue"
            //variant="outline"
          />
          <Box width={640} height={480}>
            <Image
              src={selectedImageBytes}
              alt={`slide-${currentIndex}`}
              borderRadius="lg"
              boxShadow="lg"
            />
          </Box>
          <IconButton
            aria-label=""
            icon={<FaArrowRight />}
            onClick={nextSlide}
            position="absolute"
            right="5px"
            zIndex="1"
            colorScheme="blue"
            //variant="outline"
          />
        </Flex>
        <Box mt={2}>
          <Button
            colorScheme={showLabeledImage ? "blue" : "gray"}
            onClick={() => {
              setshowLabeledImage(!showLabeledImage);
            }}>
            {showLabeledImage ? "Hide Labels" : "Show Labels"}{" "}
          </Button>
        </Box>
      </Flex>
    </Box>
  );
};

export default ImageSlider;
