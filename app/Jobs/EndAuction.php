<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EndAuction implements ShouldQueue
{
    use Queueable;

    public function __construct(public Product $product) {}

    public function handle(AuctionService $auctionService): void
    {
        $auctionService->endAuction($this->product);
    }
}
