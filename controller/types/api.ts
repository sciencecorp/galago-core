export interface Workcell {
    id: number;
    name: string;
    description: string;
    status: string;
    last_updated: Date;
    created_at: Date;
}

export interface Variable {
    id: number;
    name: string;
    value: string;
    type: string;
    created_at: Date;
    updated_at: Date;
}

export interface Tool {
    id: number;
    name: string;
    ip: string;
    port: number;
    type:string;
    workcell_id: number;
    description: string;
    status: string;
    last_updated: Date;
    created_at: Date;
}

