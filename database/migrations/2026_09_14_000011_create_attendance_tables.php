<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['organization_id', 'section_id', 'teacher_id'], 'teacher_assignment_scope_unique');
            $table->foreign(['organization_id', 'section_id'])->references(['organization_id', 'id'])->on('sections')->cascadeOnDelete();
        });

        Schema::create('attendance_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->date('attendance_date');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['organization_id', 'section_id', 'attendance_date'], 'attendance_session_scope_unique');
            $table->unique(['organization_id', 'id']);
            $table->foreign(['organization_id', 'section_id'])->references(['organization_id', 'id'])->on('sections')->cascadeOnDelete();
        });

        Schema::create('attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attendance_session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'attendance_session_id', 'student_id'], 'attendance_record_scope_unique');
            $table->foreign(['organization_id', 'attendance_session_id'])->references(['organization_id', 'id'])->on('attendance_sessions')->cascadeOnDelete();
            $table->foreign(['organization_id', 'student_id'])->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_records');
        Schema::dropIfExists('attendance_sessions');
        Schema::dropIfExists('teacher_assignments');
    }
};
