// Add to your types file
export interface BravoSequence {
  id: number;
  name: string;
  description?: string | null;
  tool_id: number;
  steps?: BravoSequenceStep[];
  created_at?: string;
  updated_at?: string;
}

export interface BravoSequenceStep {
  id: number;
  command_name:
    | "home"
    | "mix"
    | "aspirate"
    | "dispense"
    | "tips_on"
    | "tips_off"
    | "move_to_location"
    | "configure_deck"
    | "show_diagnostics";
  label: string;
  params: Record<string, any>;
  position: number;
  sequence_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface BravoDeckConfig {
  id: number;
  name: string;
  deck_layout: DeckLayout;
  workcell_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface DeckLayout {
  "1": string | null | undefined;
  "2": string | null | undefined;
  "3": string | null | undefined;
  "4": string | null | undefined;
  "5": string | null | undefined;
  "6": string | null | undefined;
  "7": string | null | undefined;
  "8": string | null | undefined;
  "9": string | null | undefined;
}
