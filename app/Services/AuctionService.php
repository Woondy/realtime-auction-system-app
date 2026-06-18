<?php

declare(strict_types=1);

namespace App\Services;

use App\Events\AuctionEnded;
use App\Events\AuctionStarted;
use App\Events\BidPlaced;
use App\Jobs\EndAuction;
use App\Models\Bid;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

readonly class AuctionService
{
    private const AUCTION_DURATION_SECONDS = 60;

    /**
     * Place a bid on a product with pessimistic locking to serialize concurrent bids.
     *
     * @param  Product  $product  The product being bid on
     * @param  string  $bidderName  The name of the bidder
     * @param  string  $amount  The bid amount (as string to preserve precision)
     * @return Bid The created bid
     *
     * @throws ValidationException When the auction has ended or the bid is too low
     */
    public function placeBid(Product $product, string $bidderName, string $amount): Bid
    {
        // Ensure $amount is a numeric string for bcmath operations
        if (! is_numeric($amount)) {
            throw ValidationException::withMessages([
                'amount' => 'The amount must be a valid number.',
            ]);
        }
        if ($product->status === 'ended') {
            throw ValidationException::withMessages([
                'amount' => 'This auction has already ended.',
            ]);
        }

        $wasPending = $product->status === 'pending';

        $bid = DB::transaction(function () use ($product, $bidderName, $amount) {
            // Lock all bids for this product to serialize concurrent bid placement
            $maxBid = (string) (Bid::where('product_id', $product->id)
                ->lockForUpdate()
                ->max('amount') ?? $product->starting_price);

            if (! is_numeric($maxBid) || bccomp($amount, $maxBid, 2) <= 0) {
                throw ValidationException::withMessages([
                    'amount' => 'A higher bid already exists. Current highest: $'.number_format((float) $maxBid, 2),
                ]);
            }

            $bid = Bid::create([
                'product_id' => $product->id,
                'bidder_name' => $bidderName,
                'amount' => $amount,
            ]);

            // First bid → start auction
            if ($product->status === 'pending') {
                $endsAt = now()->addSeconds(self::AUCTION_DURATION_SECONDS);

                $product->update([
                    'status' => 'active',
                    'ends_at' => $endsAt,
                ]);

                // Calculate delay from ends_at to avoid hardcoding
                EndAuction::dispatch($product)->delay($endsAt);
            }

            return $bid;
        });

        // Broadcast events after transaction commits
        if ($wasPending) {
            AuctionStarted::dispatch($product);
        }

        BidPlaced::dispatch($bid);

        return $bid;
    }

    /**
     * End the auction using optimistic locking to prevent duplicate execution.
     * Returns true if this call actually ended the auction, false if already ended.
     */
    public function endAuction(Product $product): bool
    {
        // Optimistic lock: only update if still active
        $updated = Product::where('id', $product->id)
            ->where('status', 'active')
            ->update(['status' => 'ended']);

        if ($updated === 0) {
            // Already ended by another job or manual intervention
            return false;
        }

        $winner = Bid::where('product_id', $product->id)
            ->orderByDesc('amount')
            ->first();

        $product->refresh();

        AuctionEnded::dispatch($product, $winner);

        return true;
    }
}
