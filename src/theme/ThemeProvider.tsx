import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors, type ThemeColors } from "./colors";
import { useAppSelector } from "@/store/hooks";

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  colorScheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  colors: Colors.dark,
  isDark: true,
  colorScheme: "dark",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const themeChoice = useAppSelector((s) => s.settings.theme);

  const colorScheme =
    themeChoice === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : themeChoice;

  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
