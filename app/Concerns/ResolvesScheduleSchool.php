<?php

namespace App\Concerns;

use App\Models\School;
use Illuminate\Support\Facades\Gate;

/**
 * The two steps every schedule action performs before touching a school's data:
 * load the school and authorize the ability on it, then refuse any related model
 * that belongs to a different school.
 *
 * Cross-school access is reported as 404 rather than 403 so a refused request
 * never confirms that another tenant's record exists.
 */
trait ResolvesScheduleSchool
{
    protected function scheduleSchool(int $school, string $ability = 'manage-schedule'): School
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize($ability, $schoolModel);

        return $schoolModel;
    }

    protected function ensureSameSchool(int $schoolId, int $modelSchoolId): void
    {
        if ($schoolId !== $modelSchoolId) {
            abort(404);
        }
    }
}
