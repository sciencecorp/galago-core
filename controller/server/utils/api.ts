import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.API_BASE_URL}` || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

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
