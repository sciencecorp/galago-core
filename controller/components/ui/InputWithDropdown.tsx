import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputProps,
  MenuProps,
  Tooltip,
  Button,
  Box,
  Portal,
} from "@chakra-ui/react";
import { RiArrowDownSLine } from "react-icons/ri";

interface Option {
  value: string;
  label?: string;
}

interface ValidationConfig {
  isValid: boolean;
  tooltipLabel?: string;
  validIcon?: React.ReactNode;
  invalidIcon?: React.ReactNode;
  onValidationClick?: () => void;
}

/**
 * InputWithDropdown - A reusable component that combines a text input with a dropdown menu
 *
 * Features:
 * - Text input field for free-form entry
 * - Dropdown menu of pre-defined options
 * - Optional validation with visual indicator
 * - Customizable placement and styling
 *
 * Common use cases:
 * - Selecting from common values while allowing custom input
 * - Fields with validation that also need quick selection (IPs, ports, etc.)
 * - Any input that benefits from both typing and selection
 *
 * @example
 * // Basic usage
 * <InputWithDropdown
 *   value={myValue}
 *   options={[{ value: 'option1' }, { value: 'option2', label: 'Option 2' }]}
 *   onChange={(newValue) => setMyValue(newValue)}
 * />
 *
 * // With validation
 * <InputWithDropdown
 *   value={ipAddress}
 *   options={commonIps}
 *   onChange={setIpAddress}
 *   validation={{
 *     isValid: isValidIp,
 *     tooltipLabel: isValidIp ? "Valid IP" : "Invalid IP",
 *     onValidationClick: handleValidationClick
 *   }}
 * />
 */
interface InputWithDropdownProps extends Omit<InputProps, "onChange"> {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  menuPlacement?: MenuProps["placement"];
  menuMaxHeight?: string;
  buttonTooltip?: string;
  customIcon?: React.ReactElement;
  zIndex?: number;
  validation?: ValidationConfig;
}

export const InputWithDropdown: React.FC<InputWithDropdownProps> = ({
  value,
  options,
  onChange,
  placeholder = "Enter value",
  menuPlacement = "right",
  menuMaxHeight = "200px",
  buttonTooltip,
  customIcon,
  zIndex = 1500,
  validation,
  ...inputProps
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleOptionSelect = (value: string) => {
    onChange(value);
  };

  return (
    <InputGroup>
      <Input value={value} onChange={handleInputChange} placeholder={placeholder} {...inputProps} />
      <InputRightElement width={validation ? "8rem" : "2.5rem"}>
        {validation && (
          <Box mr={2}>
            <Tooltip label={validation.tooltipLabel || (validation.isValid ? "Valid" : "Invalid")}>
              <Button
                h="1.75rem"
                size="sm"
                colorScheme={validation.isValid ? "teal" : "red"}
                variant="outline"
                onClick={validation.onValidationClick}>
                {validation.isValid ? validation.validIcon || "✓" : validation.invalidIcon || "✗"}
              </Button>
            </Tooltip>
          </Box>
        )}
        <Menu placement={menuPlacement} closeOnSelect={true} strategy="fixed">
          {buttonTooltip ? (
            <Tooltip label={buttonTooltip}>
              <MenuButton
                as={IconButton}
                size="sm"
                aria-label="Select option"
                icon={customIcon || <RiArrowDownSLine />}
                variant="ghost"
              />
            </Tooltip>
          ) : (
            <MenuButton
              as={IconButton}
              size="sm"
              aria-label="Select option"
              icon={customIcon || <RiArrowDownSLine />}
              variant="ghost"
            />
          )}
          <Portal>
            <MenuList maxHeight={menuMaxHeight} overflowY="auto" zIndex={2000}>
              {options.map((option) => (
                <MenuItem key={option.value} onClick={() => handleOptionSelect(option.value)}>
                  {option.label || option.value}
                </MenuItem>
              ))}
            </MenuList>
          </Portal>
        </Menu>
      </InputRightElement>
    </InputGroup>
  );
};
