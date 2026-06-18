<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreBidRequest;
use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Http\RedirectResponse;

class BidController extends Controller
{
    public function __construct(
        private readonly AuctionService $auctionService,
    ) {}

    public function store(StoreBidRequest $request, Product $product): RedirectResponse
    {
        $bid = $this->auctionService->placeBid(
            product: $product,
            bidderName: $request->bidder_name,
            amount: (string) $request->amount,
        );

        return back()->with('success', 'Bid placed successfully! $'.number_format((float) $bid->amount, 2));
    }
}
