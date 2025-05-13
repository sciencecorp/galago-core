import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from "next-auth/react";

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    username: string,
    password: string,
    csrfToken?: string,
    rememberMe?: boolean,
  ) => Promise<LoginResult>;
  socialLogin: (provider: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper function to store token in cookies only
export const storeToken = (token: string) => {
  if (typeof window !== "undefined") {
    // Set cookie with httpOnly:true to prevent JavaScript access, and secure if in production
    fetch(`${API_URL}/set-cookie`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
      credentials: "include", // Important for cookies
    }).catch((err) => {
      console.error("Failed to set secure cookie:", err);
    });
  }
};

// Helper function to remove token from cookies
export const removeToken = () => {
  if (typeof window !== "undefined") {
    // Remove the cookie by making it expire
    fetch(`${API_URL}/clear-cookie`, {
      method: "POST",
      credentials: "include", // Important for cookies
    }).catch((err) => {
      console.error("Failed to clear secure cookie:", err);
    });

    // Also remove non-httpOnly cookie if it exists
    Cookies.remove("token", { path: "/" });
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get NextAuth session
  const { data: session, status: sessionStatus } = useSession();

  // Check if user is authenticated via NextAuth
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      if (session?.accessToken) {
        // Store the token from NextAuth in our local storage/cookies
        const token = session.accessToken as string;
        storeToken(token);

        // Fetch user data with the token to keep systems in sync
        const fetchUserWithToken = async () => {
          try {
            const response = await axios.get(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setUser(response.data);
            setError(null);
          } catch (err) {
            console.error("Failed to sync NextAuth session with custom auth:", err);
          } finally {
            setLoading(false);
          }
        };

        fetchUserWithToken();
      } else {
        // Session is authenticated but has no token (abnormal case)
        setLoading(false);
      }
    } else if (sessionStatus === "unauthenticated") {
      // If NextAuth says we're not authenticated, then check our custom auth
      checkCustomAuth();
    } else if (sessionStatus === "loading") {
      // Keep loading true while NextAuth is checking
      setLoading(true);
    }
  }, [session, sessionStatus]);

  // Make sure loading is set to false when auth checks complete
  useEffect(() => {
    if (sessionStatus !== "loading" && user !== null) {
      setLoading(false);
    } else if (
      sessionStatus === "unauthenticated" &&
      !localStorage.getItem("token") &&
      !Cookies.get("token")
    ) {
      setLoading(false);
    }
  }, [sessionStatus, user]);

  // Check if the user is already logged in via custom auth
  const checkCustomAuth = async () => {
    const token = localStorage.getItem("token") || Cookies.get("token");

    if (token) {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error("Authentication check failed:", err);
        removeToken();
        setUser(null);
      }
    }

    setLoading(false);
  };

  const login = async (
    username: string,
    password: string,
    csrfToken?: string,
    rememberMe?: boolean,
  ): Promise<LoginResult> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Add CSRF token if provided
      if (csrfToken) {
        formData.append("csrfToken", csrfToken);
      }

      // Add remember me preference
      if (rememberMe !== undefined) {
        formData.append("remember_me", rememberMe ? "true" : "false");
      }

      const response = await axios.post(`${API_URL}/token`, formData);

      const { access_token } = response.data;
      storeToken(access_token);

      // Get the user data
      const userResponse = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setUser(userResponse.data);
      return { success: true };
    } catch (err: any) {
      console.error("Login failed:", err);

      // Extract more detailed error information if available
      let errorType = "unknown";
      let errorMsg = "Login failed. Please check your credentials.";

      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        // Handle different error scenarios based on status code and response data
        if (status === 401) {
          if (errorData?.detail === "Account locked") {
            errorType = "locked";
            errorMsg = "Your account has been locked due to too many failed attempts";
          } else if (errorData?.detail === "Inactive account") {
            errorType = "inactive";
            errorMsg = "Your account is inactive. Please contact an administrator";
          } else if (errorData?.detail === "Credentials expired") {
            errorType = "expired";
            errorMsg = "Your credentials have expired. Please reset your password";
          } else {
            errorType = "credentials";
            errorMsg = errorData?.detail || "Invalid username or password";
          }
        } else if (status === 403) {
          errorType = "forbidden";
          errorMsg = "Access denied. You do not have permission to access this resource";
        } else if (status === 429) {
          errorType = "rate_limited";
          errorMsg = "Too many login attempts. Please try again later";
        }
      }

      setError(errorMsg);
      return {
        success: false,
        error: errorType,
        message: errorMsg,
      };
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: string) => {
    await nextAuthSignIn(provider, { callbackUrl: "/" });
  };

  const logout = () => {
    removeToken();
    setUser(null);

    // Also logout from NextAuth
    nextAuthSignOut({ callbackUrl: "/auth/signin" });
  };

  const isAuthenticated = !!user || (sessionStatus === "authenticated" && !!session);
  const isAdmin = user?.is_admin || session?.isAdmin === true;

  // Safety timeout to ensure loading state doesn't get stuck
  useEffect(() => {
    // Add a safety timeout to force loading to false after 5 seconds
    const forceLoadingEndTimeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    return () => clearTimeout(forceLoadingEndTimeout);
  }, [loading]);

  const contextValue = {
    user,
    loading,
    error,
    login,
    socialLogin,
    logout,
    isAuthenticated,
    isAdmin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Create an axios instance with auth header
export const authAxios = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the token to all requests
authAxios.interceptors.request.use(
  (config) => {
    // With httpOnly cookies, we don't need to manually add the token
    // The browser will automatically send the cookie with requests
    // Just make sure credentials are included
    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error),
);

// Add a response interceptor to handle authentication errors
authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we get a 401 Unauthorized, redirect to login
      removeToken();
      window.location.href = "/auth/signin";
    }
    return Promise.reject(error);
  },
);
