<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    use RefreshDatabase;

    public function test_readiness_endpoint_reports_dependency_status_without_secrets(): void
    {
        Storage::fake('local');

        $response = $this->getJson(route('health.ready'));

        $response->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('checks.database.status', 'ok')
            ->assertJsonPath('checks.storage.status', 'ok')
            ->assertJsonStructure(['status', 'environment', 'checks' => ['database', 'storage', 'queue']]);
    }
}
