<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\Organization;
use App\Models\User;
use App\Services\MediaStorage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_media_is_stored_under_the_organization_and_has_a_signed_url(): void
    {
        Storage::fake('local');
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $user = User::factory()->create(['organization_id' => $organization->id]);

        $media = app(MediaStorage::class)->store(
            UploadedFile::fake()->create('prospectus.pdf', 20, 'application/pdf'),
            $organization,
            $user,
        );

        Storage::disk('local')->assertExists($media->path);
        $this->assertStringContainsString('/media/'.$media->id.'/download', $media->temporaryDownloadUrl());
        $this->assertSame($organization->id, $media->organization_id);
    }

    public function test_media_queries_cannot_cross_the_current_organization(): void
    {
        $first = Organization::create(['name' => 'First', 'slug' => 'first']);
        $second = Organization::create(['name' => 'Second', 'slug' => 'second']);
        $media = Media::create([
            'organization_id' => $second->id,
            'disk' => 'local',
            'path' => 'second/private.pdf',
            'original_name' => 'private.pdf',
        ]);

        app()->instance('currentOrganization', $first);

        $this->assertNull(Media::query()->find($media->id));
    }
}
