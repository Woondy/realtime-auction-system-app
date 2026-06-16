<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBidRequest;
use App\Jobs\EndAuction;
use App\Models\Bid;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class BidController extends Controller
{
    public function store(StoreBidRequest $request, Product $product): RedirectResponse
    {
        if ($product->status === 'ended') {
            throw ValidationException::withMessages([
                'amount' => 'This auction has already ended.',
            ]);
        }

        $bid = DB::transaction(function () use ($request, $product) {
            $maxBid = Bid::where('product_id', $product->id)
                ->lockForUpdate()
                ->max('amount') ?? $product->starting_price;

            if ((float) $request->amount <= (float) $maxBid) {
                throw ValidationException::withMessages([
                    'amount' => 'A higher bid already exists. Current highest: ¥' . number_format((float) $maxBid, 2),
                ]);
            }

            $bid = Bid::create([
                'product_id' => $product->id,
                'bidder_name' => $request->bidder_name,
                'amount' => $request->amount,
            ]);

            // First bid → start auction
            if ($product->status === 'pending') {
                $product->update([
                    'status' => 'active',
                    'ends_at' => now()->addSeconds(60),
                ]);

                EndAuction::dispatch($product)->delay(60);
            }

            return $bid;
        });

        return back();
    }
}
