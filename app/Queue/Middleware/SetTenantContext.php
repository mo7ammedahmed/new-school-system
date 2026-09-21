<?php

namespace App\Queue\Middleware;

use App\Models\Organization;
use Closure;
use Illuminate\Support\Facades\App;
use LogicException;

class SetTenantContext
{
    public function __construct(private readonly int $organizationId) {}

    public function handle(object $job, Closure $next): void
    {
        $organization = Organization::query()->find($this->organizationId);

        if ($organization === null) {
            throw new LogicException("Tenant organization [{$this->organizationId}] no longer exists.");
        }

        app()->instance('currentOrganization', $organization);

        try {
            $next($job);
        } finally {
            App::forgetInstance('currentOrganization');
        }
    }
}
