<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Page;
use App\Models\School;
use Inertia\Inertia;
use Inertia\Response;

class PublicSchoolController
{
    public function show(Organization $organization, School $school, string $page = 'home'): Response
    {
        $pages = Page::query()
            ->where('school_id', $school->getKey())
            ->where('slug', $page);
        $content = (clone $pages)->published()->first();

        // A page that was written but not published stays private, and a named
        // page that was never written does not exist. The school's own home page
        // differs: it is reachable from day one, and says so until an admin
        // publishes content for it.
        abort_if(
            $content === null && ($page !== 'home' || (clone $pages)->exists()),
            404,
        );

        return Inertia::render('public-school', [
            'school' => [
                'name' => $school->name,
                'slug' => $school->slug,
                'organizationSlug' => $organization->slug,
            ],
            'page' => [
                'slug' => $content->slug ?? $page,
                'title' => $content?->localizedTitle(),
                'body' => $content?->localizedBody(),
            ],
        ]);
    }
}
