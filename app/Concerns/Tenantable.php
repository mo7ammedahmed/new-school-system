<?php

namespace App\Concerns;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\App;

/**
 * Applies the active organization scope to tenant-owned models.
 */
trait Tenantable
{
    public static function bootTenantable(): void
    {
        static::addGlobalScope('organization', function (Builder $builder): void {
            if (! App::bound('currentOrganization')) {
                return;
            }

            $organization = App::make('currentOrganization');

            if ($organization instanceof Organization && $organization->exists) {
                $builder->where(
                    $builder->getModel()->qualifyColumn('organization_id'),
                    $organization->getKey(),
                );
            }
        });
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeForOrganization(Builder $query, Organization|int $organization): Builder
    {
        return $query->withoutGlobalScope('organization')->where(
            $this->qualifyColumn('organization_id'),
            $organization instanceof Organization ? $organization->getKey() : $organization,
        );
    }
}
