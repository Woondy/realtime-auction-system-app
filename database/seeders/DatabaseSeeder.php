<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
            ]
        );

        $products = [
            [
                'name' => 'Vintage Rolex Submariner 16610',
                'description' => 'A classic stainless steel dive watch from 2005. Features a black dial, unidirectional bezel, and automatic movement. Complete with original box and papers.',
                'starting_price' => 45000.00,
            ],
            [
                'name' => 'Hermès Birkin 30 Togo Leather',
                'description' => 'Iconic Birkin 30 in Etoupe Togo leather with palladium hardware. Excellent condition with original dust bag and lock set.',
                'starting_price' => 88000.00,
            ],
            [
                'name' => 'Leica M6 TTL 0.85 Black Paint',
                'description' => 'Mint condition Leica M6 TTL with 0.85x viewfinder. Rare black paint finish. Includes original box and matching 50mm Summicron lens.',
                'starting_price' => 22000.00,
            ],
            [
                'name' => 'Gibson Les Paul Standard 1959 Reissue',
                'description' => 'Custom Shop 1959 Reissue in Iced Tea Burst. Flamed maple top, mahogany body. Includes original hardshell case and certificate.',
                'starting_price' => 35000.00,
            ],
            [
                'name' => 'Patek Philippe Calatrava 5196J',
                'description' => 'Elegant 18K yellow gold dress watch with cream dial. Manual winding movement, sapphire caseback. Full set from authorized dealer.',
                'starting_price' => 95000.00,
            ],
            [
                'name' => 'KAWS "Companion" 2011 Original Fake',
                'description' => 'Original 2011 KAWS Companion figure in brown. 11 inches tall. Excellent condition with original packaging and holographic authentication.',
                'starting_price' => 12000.00,
            ],
            [
                'name' => 'Banksy "Girl with Balloon" Signed Print',
                'description' => 'Mint condition signed Banksy screen print from the 2004 edition of 150. Professionally framed with UV-protective glass.',
                'starting_price' => 75000.00,
            ],
            [
                'name' => 'Porsche Design P\'6520 Dashboard Clock',
                'description' => 'Rare 1970s Porsche Design dashboard clock by Orfina. Iconic black PVD-coated case with Valjoux movement. Fully serviced.',
                'starting_price' => 8000.00,
            ],
            [
                'name' => 'Nike Air Mag 2016 Auto-Lacing',
                'description' => 'Deadstock Nike Air Mag from the 2016 release. Self-lacing technology, LED panels. Never worn, includes original box and charger.',
                'starting_price' => 25000.00,
            ],
            [
                'name' => 'Hasselblad 500C/M Medium Format Kit',
                'description' => 'Complete Hasselblad 500C/M kit with 80mm f/2.8 Planar lens, A12 film back, waist-level finder. Recently CLA\'d, film tested.',
                'starting_price' => 15000.00,
            ],
        ];

        foreach ($products as $product) {
            Product::firstOrCreate(
                ['name' => $product['name']],
                array_merge($product, ['status' => 'pending']),
            );
        }
    }
}
