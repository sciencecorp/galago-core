import React from "react";
import { Box, Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { DeleteWithConfirmation } from "./Delete";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { HamburgerIcon } from "@chakra-ui/icons";
import { RiEdit2Line } from "react-icons/ri";

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
        <MenuItem>
          <DeleteWithConfirmation
            onDelete={() => props.onDelete && props.onDelete()}
            label="tool"
            showText={true}
          />
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
