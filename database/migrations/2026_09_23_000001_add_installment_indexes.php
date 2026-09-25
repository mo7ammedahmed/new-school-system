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
        // Index for installments: school_id, paid_minor, amount_minor for outstanding balances queries
        Schema::table('installments', function (Blueprint $table) {
            $table->index(['school_id', 'paid_minor', 'amount_minor'], 'installments_school_paid_amount_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('installments', function (Blueprint $table) {
            $table->dropIndex('installments_school_paid_amount_index');
        });
    }
};
