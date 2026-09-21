<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;

class AuditLogger
{
    public function __construct(private readonly ?Request $request = null) {}

    /**
     * Record an immutable, tenant-aware audit event.
     *
     * Platform-level events may intentionally have a null organization_id.
     * Callers must provide the organization explicitly when no authenticated
     * actor exists, such as a controlled webhook or queue handler.
     *
     * @param  array<string, mixed>|null  $before
     * @param  array<string, mixed>|null  $after
     * @param  array<string, mixed>|null  $metadata
     */
    public function record(
        string $action,
        ?Model $subject = null,
        ?array $before = null,
        ?array $after = null,
        ?array $metadata = null,
        ?Organization $organization = null,
    ): AuditLog {
        $actor = Auth::user();
        $organization ??= $actor?->organization;

        if ($organization === null && App::bound('currentOrganization')) {
            $candidate = App::make('currentOrganization');
            $organization = $candidate instanceof Organization ? $candidate : null;
        }

        return AuditLog::create([
            'organization_id' => $organization?->getKey(),
            'user_id' => $actor?->getKey(),
            'action' => $action,
            'auditable_type' => $subject?->getMorphClass(),
            'auditable_id' => $subject?->getKey(),
            'before' => $before,
            'after' => $after,
            'metadata' => $metadata,
            'ip_address' => $this->request?->ip(),
            'user_agent' => $this->request?->userAgent(),
        ]);
    }
}
