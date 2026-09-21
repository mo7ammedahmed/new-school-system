<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Throwable;

class HealthController
{
    public function __invoke(): JsonResponse
    {
        $checks = [
            'database' => $this->database(),
            'storage' => $this->storage(),
            'queue' => $this->queue(),
        ];
        $healthy = collect($checks)->every(fn (array $check): bool => $check['status'] === 'ok');

        return response()->json([
            'status' => $healthy ? 'ok' : 'degraded',
            'environment' => app()->environment(),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    /** @return array{status: string} */
    private function database(): array
    {
        try {
            DB::select('select 1');

            return ['status' => 'ok'];
        } catch (Throwable) {
            return ['status' => 'failed'];
        }
    }

    /** @return array{status: string} */
    private function storage(): array
    {
        $probe = 'health-checks/'.bin2hex(random_bytes(8)).'.probe';

        try {
            Storage::disk('local')->put($probe, 'ok');
            Storage::disk('local')->delete($probe);

            return ['status' => 'ok'];
        } catch (Throwable) {
            return ['status' => 'failed'];
        }
    }

    /** @return array{status: string, driver: string} */
    private function queue(): array
    {
        $driver = (string) config('queue.default');

        try {
            $ready = $driver !== 'database' || Schema::hasTable(config('queue.connections.database.table', 'jobs'));

            return ['status' => $ready ? 'ok' : 'failed', 'driver' => $driver];
        } catch (Throwable) {
            return ['status' => 'failed', 'driver' => $driver];
        }
    }
}
