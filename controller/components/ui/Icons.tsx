import React from "react";
import { Box, Tooltip, Icon as ChakraIcon, IconProps as ChakraIconProps } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Terminal,
  Code2,
  Play,
  Save,
  Folder,
  FolderOpen,
  FolderPlus,
  Edit2,
  Trash2,
  GripHorizontal,
  Hand,
  CornerUpLeft,
  CornerUpRight,
  Lock,
  LockOpen,
  Minimize2,
  ArrowUpRight,
  FilePlus,
} from "lucide-react";

// Types
interface IconBaseProps extends ChakraIconProps {
  color?: string;
  size?: string | number;
}

interface WellPlateIconProps {
  rows: number;
  columns: number;
  size?: string;
}

// Custom Components
export const Icon = ({ as, ...props }: IconBaseProps & { as: React.ElementType }) => {
  return <ChakraIcon as={as} {...props} />;
};

// Categorized Icon Groups
export const ScriptIcons = {
  Python: Terminal,
  Code: Code2,
  Play: Play,
  Save: Save,
  Close: CloseIcon,
  FileAdd: FilePlus,
} as const;

export const FolderIcons = {
  Folder: Folder,
  FolderOpen: FolderOpen,
  FolderAdd: FolderPlus,
  FolderAddLine: FolderPlus,
} as const;

export const ActionIcons = {
  Edit: Edit2,
  Delete: Trash2,
  Menu: HamburgerIcon,
} as const;

// Robot Command Icons
export const CommandIcons = {
  Move: ArrowUpRight,
  GraspPlate: GripHorizontal,
  ReleasePlate: Hand,
  RetrievePlate: CornerUpLeft,
  DropoffPlate: CornerUpRight,
  Engage: Lock,
  Release: LockOpen,
  Unwind: Minimize2,
} as const;

// Individual Icon Exports with Consistent Naming
export {
  Terminal as PythonIcon,
  Code2 as CodeIcon,
  Play as PlayIcon,
  Save as SaveIcon,
  CloseIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  FolderPlus as FolderAddIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  FolderPlus as FolderAddLineIcon,
  HamburgerIcon as MenuIcon,
  FilePlus as FileAddIcon,
  // Robot Command Icons
  ArrowUpRight as MoveIcon,
  GripHorizontal as GraspPlateIcon,
  Hand as ReleasePlateIcon,
  CornerUpLeft as RetrievePlateIcon,
  CornerUpRight as DropoffPlateIcon,
  Minimize2 as UnwindIcon,
};

// Custom Icon Components
export const WellPlateIcon: React.FC<WellPlateIconProps> = ({ rows, columns, size = "48px" }) => {
  // Determine if this matches a standard plate format
  const getStandardFormat = (r: number, c: number): string => {
    if (r === 1 && c === 1) return "1-well";
    if (r === 2 && c === 3) return "6-well";
    if (r === 3 && c === 4) return "12-well";
    if (r === 4 && c === 6) return "24-well";
    if (r === 6 && c === 8) return "48-well";
    if (r === 8 && c === 12) return "96-well";
    if (r === 16 && c === 24) return "384-well";
    return "custom";
  };

  const format = getStandardFormat(rows, columns);

  // Add special case for 384-well plate
  const is384Well = rows === 16 && columns === 24;
  const is96Well = rows === 8 && columns === 12;
  const displayRows = is384Well ? 10 : is96Well ? 6 : rows;

  // SVG viewBox calculations
  const padding = 4;
  const wellSize = 10;
  const spacing = is384Well ? 2 : 3;
  const width = columns * wellSize + (columns - 1) * spacing + 2 * padding;
  const height = displayRows * wellSize + (displayRows - 1) * spacing + 2 * padding;

  // Generate well positions
  const wells = [];
  for (let row = 0; row < displayRows; row++) {
    for (let col = 0; col < columns; col++) {
      const cx = padding + col * (wellSize + spacing) + wellSize / 2;
      const cy = padding + row * (wellSize + spacing) + wellSize / 2;
      wells.push({ cx, cy });
    }
  }

  return (
    <Tooltip hasArrow placement="top">
      <Box width={size} height={`calc(${size} * 0.7)`}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ overflow: "visible" }}>
          {/* Plate border */}
          <rect
            x="1"
            y="1"
            width={width - 2}
            height={height - 2}
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Wells */}
          {wells.map((well, i) => (
            <circle
              key={i}
              cx={well.cx}
              cy={well.cy}
              r={is384Well ? wellSize / 2.5 : wellSize / 2}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </svg>
      </Box>
    </Tooltip>
  );
};
