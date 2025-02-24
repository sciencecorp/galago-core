export type NestStatus = 'empty' | 'occupied' | 'reserved' | 'error';
export type PlateStatus = 'stored' | 'in_use' | 'completed' | 'disposed';
export type PlateNestAction = 'check_in' | 'check_out' | 'transfer';

export interface Nest {
  id: number;
  name: string;
  row: number;
  column: number;
  tool_id: number;
  status: NestStatus;
  current_plate_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Plate {
  id: number;
  name: string | null;
  barcode: string;
  plate_type: string;
  nest_id: number | null;
  status: PlateStatus;
  created_at: string;
  updated_at: string;
}

export interface PlateNestHistory {
  id: number;
  plate_id: number;
  nest_id: number;
  action: PlateNestAction;
  timestamp: string;
  created_at: string;
  updated_at: string;
} 