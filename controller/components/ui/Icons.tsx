import React from "react";
import { Box, Tooltip, Icon as ChakraIcon, IconProps as ChakraIconProps } from "@chakra-ui/react";
import {
  CloseIcon,
  HamburgerIcon,
  SearchIcon,
  AddIcon,
  DeleteIcon,
  EditIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  WarningIcon,
  QuestionOutlineIcon,
  TimeIcon,
  PlusSquareIcon,
  ArrowForwardIcon,
  MoonIcon,
  SunIcon,
  Search2Icon,
  DownloadIcon,
  ArrowUpDownIcon,
} from "@chakra-ui/icons";

// React Icons imports
import { SiPython, SiGithubactions } from "react-icons/si";
import { VscCode, VscSymbolString, VscSymbolBoolean, VscRunBelow } from "react-icons/vsc";
import {
  FaPlay,
  FaFolder,
  FaFolderOpen,
  FaPause,
  FaStop,
  FaTrash,
  FaFlask,
  FaToolbox,
  FaArrowRight,
  FaArrowLeft,
  FaRobot,
  FaArrowsAlt,
  FaHandPaper,
  FaLocationArrow,
} from "react-icons/fa";
import { FaFileCirclePlus, FaRegFileCode, FaBookOpen, FaChartGantt } from "react-icons/fa6";
import { IoIosSave } from "react-icons/io";
import { IoPlaySkipForward } from "react-icons/io5";
import { TbFolderPlus, TbVariable } from "react-icons/tb";
import {
  RiEdit2Line,
  RiDeleteBinLine,
  RiFolderAddLine,
  RiAddFill,
  RiDeleteBin5Line,
  RiCheckFill,
  RiCloseFill,
  RiCalendarCheckLine,
} from "react-icons/ri";
import {
  BsTools,
  BsSkipForwardFill,
  BsBoxSeam,
  BsInbox,
  BsGrid3X3,
  BsCalendarWeek,
  BsRecordCircle,
  BsLayoutSidebarInset,
} from "react-icons/bs";
import { HiOutlineRectangleStack } from "react-icons/hi2";
import { PiPathBold, PiToolbox } from "react-icons/pi";
import { GiChaingun } from "react-icons/gi";
import {
  MdOutlineNumbers,
  MdLocationOn,
  MdOutlineTransitEnterexit,
  MdOutlineIntegrationInstructions,
  MdOutlineReplay,
} from "react-icons/md";
import {
  FiBook,
  FiInfo,
  FiMenu,
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiUpload,
} from "react-icons/fi";
import { BiTime } from "react-icons/bi";

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
  Python: SiPython,
  Code: VscCode,
  Play: FaPlay,
  Save: IoIosSave,
  Close: CloseIcon,
  FileAdd: FaFileCirclePlus,
} as const;

export const FolderIcons = {
  Folder: FaFolder,
  FolderOpen: FaFolderOpen,
  FolderAdd: TbFolderPlus,
  FolderAddLine: RiFolderAddLine,
} as const;

export const ActionIcons = {
  Edit: RiEdit2Line,
  Delete: RiDeleteBinLine,
  Menu: HamburgerIcon,
  Add: AddIcon,
  Check: CheckIcon,
  Close: CloseIcon,
  Play: FaPlay,
  Pause: FaPause,
  Stop: FaStop,
  Trash: FaTrash,
} as const;

export const NavigationIcons = {
  ArrowLeft: ArrowLeftIcon,
  ArrowRight: ArrowRightIcon,
  ChevronUp: ChevronUpIcon,
  ChevronDown: ChevronDownIcon,
  ArrowForward: ArrowForwardIcon,
  ChevronLeft: FiChevronLeft,
  ChevronRight: FiChevronRight,
  Menu: FiMenu,
  Home: FiHome,
} as const;

export const StatusIcons = {
  Warning: WarningIcon,
  Question: QuestionOutlineIcon,
  Info: FiInfo,
  Time: TimeIcon,
  Plus: PlusSquareIcon,
} as const;

export const ThemeIcons = {
  Moon: MoonIcon,
  Sun: SunIcon,
} as const;

export const SearchIcons = {
  Search: SearchIcon,
  Search2: Search2Icon,
} as const;

export const ToolIcons = {
  Tools: BsTools,
  Toolbox: FaToolbox,
  PiToolbox: PiToolbox,
  Robot: FaRobot,
  Arrows: FaArrowsAlt,
  Hand: FaHandPaper,
} as const;

export const SectionIcons = {
  Labware: HiOutlineRectangleStack,
  Inventory: BsBoxSeam,
  Protocol: PiPathBold,
  Workcell: GiChaingun,
  Variables: TbVariable,
  Logs: FiBook,
  Calendar: BsCalendarWeek,
  Scripts: VscCode,
  Runs: FaChartGantt,
  Actions: SiGithubactions,
} as const;

