<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('sections') || ! Schema::hasIndex('sections', 'sections_organization_id_class_id_unique')) {
            return;
        }

        Schema::table('sections', function (Blueprint $table): void {
            $table->dropUnique('sections_organization_id_class_id_unique');
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('sections') || Schema::hasIndex('sections', 'sections_organization_id_class_id_unique')) {
            return;
        }

        Schema::table('sections', function (Blueprint $table): void {
            $table->unique(['organization_id', 'class_id']);
        });
    }
};
