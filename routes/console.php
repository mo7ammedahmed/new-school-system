<?php

use App\Models\Organization;
use App\Models\School;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display a famous quote');

Artisan::command('foundation:smoke', function () {
    if (! app()->environment(['local', 'testing'])) {
        $this->error('foundation:smoke is restricted to local and testing environments.');

        return 1;
    }

    foreach (['organizations', 'schools', 'branches', 'users', 'audit_logs', 'media'] as $table) {
        if (! Schema::hasTable($table)) {
            $this->error("Missing required table: {$table}");

            return 1;
        }
    }

    $organization = Organization::query()->first();

    if ($organization === null) {
        $this->error('No organization fixture found. Run php artisan db:seed first.');

        return 1;
    }

    $schoolCount = School::query()->forOrganization($organization)->count();
    $this->info("Foundation ready: {$organization->slug} with {$schoolCount} school(s).");

    return 0;
})->purpose('Validate the local Phase 1 foundation');
