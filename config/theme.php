<?php

use App\Support\Theme\ThemePalette;

/**
 * Every colour a palette may be re-skinned with.
 *
 * One schema serves both scopes: a school's own palette and the platform
 * palette that paints the pages belonging to no school. Neither this file nor
 * the database stores a *default* colour — `resources/css/app.css` owns those,
 * and an override exists only for a seat somebody actually changed, so
 * clearing the map restores the bundle palette exactly.
 *
 * Each entry: `var` is the custom property written into `:root` / `.dark`,
 * `contrast` names the surface that seat is drawn on (for text seats) so the
 * editor can show a WCAG ratio and offer a legible swap. A seat without
 * `contrast` is a fill or a line.
 *
 * @see ThemePalette
 */
return [
    /*
    |--------------------------------------------------------------------------
    | Editable groups
    |--------------------------------------------------------------------------
    |
    | Order is the order the editor renders, and each key doubles as a
    | translation key under `theme.group.*`.
    |
    */
    'groups' => [
        'brand' => [
            ['var' => '--primary'],
            ['var' => '--on-primary', 'contrast' => '--primary'],
            ['var' => '--primary-container'],
            ['var' => '--on-primary-container', 'contrast' => '--primary-container'],
            ['var' => '--primary-fixed'],
            ['var' => '--primary-fixed-dim'],
        ],
        'secondary' => [
            ['var' => '--secondary'],
            ['var' => '--on-secondary', 'contrast' => '--secondary'],
            ['var' => '--secondary-container'],
            ['var' => '--on-secondary-container', 'contrast' => '--secondary-container'],
            ['var' => '--secondary-fixed'],
            ['var' => '--secondary-fixed-dim'],
        ],
        'tertiary' => [
            ['var' => '--tertiary'],
            ['var' => '--on-tertiary', 'contrast' => '--tertiary'],
            ['var' => '--tertiary-container'],
            ['var' => '--on-tertiary-container', 'contrast' => '--tertiary-container'],
            ['var' => '--tertiary-fixed'],
            ['var' => '--tertiary-fixed-dim'],
        ],
        'surfaces' => [
            ['var' => '--surface'],
            ['var' => '--surface-dim'],
            ['var' => '--surface-bright'],
            ['var' => '--surface-variant'],
            ['var' => '--surface-container-lowest'],
            ['var' => '--surface-container-low'],
            ['var' => '--surface-container'],
            ['var' => '--surface-container-high'],
            ['var' => '--surface-container-highest'],
            ['var' => '--surface-tint'],
            ['var' => '--inverse-surface'],
            ['var' => '--inverse-on-surface', 'contrast' => '--inverse-surface'],
        ],
        'components' => [
            ['var' => '--background'],
            ['var' => '--foreground', 'contrast' => '--background'],
            ['var' => '--card'],
            ['var' => '--card-foreground', 'contrast' => '--card'],
            ['var' => '--popover'],
            ['var' => '--popover-foreground', 'contrast' => '--popover'],
            ['var' => '--primary-foreground', 'contrast' => '--primary'],
            ['var' => '--secondary-foreground', 'contrast' => '--secondary'],
            ['var' => '--muted'],
            ['var' => '--muted-foreground', 'contrast' => '--muted'],
            ['var' => '--accent'],
            ['var' => '--accent-foreground', 'contrast' => '--accent'],
            ['var' => '--destructive'],
            ['var' => '--destructive-foreground', 'contrast' => '--destructive'],
            ['var' => '--border'],
            ['var' => '--input'],
        ],
        'sidebar' => [
            ['var' => '--sidebar'],
            ['var' => '--sidebar-foreground', 'contrast' => '--sidebar'],
            ['var' => '--sidebar-primary'],
            ['var' => '--sidebar-primary-foreground', 'contrast' => '--sidebar-primary'],
            ['var' => '--sidebar-accent'],
            ['var' => '--sidebar-accent-foreground', 'contrast' => '--sidebar-accent'],
            ['var' => '--sidebar-border'],
            ['var' => '--sidebar-ring'],
        ],
        'text' => [
            ['var' => '--on-surface', 'contrast' => '--surface'],
            ['var' => '--on-surface-variant', 'contrast' => '--surface'],
            ['var' => '--outline'],
            ['var' => '--outline-variant'],
            ['var' => '--ring'],
        ],
        'states' => [
            ['var' => '--success'],
            ['var' => '--success-container'],
            ['var' => '--success-foreground', 'contrast' => '--success-container'],
            ['var' => '--success-border'],
            ['var' => '--warning'],
            ['var' => '--warning-container'],
            ['var' => '--warning-foreground', 'contrast' => '--warning-container'],
            ['var' => '--warning-border'],
            ['var' => '--danger'],
            ['var' => '--danger-container'],
            ['var' => '--danger-foreground', 'contrast' => '--danger-container'],
            ['var' => '--danger-border'],
            ['var' => '--academic'],
            ['var' => '--academic-container'],
            ['var' => '--academic-foreground', 'contrast' => '--academic-container'],
            ['var' => '--academic-border'],
            ['var' => '--info'],
            ['var' => '--info-foreground', 'contrast' => '--info'],
            ['var' => '--error'],
            ['var' => '--on-error', 'contrast' => '--error'],
            ['var' => '--error-container'],
            ['var' => '--on-error-container', 'contrast' => '--error-container'],
        ],
        'hero' => [
            ['var' => '--hero-bg'],
            ['var' => '--hero-muted'],
            ['var' => '--hero-accent'],
        ],
        'ramp' => [
            ['var' => '--brand-50'],
            ['var' => '--brand-100'],
            ['var' => '--brand-200'],
            ['var' => '--brand-300'],
            ['var' => '--brand-400'],
            ['var' => '--brand-500'],
            ['var' => '--brand-600', 'contrast' => '--primary-foreground'],
            ['var' => '--brand-700'],
            ['var' => '--brand-800'],
            ['var' => '--brand-900'],
        ],
        'charts' => [
            ['var' => '--chart-1'],
            ['var' => '--chart-2'],
            ['var' => '--chart-3'],
            ['var' => '--chart-4'],
            ['var' => '--chart-5'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Contrast pairs the editor flags
    |--------------------------------------------------------------------------
    |
    | Both members are resolved from the live stylesheet, so a pair stays
    | correct when either side is overridden. `min` is the WCAG AA ratio for
    | the kind of text drawn with that pair.
    |
    */
    'contrast_pairs' => [
        ['text' => '--on-surface', 'on' => '--surface', 'min' => 4.5],
        ['text' => '--on-surface-variant', 'on' => '--surface', 'min' => 4.5],
        ['text' => '--on-surface-variant', 'on' => '--surface-container-lowest', 'min' => 4.5],
        ['text' => '--on-primary', 'on' => '--primary', 'min' => 4.5],
        ['text' => '--on-primary-container', 'on' => '--primary-container', 'min' => 4.5],
        ['text' => '--on-secondary', 'on' => '--secondary', 'min' => 4.5],
        ['text' => '--on-secondary-container', 'on' => '--secondary-container', 'min' => 4.5],
        ['text' => '--on-tertiary', 'on' => '--tertiary', 'min' => 4.5],
        ['text' => '--card-foreground', 'on' => '--card', 'min' => 4.5],
        ['text' => '--muted-foreground', 'on' => '--muted', 'min' => 4.5],
        ['text' => '--sidebar-foreground', 'on' => '--sidebar', 'min' => 4.5],
        ['text' => '--sidebar-primary-foreground', 'on' => '--sidebar-primary', 'min' => 4.5],
        ['text' => '--primary-foreground', 'on' => '--brand-600', 'min' => 4.5],
        ['text' => '--success-foreground', 'on' => '--success-container', 'min' => 4.5],
        ['text' => '--warning-foreground', 'on' => '--warning-container', 'min' => 4.5],
        ['text' => '--danger-foreground', 'on' => '--danger-container', 'min' => 4.5],
        ['text' => '--academic-foreground', 'on' => '--academic-container', 'min' => 4.5],
        ['text' => '--on-error', 'on' => '--error', 'min' => 4.5],
        ['text' => '--on-error-container', 'on' => '--error-container', 'min' => 4.5],
        ['text' => '--inverse-on-surface', 'on' => '--inverse-surface', 'min' => 4.5],
    ],

    /*
    |--------------------------------------------------------------------------
    | Accepted colour syntax
    |--------------------------------------------------------------------------
    |
    | `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `hsl()` and `oklch()` are all
    | accepted; anything else (including a `var()` indirection, which would let
    | a palette point a token at an internal variable it cannot see) is refused.
    |
    */
    'colour_pattern' => '/^(#[0-9a-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\([0-9a-z%.,\/\s+-]+\))$/i',
];
