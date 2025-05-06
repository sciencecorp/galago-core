import React from "react";
import { Box, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { RiDeleteBin5Line, RiEdit2Line } from "react-icons/ri";

// Define interface for custom menu items
interface CustomMenuItem {
  label: string;
  icon?: React.ReactElement;
  onClick: () => void;
}

interface EditMenuProps {
  onEdit: () => void;
  onDelete?: () => void;
  // New property for additional menu items
  customMenuItems?: CustomMenuItem[];
}

export const EditMenu: React.FC<EditMenuProps> = (props) => {
  const { onEdit, onDelete, customMenuItems = [] } = props;

  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="ghost" />
      <MenuList>
        {customMenuItems.map((item, index) => (
          <MenuItem key={`custom-item-${index}`} icon={item.icon} onClick={item.onClick}>
            {item.label}
          </MenuItem>
        ))}

        {onEdit && (
          <MenuItem icon={<RiEdit2Line />} onClick={onEdit}>
            Edit
          </MenuItem>
        )}

        {/* Conditionally render the delete option */}
        {onDelete && (
          <MenuItem icon={<RiDeleteBin5Line />} onClick={onDelete}>
            Delete
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};
