export interface Protocol {
  id: number;
  name: string;
  category: "development" | "qc" | "production";
  workcell: string;
  description: string;
  commands?: any;
  icon?: string;
  number_of_commands: number;
  created_at: string;
  updated_at: string;
}

export const mockProtocols: Protocol[] = [
  {
    id: 1,
    name: "Cell Culture Protocol",
    category: "production",
    workcell: "Bishop",
    description: "Standard cell culture protocol for maintenance",
    commands: [],
    number_of_commands: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "QC Analysis",
    category: "qc",
    workcell: "Rook",
    description: "Quality control analysis protocol",
    commands: [],
    number_of_commands: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Plate Washing Protocol",
    category: "development",
    workcell: "Queen",
    description: "Protocol under development",
    commands: [],
    number_of_commands: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
