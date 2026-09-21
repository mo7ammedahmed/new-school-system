<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $worker_id
 * @property string $connection
 * @property string $queue
 * @property CarbonImmutable|null $last_seen_at
 * @property int $processed_jobs
 * @property int $failed_jobs
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class QueueWorkerHeartbeat extends Model
{
    protected $fillable = ['worker_id', 'connection', 'queue', 'last_seen_at', 'processed_jobs', 'failed_jobs'];

    protected $casts = ['last_seen_at' => 'datetime', 'processed_jobs' => 'integer', 'failed_jobs' => 'integer'];
}
