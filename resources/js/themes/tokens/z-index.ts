// Z-index tokens for the school management platform
export const zIndex = {
    // Base layer
    base: 0,

    // Dropdowns, popovers, tooltips
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,

    // Navigation and headers
    header: 1100,
    sidebar: 1150,
    navbar: 1200,

    // Overlays and modals
    overlay: 1300,
    modalOverlay: 1310,
    drawer: 1320,

    // Toasts and notifications
    toast: 1400,
    notification: 1410,

    // Debugging and development
    debug: 9999,
};

// Type definition for z-index keys
export type ZIndexKey = keyof typeof zIndex;
