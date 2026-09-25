<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\Organization;
use App\Models\ReportCardSnapshot;
use App\Models\School;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
        RateLimiter::for('stripe-webhook', fn (Request $request) => Limit::perMinute(120)->by($request->ip()));
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configureAuthorization(): void
    {
        Gate::before(fn (User $user): ?bool => $user->isPlatformOperator() ? true : null);

        Gate::define('manage-organization', function (User $user, Organization $organization): bool {
            return $user->hasRole(UserRole::OrganizationAdmin)
                && $user->belongsToOrganization($organization);
        });

        Gate::define('access-school', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(
                    UserRole::OrganizationAdmin,
                    UserRole::SchoolAdmin,
                    UserRole::FinanceStaff,
                    UserRole::AcademicCoordinator,
                    UserRole::Teacher,
                );
        });

        Gate::define('manage-content', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        Gate::define('manage-admissions', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        // Re-skinning every screen is an administrator action, exactly like
        // editing the content those screens render.
        Gate::define('manage-theme', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        // The palette for the pages that belong to no school (the marketing
        // site) is platform property, so only a platform operator may set it.
        Gate::define('manage-platform-theme', fn (User $user): bool => $user->isPlatformOperator());

        Gate::define('manage-enrollment', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        Gate::define('manage-users', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        Gate::define('view-student', function (User $user, Student $student): bool {
            if ($user->hasRole(UserRole::Guardian)) {
                return $user->organization_id === $student->organization_id
                    && $user->guardian?->students()->whereKey($student->id)->exists();
            }

            // A student may always see their own record, and only their own.
            if ($user->hasRole(UserRole::Student)) {
                return $student->user_id !== null
                    && $student->user_id === $user->getKey();
            }

            return Gate::forUser($user)->allows('access-school', $student->school);
        });

        Gate::define('issue-report-card', function (User $user, Student $student): bool {
            return $user->belongsToOrganization($student->school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin);
        });

        Gate::define('view-report-card-snapshot', function (User $user, ReportCardSnapshot $snapshot): bool {
            return Gate::forUser($user)->allows('view-student', $snapshot->student);
        });

        Gate::define('manage-finance', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin, UserRole::FinanceStaff);
        });

        Gate::define('record-attendance', function (User $user, School $school): bool {
            return $user->belongsToOrganization($school->organization)
                && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin, UserRole::Teacher);
        });

        Gate::define('record-section-attendance', function (User $user, Section $section): bool {
            if ($user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin)) {
                return $user->belongsToOrganization($section->school->organization);
            }

            return $user->hasRole(UserRole::Teacher)
                && $user->organization_id === $section->organization_id
                && $user->assignedSections()->whereKey($section->id)->exists();
        });

        Gate::define('view-attendance-report', function (User $user, School $school): bool {
            if ($user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin)) {
                return $user->belongsToOrganization($school->organization);
            }

            return $user->hasRole(UserRole::Teacher)
                && $user->organization_id === $school->organization_id
                && $user->assignedSections()->where('teacher_assignments.school_id', $school->id)->exists();
        });

        Gate::define('record-assessment', function (User $user, Section $section): bool {
            return $user->hasRole(UserRole::Teacher)
                && $user->organization_id === $section->organization_id
                && $user->assignedSections()->whereKey($section->id)->exists();
        });
    }
}
