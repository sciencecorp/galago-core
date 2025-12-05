import axios from "axios";

/**
 * Get the API base URL based on environment
 * 
 * Priority:
 * 1. Environment variable API_BASE_URL (works for both server and client)
 * 2. URL query parameters (apiPort, apiHost) - client only
 * 3. Default localhost:8000
 */
function getApiBaseUrl(): string {
  // Check environment variable first (works on both server and client)
  if (process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Also check NEXT_PUBLIC variant for client-side
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Server-side: use default
  if (typeof window === "undefined") {
    return "http://localhost:8000/api";
  }

  // Check for cached URL to avoid repeated calculations
  const cachedUrl = (window as any).__GALAGO_API_BASE_URL__;
  if (cachedUrl) {
    return cachedUrl;
  }

  let baseUrl: string;

  // Check URL query parameters (useful for development and Electron)
  const urlParams = new URLSearchParams(window.location.search);
  const apiPort = urlParams.get("apiPort");
  const apiHost = urlParams.get("apiHost");

  if (apiPort) {
    // Use localhost (not 127.0.0.1) to match the page origin and avoid CORS
    baseUrl = `http://localhost:${apiPort}/api`;
  } else {
    // Fall back to default
    baseUrl = "http://localhost:8000/api";
  }

  // Cache the URL
  (window as any).__GALAGO_API_BASE_URL__ = baseUrl;
  console.log(`[API] Using base URL: ${baseUrl}`);

  return baseUrl;
}

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Update the API base URL dynamically (e.g., after Electron IPC call)
 */
export function updateApiBaseUrl(newBaseUrl: string): void {
  api.defaults.baseURL = newBaseUrl;
  if (typeof window !== "undefined") {
    (window as any).__GALAGO_API_BASE_URL__ = newBaseUrl;
  }
  console.log(`[API] Base URL updated to: ${newBaseUrl}`);
}

export const unpackError = (error: any): string => {
  let errorMessage = "Unknown error";
  if (!error.response) {
    errorMessage = "Network error";
  } else if (error.response?.data?.error) {
    const { title, message } = error.response.data.error;
    errorMessage =
      title && message ? `${title}: ${message}` : JSON.stringify(error.response.data.error);
  } else if (error.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error.message) {
    errorMessage = error.message;
  }
  return typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage);
};

export const get = async <T>(url: string, params?: any): Promise<T> => {
  try {
    const response = await api.get<T>(url, params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("Request error:", errorMsg);
      const err = new Error(`${error.response?.status} - ${errorMsg}`);
      // Attach the status code to the error
      (err as any).status = error.response?.status;
      throw err;
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const post = async <T>(url: string, data: any): Promise<T | null> => {
  try {
    const response = await api.post<T>(url, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("Request error:", errorMsg);
      throw new Error(
        `${error.response?.status} - ${errorMsg} - ${JSON.stringify(error.response?.data?.detail)}`,
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const put = async <T>(url: string, data: any): Promise<T> => {
  try {
    const response = await api.put<T>(url, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("Request error:", errorMsg);
      throw new Error(
        `Error: ${error.response?.status} - ${errorMsg} - ${JSON.stringify(error.response?.data?.detail)}`,
      );
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const del = async <T>(url: string): Promise<T> => {
  try {
    const response = await api.delete<T>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("Request error:", errorMsg);
      throw new Error(`Error: ${error.response?.status} - ${errorMsg}`);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

/**
 * Upload a file to the specified URL
 */
export const uploadFile = async <T>(
  url: string,
  file: File,
  extraData?: Record<string, any>,
): Promise<T> => {
  try {
    // Create FormData and append the file
    const formData = new FormData();
    formData.append("file", file);

    // Append any extra data if provided
    if (extraData) {
      Object.entries(extraData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // Use axios instance but override the Content-Type header
    const response = await api.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("File upload error:", errorMsg);
      throw new Error(`Error: ${error.response?.status} - ${errorMsg}`);
    } else {
      console.error("Unexpected error:", error);
      throw new Error("An unexpected error occurred during file upload");
    }
  }
};

export const downloadFile = async (url: string, filename?: string): Promise<void> => {
  try {
    const response = await api.get<Blob>(url, {
      responseType: "blob",
    });

    // Extract filename from Content-Disposition header if not provided
    if (!filename) {
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }
      // Fallback to a default filename if still not found
      if (!filename) {
        filename = url.split("/").pop() || "download";
      }
    }

    // Create a blob URL for the file
    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/octet-stream",
    });
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary anchor element and trigger download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg = unpackError(error);
      console.error("File download error:", errorMsg);
      throw new Error(`Error downloading file: ${error.response?.status} - ${errorMsg}`);
    } else {
      console.error("Unexpected error during download:", error);
      throw new Error("An unexpected error occurred during file download");
    }
  }
};
