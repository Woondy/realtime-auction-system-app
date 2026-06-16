<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'starting_price' => fake()->randomFloat(2, 10, 10000),
            'status' => 'pending',
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending', 'ends_at' => null]);
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => 'active',
            'ends_at' => now()->addSeconds(60),
        ]);
    }

    public function ended(): static
    {
        return $this->state(fn () => ['status' => 'ended', 'ends_at' => now()->subSeconds(10)]);
    }
}
