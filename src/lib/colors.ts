// Color configuration following Material Design 3 principles
export const colors = {
  // Primary brand colors
  primary: {
    50: 'oklch(0.95 0.02 240)',
    100: 'oklch(0.9 0.04 240)', 
    200: 'oklch(0.8 0.06 240)',
    300: 'oklch(0.7 0.08 240)',
    400: 'oklch(0.6 0.1 240)',
    500: 'oklch(0.45 0.12 240)', // Main primary
    600: 'oklch(0.4 0.12 240)',
    700: 'oklch(0.35 0.12 240)',
    800: 'oklch(0.3 0.1 240)',
    900: 'oklch(0.25 0.08 240)',
    950: 'oklch(0.2 0.06 240)'
  },
  
  // Accent colors (orange complementary)
  accent: {
    50: 'oklch(0.95 0.02 45)',
    100: 'oklch(0.9 0.05 45)',
    200: 'oklch(0.85 0.08 45)',
    300: 'oklch(0.8 0.11 45)',
    400: 'oklch(0.75 0.13 45)',
    500: 'oklch(0.7 0.15 45)', // Main accent
    600: 'oklch(0.65 0.15 45)',
    700: 'oklch(0.6 0.15 45)',
    800: 'oklch(0.55 0.13 45)',
    900: 'oklch(0.5 0.11 45)',
    950: 'oklch(0.45 0.09 45)'
  },
  
  // Neutral colors
  neutral: {
    50: 'oklch(0.98 0.005 240)',
    100: 'oklch(0.96 0.005 240)',
    200: 'oklch(0.92 0.005 240)',
    300: 'oklch(0.87 0.005 240)',
    400: 'oklch(0.74 0.005 240)',
    500: 'oklch(0.56 0.005 240)',
    600: 'oklch(0.49 0.005 240)',
    700: 'oklch(0.42 0.005 240)',
    800: 'oklch(0.28 0.005 240)',
    900: 'oklch(0.15 0.005 240)',
    950: 'oklch(0.09 0.005 240)'
  },
  
  // Semantic colors
  semantic: {
    success: 'oklch(0.6 0.15 140)',
    warning: 'oklch(0.75 0.15 60)',
    error: 'oklch(0.6 0.18 20)',
    info: 'oklch(0.65 0.12 220)'
  },
  
  // Chart colors (data visualization palette)
  chart: {
    primary: 'oklch(0.45 0.12 240)',
    secondary: 'oklch(0.7 0.15 45)',
    tertiary: 'oklch(0.6 0.15 140)',
    quaternary: 'oklch(0.65 0.12 300)',
    quinary: 'oklch(0.75 0.15 60)',
    senary: 'oklch(0.6 0.18 20)'
  }
} as const

export type ColorConfig = typeof colors