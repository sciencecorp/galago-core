import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SidebarContextProps {
  lastClickedSubtab: string | null;
  setLastClickedSubtab: (subtab: string | null) => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  lastClickedSubtab: null,
  setLastClickedSubtab: () => {},
});

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lastClickedSubtab, setLastClickedSubtabState] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedSubtab = localStorage.getItem("lastClickedSubtab");
      if (storedSubtab) {
        setLastClickedSubtabState(storedSubtab);
      }
    }
  }, []);

  const setLastClickedSubtab = (subtab: string | null) => {
    if (typeof window !== "undefined" && subtab !== null) {
      localStorage.setItem("lastClickedSubtab", subtab);
    }
    setLastClickedSubtabState(subtab);
  };
  return (
    <SidebarContext.Provider value={{ lastClickedSubtab, setLastClickedSubtab }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
