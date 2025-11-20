import React, { useState } from "react";
import {
  ButtonGroup,
  Flex,
  HStack,
  IconButton,
  Input,
  Text,
  useColorModeValue,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { RiCheckFill, RiCloseFill, RiEdit2Line } from "react-icons/ri";
import {
  AutoComplete,
  AutoCompleteCreatable,
  AutoCompleteInput,
  AutoCompleteItem,
  AutoCompleteList,
  Item,
} from "@choc-ui/chakra-autocomplete";

export const inputStyles = {
  padding: 0,
  paddingTop: 3,
  paddingBottom: 3,
  paddingLeft: 3,
  fontSize: 14,
  borderRadius: 6,
  height: "unset",
  border: "1px solid var(--chakra-colors-gray-200)",
  outlineColor: "var(--chakra-colors-blue-500)",
};

export const Editable = (props: {
  onSubmit: (value?: string | null) => void;
  renderInput: (
    value: string | number,
    setValue: (newValue: string) => void,
    submit: (newValue?: string) => void
  ) => JSX.Element;
  preview: JSX.Element;
  defaultValue?: string;
  placeHolder?: string;
  disabled?: boolean;
  startInEditView?: boolean;
  minWidth?: number;
  persistentEdit?: boolean;
}) => {
  const {
    onSubmit,
    renderInput,
    preview,
    defaultValue,
    disabled,
    startInEditView,
    minWidth,
  } = props;

  const [isEditing, setIsEditing] = React.useState(!!startInEditView);
  const [value, setValue] = React.useState("");
  const [isHovered, setIsHovered] = useState(false); // Hover state for edit icon visibility

  const startEditing = () => {
    setValue(
      defaultValue === undefined || defaultValue === null ? "" : defaultValue
    );
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
      onMouseLeave={() => setIsHovered(false)}
    >
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
  displayValue?: string; // New prop for displaying truncated text
  placeholder?: string;
  minWidth?: number;
  preview?: JSX.Element;
  persistentEdit?: boolean;
  disabled?: boolean;
  showTooltip?: boolean; // Optional prop to control tooltip display
}) => {
  const textColor = useColorModeValue("gray.800", "gray.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");

  // If displayValue is provided, use it for display but keep defaultValue for editing
  const displayText =
    props.displayValue !== undefined ? props.displayValue : props.defaultValue;

  // Check if we need to show a tooltip (when displayValue is different from defaultValue)
  const shouldShowTooltip =
    props.showTooltip !== false &&
    props.defaultValue !== undefined &&
    props.displayValue !== undefined &&
    props.defaultValue !== props.displayValue;

  // Create a custom preview that shows placeholder text when empty
  const textPreview = (
    <Text
      fontSize="sm"
      color={displayText ? textColor : placeholderColor}
      fontStyle={displayText ? "normal" : "italic"}
    >
      {displayText || props.placeholder || "Click to edit"}
    </Text>
  );

  // Add tooltip if needed
  const customPreview =
    props.preview ||
    (shouldShowTooltip ? (
      <Tooltip label={props.defaultValue} placement="top" hasArrow>
        {textPreview}
      </Tooltip>
    ) : (
      textPreview
    ));

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
          size="xs"
          borderColor={borderColor}
          bg={inputBg}
          color={textColor}
          placeholder={props.placeholder}
        />
      )}
      preview={customPreview}
      defaultValue={props.defaultValue}
      placeHolder={props.placeholder}
      minWidth={props.minWidth}
      persistentEdit={props.persistentEdit}
      disabled={props.disabled}
    />
  );
};

export const EditableSelect = (props: {
  onSubmit: (value?: string | null) => void;
  options: { label: string; value: string | number }[];
  preview: JSX.Element;
  persistentEdit?: boolean;
  disabled?: boolean;
  dropDownWidth?: number | string;
}) => (
  <Editable
    onSubmit={props.onSubmit}
    renderInput={(value, setValue, submit) => (
      <VStack align="start" width="100%">
        <AutoComplete
          openOnFocus
          filter={(query, _, optionLabel) => {
            return optionLabel.toLowerCase().includes(query.toLowerCase());
          }}
          defaultValue={value}
          onSelectOption={(params) => {
            submit(params?.item?.value);
          }}
        >
          <AutoCompleteInput
            width={props.dropDownWidth ? props.dropDownWidth : 230}
            autoFocus
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={inputStyles}
          />
          <AutoCompleteList
            width={props.dropDownWidth ? props.dropDownWidth : 230}
          >
            {props.options.map((option, i) => (
              <AutoCompleteItem
                key={`${i}`}
                value={`${option.value}`}
                label={option.label}
              >
                {option.label}
              </AutoCompleteItem>
            ))}
          </AutoCompleteList>
        </AutoComplete>
      </VStack>
    )}
    preview={props.preview}
    persistentEdit={props.persistentEdit}
    disabled={props.disabled}
  />
);
