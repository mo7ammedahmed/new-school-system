<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;

/**
 * Platform-wide preferences, one JSON value per key.
 *
 * Rows exist only for values somebody actually changed, so an empty table
 * means "the bundle defaults" everywhere — the same rule the per-school
 * palette follows.
 *
 * @property int $id
 * @property string $key
 * @property array<string, mixed>|null $value
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public static function read(string $key, array $default = []): array
    {
        $row = static::query()->where('key', $key)->first();
        $value = $row?->value;

        return is_array($value) ? $value : $default;
    }

    /**
     * @param  array<string, mixed>  $value
     */
    public static function write(string $key, array $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function forget(string $key): void
    {
        static::query()->where('key', $key)->delete();
    }
}
