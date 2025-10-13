import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string | number;
  issuer?: string;
}

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  userId: number | null;
}

interface AuthContextType extends AuthState {
  setAuthState: (state: AuthState) => void;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthStateInternal] = useState<AuthState>({
    accessToken: null,
    isAuthenticated: false,
    userId: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
          const decoded: DecodedToken = jwtDecode(token);
          setAuthStateInternal({
            accessToken: token,
            isAuthenticated: true,
            userId: decoded.userId ? Number(decoded.userId) : null,
          });
        }
      } catch (err) {
        console.error("Failed to load auth state:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const setAuthState = async (state: AuthState) => {
    setAuthStateInternal(state);
    if (state.accessToken) {
      await AsyncStorage.setItem("accessToken", state.accessToken);
    }
  };

const authFetch = async (url: string, options: RequestInit = {}) => {
  let existingHeaders: Record<string, string> = {};

  if (options.headers instanceof Headers) {
    existingHeaders = Object.fromEntries(options.headers.entries());
  } else if (Array.isArray(options.headers)) {
    existingHeaders = Object.fromEntries(options.headers);
  } else if (typeof options.headers === "object" && options.headers !== null) {
    existingHeaders = options.headers as Record<string, string>;
  }

  const headers: Record<string, string> = {
    ...existingHeaders,
    Authorization: `Bearer ${authState.accessToken}`, 
    "Content-Type": "application/json",
  };

  return fetch(url, { ...options, headers });
};

  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    setAuthStateInternal({
      accessToken: null,
      isAuthenticated: false,
      userId: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{ ...authState, setAuthState, logout, authFetch, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
