<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The canonical user organization migration is 2026_09_14_000002.
     * This generated duplicate remains only for migration-history compatibility.
     */
    public function up(): void
    {
        // Intentionally empty: organization_id is added by the canonical migration.
    }

    public function down(): void
    {
        // Intentionally empty: never remove the canonical tenant column here.
    }
};
