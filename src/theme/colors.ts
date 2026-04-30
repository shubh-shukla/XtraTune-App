// Modern theme palette — Spotify-inspired dark, clean light
export const Colors = {
  light: {
    primary: "#f97316",          // orange-500
    primaryLight: "#fff7ed",     // orange-50 tint
    primaryGradientStart: "#f97316",
    primaryGradientEnd: "#ea580c",
    background: "#ffffff",
    surface: "#f8fafc",           // slate-50
    surfaceElevated: "#ffffff",
    card: "#f1f5f9",              // slate-100 — visible contrast
    text: "#0f172a",              // slate-900
    textSecondary: "#64748b",     // slate-500
    textMuted: "#94a3b8",         // slate-400
    border: "#e2e8f0",            // slate-200
    icon: "#475569",              // slate-600
    tabBar: "#ffffff",
    tabBarBorder: "#e2e8f0",
    playerBackground: "#ffffff",
    playerSurface: "#f1f5f9",
    danger: "#ef4444",
    success: "#22c55e",
    overlay: "rgba(0,0,0,0.5)",
    skeleton: "#e2e8f0",
    inputBackground: "#f1f5f9",
    cardBorder: "#e2e8f0",
    accent: "#6366f1",            // indigo pop
  },
  dark: {
    primary: "#fb923c",           // orange-400 — brighter in dark
    primaryLight: "#431407",      // warm dark tint
    primaryGradientStart: "#fb923c",
    primaryGradientEnd: "#f97316",
    background: "#09090b",        // zinc-950
    surface: "#18181b",           // zinc-900
    surfaceElevated: "#27272a",   // zinc-800
    card: "#1c1c22",              // slightly blue-tinted dark
    text: "#f4f4f5",              // zinc-100
    textSecondary: "#a1a1aa",     // zinc-400
    textMuted: "#71717a",         // zinc-500
    border: "#27272a",            // zinc-800
    icon: "#a1a1aa",              // zinc-400
    tabBar: "#09090b",
    tabBarBorder: "#27272a",
    playerBackground: "#18181b",
    playerSurface: "#27272a",
    danger: "#f87171",            // red-400
    success: "#4ade80",           // green-400
    overlay: "rgba(0,0,0,0.75)",
    skeleton: "#27272a",
    inputBackground: "#18181b",
    cardBorder: "#303038",        // subtle elevated border
    accent: "#818cf8",            // indigo-400
  },
} as const;

export type ThemeColors = typeof Colors.dark;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 36,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;
