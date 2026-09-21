<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $previous = App::getLocale();
        $locale = $this->resolveLocale($request);
        $direction = config("localization.supported.{$locale}.direction", 'ltr');

        App::setLocale($locale);
        View::share('locale', $locale);
        View::share('direction', $direction);

        try {
            return $next($request);
        } finally {
            App::setLocale($previous);
        }
    }

    private function resolveLocale(Request $request): string
    {
        /** @var array<string, array<string, string>> $supported */
        $supported = config('localization.supported', []);
        $fallback = config('localization.default', config('app.fallback_locale', 'en'));
        $candidates = [
            $request->cookie('locale'),
            $request->query('locale'),
            $request->getPreferredLanguage(array_keys($supported)),
            $fallback,
        ];

        foreach ($candidates as $candidate) {
            $candidate = is_string($candidate) ? strtolower(str_replace('_', '-', $candidate)) : null;
            $base = $candidate ? explode('-', $candidate)[0] : null;

            if ($base !== null && array_key_exists($base, $supported)) {
                return $base;
            }
        }

        return array_key_first($supported) ?: 'en';
    }
}
