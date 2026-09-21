<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('student_number');
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->unique(['organization_id', 'student_number']);
            $table->unique(['organization_id', 'id']);
            $table->index(['school_id', 'status']);
            $table->foreign(['organization_id', 'school_id'])
                ->references(['organization_id', 'id'])->on('schools')->cascadeOnDelete();
        });

        Schema::create('guardians', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'email']);
            $table->unique(['organization_id', 'id']);
        });

        Schema::create('guardian_student', function (Blueprint $table): void {
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guardian_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('relationship')->default('guardian');
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->primary(['guardian_id', 'student_id']);
            $table->foreign(['organization_id', 'guardian_id'])
                ->references(['organization_id', 'id'])->on('guardians')->cascadeOnDelete();
            $table->foreign(['organization_id', 'student_id'])
                ->references(['organization_id', 'id'])->on('students')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guardian_student');
        Schema::dropIfExists('guardians');
        Schema::dropIfExists('students');
    }
};
