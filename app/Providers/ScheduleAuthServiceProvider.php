<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\Section;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class ScheduleAuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::define('manage-schedule', function (User $user, $school): bool {
            return $user->isPlatformOperator()
                || ($user->hasRole(UserRole::OrganizationAdmin) && $user->belongsToOrganization($school->organization))
                || ($user->hasRole(UserRole::SchoolAdmin) && $user->belongsToSchool($school))
                || ($user->hasRole(UserRole::AcademicCoordinator) && $user->belongsToSchool($school));
        });

        Gate::define('publish-schedule', function (User $user, $school): bool {
            if ($user->isPlatformOperator()) {
                return true;
            }

            if ($user->belongsToOrganization($school->organization)) {
                if ($user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin)) {
                    return true;
                }

                if ($user->hasRole(UserRole::AcademicCoordinator) && $user->belongsToSchool($school)) {
                    return (bool) config('schedule.coordinators_can_publish', false);
                }
            }

            return false;
        });

        Gate::define('delete-schedule', function (User $user, $school): bool {
            if ($user->isPlatformOperator()) {
                return true;
            }

            if ($user->belongsToOrganization($school->organization)) {
                if ($user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin)) {
                    return true;
                }
            }

            return false;
        });

        Gate::define('view-section-timetable', function (User $user, Section $section): bool {
            if ($user->isPlatformOperator()) {
                return true;
            }

            $school = $section->school;

            if ($user->belongsToOrganization($school->organization) && $user->hasRole(UserRole::OrganizationAdmin, UserRole::SchoolAdmin)) {
                return true;
            }

            if ($user->hasRole(UserRole::Teacher)) {
                return $user->organization_id === $section->organization_id
                    && $user->assignedSections()->whereKey($section->id)->exists();
            }

            if ($user->hasRole(UserRole::Guardian)) {
                return $user->organization_id === $section->organization_id
                    && $user->guardian?->students()
                        ->where('students.section_id', $section->id)
                        ->exists();
            }

            if ($user->hasRole(UserRole::Student)) {
                $student = Student::where('user_id', $user->id)->first();

                return $student !== null
                    && $user->organization_id === $section->organization_id
                    && $student->enrollments()
                        ->where('section_id', $section->id)
                        ->where('status', 'active')
                        ->exists();
            }

            return false;
        });

        Gate::define('view-teacher-timetable', function (User $user, User $teacher): bool {
            return $teacher->hasRole(UserRole::Teacher);
        });

        Gate::define('view-exam-schedule', function (User $user, Model $schedule): bool {
            return true;
        });
    }
}
