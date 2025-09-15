// ConnectGig Color Palette
// Consistent color scheme across all UI components

export const colors = {
  // Primary Colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb', // Primary Blue
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary Colors
  secondary: {
    50: '#f9fafb', // Secondary White
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280', // Neutral Gray
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Accent Colors
  accent: {
    white: '#ffffff', // Accent Milky White
    gray: '#f8fafc',
    blue: '#1e40af',
    green: '#059669',
    yellow: '#d97706',
    red: '#dc2626',
  },

  // Status Colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    muted: '#6b7280',
  },

  // Border Colors
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    focus: '#2563eb',
  },

  // Shadow Colors
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
} as const;

// CSS Custom Properties for use in CSS-in-JS
export const cssVariables = {
  '--color-primary': colors.primary[600],
  '--color-primary-light': colors.primary[400],
  '--color-primary-dark': colors.primary[800],
  '--color-secondary': colors.secondary[50],
  '--color-accent': colors.accent.white,
  '--color-neutral': colors.secondary[500],
  '--color-background': colors.background.primary,
  '--color-text': colors.text.primary,
  '--color-border': colors.border.light,
} as const;

// Tailwind CSS color classes mapping
export const tailwindColors = {
  primary: colors.primary,
  secondary: colors.secondary,
  accent: colors.accent,
  status: colors.status,
  background: colors.background,
  text: colors.text,
  border: colors.border,
} as const;

export default colors;
