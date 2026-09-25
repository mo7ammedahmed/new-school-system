/**
 * Client half of the school palette.
 *
 * The server renders the same stylesheet into the document head (see
 * `SchoolTheme::css()`); this module rebuilds it live while an administrator
 * drags a colour, so the whole shell re-skins before anything is saved.
 */

export type ThemeMode = 'light' | 'dark';

export type ThemeOverrides = Record<ThemeMode, Record<string, string>>;

/** Id the server uses for the injected palette, so preview edits the same node. */
const STYLE_ID = 'theme-tokens';

export const THEME_MODES: ThemeMode[] = ['light', 'dark'];

export function emptyOverrides(): ThemeOverrides {
    return { light: {}, dark: {} };
}

/**
 * Mirrors `App\Support\Theme\SchoolTheme::css()`. Only tokens a school
 * actually changed are emitted, so everything else keeps resolving to the
 * bundle value in `app.css`.
 */
export function buildThemeCss(overrides: ThemeOverrides): string {
    const light = declarations(overrides.light);
    const dark = declarations(overrides.dark);

    if (light === '' && dark === '') {
        return '';
    }

    return `:root{${light}}.dark{${dark}}`;
}

/** Writes the palette into the document, or clears it when nothing is overridden. */
export function applyThemeCss(overrides: ThemeOverrides): void {
    const css = buildThemeCss(overrides);
    const existing = document.getElementById(STYLE_ID);

    if (css === '') {
        existing?.remove();

        return;
    }

    if (existing) {
        // Re-writing the node the server rendered keeps the cascade order the
        // server chose (after app.css) instead of appending a second sheet.
        existing.textContent = css;

        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
}

/**
 * The colours the stylesheet paints *right now* for both modes.
 *
 * Values are read off a hidden probe rather than parsed out of `app.css`,
 * because a token may be an indirection (`--hero-bg: var(--primary-container)`)
 * or a syntax a picker cannot use (`oklch(...)`). A canvas normalises whatever
 * the browser computed into `#rrggbb`.
 */
export function readThemeVars(variables: string[]): ThemeOverrides {
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    const probe = document.createElement('div');

    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
        'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden';
    document.body.appendChild(probe);

    const read = (): Record<string, string> =>
        Object.fromEntries(
            variables.map((variable) => [
                variable,
                resolveVar(variable, probe),
            ]),
        );

    html.classList.remove('dark');
    const light = read();

    html.classList.add('dark');
    const dark = read();

    if (!wasDark) {
        html.classList.remove('dark');
    }

    probe.remove();

    return { light, dark };
}

/** Only the tokens that differ from the bundle palette. */
export function diffFromBaseline(
    values: ThemeOverrides,
    baseline: ThemeOverrides,
): ThemeOverrides {
    const overrides = emptyOverrides();

    for (const mode of THEME_MODES) {
        for (const [variable, value] of Object.entries(values[mode])) {
            if (value !== '' && value !== baseline[mode][variable]) {
                overrides[mode][variable] = value;
            }
        }
    }

    return overrides;
}

/** The palette an editor should show: stored overrides on top of the bundle. */
export function mergeOverrides(
    baseline: ThemeOverrides,
    overrides: ThemeOverrides,
): ThemeOverrides {
    return {
        light: { ...baseline.light, ...overrides.light },
        dark: { ...baseline.dark, ...overrides.dark },
    };
}

export function hasAnyOverride(overrides: ThemeOverrides): boolean {
    return (
        Object.keys(overrides.light).length > 0 ||
        Object.keys(overrides.dark).length > 0
    );
}

/** Key-order independent comparison, so "is this dirty?" never lies. */
export function sameOverrides(a: ThemeOverrides, b: ThemeOverrides): boolean {
    return THEME_MODES.every((mode) => {
        const left = Object.keys(a[mode]);
        const right = Object.keys(b[mode]);

        return (
            left.length === right.length &&
            left.every((variable) => a[mode][variable] === b[mode][variable])
        );
    });
}

/**
 * WCAG 2.1 relative luminance, used for the editor's contrast readout and for
 * picking a legible label colour on a swatch.
 */
export function relativeLuminance(hex: string): number {
    const channels = hexToChannels(hex);

    if (!channels) {
        return 0;
    }

    const [r, g, b] = channels.map((channel) => {
        const value = channel / 255;

        return value <= 0.03928
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
    const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
        (x, y) => y - x,
    );

    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * A readable name for a seat nobody translated: `--surface-container-high`
 * becomes `Surface container high`, so the long tail of the palette stays
 * scannable without ninety hand-written labels.
 */
export function humanizeToken(variable: string): string {
    const [first, ...rest] = variable.replace(/^--/, '').split('-');

    return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(' ');
}

/** Black or white, whichever is legible on a swatch. */
export function readableOn(hex: string): string {
    return contrastRatio(hex, '#ffffff') >= 4.5 ? '#ffffff' : '#000000';
}

function declarations(values: Record<string, string>): string {
    return Object.entries(values)
        .map(([variable, value]) => `${variable}:${value};`)
        .join('');
}

function resolveVar(variable: string, probe: HTMLElement): string {
    probe.style.backgroundColor = '';
    probe.style.backgroundColor = `var(${variable})`;

    return toHex(getComputedStyle(probe).backgroundColor) ?? '';
}

function toHex(value: string): string | null {
    const trimmed = value.trim();

    if (trimmed === '' || trimmed === 'transparent') {
        return null;
    }

    if (/^#[0-9a-f]{6}$/i.test(trimmed)) {
        return trimmed.toLowerCase();
    }

    if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
        const [, r, g, b] = trimmed;

        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    const context = document.createElement('canvas').getContext('2d');

    if (!context) {
        return null;
    }

    // The canvas accepts every CSS colour syntax and reports opaque colours
    // back as #rrggbb, which is the only format an <input type="color"> takes.
    context.fillStyle = '#000000';
    context.fillStyle = trimmed;

    return /^#[0-9a-f]{6}$/i.test(context.fillStyle)
        ? context.fillStyle.toLowerCase()
        : null;
}

function hexToChannels(hex: string): [number, number, number] | null {
    const normalised = toHex(hex);

    if (!normalised) {
        return null;
    }

    return [
        parseInt(normalised.slice(1, 3), 16),
        parseInt(normalised.slice(3, 5), 16),
        parseInt(normalised.slice(5, 7), 16),
    ];
}
