<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Page;
use Inertia\Inertia;
use Inertia\Response;

class PublicSchoolController
{
    public function show(Organization $organization, string $school, string $page = 'home'): Response
    {
        $schoolModel = $organization->schools()->where('slug', $school)->firstOrFail();
        $content = Page::query()
            ->where('school_id', $schoolModel->getKey())
            ->where('slug', $page)
            ->published()
            ->firstOrFail();

        return Inertia::render('public-school', [
            'school' => [
                'name' => $schoolModel->name,
                'slug' => $schoolModel->slug,
                'organizationSlug' => $organization->slug,
            ],
            'page' => [
                'slug' => $content->slug,
                'title' => $content->localizedTitle(),
                'body' => $content->localizedBody(),
            ],
        ]);
    }
}
