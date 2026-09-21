<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class CheckReleaseReadiness extends Command
{
    protected $signature = 'app:release-check {--strict : Treat non-critical warnings as failures}';

    protected $description = 'Validate production configuration and release prerequisites';

    public function handle(): int
    {
        $failures = 0;
        $warnings = 0;

        $stripeSecret = (string) config('services.stripe.secret');
        $stripeWebhookSecret = (string) config('services.stripe.webhook_secret');
        $paymentsEnabled = (bool) config('services.payments.enabled', false);

        $checks = [
            ['APP_ENV is production', app()->environment('production'), true],
            ['APP_DEBUG is disabled', ! (bool) config('app.debug'), true],
            ['APP_KEY is configured', (string) config('app.key') !== '', true],
            ['APP_URL is HTTPS', str_starts_with((string) config('app.url'), 'https://'), false],
            ['Queue is asynchronous', ! in_array((string) config('queue.default'), ['sync', 'null'], true), true],
            ['Mail transport is configured', ! in_array((string) config('mail.default'), ['log', 'array'], true), false],
            ['Stripe secrets are paired', ($stripeSecret === '') === ($stripeWebhookSecret === ''), true],
            ['Stripe secrets are set when payments enabled', ! $paymentsEnabled || ($stripeSecret !== '' && $stripeWebhookSecret !== ''), true],
            ['Audit table exists', Schema::hasTable('audit_logs'), true],
            ['Queue jobs table exists', Schema::hasTable('jobs'), true],
            ['Failed jobs table exists', Schema::hasTable('failed_jobs'), true],
            ['Notification delivery table exists', Schema::hasTable('notification_deliveries'), true],
            ['Worker heartbeat table exists', Schema::hasTable('queue_worker_heartbeats'), true],
        ];

        foreach ($checks as [$label, $passed, $critical]) {
            if ($passed) {
                $this->line("<fg=green>PASS</> {$label}");

                continue;
            }
            $critical = $critical || $this->option('strict');
            $critical ? $failures++ : $warnings++;
            $this->line(($critical ? '<fg=red>FAIL</>' : '<fg=yellow>WARN</>')." {$label}");
        }

        try {
            DB::select('select 1');
            $this->line('<fg=green>PASS</> Database connection');
        } catch (\Throwable $exception) {
            $failures++;
            $this->line('<fg=red>FAIL</> Database connection: '.str($exception->getMessage())->limit(160));
        }

        $this->newLine();
        $this->info("Release check complete: {$failures} failure(s), {$warnings} warning(s).");

        return $failures === 0 ? self::SUCCESS : self::FAILURE;
    }
}
