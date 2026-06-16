<?php

namespace Database\Factories;

use App\Models\Bid;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bid>
 */
class BidFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => \App\Models\Product::factory(),
            'bidder_name' => fake()->firstName(),
            'amount' => fake()->randomFloat(2, 10, 10000),
        ];
    }
}
