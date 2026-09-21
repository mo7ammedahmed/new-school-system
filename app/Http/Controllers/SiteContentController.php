<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteContentController
{
    /** @var array<string, string> */
    private const PAGES = [
        'home' => 'Home',
        'about' => 'About',
        'features' => 'Features',
        'pricing' => 'Pricing',
        'faq' => 'FAQ',
        'security' => 'Security',
        'privacy' => 'Privacy',
        'terms' => 'Terms',
        'contact' => 'Contact',
    ];

    public function index(Request $request): Response
    {
        $this->authorizeManager($request);

        $contents = SiteContent::query()
            ->orderBy('page')
            ->orderBy('locale')
            ->get()
            ->map(fn (SiteContent $content): array => [
                'id' => $content->id,
                'page' => $content->page,
                'pageLabel' => self::PAGES[$content->page] ?? $content->page,
                'locale' => $content->locale,
                'content' => $content->content,
                'seoTitle' => $content->seo_title,
                'seoDescription' => $content->seo_description,
                'status' => $content->status,
                'publishedAt' => $content->published_at?->toISOString(),
            ]);

        return Inertia::render('admin/site-content/index', [
            'pages' => collect(self::PAGES)->map(fn (string $label, string $page): array => [
                'key' => $page,
                'label' => $label,
            ])->values(),
            'contents' => $contents,
        ]);
    }

    public function upsert(Request $request, AuditLogger $audit): RedirectResponse
    {
        $this->authorizeManager($request);
        $data = $request->validate([
            'page' => ['required', 'string', 'in:'.implode(',', array_keys(self::PAGES))],
            'locale' => ['required', 'string', 'in:ar,en'],
            'content' => ['required', 'array'],
            'content.*' => ['nullable', 'string'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', 'in:draft,published'],
        ]);

        $content = SiteContent::query()->firstOrNew([
            'page' => $data['page'],
            'locale' => $data['locale'],
        ]);
        $before = $content->exists ? $content->only(['content', 'seo_title', 'seo_description', 'status', 'published_at']) : null;
        $content->fill($data);
        $content->published_at = $data['status'] === 'published' ? ($content->published_at ?? now()) : null;
        $content->save();

        $audit->record(
            $before === null ? 'site-content.created' : 'site-content.updated',
            $content,
            before: $before,
            after: $content->only(['page', 'locale', 'content', 'seo_title', 'seo_description', 'status', 'published_at']),
        );

        return to_route('admin.site-content.index');
    }

    private function authorizeManager(Request $request): void
    {
        abort_unless(
            $request->user()?->isPlatformOperator(),
            403,
        );
    }
}
