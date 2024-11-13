export interface Labware {
    id?: number;
    name: string;
    description: string;
    number_of_wells: number;
    z_offset: number;
    width: number;
    height: number;
    plate_lid_offset: number;
    lid_offset: number;
    stack_height: number;
    has_lid: boolean;
    image_url: string;
    created_at?: string;
    updated_at?: string;
  }