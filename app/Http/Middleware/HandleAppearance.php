<?php

namespace App\Http\Middleware;

use App\Support\Theme\ThemePalette;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class HandleAppearance
{
    public function __construct(private readonly ThemePalette $theme) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        View::share('appearance', $request->cookie('appearance') ?? 'system');

        // The palette is resolved server-side so the first paint is already
        // re-skinned: a client-side apply would flash the bundle colours on
        // every navigation.
        View::share('themeCss', $this->theme->css($this->theme->forRequest($request)));

        return $next($request);
    }
}
