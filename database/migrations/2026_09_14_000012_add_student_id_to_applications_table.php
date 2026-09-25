<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->foreignId('student_id')
                ->nullable()
                ->after('school_id')
                ->constrained('students')
                ->nullOnDelete();
            $table->unique('student_id', 'applications_student_id_unique');
            $table->foreign(['organization_id', 'student_id'])
                ->references(['organization_id', 'id'])
                ->on('students')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table): void {
            $table->dropForeign(['organization_id', 'student_id']);
            $table->dropForeign(['student_id']);
            $table->dropUnique('applications_student_id_unique');
            $table->dropColumn('student_id');
        });
    }
};
