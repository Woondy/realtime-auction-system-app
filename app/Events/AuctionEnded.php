<?php

namespace App\Events;

use App\Models\Bid;
use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AuctionEnded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Product $product,
        public ?Bid $winner,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('auction.'.$this->product->id);
    }

    public function broadcastAs(): string
    {
        return 'AuctionEnded';
    }
}
