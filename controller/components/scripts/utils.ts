import { successToast, errorToast } from "../ui/Toast";

// Shared validation functions
export const validateScriptName = (name: string): string => {
  if (!name) return "Name cannot be empty";
  if (name.length > 25) return "Name cannot exceed 25 characters";
  if (!/^[a-z][a-z0-9_]*$/.test(name))
    return "Name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores";
  if (/_{2,}/.test(name)) return "Name cannot contain consecutive underscores";
  if (name.endsWith("_")) return "Name cannot end with an underscore";
  return "";
};

export const validateFolderName = validateScriptName; // Same rules apply for both

// Shared file operations
export const removeFileExtension = (filename: string): string => {
  return filename.replace(/\.py$/, "");
};

export const addPythonExtension = (filename: string): string => {
  return `${filename}.py`;
};

// Toast message helpers
export const showErrorToast = (title: string, description: string) => {
  errorToast(title, description);
};

export const showSuccessToast = (title: string, description: string = "") => {
  successToast(title, description);
}; 