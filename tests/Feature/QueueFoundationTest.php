<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Queue\Middleware\SetTenantContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

class QueueFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_queue_middleware_restores_and_clears_tenant_context(): void
    {
        $organization = Organization::create(['name' => 'Org', 'slug' => 'org']);
        $middleware = new SetTenantContext($organization->id);
        $observedId = null;

        $middleware->handle(new \stdClass, function () use (&$observedId): void {
            $observedId = app('currentOrganization')->getKey();
        });

        $this->assertSame($organization->id, $observedId);
        $this->assertFalse(app()->bound('currentOrganization'));
    }

    public function test_queue_middleware_rejects_a_deleted_organization(): void
    {
        $middleware = new SetTenantContext(999999);

        $this->expectException(LogicException::class);
        $middleware->handle(new \stdClass, static function (): void {});
    }
}
