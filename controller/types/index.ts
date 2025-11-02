// types/index.ts - Central export
export * from "./form";
export * from "./run";
export * from "./protocol"; 

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
