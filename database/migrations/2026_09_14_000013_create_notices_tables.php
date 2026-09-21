<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notices', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'id']);
            $table->index(['school_id', 'status', 'published_at']);
            $table->foreign(['organization_id', 'school_id'])->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
        });

        Schema::create('notice_student', function (Blueprint $table): void {
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('notice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->primary(['notice_id', 'student_id']);
            $table->foreign(['organization_id', 'notice_id'])->references(['organization_id', 'id'])->on('notices')->cascadeOnDelete();
            $table->foreign(['organization_id', 'student_id'])->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notice_student');
        Schema::dropIfExists('notices');
    }
};
