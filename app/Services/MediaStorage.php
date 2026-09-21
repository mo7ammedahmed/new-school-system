<?php

namespace App\Services;

use App\Models\Media;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class MediaStorage
{
    public function store(
        UploadedFile $file,
        Organization $organization,
        ?User $uploader = null,
        string $directory = 'uploads',
        string $disk = 'local',
    ): Media {
        if (! $organization->exists) {
            throw new InvalidArgumentException('A persisted organization is required.');
        }

        if ($uploader !== null && $uploader->organization_id !== $organization->getKey()) {
            throw new InvalidArgumentException('The uploader must belong to the media organization.');
        }

        $path = $file->store($organization->getKey().'/'.$directory, $disk);

        return Media::create([
            'organization_id' => $organization->getKey(),
            'uploaded_by' => $uploader?->getKey(),
            'disk' => $disk,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }

    public function delete(Media $media): void
    {
        Storage::disk($media->disk)->delete($media->path);
        $media->delete();
    }
}
