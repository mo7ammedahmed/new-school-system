<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_structures', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('amount_minor');
            $table->char('currency', 3)->default('SAR');
            $table->string('frequency')->default('annual');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['organization_id', 'school_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_structures');
    }
};
