<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->decimal('score', 8, 2);
            $table->decimal('max_score', 8, 2);
            $table->date('assessed_on');
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->index(['school_id', 'section_id', 'assessed_on']);
            $table->unique(['organization_id', 'section_id', 'student_id', 'title', 'assessed_on'], 'assessment_scope_unique');
            $table->unique(['organization_id', 'id']);
            $table->foreign(['organization_id', 'section_id'])->references(['organization_id', 'id'])->on('sections')->cascadeOnDelete();
            $table->foreign(['organization_id', 'student_id'])->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
