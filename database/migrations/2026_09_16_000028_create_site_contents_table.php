<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_contents', function (Blueprint $table): void {
            $table->id();
            $table->string('page', 80);
            $table->string('locale', 5);
            $table->json('content');
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('status')->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['page', 'locale'], 'site_content_page_locale_unique');
            $table->index(['page', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
