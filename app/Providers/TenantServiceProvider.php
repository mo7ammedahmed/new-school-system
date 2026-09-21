<?php

namespace App\Providers;

use App\Http\Middleware\TenantMiddleware;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class TenantServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register tenant middleware to the web middleware group
        Route::middlewareGroup('web', array_merge(
            $this->getWebMiddleware(),
            [TenantMiddleware::class]
        ));

        // Also register to api group if needed for API tenancy
        Route::middlewareGroup('api', array_merge(
            $this->getApiMiddleware(),
            [TenantMiddleware::class]
        ));
    }

    /**
     * Get the default web middleware.
     *
     * @return list<class-string>
     */
    protected function getWebMiddleware(): array
    {
        return [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ShareErrorsFromSession::class,
            AuthenticatesRequests::class,
            SubstituteBindings::class,
        ];
    }

    /**
     * Get the default api middleware.
     *
     * @return list<class-string>
     */
    protected function getApiMiddleware(): array
    {
        return [
            ThrottleRequests::class,
        ];
    }
}
