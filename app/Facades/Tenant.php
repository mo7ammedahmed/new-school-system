<?php

namespace App\Facades;

use App\Services\TenantService;
use Illuminate\Support\Facades\Facade;

/**
 * @see TenantService
 */
class Tenant extends Facade
{
    /**
     * Get the registered name of the component.
     */
    protected static function getFacadeAccessor(): string
    {
        return 'currentOrganization';
    }
}
