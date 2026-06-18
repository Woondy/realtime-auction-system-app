<?php

namespace Database\Factories;

use App\Models\Bid;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Bid>
 */
class BidFactory extends Factory
{
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'bidder_name' => fake()->firstName(),
            'amount' => fake()->randomFloat(2, 10, 10000),
        ];
    }
}
