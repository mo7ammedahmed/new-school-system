<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\School;
use App\Models\Setting;
use App\Models\User;
use App\Support\Theme\ThemePalette;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

/**
 * The palette editor rewrites the colours every screen uses, so the tests pin
 * the things that could quietly corrupt that: who may write which palette, what
 * values are accepted, and how an override reaches the document.
 */
class ThemeTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_school_admin_can_open_the_palette_editor(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->get(route('admin.theme.edit', ['school' => $school->id]))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/theme/index')
                ->where('scope', 'school')
                ->has('groups.brand')
                ->has('groups.charts')
                ->has('action')
                ->has('contrastPairs')
                ->where('hasOverride', false)
                ->where('theme.light', [])
                ->where('theme.dark', []));
    }

    public function test_a_teacher_may_not_read_or_write_the_palette(): void
    {
        [$school] = $this->school();
        $teacher = User::factory()->create([
            'organization_id' => $school->organization_id,
            'role' => UserRole::Teacher,
        ]);

        $this->actingAs($teacher)
            ->get(route('admin.theme.edit', ['school' => $school->id]))
            ->assertForbidden();

        $this->actingAs($teacher)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--primary' => '#123456']],
            ])
            ->assertForbidden();

        $this->assertNull($school->fresh()->settings['theme'] ?? null);
    }

    public function test_saving_stores_only_the_tokens_that_were_changed(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => [
                    'light' => ['--primary' => '#123456', '--surface' => '#ffffff'],
                    'dark' => ['--primary' => '#abcdef'],
                ],
            ])
            ->assertRedirect(route('admin.theme.edit', ['school' => $school->id]));

        $this->assertSame(
            [
                'light' => ['--primary' => '#123456', '--surface' => '#ffffff'],
                'dark' => ['--primary' => '#abcdef'],
            ],
            $school->fresh()->settings['theme'],
        );
    }

    public function test_the_override_is_rendered_after_the_bundle_stylesheet(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--surface' => '#101010']],
            ]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertSee('id="theme-tokens"', false);
        $response->assertSee('--surface:#101010;', false);
        // Both blocks are emitted so a light-only override cannot leak into dark
        // mode through the shared custom properties.
        $response->assertSee('.dark{}', false);
    }

    public function test_a_school_without_an_override_gets_no_stylesheet(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertDontSee('id="theme-tokens"', false);
    }

    public function test_unknown_tokens_and_non_colour_values_are_refused(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => [
                    'light' => [
                        '--primary' => '#123456',
                        '--not-a-token' => '#ffffff',
                        '--surface' => '#fff}html{display:none',
                    ],
                ],
            ])
            ->assertSessionHasErrors('theme');

        $this->assertNull($school->fresh()->settings['theme'] ?? null);
    }

    public function test_resetting_removes_the_override_and_keeps_other_settings(): void
    {
        [$school, $admin] = $this->school();

        $school->settings = ['locale' => 'ar'];
        $school->save();

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--primary' => '#123456']],
            ]);

        $this->actingAs($admin)
            ->delete(route('admin.theme.reset', ['school' => $school->id]))
            ->assertRedirect(route('admin.theme.edit', ['school' => $school->id]));

        $this->assertSame(['locale' => 'ar'], $school->fresh()->settings);
    }

    public function test_the_stored_map_survives_an_edit_that_cleared_a_token(): void
    {
        [$school, $admin] = $this->school();

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--primary' => '#123456']],
            ]);

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--primary' => '']],
            ]);

        $this->assertSame(['light' => [], 'dark' => []], $school->fresh()->settings['theme']);
    }

    public function test_a_platform_operator_can_edit_and_reset_the_platform_palette(): void
    {
        $operator = $this->platformOperator();

        $this->actingAs($operator)
            ->get(route('admin.theme.platform.edit'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('admin/theme/index')
                ->where('scope', 'platform')
                ->where('school', null)
                ->has('groups.states'));

        $this->actingAs($operator)
            ->put(route('admin.theme.platform.update'), [
                'theme' => ['light' => ['--primary' => '#123456']],
            ])
            ->assertRedirect(route('admin.theme.platform.edit'));

        $this->assertSame(
            ['light' => ['--primary' => '#123456'], 'dark' => []],
            Setting::read(ThemePalette::PLATFORM_KEY),
        );

        $this->actingAs($operator)
            ->delete(route('admin.theme.platform.reset'))
            ->assertRedirect(route('admin.theme.platform.edit'));

        $this->assertSame([], Setting::read(ThemePalette::PLATFORM_KEY));
    }

    public function test_an_organization_or_school_administrator_may_not_edit_the_platform_palette(): void
    {
        [, $admin] = $this->school();

        $this->actingAs($admin)
            ->get(route('admin.theme.platform.edit'))
            ->assertForbidden();

        $this->actingAs($admin)
            ->put(route('admin.theme.platform.update'), [
                'theme' => ['light' => ['--primary' => '#123456']],
            ])
            ->assertForbidden();

        $this->assertSame([], Setting::read(ThemePalette::PLATFORM_KEY));
    }

    public function test_the_platform_palette_paints_the_pages_that_belong_to_no_school(): void
    {
        Setting::write(ThemePalette::PLATFORM_KEY, ['light' => ['--primary' => '#ff0000']]);

        $this->get('/')
            ->assertOk()
            ->assertSee('--primary:#ff0000;', false);

        $this->get('/contact')
            ->assertOk()
            ->assertSee('--primary:#ff0000;', false);
    }

    public function test_a_school_screen_follows_its_own_palette_not_the_platform_one(): void
    {
        [$school, $admin] = $this->school();

        Setting::write(ThemePalette::PLATFORM_KEY, ['light' => ['--primary' => '#ff0000']]);

        $this->actingAs($admin)
            ->put(route('admin.theme.update', ['school' => $school->id]), [
                'theme' => ['light' => ['--primary' => '#00ff00']],
            ]);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertSee('--primary:#00ff00;', false)
            ->assertDontSee('--primary:#ff0000;', false);
    }

    public function test_a_school_without_a_palette_keeps_the_bundle_colours_on_its_own_pages(): void
    {
        [, $admin] = $this->school();

        Setting::write(ThemePalette::PLATFORM_KEY, ['light' => ['--primary' => '#ff0000']]);

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk()
            ->assertDontSee('id="theme-tokens"', false);

        $this->get('/schools/theme-org/theme-school')
            ->assertOk()
            ->assertDontSee('id="theme-tokens"', false);
    }

    public function test_a_school_palette_paints_the_schools_own_public_pages(): void
    {
        [$school] = $this->school();

        app(ThemePalette::class)->save($school, [
            'light' => ['--primary' => '#00ff00'],
            'dark' => [],
        ]);

        // No session at all: the school is in the URL, so its palette applies
        // to the page a visitor who has never signed in can see.
        $this->get(route('public.school', ['organization' => 'theme-org', 'school' => 'theme-school']))
            ->assertOk()
            ->assertSee('--primary:#00ff00;', false);

        $this->get(route('public.admissions.create', ['organization' => 'theme-org', 'school' => 'theme-school']))
            ->assertOk()
            ->assertSee('--primary:#00ff00;', false);
    }

    /**
     * A seat in the config that no stylesheet declares would render a control
     * that silently does nothing.
     */
    public function test_every_editable_token_is_declared_by_the_stylesheet(): void
    {
        $css = file_get_contents(resource_path('css/app.css'));
        $this->assertIsString($css);

        $missing = array_values(array_filter(
            app(ThemePalette::class)->vars(),
            fn (string $variable): bool => ! preg_match('/'.preg_quote($variable, '/').'\s*:/', $css),
        ));

        $this->assertSame([], $missing, 'config/theme.php lists tokens app.css never declares.');
    }

    /**
     * @return array{School, User}
     */
    private function school(): array
    {
        $organization = Organization::factory()->create(['name' => 'Theme Org', 'slug' => 'theme-org']);
        $school = School::factory()->create([
            'organization_id' => $organization->id,
            'name' => 'Theme School',
            'slug' => 'theme-school',
        ]);

        $admin = User::factory()->create([
            'organization_id' => $organization->id,
            'role' => UserRole::SchoolAdmin,
        ]);

        return [$school, $admin];
    }

    private function platformOperator(): User
    {
        return User::factory()->create([
            'organization_id' => null,
            'role' => UserRole::PlatformSuperAdmin,
        ]);
    }
}
