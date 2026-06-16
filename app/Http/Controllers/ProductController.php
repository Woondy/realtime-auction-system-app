<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        $products = Product::withCount('bids')->orderByDesc('created_at')->get();

        return Inertia::render('product/index', [
            'products' => $products,
        ]);
    }

    public function show(Product $product): Response
    {
        $product->load('bids');

        return Inertia::render('product/show', [
            'product' => $product,
            'highestBid' => $product->bids()->orderByDesc('amount')->first(),
        ]);
    }
}
