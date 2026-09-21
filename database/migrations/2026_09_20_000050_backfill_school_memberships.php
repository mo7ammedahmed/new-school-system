<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('school_memberships')) {
            return;
        }

        $organizationsWithOneSchool = DB::table('organizations as o')
            ->select('o.id')
            ->join('schools as s', 's.organization_id', '=', 'o.id')
            ->groupBy('o.id')
            ->havingRaw('COUNT(s.id) = 1')
            ->pluck('o.id');

        foreach ($organizationsWithOneSchool as $orgId) {
            $schoolId = DB::table('schools')->where('organization_id', $orgId)->value('id');

            $userIds = User::query()
                ->where('organization_id', $orgId)
                ->whereIn('role', ['organization_admin', 'school_admin', 'teacher'])
                ->pluck('id');

            foreach ($userIds as $userId) {
                $exists = DB::table('school_memberships')
                    ->where('user_id', $userId)
                    ->where('school_id', $schoolId)
                    ->exists();

                if (! $exists) {
                    DB::table('school_memberships')->insert([
                        'organization_id' => $orgId,
                        'school_id' => $schoolId,
                        'user_id' => $userId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Cannot reverse backfill safely — keep memberships.
    }
};
