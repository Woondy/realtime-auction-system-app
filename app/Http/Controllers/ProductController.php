<?php

declare(strict_types=1);

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
        // Eager-load only the top 20 bids (avoids loading thousands of rows)
        // and reuse the collection to find the highest bid (no extra query)
        $product->load([
            'bids' => fn ($query) => $query->orderByDesc('amount')->limit(20),
        ]);

        return Inertia::render('product/show', [
            'product' => $product,
            'highestBid' => $product->bids->first(),
        ]);
    }
}
