<?php

namespace App\Support\Theme;

use App\Models\School;
use App\Models\Setting;
use Illuminate\Http\Request;

/**
 * The single owner of "what a palette override means".
 *
 * Two scopes share it. A school's palette lives in `schools.settings.theme`
 * and paints that school's screens; the platform palette lives in the
 * `settings` table under `theme.platform` and paints every page that belongs
 * to no school — the marketing site, sign-in and error screens.
 *
 * Both are stored the same way: only the seats somebody changed, shaped as
 * `['light' => ['--primary' => '#123456'], 'dark' => [...]]`. Nothing here
 * duplicates a default colour, so clearing a map restores the bundle palette
 * in `resources/css/app.css` exactly.
 */
class ThemePalette
{
    /** Row key the platform-wide palette is stored under. */
    public const PLATFORM_KEY = 'theme.platform';

    private const THEMES = ['light', 'dark'];

    /**
     * Every custom property a palette is allowed to override.
     *
     * @return list<string>
     */
    public function vars(): array
    {
        $vars = [];

        foreach ($this->groups() as $fields) {
            foreach ($fields as $field) {
                $vars[] = $field['var'];
            }
        }

        return $vars;
    }

    /**
     * The editable schema, unchanged from config so PHP stays the only list.
     *
     * @return array<string, list<array{var: string, contrast?: string}>>
     */
    public function groups(): array
    {
        return config('theme.groups', []);
    }

    /**
     * The pairs the editor checks for WCAG AA, resolved against the live sheet.
     *
     * @return list<array{text: string, on: string, min: int|float}>
     */
    public function contrastPairs(): array
    {
        return config('theme.contrast_pairs', []);
    }

    /**
     * A school's stored override, keyed by theme then custom property.
     *
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    public function overrides(?School $school): array
    {
        $stored = $school?->settings['theme'] ?? [];

        return $this->clean(is_array($stored) ? $stored : []);
    }

    /**
     * The platform-wide override, which is what a page without a school renders.
     *
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    public function platformOverrides(): array
    {
        return $this->clean(Setting::read(self::PLATFORM_KEY));
    }

    /**
     * Validate a submitted payload into the shape that gets persisted.
     *
     * @param  array<string, mixed>  $input
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    public function normalise(array $input): array
    {
        return $this->clean($input);
    }

    /**
     * Persist a school's palette, leaving every other school setting untouched.
     *
     * @param  array{light: array<string, string>, dark: array<string, string>}  $overrides
     */
    public function save(School $school, array $overrides): void
    {
        $settings = $school->settings ?? [];
        $settings['theme'] = $overrides;

        $school->settings = $settings;
        $school->save();
    }

    /**
     * @param  array{light: array<string, string>, dark: array<string, string>}  $overrides
     */
    public function savePlatform(array $overrides): void
    {
        Setting::write(self::PLATFORM_KEY, $overrides);
    }

    /**
     * Drop a school's palette so it falls back to the bundle palette.
     */
    public function clear(School $school): void
    {
        $settings = $school->settings ?? [];
        unset($settings['theme']);

        $school->settings = $settings;
        $school->save();
    }

    public function clearPlatform(): void
    {
        Setting::forget(self::PLATFORM_KEY);
    }

    /**
     * Whether a stored map holds anything worth rendering. A palette that
     * cleared every seat keeps the bundle colours.
     *
     * @param  array{light: array<string, string>, dark: array<string, string>}  $overrides
     */
    public function hasOverride(array $overrides): bool
    {
        return $overrides['light'] !== [] || $overrides['dark'] !== [];
    }

    /**
     * The stylesheet fragment for a palette, or null when nothing is overridden.
     *
     * Both blocks are emitted whenever either theme carries a value. A palette
     * that only re-skins light mode still needs a `.dark` block: without one,
     * the light override would leak into dark mode through the shared `:root`
     * custom properties.
     *
     * @param  array{light: array<string, string>, dark: array<string, string>}  $overrides
     */
    public function css(array $overrides): ?string
    {
        if (! $this->hasOverride($overrides)) {
            return null;
        }

        return ':root{'.$this->declarations($overrides['light']).'}'
            .'.dark{'.$this->declarations($overrides['dark']).'}';
    }

    /**
     * The palette that applies to this request: the school in the route when one
     * is bound, otherwise the viewer's own school, otherwise the platform
     * palette — which is how the public marketing pages get their colours.
     *
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    public function forRequest(Request $request): array
    {
        $school = $request->route('school');

        if (! $school instanceof School) {
            $school = $request->user()?->accessibleSchools()->first();
        }

        return $school instanceof School
            ? $this->overrides($school)
            : $this->platformOverrides();
    }

    /**
     * @param  array<string, mixed>  $stored
     * @return array{light: array<string, string>, dark: array<string, string>}
     */
    private function clean(array $stored): array
    {
        $clean = ['light' => [], 'dark' => []];

        foreach (self::THEMES as $theme) {
            $values = $stored[$theme] ?? [];

            if (is_array($values)) {
                $clean[$theme] = $this->filter($values);
            }
        }

        return $clean;
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, string>
     */
    private function filter(array $values): array
    {
        $allowed = $this->vars();
        $pattern = (string) config('theme.colour_pattern');
        $clean = [];

        foreach ($values as $var => $value) {
            if (! in_array($var, $allowed, true)) {
                continue;
            }

            if (! is_string($value)) {
                continue;
            }

            $value = trim($value);

            if ($value === '' || ! preg_match($pattern, $value)) {
                continue;
            }

            $clean[$var] = $value;
        }

        return $clean;
    }

    /**
     * @param  array<string, string>  $values
     */
    private function declarations(array $values): string
    {
        $css = '';

        foreach ($values as $var => $value) {
            $css .= $var.':'.$value.';';
        }

        return $css;
    }
}
