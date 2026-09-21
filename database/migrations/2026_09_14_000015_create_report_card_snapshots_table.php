<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('report_card_snapshots', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('issued_by')->constrained('users')->cascadeOnDelete();
            $table->string('term');
            $table->json('enrollment')->nullable();
            $table->json('attendance');
            $table->json('assessments');
            $table->timestamp('issued_at');
            $table->timestamps();
            $table->unique(['organization_id', 'student_id', 'term']);
            $table->index(['school_id', 'issued_at']);
            $table->foreign(['organization_id', 'student_id'])->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_card_snapshots');
    }
};
