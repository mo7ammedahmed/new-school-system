<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained();
            $table->foreignId('school_id')->constrained();
            $table->foreignId('installment_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('received_by')->nullable()->constrained('users'); // User who recorded the payment
            $table->string('payment_method')->nullable(); // cash, bank_transfer, credit_card, etc.
            $table->string('reference_number')->nullable(); // Check number, transaction ID, etc.
            $table->date('payment_date');
            $table->integer('amount_minor'); // Amount in smallest currency unit (cents)
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->timestamps();
            $table->softDeletes();

            // A payment settles either an installment or a whole invoice, never
            // both. That rule lives in PaymentRequest: a DB-level CHECK is not
            // portable across the drivers this app runs on.
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
