// types/index.ts - Central export
export * from "./form";
export * from "./run";

export interface ParameterSchema {
  type: string;
  description?: string;
  variable?: string;
}

export interface PageProps {
  title: string;
  subtitle: string;
  link: string;
  icon: any;
  color: any;
  description: string;
}

export interface Protocol {
  id: number;
  name: string;
  description?: string;
  icon?: any;
  params: Record<string, string>;
}
