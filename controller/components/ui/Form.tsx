import React, { useState } from "react";
import {
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { RiCheckFill, RiCloseFill, RiEdit2Line } from "react-icons/ri";
import { palette, semantic } from "../../themes/colors";

export const inputStyles = {
  padding: 0,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 3,
  fontSize: 14,
  borderRadius: 6,
  height: "unset",
  border: `1px solid ${palette.gray[200]}`,
  outlineColor: palette.blue[500],
};

export const Editable = (props: {
  onSubmit: (value?: string | null) => void;
  renderInput: (
    value: string | number,
    setValue: (newValue: string) => void,
    submit: (newValue?: string) => void,
  ) => JSX.Element;
  preview: JSX.Element;
  defaultValue?: string;
  disabled?: boolean;
  startInEditView?: boolean;
  minWidth?: number;
  persistentEdit?: boolean;
}) => {
  const { onSubmit, renderInput, preview, defaultValue, disabled, startInEditView, minWidth } =
    props;

  const [isEditing, setIsEditing] = React.useState(!!startInEditView);
  const [value, setValue] = React.useState("");
  const [isHovered, setIsHovered] = useState(false); // Hover state for edit icon visibility

  const startEditing = () => {
    setValue(defaultValue === undefined || defaultValue === null ? "" : defaultValue);
    setIsEditing(true);
  };

  const doneEditing = () => {
    setValue("");
    setIsEditing(false);
  };

  const submit = (newValue?: string) => {
    onSubmit(newValue !== undefined ? newValue : value);
    doneEditing();
  };

  return isEditing ? (
    <HStack minWidth={minWidth || 230}>
      {renderInput(value, setValue, submit)}
      <ButtonGroup justifyContent="center" ml={0} size="xs">
        <IconButton
          icon={<RiCheckFill />}
          aria-label="Save Edits"
          onClick={() => submit()}
          colorScheme="blue"
        />
        <IconButton
          icon={<RiCloseFill />}
          aria-label="Cancel Edits"
          onMouseDown={(e) => {
            e.preventDefault();
            doneEditing();
          }}
          colorScheme="red"
          variant="outline"
        />
      </ButtonGroup>
    </HStack>
  ) : (
    <HStack
      className={props.persistentEdit ? "" : "editable"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {preview}
      <Flex justifyContent="center" ml={0}>
        {isHovered && ( // Show the edit icon only when hovered
          <IconButton
            className={props.persistentEdit ? "" : "editable__button"}
            size="xs"
            icon={<RiEdit2Line />}
            aria-label="Start Editing"
            onClick={startEditing}
            disabled={disabled}
            colorScheme="blue"
            variant="ghost"
          />
        )}
      </Flex>
    </HStack>
  );
};

export const EditableText = (props: {
  onSubmit: (value?: string | null) => void;
  defaultValue?: string;
  minWidth?: number;
  preview?: JSX.Element;
  persistentEdit?: boolean;
  disabled?: boolean;
}) => {
  const textColor = useColorModeValue(semantic.text.primary.light, semantic.text.primary.dark);
  const borderColor = useColorModeValue(
    semantic.border.primary.light,
    semantic.border.primary.dark,
  );
  const inputBg = useColorModeValue(
    semantic.background.primary.light,
    semantic.background.card.dark,
  );

  return (
    <Editable
      onSubmit={props.onSubmit}
      renderInput={(value, setValue, submit) => (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit();
            }
          }}
          onBlur={() => submit()}
          autoFocus
          size="sm"
          borderColor={borderColor}
          bg={inputBg}
          color={textColor}
        />
      )}
      preview={
        props.preview || (
          <Text fontSize="sm" color={textColor}>
            {props.defaultValue || ""}
          </Text>
        )
      }
      defaultValue={props.defaultValue}
      minWidth={props.minWidth}
      persistentEdit={props.persistentEdit}
      disabled={props.disabled}
    />
  );
};
