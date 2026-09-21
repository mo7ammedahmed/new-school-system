<?php

namespace App\Console\Commands;

use App\Models\QueueWorkerHeartbeat;
use Illuminate\Console\Command;

class RecordQueueWorkerHeartbeat extends Command
{
    protected $signature = 'queue:heartbeat {worker=default} {--connection=database} {--queue=default} {--processed=0} {--failed=0}';

    protected $description = 'Record the liveness counters of a queue worker';

    public function handle(): int
    {
        QueueWorkerHeartbeat::query()->updateOrCreate(
            ['worker_id' => $this->argument('worker'), 'connection' => $this->option('connection'), 'queue' => $this->option('queue')],
            ['last_seen_at' => now(), 'processed_jobs' => (int) $this->option('processed'), 'failed_jobs' => (int) $this->option('failed')],
        );
        $this->info('Queue worker heartbeat recorded.');

        return self::SUCCESS;
    }
}