export const RunIcons = {
  PlaySkipForward: IoPlaySkipForward,
  SkipForward: BsSkipForwardFill,
  RunBelow: VscRunBelow,
  FileCode: FaRegFileCode,
} as const;

export const InventoryIcons = {
  Grid: BsGrid3X3,
  Flask: FaFlask,
  Location: MdLocationOn,
} as const;

export const TeachPendantIcons = {
  Record: BsRecordCircle,
  Replay: MdOutlineReplay,
  ArrowRight: FaArrowRight,
  ArrowLeft: FaArrowLeft,
  LocationArrow: FaLocationArrow,
  Upload: FiUpload,
  Download: DownloadIcon,
} as const;

export const FormIcons = {
  Check: RiCheckFill,
  Close: RiCloseFill,
  Edit: RiEdit2Line,
  Add: RiAddFill,
  Delete: RiDeleteBin5Line,
} as const;

export const VariableIcons = {
  String: VscSymbolString,
  Number: MdOutlineNumbers,
  Boolean: VscSymbolBoolean,
  Variable: TbVariable,
} as const;

export const SidebarIcons = {
  Sidebar: BsLayoutSidebarInset,
  Transit: MdOutlineTransitEnterexit,
  Integration: MdOutlineIntegrationInstructions,
  Calendar: RiCalendarCheckLine,
} as const;

export const TimeIcons = {
  Time: BiTime,
  Clock: TimeIcon,
} as const;

// Individual Icon Exports with Consistent Naming
export {
  SiPython as PythonIcon,
  VscCode as CodeIcon,
  FaPlay as PlayIcon,
  IoIosSave as SaveIcon,
  CloseIcon,
  FaFolder as FolderIcon,
  FaFolderOpen as FolderOpenIcon,
  TbFolderPlus as FolderAddIcon,
  RiEdit2Line as EditIcon,
  RiDeleteBinLine as DeleteIcon,
  RiFolderAddLine as FolderAddLineIcon,
  HamburgerIcon as MenuIcon,
  FaFileCirclePlus as FileAddIcon,
  SearchIcon,
  AddIcon,
  CheckIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  WarningIcon,
  QuestionOutlineIcon,
  TimeIcon,
  PlusSquareIcon,
  ArrowForwardIcon,
  MoonIcon,
  SunIcon,
  Search2Icon,
  DownloadIcon,
  ArrowUpDownIcon,
  SiGithubactions as GithubActionsIcon,
  VscSymbolString as StringIcon,
  VscSymbolBoolean as BooleanIcon,
  VscRunBelow as RunBelowIcon,
  FaPause as PauseIcon,
  FaStop as StopIcon,
  FaTrash as TrashIcon,
  FaFlask as FlaskIcon,
  FaToolbox as ToolboxIcon,
  FaArrowRight as ArrowRightFaIcon,
  FaArrowLeft as ArrowLeftFaIcon,
  FaRobot as RobotIcon,
  FaArrowsAlt as ArrowsIcon,
  FaHandPaper as HandIcon,
  FaLocationArrow as LocationArrowIcon,
  FaRegFileCode as FileCodeIcon,
  FaBookOpen as BookOpenIcon,
  FaChartGantt as ChartGanttIcon,
  IoPlaySkipForward as PlaySkipForwardIcon,
  TbVariable as VariableIcon,
  RiAddFill as AddFillIcon,
  RiDeleteBin5Line as DeleteBin5LineIcon,
  RiCheckFill as CheckFillIcon,
  RiCloseFill as CloseFillIcon,
  RiCalendarCheckLine as CalendarCheckLineIcon,
  BsTools as ToolsIcon,
  BsSkipForwardFill as SkipForwardFillIcon,
  BsBoxSeam as BoxSeamIcon,
  BsInbox as InboxIcon,
  BsGrid3X3 as Grid3X3Icon,
  BsCalendarWeek as CalendarWeekIcon,
  BsRecordCircle as RecordCircleIcon,
  BsLayoutSidebarInset as LayoutSidebarInsetIcon,
  HiOutlineRectangleStack as RectangleStackIcon,
  PiPathBold as PathBoldIcon,
  PiToolbox as PiToolboxIcon,
  GiChaingun as ChaingunIcon,
  MdOutlineNumbers as NumbersIcon,
  MdLocationOn as LocationOnIcon,
  MdOutlineTransitEnterexit as TransitEnterexitIcon,
  MdOutlineIntegrationInstructions as IntegrationInstructionsIcon,
  MdOutlineReplay as ReplayIcon,
  FiBook as BookIcon,
  FiInfo as InfoIcon,
  FiMenu as MenuFiIcon,
  FiHome as HomeIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiUpload as UploadIcon,
  BiTime as TimeIconBi,
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
    <Tooltip label={`${format} plate (${rows}×${columns})`} hasArrow placement="top">
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
