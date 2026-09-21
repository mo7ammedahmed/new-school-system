// Border radius tokens for the school management platform
export const radius = {
  none: '0',
  sm: '0.25rem',   // 4px
  DEFAULT: '0.375rem', // 6px
  md: '0.5rem',    // 8px
  lg: '0.625rem',  // 10px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  '4xl': '1.875rem', // 30px
  '5xl': '2.25rem', // 36px
  '6xl': '2.5rem',  // 40px
  '7xl': '3rem',    // 48px
  full: '9999px',
};

export type RadiusKey = keyof typeof radius;