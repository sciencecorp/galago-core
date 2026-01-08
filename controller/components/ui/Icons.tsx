import React from "react";
import {
  Box,
  Tooltip,
  Icon as ChakraIcon,
  IconProps as ChakraIconProps,
  createIcon,
} from "@chakra-ui/react";
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
  Download,
  Upload,
  Cpu,
  LucideProps,
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
  Download as DownloadIcon,
  Upload as UploadIcon,
  Cpu as WorkcellIcon,
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

/**
 * Lucide-style 6-well plate icon (2x3).
 * Useful anywhere we expect a `LucideIcon` (e.g. sidebar items / page headers).
 */
export const SixWellPlateIcon = React.forwardRef<SVGSVGElement, LucideProps>(
  ({ color = "currentColor", size = 24, strokeWidth = 2, ...props }, ref) => {
    // LucideIcon is a ForwardRefExoticComponent; we mirror that to satisfy typing in sidebar items.
    const sw = typeof strokeWidth === "number" ? strokeWidth : Number(strokeWidth);
    const wellStrokeWidth = Number.isFinite(sw) ? Math.max(1, sw - 1) : 1;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        {/* Top row (3 wells) */}
        <circle cx="7.5" cy="9" r="1.6" strokeWidth={wellStrokeWidth} />
        <circle cx="12" cy="9" r="1.6" strokeWidth={wellStrokeWidth} />
        <circle cx="16.5" cy="9" r="1.6" strokeWidth={wellStrokeWidth} />
        {/* Bottom row (3 wells) */}
        <circle cx="7.5" cy="15" r="1.6" strokeWidth={wellStrokeWidth} />
        <circle cx="12" cy="15" r="1.6" strokeWidth={wellStrokeWidth} />
        <circle cx="16.5" cy="15" r="1.6" strokeWidth={wellStrokeWidth} />
      </svg>
    );
  },
);

SixWellPlateIcon.displayName = "SixWellPlateIcon";

export const PythonIcon = createIcon({
  displayName: "PythonIcon",
  viewBox: " 0 0 45 45",
  path: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px">
      <path
        fill="#0277BD"
        d="M24.047,5c-1.555,0.005-2.633,0.142-3.936,0.367c-3.848,0.67-4.549,2.077-4.549,4.67V14h9v2H15.22h-4.35c-2.636,0-4.943,1.242-5.674,4.219c-0.826,3.417-0.863,5.557,0,9.125C5.851,32.005,7.294,34,9.931,34h3.632v-5.104c0-2.966,2.686-5.896,5.764-5.896h7.236c2.523,0,5-1.862,5-4.377v-8.586c0-2.439-1.759-4.263-4.218-4.672C27.406,5.359,25.589,4.994,24.047,5z M19.063,9c0.821,0,1.5,0.677,1.5,1.502c0,0.833-0.679,1.498-1.5,1.498c-0.837,0-1.5-0.664-1.5-1.498C17.563,9.68,18.226,9,19.063,9z"></path>
      <path
        fill="#FFC107"
        d="M23.078,43c1.555-0.005,2.633-0.142,3.936-0.367c3.848-0.67,4.549-2.077,4.549-4.67V34h-9v-2h9.343h4.35c2.636,0,4.943-1.242,5.674-4.219c0.826-3.417,0.863-5.557,0-9.125C41.274,15.995,39.831,14,37.194,14h-3.632v5.104c0,2.966-2.686,5.896-5.764,5.896h-7.236c-2.523,0-5,1.862-5,4.377v8.586c0,2.439,1.759,4.263,4.218,4.672C19.719,42.641,21.536,43.006,23.078,43z M28.063,39c-0.821,0-1.5-0.677-1.5-1.502c0-0.833,0.679-1.498,1.5-1.498c0.837,0,1.5,0.664,1.5,1.498C29.563,38.32,28.899,39,28.063,39z"></path>
    </svg>
  ),
});

export const JavaScriptIcon = createIcon({
  displayName: "PythonIcon",
  viewBox: " 0 0 45 45",
  path: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px">
      <path fill="#ffd600" d="M6,42V6h36v36H6z"></path>
      <path
        fill="#000001"
        d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"></path>
    </svg>
  ),
});

export const CSharpIcon = createIcon({
  displayName: "PythonIcon",
  viewBox: " 0 0 45 45",
  path: (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px">
      <path
        fill="#00c853"
        d="M22.903,3.286c0.679-0.381,1.515-0.381,2.193,0c3.355,1.883,13.451,7.551,16.807,9.434 C42.582,13.1,43,13.804,43,14.566c0,3.766,0,15.101,0,18.867c0,0.762-0.418,1.466-1.097,1.847 c-3.355,1.883-13.451,7.551-16.807,9.434c-0.679,0.381-1.515,0.381-2.193,0c-3.355-1.883-13.451-7.551-16.807-9.434 C5.418,34.899,5,34.196,5,33.434c0-3.766,0-15.101,0-18.867c0-0.762,0.418-1.466,1.097-1.847 C9.451,10.837,19.549,5.169,22.903,3.286z"></path>
      <path
        fill="#69f0ae"
        d="M5.304,34.404C5.038,34.048,5,33.71,5,33.255c0-3.744,0-15.014,0-18.759 c0-0.758,0.417-1.458,1.094-1.836c3.343-1.872,13.405-7.507,16.748-9.38c0.677-0.379,1.594-0.371,2.271,0.008 c3.343,1.872,13.371,7.459,16.714,9.331c0.27,0.152,0.476,0.335,0.66,0.576L5.304,34.404z"></path>
      <path
        fill="#fff"
        d="M24,10c-7.73,0-14,6.27-14,14s6.27,14,14,14s14-6.27,14-14S31.73,10,24,10z M24,31 c-3.86,0-7-3.14-7-7s3.14-7,7-7s7,3.14,7,7S27.86,31,24,31z"></path>
      <path
        fill="#00e676"
        d="M42.485,13.205c0.516,0.483,0.506,1.211,0.506,1.784c0,3.795-0.032,14.589,0.009,18.384 c0.004,0.396-0.127,0.813-0.323,1.127L23.593,24L42.485,13.205z"></path>
      <path fill="#fff" d="M34 20H35V28H34zM37 20H38V28H37z"></path>
      <path fill="#fff" d="M32 25H40V26H32zM32 22H40V23H32z"></path>
    </svg>
  ),
});
