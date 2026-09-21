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
        Schema::table('guardians', function (Blueprint $table) {
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete()->after('organization_id');
            $table->string('address')->nullable()->after('phone');
            $table->string('occupation')->nullable()->after('address');
            $table->string('relationship')->nullable()->after('occupation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guardians', function (Blueprint $table) {
            $table->dropForeign(['school_id']);
            $table->dropColumn('school_id');
            $table->dropColumn('address');
            $table->dropColumn('occupation');
            $table->dropColumn('relationship');
        });
    }
};
