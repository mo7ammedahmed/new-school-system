<?php

namespace App\Console\Commands;

use App\Models\School;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SchoolAssignStaffCommand extends Command
{
    protected $signature = 'school:assign-staff {user} {school} {--role=academic_coordinator}';

    protected $description = 'Assign a user to a school via school_memberships';

    public function handle(): int
    {
        $userIdentifier = $this->argument('user');
        $schoolIdentifier = $this->argument('school');
        $role = $this->option('role') ?? 'academic_coordinator';

        $user = is_numeric($userIdentifier)
            ? User::query()->find($userIdentifier)
            : User::where('email', $userIdentifier)->first();

        if (! $user) {
            $this->error('User not found.');

            return 1;
        }

        $school = is_numeric($schoolIdentifier)
            ? School::query()->find($schoolIdentifier)
            : School::where('slug', $schoolIdentifier)->first();

        if (! $school) {
            $this->error('School not found.');

            return 1;
        }

        if (! $user->belongsToOrganization($school->organization)) {
            $this->error('User belongs to a different organization.');

            return 1;
        }

        $validator = Validator::make(
            ['role' => $role],
            ['role' => ['in:organization_admin,school_admin,finance_staff,academic_coordinator,teacher']],
        );

        if ($validator->fails()) {
            $this->error('Invalid role.');

            return 1;
        }

        DB::transaction(function () use ($user, $school): void {
            $user->schoolMemberships()->updateOrCreate(
                ['school_id' => $school->id],
                [
                    'organization_id' => $school->organization_id,
                    'user_id' => $user->id,
                ],
            );
        });

        $this->info("User {$user->email} assigned to school {$school->name}.");

        return 0;
    }
}
