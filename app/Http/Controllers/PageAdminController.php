<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\School;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PageAdminController
{
    public function index(Request $request, int $school): Response
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);

        return Inertia::render('admin/pages/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'pages' => $schoolModel->pages()->latest()->get()->map(fn (Page $page): array => [
                'id' => $page->id,
                'slug' => $page->slug,
                'title' => $page->title,
                'status' => $page->status,
                'publishedAt' => $page->published_at?->toISOString(),
            ]),
        ]);
    }

    public function store(Request $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);
        $data = $this->validated($request);
        $page = $schoolModel->pages()->create([
            ...$data,
            'organization_id' => $schoolModel->organization_id,
            'status' => 'draft',
        ]);

        $audit->record('page.created', $page, after: $page->only(['slug', 'title', 'body', 'status']));

        return to_route('admin.pages.index', $schoolModel->id);
    }

    public function update(Request $request, int $school, int $page, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);
        $content = $schoolModel->pages()->findOrFail($page);
        $before = $content->only(['slug', 'title', 'body', 'status', 'published_at']);
        $content->update($this->validated($request));

        $audit->record('page.updated', $content, before: $before, after: $content->fresh()->only(['slug', 'title', 'body', 'status', 'published_at']));

        return to_route('admin.pages.index', $schoolModel->id);
    }

    public function publish(int $school, int $page, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = School::query()->findOrFail($school);
        Gate::authorize('manage-content', $schoolModel);
        $content = $schoolModel->pages()->findOrFail($page);
        $before = $content->only(['status', 'published_at']);
        $content->update(['status' => 'published', 'published_at' => now()]);

        $audit->record('page.published', $content, before: $before, after: $content->fresh()->only(['status', 'published_at']));

        return to_route('admin.pages.index', $schoolModel->id);
    }

    /** @return array{slug: string, title: array<string, string>, body: array<string, string>} */
    private function validated(Request $request): array
    {
        return $request->validate([
            'slug' => ['required', 'string', 'alpha_dash', 'max:120'],
            'title' => ['required', 'array', 'min:1'],
            'title.en' => ['nullable', 'string', 'max:255'],
            'title.ar' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'array', 'min:1'],
            'body.en' => ['nullable', 'string'],
            'body.ar' => ['nullable', 'string'],
        ]);
    }
}
