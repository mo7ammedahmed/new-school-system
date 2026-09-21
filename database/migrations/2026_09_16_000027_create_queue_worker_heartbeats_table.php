<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queue_worker_heartbeats', function (Blueprint $table): void {
            $table->id();
            $table->string('worker_id');
            $table->string('connection')->default('database');
            $table->string('queue')->default('default');
            $table->timestamp('last_seen_at');
            $table->unsignedInteger('processed_jobs')->default(0);
            $table->unsignedInteger('failed_jobs')->default(0);
            $table->timestamps();
            $table->unique(['worker_id', 'connection', 'queue']);
            $table->index('last_seen_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_worker_heartbeats');
    }
};
