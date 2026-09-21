<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Branch;
use App\Models\Organization;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoSchoolSeeder extends Seeder
{
    public function run(): void
    {
        $organization = Organization::updateOrCreate(
            ['slug' => 'demo-school-group'],
            ['name' => 'Demo School Group', 'settings' => ['locale' => 'en']],
        );

        $school = School::updateOrCreate(
            ['organization_id' => $organization->id, 'slug' => 'demo-school'],
            ['name' => 'Demo School', 'settings' => ['theme' => 'default']],
        );

        Branch::updateOrCreate(
            ['organization_id' => $organization->id, 'school_id' => $school->id, 'slug' => 'main-campus'],
            ['name' => 'Main Campus', 'settings' => []],
        );

        $user = User::updateOrCreate(
            ['email' => 'admin@demo-school.test'],
            [
                'name' => 'Demo School Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $user->organization_id = $organization->id;
        $user->role = UserRole::OrganizationAdmin;
        $user->save();
    }
}
