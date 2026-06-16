<?php

namespace App\Jobs;

use App\Events\AuctionEnded;
use App\Models\Bid;
use App\Models\Product;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EndAuction implements ShouldQueue
{
    use Queueable;

    public function __construct(public Product $product)
    {
    }

    public function handle(): void
    {
        if ($this->product->status !== 'active') {
            return;
        }

        $this->product->update(['status' => 'ended']);

        $winner = Bid::where('product_id', $this->product->id)
            ->orderByDesc('amount')
            ->first();

        AuctionEnded::dispatch($this->product, $winner);
    }
}
