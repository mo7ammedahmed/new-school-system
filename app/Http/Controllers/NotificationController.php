<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\NotificationPreference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController
{
    public function index(): Response
    {
        $items = Notification::query()->where('user_id', Auth::id())->latest()->limit(50)->get();
        $preferences = NotificationPreference::query()->where('user_id', Auth::id())->get()->mapWithKeys(fn ($preference): array => [$preference->category => ['locale' => $preference->locale, 'enabled' => $preference->enabled, 'email_enabled' => $preference->email_enabled ?? true]]);

        return Inertia::render('notifications/index', ['notifications' => $items, 'preferences' => $preferences]);
    }

    public function read(Request $request, int $notification): RedirectResponse
    {
        Notification::query()->where('user_id', $request->user()->id)->findOrFail($notification)->update(['read_at' => now()]);

        return back();
    }

    public function updatePreference(Request $request, string $category): RedirectResponse
    {
        abort_unless(in_array($category, ['installment', 'payment', 'notice', 'assessment', 'report-card'], true), 404);
        $data = $request->validate(['locale' => ['required', 'in:en,ar'], 'enabled' => ['required', 'boolean'], 'email_enabled' => ['required', 'boolean']]);
        NotificationPreference::query()->updateOrCreate(['organization_id' => $request->user()->organization_id, 'user_id' => $request->user()->id, 'category' => $category], $data);

        return back()->with('success', 'Notification preference updated.');
    }
}
