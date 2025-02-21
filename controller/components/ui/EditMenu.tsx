import React from "react";
import { Box, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { RiDeleteBin5Line, RiEdit2Line } from "react-icons/ri";

interface EditMenuProps {
  onEdit: () => void;
  onDelete?: () => void;
}

export const EditMenu: React.FC<EditMenuProps> = (props) => {
  return (
    <Menu>
      <MenuButton as={IconButton} aria-label="Options" icon={<HamburgerIcon />} variant="ghost" />
      <MenuList>
        <MenuItem icon={<RiEdit2Line />} onClick={props.onEdit}>
          Edit
        </MenuItem>
        <MenuItem icon={<RiDeleteBin5Line />} onClick={() => props.onDelete && props.onDelete()}>
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
