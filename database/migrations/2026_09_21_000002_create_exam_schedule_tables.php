<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // An exam period ("First term midterms") owned by one school.
        Schema::create('exam_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained()->cascadeOnDelete();
            $table->string('term', 32)->nullable();
            $table->string('title');
            $table->string('title_ar')->nullable();
            $table->date('starts_on');
            $table->date('ends_on');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('published_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('published_at')->nullable();
            $table->unsignedInteger('lock_version')->default(0);
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['organization_id', 'school_id', 'academic_year_id', 'title'], 'exam_schedule_scope_unique');
        });

        // One paper per section + subject inside an exam period.
        Schema::create('exam_papers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_schedule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->date('exam_date');
            $table->time('starts_at');
            $table->time('ends_at');
            $table->string('room', 64)->nullable();
            $table->decimal('max_score', 8, 2)->nullable();
            $table->text('instructions')->nullable();
            $table->uuid('batch_uuid')->nullable();
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['exam_schedule_id', 'section_id', 'subject_id'], 'exam_paper_scope_unique');
            $table->index(['exam_schedule_id', 'exam_date'], 'exam_paper_date_index');
            $table->index(['exam_schedule_id', 'section_id', 'exam_date'], 'exam_paper_section_date_index');
        });

        Schema::create('exam_paper_invigilators', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('exam_paper_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->enum('role', ['invigilator', 'head'])->default('invigilator');
            $table->timestamps();

            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])
                ->on('schools')
                ->cascadeOnDelete();

            $table->unique(['exam_paper_id', 'teacher_id'], 'exam_invigilator_scope_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_paper_invigilators');
        Schema::dropIfExists('exam_papers');
        Schema::dropIfExists('exam_schedules');
    }
};
