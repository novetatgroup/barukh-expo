import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { Role } from "../constants/roles";
import { getSecureItem, saveSecureItem, deleteSecureItem } from "../utils/secureStorage";

interface RoleContextType {
  role: Role | null;
  setRole: (role: Role) => Promise<void>;
  clearRole: () => Promise<void>;
  loading: boolean;
}

export const RoleContext = createContext<RoleContextType>({} as RoleContextType);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await getSecureItem("userRole");
        if (savedRole === "TRAVELLER" || savedRole === "SENDER") {
          setRoleState(savedRole as Role);
        }
      } catch (err) {
        console.error("Failed to load role:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRole();
  }, []);

  const setRole = async (newRole: Role) => {
    setRoleState(newRole);
    await saveSecureItem("userRole", newRole);
  };

  const clearRole = async () => {
    setRoleState(null);
    await deleteSecureItem("userRole");
  };

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
