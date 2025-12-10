import React from "react";
import { Menu, MenuButton, MenuList, MenuItem, IconButton } from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Trash2, Edit2 } from "lucide-react";

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
          <MenuItem icon={<Edit2 size={14} />} onClick={onEdit}>
            Edit
          </MenuItem>
        )}

        {/* Conditionally render the delete option */}
        {onDelete && (
          <MenuItem icon={<Trash2 size={14} />} onClick={onDelete}>
            Delete
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};
