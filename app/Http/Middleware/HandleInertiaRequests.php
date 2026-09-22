<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\SiteContent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use Laravel\Fortify\Features;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $organization = $user?->organization;
        $schools = $user?->accessibleSchools() ?? new Collection;
        $primarySchool = $schools->first();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // Public calls to action must not link to a route that only exists
            // when self-registration is switched on.
            'canRegister' => Features::enabled(Features::registration()),
            'locale' => app()->getLocale(),
            'direction' => config('localization.supported.'.app()->getLocale().'.direction', 'ltr'),
            'locales' => config('localization.supported', []),
            'siteContent' => fn () => Schema::hasTable('site_contents')
                ? SiteContent::query()
                    ->published()
                    ->get(['page', 'locale', 'content', 'seo_title', 'seo_description'])
                    ->groupBy('page')
                    ->map(fn (Collection $items) => $items->keyBy('locale')->map(fn (SiteContent $item) => [
                        'content' => $item->content,
                        'seoTitle' => $item->seo_title,
                        'seoDescription' => $item->seo_description,
                    ]))
                : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                // Machine-readable schedule conflict codes; the client translates them.
                'conflicts' => fn () => $request->session()->get('conflicts'),
            ],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->getKey(),
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                ] : null,
                'organization' => $organization ? [
                    'id' => $organization->getKey(),
                    'name' => $organization->name,
                    'slug' => $organization->slug,
                ] : null,
                'abilities' => [
                    'manageOrganization' => $user?->isPlatformOperator() || $user?->hasRole(UserRole::OrganizationAdmin),
                    'manageFinance' => $user?->isPlatformOperator() || $user?->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin, UserRole::FinanceStaff),
                    'recordAttendance' => $user?->isPlatformOperator() || $user?->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin, UserRole::Teacher),
                    'manageSiteContent' => $user?->isPlatformOperator(),
                    'canAccessSchedule' => $user?->isPlatformOperator()
                        || $user?->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin, UserRole::AcademicCoordinator, UserRole::Teacher),
                    'manageSchedule' => $this->allows($request, 'manage-schedule', $primarySchool),
                    'publishSchedule' => $this->allows($request, 'publish-schedule', $primarySchool),
                    'manageAdmissions' => $this->allows($request, 'manage-admissions', $primarySchool),
                    'manageEnrollment' => $this->allows($request, 'manage-enrollment', $primarySchool),
                    'manageUsers' => $this->allows($request, 'manage-users', $primarySchool),
                    'manageContent' => $this->allows($request, 'manage-content', $primarySchool),
                    'viewAttendanceReports' => $this->allows($request, 'view-attendance-report', $primarySchool),
                ],
                // Presentation hints only: every server endpoint re-authorizes.
                'schools' => $schools
                    ->map(fn ($school): array => ['id' => $school->id, 'name' => $school->name])
                    ->values()
                    ->all(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    private function allows(Request $request, string $ability, mixed $argument): bool
    {
        $user = $request->user();

        if ($user === null || $argument === null) {
            return false;
        }

        return Gate::forUser($user)->allows($ability, $argument);
    }
}
