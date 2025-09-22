import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface AuthState {
 accessToken: string | null;
 isAuthenticated: boolean;
}
interface AuthContextType extends AuthState {
 setAuthState: (state: AuthState) => void;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}
export  const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthStateInternal] = useState<AuthState>({
    accessToken: null,
    isAuthenticated: false,
  });
  useEffect(() => {
    const loadTokens = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        setAuthStateInternal({
          accessToken,
          isAuthenticated: true,
        });
      }
    };
    loadTokens();
  }, []);
const setAuthState = async (state: AuthState) => {
    setAuthStateInternal(state);
    if (state.accessToken) {
      await AsyncStorage.setItem("accessToken", state.accessToken);
    }
  };
  
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      ...(options.headers || {}),
      Authorization: authState.accessToken
        ? `Bearer ${authState.accessToken}`
        : "",
      "Content-Type": "application/json",
    };
    return fetch(url, { ...options, headers });
  };
  const logout = async () => {
    await AsyncStorage.removeItem("accessToken");
    setAuthStateInternal({
      accessToken: null,
      isAuthenticated: false,
    });
  };
  return (
    <AuthContext.Provider value={{ ...authState, setAuthState, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;