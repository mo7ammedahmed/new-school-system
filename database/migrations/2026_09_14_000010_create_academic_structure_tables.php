<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->date('starts_on');
            $table->date('ends_on');
            $table->boolean('is_current')->default(false);
            $table->timestamps();
            $table->unique(['organization_id', 'school_id', 'name'], 'academic_year_scope_unique');
            $table->unique(['organization_id', 'id']);
            $table->foreign(['organization_id', 'school_id'])->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
        });

        Schema::create('classes', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['organization_id', 'school_id', 'name'], 'class_scope_unique');
            $table->unique(['organization_id', 'id']);
            $table->foreign(['organization_id', 'school_id'])->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
        });

        Schema::create('sections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->string('name');
            $table->timestamps();
            $table->unique(['organization_id', 'class_id', 'name'], 'section_scope_unique');
            $table->unique(['organization_id', 'id']);
            $table->unique(['organization_id', 'class_id']);
            $table->foreign(['organization_id', 'school_id'])->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
            $table->foreign(['organization_id', 'class_id'])->references(['organization_id', 'id'])->on('classes')->cascadeOnDelete();
        });

        Schema::create('enrollments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained('sections')->nullOnDelete();
            $table->string('status')->default('active');
            $table->date('enrolled_on');
            $table->date('ended_on')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'student_id', 'academic_year_id'], 'enrollment_scope_unique');
            $table->foreign(['organization_id', 'school_id'])->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
            $table->foreign(['organization_id', 'student_id'])->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
            $table->foreign(['organization_id', 'academic_year_id'])->references(['organization_id', 'id'])->on('academic_years')->cascadeOnDelete();
            $table->foreign(['organization_id', 'class_id'])->references(['organization_id', 'id'])->on('classes')->cascadeOnDelete();
            // organization_id is required for tenant integrity, so a composite
            // SET NULL action is invalid in MySQL. The single section FK above
            // clears nullable section_id; this key remains restrictive.
            $table->foreign(['organization_id', 'section_id'])->references(['organization_id', 'id'])->on('sections')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('classes');
        Schema::dropIfExists('academic_years');
    }
};
