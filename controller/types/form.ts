export const FIELD_TYPES = [
  { value: "text", label: "Text Input" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select Dropdown" },
  { value: "radio", label: "Radio Buttons" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "file", label: "File Upload" },
  { value: "label", label: "Static Text Label" },
] as const;

export const DEFAULT_EDITING_FIELD: FormField = {
  type: "text",
  label: "",
  required: false,
  placeholder: null,
  options: null,
  default_value: null,
  mapped_variable: null,
};

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  type:
    | "text"
    | "select"
    | "radio"
    | "checkbox"
    | "textarea"
    | "number"
    | "date"
    | "time"
    | "file"
    | "label"; // text, select, radio, checkbox, textarea, number, date, etc.
  label: string;
  required?: boolean;
  placeholder?: string | null;
  options?: FormFieldOption[] | null; // For select, radio, checkbox types
  default_value?: string | string[] | null;
  mapped_variable?: string | null;
}

export interface Form {
  id: number;
  name: string;
  description?: string;
  background_color: string | null;
  font_color: string | null;
  fields: FormField[];
  created_at?: string;
  updated_at?: string;
}
