<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Laravel's default create_jobs_table migration already creates jobs,
     * job_batches, and failed_jobs before this project migration runs.
     *
     * This migration is intentionally retained as a no-op so databases that
     * already recorded its name keep a stable migration history while fresh
     * installs avoid attempting to create duplicate tables.
     */
    public function up(): void
    {
        // Intentionally empty: the canonical queue tables are created earlier.
    }

    public function down(): void
    {
        // Intentionally empty: never remove canonical queue tables here.
    }
};
