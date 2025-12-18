/**
 * Sidebar Context
 * 
 * Context for managing sidebar open/close state across TopBar and Sidebar components.
 */

"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext({
  isOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
  isCollapsed: false,
  toggleCollapse: () => {},
});

/**
 * SidebarProvider Component
 * Provides sidebar state to children components
 */
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  // Initialize collapsed state from localStorage, default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      // Save to localStorage
      localStorage.setItem("sidebarCollapsed", String(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, closeSidebar, isCollapsed, toggleCollapse }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

/**
 * useSidebar Hook
 * Hook to access sidebar state and functions
 */
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}

