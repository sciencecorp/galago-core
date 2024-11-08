import axios, { AxiosRequestConfig, AxiosError } from "axios";
import { errorToast, successToast, warningToast } from "@/components/ui/Toast";

export const api = axios.create({
  baseURL: "http://localhost:8000/",
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
    console.log("error.response.data.message", error.response.data.message);
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
      throw new Error(`Error: ${error.response?.status} - ${errorMsg}`);
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
      errorToast("Unexpected error", "An unexpected error occurred");
      throw new Error(
        `Error: ${error.response?.status} - ${errorMsg} - ${JSON.stringify(error.response?.data?.detail)}`,
      );
    } else {
      console.error("Unexpected error:", error);
      errorToast("Unexpected error", "An unexpected error occurred");
      throw new Error("An unexpected error occurred");
    }
  }
};

export const put = async <T>(url: string, data: any): Promise<T> => {
  try {
    const response = await api.put<T>(url, data);
    return response.data;
  } catch (error) {
    console.log("Error format is", error);
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
