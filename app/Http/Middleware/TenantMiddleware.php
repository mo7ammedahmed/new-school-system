<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    /**
     * Resolve the authenticated user's organization for this request.
     *
     * The binding is deliberately cleared in finally so Octane, queue-like
     * workers, and test processes cannot retain one request's tenant context.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        $organization = $user?->organization;

        if ($user !== null && ! $user->isPlatformOperator() && $organization === null) {
            abort(403);
        }

        app()->instance('currentOrganization', $organization);
        View::share('currentOrganization', $organization);

        try {
            return $next($request);
        } finally {
            app()->forgetInstance('currentOrganization');
        }
    }
}
