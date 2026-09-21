<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The `student` role exists, but there was no way to connect a login to a
     * student record, so a student could never see their own data. This adds
     * the missing link. It mirrors `guardians.user_id`: nullable, unique, and
     * cleared when the user is deleted so the student record survives.
     */
    public function up(): void
    {
        if (Schema::hasColumn('students', 'user_id')) {
            return;
        }

        Schema::table('students', function (Blueprint $table): void {
            $table->foreignId('user_id')
                ->nullable()
                ->after('school_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('students', 'user_id')) {
            return;
        }

        Schema::table('students', function (Blueprint $table): void {
            $table->dropUnique(['user_id']);
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
