import React from "react";
import { Box, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { DeleteWithConfirmation } from "./Delete";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons";

interface EditMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
  label?: string;
  customMenuItems?: React.ReactNode;
  buttonProps?: {
    size?: string;
    position?: 'absolute' | 'relative';
    right?: number;
    top?: number;
  };
}

export const EditMenu: React.FC<EditMenuProps> = ({
  onEdit,
  onDelete,
  label = "item",
  customMenuItems,
  buttonProps
}) => {
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<HamburgerIcon />}
        variant="ghost"
        size={buttonProps?.size || "md"}
        position={buttonProps?.position}
        right={buttonProps?.right}
        top={buttonProps?.top}
      />
      <MenuList>
        {onEdit && (
          <MenuItem icon={<MdOutlineModeEditOutline />} onClick={onEdit}>
            Edit
          </MenuItem>
        )}
        {customMenuItems}
        {onDelete && (
          <MenuItem padding="0px">
            <DeleteWithConfirmation
              onDelete={onDelete}
              label={label}
              showText={true}
            /></MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};
