<?php

return [
    'delivery_failure_threshold' => (int) env('NOTIFICATION_DELIVERY_FAILURE_THRESHOLD', 10),
    'delivery_queue_threshold' => (int) env('NOTIFICATION_DELIVERY_QUEUE_THRESHOLD', 50),
    'queue_worker_stale_minutes' => (int) env('QUEUE_WORKER_STALE_MINUTES', 10),
    'queue_backlog_threshold' => (int) env('QUEUE_BACKLOG_THRESHOLD', 100),
    'queue_failed_threshold' => (int) env('QUEUE_FAILED_THRESHOLD', 10),
];
