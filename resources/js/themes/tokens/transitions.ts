// Transition tokens for the school management platform
export const transitions = {
  // Duration tokens
  duration: {
    fastest: '50ms',
    faster: '100ms',
    fast: '150ms',
    DEFAULT: '200ms', // Default transition duration
    slow: '300ms',
    slower: '400ms',
    slowest: '500ms',
  },

  // Easing tokens
  easing: {
    // Common easing curves
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOutBack: 'cubic-bezier(0.12, 0.4, 0.29, 1.46)',
    easeInBack: 'cubic-bezier(0.48, -0.12, 0.88, 1)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeInCirc: 'cubic-bezier(0, 0.65, 0.55, 1)',
    easeOutCirc: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
    easeInQuad: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    easeOutQuad: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    easeInOutQuad: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)',
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    easeInQuart: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
    easeOutQuart: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    easeInOutQuart: 'cubic-bezier(0.77, 0, 0.175, 1)',
    easeInQuint: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)',
    easeOutQuint: 'cubic-bezier(0.23, 1, 0.32, 1)',
    easeInOutQuint: 'cubic-bezier(0.86, 0, 0.07, 1)',
    easeInSine: 'cubic-bezier(0.47, 0, 0.745, 0.715)',
    easeOutSine: 'cubic-bezier(0.39, 0.575, 0.565, 1)',
    easeInOutSine: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    easeInExpo: 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
    easeOutExpo: 'cubic-bezier(0.19, 1, 0.22, 1)',
    easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
    // Elastic
    easeOutElastic: 'cubic-bezier(0.104, 0.176, 0.215, 0.931)',
    easeInElastic: 'cubic-bezier(0.895, 0.03, 0.685, 0.22)',
    easeInOutElastic: 'cubic-bezier(0.85, 0, 0.15, 1)',
    // Bounce
    easeOutBounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    easeInBounce: 'cubic-bezier(0.48, -0.28, 0.535, 0.035)',
    easeInOutBounce: 'cubic-bezier(0.58, -0.18, 0.59, 0.99)',
  },

  // Predefined transition combinations
  DEFAULT: '200ms cubic-bezier(0.4, 0, 0.2, 1)', // duration + easing
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

// Type definitions
export type DurationKey = keyof typeof transitions.duration;
export type EasingKey = keyof typeof transitions.easing;
export type TransitionValue = `${DurationKey} ${EasingKey}` | string;