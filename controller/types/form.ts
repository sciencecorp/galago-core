
export interface FormFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface FormField {
  type: string; // text, email, select, radio, checkbox, textarea, number, date, tel, etc.
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  description?: string;
  validation?: Record<string, any>;
  options?: FormFieldOption[];
  default_value?: string | string[];
  mapped_variable?: string; 
}

export interface Form {
  id: number;
  name: string;
  description?: string;
  fields: FormField[];
  background_color?: string;
  background_image?: string;
  size?: "small" | "medium" | "large";
  is_locked?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FormCreate {
  name: string;
  description?: string;
  fields: FormField[];
  background_color?: string;
  background_image?: string;
  size?: "small" | "medium" | "large";
  is_locked?: boolean;
}

export interface FormUpdate {
  name?: string;
  description?: string;
  fields?: FormField[];
  background_color?: string;
  background_image?: string;
  size?: "small" | "medium" | "large";
  is_locked?: boolean;
}

export interface FormStats {
  total: number;
  locked: number;
  unlocked: number;
  bySize: {
    small: number;
    medium: number;
    large: number;
  };
  averageFields: number;
}

export interface FormValidationResult {
  valid: boolean;
  data: FormCreate | null;
  errors: any[] | null;
}