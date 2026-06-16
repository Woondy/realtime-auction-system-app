<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product): Response
    {
        $product->load('bids');

        return Inertia::render('product/show', [
            'product' => $product,
            'highestBid' => $product->bids()->orderByDesc('amount')->first(),
        ]);
    }
}
