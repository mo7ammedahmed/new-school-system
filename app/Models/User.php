<?php

namespace App\Models;

use App\Enums\UserRole;
use Carbon\CarbonImmutable;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property int|null $organization_id
 * @property CarbonImmutable|null $email_verified_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    protected $attributes = [
        'role' => UserRole::Guardian->value,
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            /* @chisel-2fa */
            'two_factor_confirmed_at' => 'datetime',
            /* @end-chisel-2fa */
        ];
    }

    /**
     * @return BelongsTo<Organization, $this>
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * @return HasOne<Guardian, $this>
     */
    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    /**
     * @return BelongsToMany<Section, $this>
     */
    public function assignedSections(): BelongsToMany
    {
        return $this->belongsToMany(Section::class, 'teacher_assignments', 'teacher_id', 'section_id')
            ->withPivot(['organization_id', 'school_id'])->withTimestamps();
    }

    /**
     * @return HasMany<SchoolMembership, $this>
     */
    public function schoolMemberships(): HasMany
    {
        return $this->hasMany(SchoolMembership::class);
    }

    public function belongsToSchool(School $school): bool
    {
        return $this->schoolMemberships()
            ->where('school_id', $school->id)
            ->where('organization_id', $school->organization_id)
            ->exists();
    }

    /**
     * Schools this user may work in.
     *
     * Platform operators see every school, organization admins see their
     * organization, staff with explicit memberships see those schools, and
     * everyone else falls back to their organization's schools.
     *
     * @return EloquentCollection<int, School>
     */
    public function accessibleSchools(): EloquentCollection
    {
        if ($this->organization_id === null && ! $this->isPlatformOperator()) {
            return new EloquentCollection;
        }

        if ($this->isPlatformOperator()) {
            return School::query()->orderBy('name')->limit(25)->get();
        }

        $membershipSchoolIds = $this->schoolMemberships()->pluck('school_id')->all();

        if ($membershipSchoolIds !== []) {
            return School::query()->whereIn('id', $membershipSchoolIds)->orderBy('name')->get();
        }

        return School::query()
            ->where('organization_id', $this->organization_id)
            ->orderBy('name')
            ->get();
    }

    public function hasRole(UserRole|string ...$roles): bool
    {
        $current = $this->role->value;

        return collect($roles)->contains(
            static fn (UserRole|string $role): bool => $current === ($role instanceof UserRole ? $role->value : $role),
        );
    }

    public function isPlatformOperator(): bool
    {
        return $this->hasRole(UserRole::PlatformSuperAdmin);
    }

    public function belongsToOrganization(?Organization $organization): bool
    {
        return $organization !== null && $this->organization_id === $organization->getKey();
    }
}
