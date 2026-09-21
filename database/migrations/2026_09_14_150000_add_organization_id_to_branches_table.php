<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * The canonical organization hierarchy migration already creates the
     * organization_id column and composite branch ownership constraint.
     * Keep this migration as a no-op for migration-history compatibility.
     */
    public function up(): void
    {
        // Intentionally empty: branches are created with organization_id earlier.
    }

    public function down(): void
    {
        // Intentionally empty: never remove the canonical tenant column here.
    }
};
