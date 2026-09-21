// Color palette for the school management platform
export const colors = {
  // Primary colors - based on existing design but expanded
  primary: {
    50: '#eff6f3',
    100: '#dcecdf',
    200: '#bcd9c0',
    300: '#8fc194',
    400: '#5fa368',
    500: '#3d8548', // Primary 500 - main brand color
    600: '#2f6b3a',
    700: '#275430',
    800: '#21432a',
    900: '#1d3825',
    950: '#0d1f13',
  },

  // Secondary colors - for accents and secondary actions
  secondary: {
    50: '#f8f4f3',
    100: '#f0e9e5',
    200: '#e2cfc8',
    300: '#ccb5a9',
    400: '#b59c8b',
    500: '#9f836e', // Secondary 500
    600: '#7f6958',
    700: '#665247',
    800: '#52423b',
    900: '#3f312c',
    950: '#2c2420',
  },

  // Neutral colors - for text, backgrounds, borders
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Semantic colors - for status and feedback
  success: {
    light: '#dcfce7',
    DEFAULT: '#22c55e',
    dark: '#166534',
  },

  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
  },

  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
  },

  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },

  // Additional premium colors for special uses
  premium: {
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Premium gold
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    platinum: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b', // Premium platinum
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    }
  }
};

export type ColorScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type ColorKey = keyof typeof colors;
export type PremiumColorKey = keyof typeof colors.premium;