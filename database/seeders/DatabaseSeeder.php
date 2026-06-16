<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        Product::firstOrCreate(
            ['name' => 'Vintage Rolex Submariner 16610'],
            [
                'description' => 'A classic stainless steel dive watch from 2005. Features a black dial, unidirectional bezel, and automatic movement. Complete with original box and papers.',
                'image' => null,
                'starting_price' => 45000.00,
                'status' => 'pending',
            ]
        );
    }
}
