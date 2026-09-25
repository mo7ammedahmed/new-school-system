<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Subjects catalog
        Schema::create('subjects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('code', 32);
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('color', 7)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['organization_id', 'school_id', 'code'], 'subjects_school_code_unique');
        });

        // Required periods per subject per class
        Schema::create('class_subjects', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('periods_per_week');
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['organization_id', 'class_id', 'subject_id'], 'class_subjects_class_subject_unique');
        });

        // Teacher assignments: which teacher teaches which subject in which section
        Schema::create('teaching_assignments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('periods_per_week')->nullable();
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['organization_id', 'academic_year_id', 'section_id', 'subject_id'], 'teaching_assignments_ay_section_subject_unique');
        });

        // Bell schedules
        Schema::create('bell_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['organization_id', 'school_id', 'name'], 'bell_schedules_school_name_unique');
        });

        // Bell periods within a schedule
        Schema::create('bell_periods', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('bell_schedule_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('number');
            $table->string('label_en');
            $table->string('label_ar');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->boolean('is_break')->default(false);
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['bell_schedule_id', 'number'], 'bell_periods_schedule_number_unique');
        });

        // Schedule settings per school
        Schema::create('school_schedule_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->json('working_days');
            $table->unsignedTinyInteger('max_exams_per_day_per_section')->default(1);
            $table->unsignedSmallInteger('teacher_max_periods_per_day')->nullable();
            $table->unsignedSmallInteger('teacher_max_periods_per_week')->nullable();
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['school_id'], 'school_schedule_settings_school_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_schedule_settings');
        Schema::dropIfExists('bell_periods');
        Schema::dropIfExists('bell_schedules');
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('class_subjects');
        Schema::dropIfExists('subjects');
    }
};
