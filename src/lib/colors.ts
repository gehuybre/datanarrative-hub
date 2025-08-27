// Aurora Borealis inspired color palette
export const colors = {
  // Primary aurora green colors
  primary: {
    50: 'oklch(0.96 0.02 160)',
    100: 'oklch(0.92 0.04 160)', 
    200: 'oklch(0.86 0.08 160)',
    300: 'oklch(0.78 0.12 160)',
    400: 'oklch(0.70 0.16 160)',
    500: 'oklch(0.65 0.20 160)', // Main aurora green
    600: 'oklch(0.58 0.18 160)',
    700: 'oklch(0.50 0.16 160)',
    800: 'oklch(0.42 0.14 160)',
    900: 'oklch(0.34 0.12 160)',
    950: 'oklch(0.26 0.10 160)'
  },
  
  // Purple aurora accents
  accent: {
    50: 'oklch(0.95 0.02 280)',
    100: 'oklch(0.90 0.05 280)',
    200: 'oklch(0.85 0.08 280)',
    300: 'oklch(0.80 0.11 280)',
    400: 'oklch(0.75 0.13 280)',
    500: 'oklch(0.75 0.15 280)', // Main purple
    600: 'oklch(0.68 0.15 280)',
    700: 'oklch(0.60 0.15 280)',
    800: 'oklch(0.52 0.13 280)',
    900: 'oklch(0.45 0.11 280)',
    950: 'oklch(0.38 0.09 280)'
  },
  
  // Arctic neutral colors
  neutral: {
    50: 'oklch(0.98 0.01 180)',
    100: 'oklch(0.96 0.01 180)',
    200: 'oklch(0.92 0.02 180)',
    300: 'oklch(0.88 0.02 180)',
    400: 'oklch(0.74 0.02 180)',
    500: 'oklch(0.56 0.02 180)',
    600: 'oklch(0.49 0.02 180)',
    700: 'oklch(0.42 0.02 180)',
    800: 'oklch(0.28 0.02 180)',
    900: 'oklch(0.15 0.02 240)',
    950: 'oklch(0.09 0.02 240)'
  },
  
  // Semantic colors
  semantic: {
    success: 'oklch(0.55 0.18 120)', // Bright green
    warning: 'oklch(0.60 0.15 40)', // Aurora yellow
    error: 'oklch(0.65 0.20 25)', // Warm red
    info: 'oklch(0.70 0.12 320)' // Cool magenta
  },
  
  // Chart colors optimized for Aurora Borealis theme
  chart: {
    primary: 'oklch(0.65 0.20 160)', // Aurora green
    secondary: 'oklch(0.75 0.15 280)', // Aurora purple  
    tertiary: 'oklch(0.55 0.18 120)', // Bright forest green
    quaternary: 'oklch(0.70 0.12 320)', // Magenta aurora
    quinary: 'oklch(0.60 0.15 40)', // Aurora yellow
    senary: 'oklch(0.68 0.18 200)' // Icy blue
  }
} as const

export type ColorConfig = typeof colors