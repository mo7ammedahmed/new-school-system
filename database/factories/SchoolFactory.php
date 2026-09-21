<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<School>
 */
class SchoolFactory extends Factory
{
    public function definition(): array
    {
        return [
            'organization_id' => Organization::count() > 0
                ? Organization::inRandomOrder()->first()->id
                : Organization::factory(),
            'name' => fake()->company().' School',
            'slug' => fake()->unique()->slug(),
            'settings' => [],
        ];
    }
}
