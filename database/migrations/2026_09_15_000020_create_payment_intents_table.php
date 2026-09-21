<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_intents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('installment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->default('stripe');
            $table->string('provider_intent_id')->nullable();
            $table->string('idempotency_key');
            $table->unsignedBigInteger('amount_minor');
            $table->char('currency', 3)->default('SAR');
            $table->string('status')->default('created');
            $table->json('provider_payload')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'user_id', 'idempotency_key'], 'payment_idempotency_unique');
            $table->unique(['provider', 'provider_intent_id'], 'provider_intent_unique');
            $table->index(['organization_id', 'installment_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_intents');
    }
};
