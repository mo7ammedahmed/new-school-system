<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Services\AuditLogger;
use App\Support\Theme\ThemePalette;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The palette editor, for both scopes it has: a school re-skinning its own
 * screens, and a platform operator re-skinning the pages that belong to no
 * school (the marketing site, sign-in and error screens).
 *
 * A palette is stored as the seats somebody changed and reset by deleting that
 * map — never by writing values the bundle already has.
 */
class ThemeController
{
    public function editSchool(int $school, ThemePalette $palette): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-theme', $schoolModel);

        return $this->page($palette, 'school', $schoolModel, route('admin.theme.update', $schoolModel->id));
    }

    public function updateSchool(
        Request $request,
        int $school,
        ThemePalette $palette,
        AuditLogger $audit,
    ): RedirectResponse {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-theme', $schoolModel);

        $before = $palette->overrides($schoolModel);
        $overrides = $palette->normalise($this->validated($request, $palette));

        $palette->save($schoolModel, $overrides);

        $audit->record('school.theme.updated', $schoolModel, before: $before, after: $overrides);

        return $this->saved('admin.theme.edit', $schoolModel->id);
    }

    public function resetSchool(
        int $school,
        ThemePalette $palette,
        AuditLogger $audit,
    ): RedirectResponse {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-theme', $schoolModel);

        $before = $palette->overrides($schoolModel);
        $palette->clear($schoolModel);

        $audit->record('school.theme.reset', $schoolModel, before: $before);

        return $this->saved('admin.theme.edit', $schoolModel->id, code: 'theme.reset');
    }

    public function editPlatform(ThemePalette $palette): Response
    {
        Gate::authorize('manage-platform-theme');

        return $this->page($palette, 'platform', null, route('admin.theme.platform.update'));
    }

    public function updatePlatform(
        Request $request,
        ThemePalette $palette,
        AuditLogger $audit,
    ): RedirectResponse {
        Gate::authorize('manage-platform-theme');

        $before = $palette->platformOverrides();
        $overrides = $palette->normalise($this->validated($request, $palette));

        $palette->savePlatform($overrides);

        // No subject and no organization: this palette belongs to the platform,
        // not to any one tenant.
        $audit->record('platform.theme.updated', before: $before, after: $overrides);

        return $this->saved('admin.theme.platform.edit', code: 'theme.platform.saved');
    }

    public function resetPlatform(ThemePalette $palette, AuditLogger $audit): RedirectResponse
    {
        Gate::authorize('manage-platform-theme');

        $before = $palette->platformOverrides();
        $palette->clearPlatform();

        $audit->record('platform.theme.reset', before: $before);

        return $this->saved('admin.theme.platform.edit', code: 'theme.platform.reset');
    }

    /**
     * @param  'school'|'platform'  $scope
     */
    private function page(
        ThemePalette $palette,
        string $scope,
        ?School $school,
        string $action,
    ): Response {
        $overrides = $scope === 'platform'
            ? $palette->platformOverrides()
            : $palette->overrides($school);

        return Inertia::render('admin/theme/index', [
            'scope' => $scope,
            // The server owns the endpoint, so one screen can serve both scopes.
            'action' => $action,
            'school' => $school === null ? null : ['id' => $school->id, 'name' => $school->name],
            'theme' => $overrides,
            'groups' => $palette->groups(),
            'contrastPairs' => $palette->contrastPairs(),
            'hasOverride' => $palette->hasOverride($overrides),
        ]);
    }

    /**
     * The page turns this code into a translated sentence; a flash is the only
     * channel that survives the redirect.
     */
    private function saved(string $route, ?int $school = null, string $code = 'theme.saved'): RedirectResponse
    {
        $redirect = $school === null ? to_route($route) : to_route($route, $school);

        return $redirect->with('success', $code);
    }

    /**
     * Unknown seats and non-colour values are refused rather than dropped, so a
     * rejected value is visible to whoever submitted it instead of silently
     * reverting a screen they thought they had changed.
     *
     * @return array<string, mixed>
     */
    private function validated(Request $request, ThemePalette $palette): array
    {
        $data = $request->validate([
            'theme' => ['required', 'array'],
            'theme.light' => ['nullable', 'array'],
            'theme.dark' => ['nullable', 'array'],
        ]);

        $allowed = $palette->vars();
        $pattern = (string) config('theme.colour_pattern');
        $rejected = [];

        foreach (['light', 'dark'] as $mode) {
            $values = $data['theme'][$mode] ?? [];

            if (! is_array($values)) {
                continue;
            }

            foreach ($values as $var => $value) {
                // An empty seat means "stop overriding this one", which the
                // service already handles by dropping it from the map.
                if ($value === null || (is_string($value) && trim($value) === '')) {
                    continue;
                }

                if (! is_string($var) || ! in_array($var, $allowed, true)) {
                    $rejected[] = (string) $var;

                    continue;
                }

                if (! is_string($value) || ! preg_match($pattern, trim($value))) {
                    $rejected[] = $var;
                }
            }
        }

        if ($rejected !== []) {
            throw ValidationException::withMessages([
                'theme' => 'These palette seats were refused: '.implode(', ', array_unique($rejected)),
            ]);
        }

        return $data['theme'];
    }
}
