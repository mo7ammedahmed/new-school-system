/**
 * Tailwind CSS 4 is configured CSS-first: the palette, fonts, radii and type
 * scale all live in `resources/css/app.css` under `@theme`. This file is loaded
 * only through the `@config` directive in that same stylesheet, so it must not
 * declare a second palette — doing so silently shadows the CSS tokens.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
    content: [
        './resources/**/*.blade.php',
        './resources/**/*.js',
        './resources/**/*.tsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    'Apple Color Emoji',
                    'Segoe UI Emoji',
                ],
                display: [
                    'Geist',
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                ],
                arabic: [
                    'IBM Plex Sans Arabic',
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                ],
            },
        },
    },
    plugins: [],
};
