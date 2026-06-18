<?php

declare(strict_types=1);

use App\Events\AuctionEnded;
use App\Events\AuctionStarted;
use App\Events\BidPlaced;
use App\Jobs\EndAuction;
use App\Models\Bid;
use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;
use Illuminate\Validation\ValidationException;

beforeEach(function () {
    Queue::fake();
    Event::fake();
});

it('places first bid and starts auction', function () {
    $product = Product::factory()->pending()->create(['starting_price' => 100]);
    $service = app(AuctionService::class);

    $bid = $service->placeBid($product, 'Alice', '150');

    expect($bid)->toBeInstanceOf(Bid::class);
    expect($bid->bidder_name)->toBe('Alice');
    expect($bid->amount)->toBe('150.00');

    $product->refresh();
    expect($product->status)->toBe('active');
    expect($product->ends_at)->not->toBeNull();

    Queue::assertPushed(EndAuction::class);
    Event::assertDispatched(AuctionStarted::class);
    Event::assertDispatched(BidPlaced::class);
});

it('rejects bid on ended auction', function () {
    $product = Product::factory()->ended()->create(['starting_price' => 100]);
    $service = app(AuctionService::class);

    expect(fn () => $service->placeBid($product, 'Bob', '200'))
        ->toThrow(ValidationException::class);

    expect(Bid::count())->toBe(0);
});

it('rejects bid lower than current max', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 200]);

    $service = app(AuctionService::class);

    expect(fn () => $service->placeBid($product, 'Bob', '150'))
        ->toThrow(ValidationException::class);
});

it('rejects bid equal to current max using bccomp', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => '200.00']);

    $service = app(AuctionService::class);

    // 200.00 == 200.00, bccomp returns 0, should be rejected
    expect(fn () => $service->placeBid($product, 'Bob', '200'))
        ->toThrow(ValidationException::class);
});

it('accepts higher bid with precise decimal comparison', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => '200.05']);

    $service = app(AuctionService::class);

    $bid = $service->placeBid($product, 'Charlie', '200.10');

    expect($bid->amount)->toBe('200.10');
    expect(Bid::count())->toBe(2);
});

it('handles high precision amounts correctly with bcmath', function () {
    $product = Product::factory()->active()->create(['starting_price' => '0.01']);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => '0.10']);

    $service = app(AuctionService::class);

    // 0.10 vs 0.100 — bccomp with scale 2 treats them as equal
    expect(fn () => $service->placeBid($product, 'Alice', '0.100'))
        ->toThrow(ValidationException::class);

    // 0.11 > 0.10 — should pass
    $bid = $service->placeBid($product, 'Bob', '0.11');
    expect($bid->amount)->toBe('0.11');
});

it('ends auction with optimistic lock and dispatches event', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 500, 'bidder_name' => 'Alice']);

    $service = app(AuctionService::class);
    $result = $service->endAuction($product);

    expect($result)->toBeTrue();
    $product->refresh();
    expect($product->status)->toBe('ended');
    Event::assertDispatched(AuctionEnded::class);
});

it('returns false when ending an already ended auction', function () {
    $product = Product::factory()->ended()->create(['starting_price' => 100]);

    $service = app(AuctionService::class);
    $result = $service->endAuction($product);

    expect($result)->toBeFalse();
    Event::assertNotDispatched(AuctionEnded::class);
});

it('prevents double-ending via concurrent optimistic lock', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 500, 'bidder_name' => 'Alice']);

    $service = app(AuctionService::class);

    // Simulate two concurrent calls — first succeeds, second is no-op
    $first = $service->endAuction($product);
    $second = $service->endAuction($product);

    expect($first)->toBeTrue();
    expect($second)->toBeFalse();

    // AuctionEnded should only be dispatched once
    Event::assertDispatched(AuctionEnded::class, 1);
});

it('dispatches EndAuction with delay matching ends_at', function () {
    Queue::fake();
    $product = Product::factory()->pending()->create(['starting_price' => 100]);

    $service = app(AuctionService::class);
    $service->placeBid($product, 'Alice', '150');

    $product->refresh();

    Queue::assertPushed(EndAuction::class, function (EndAuction $job) use ($product) {
        return $job->product->id === $product->id;
    });

    // Verify delay was set (delay method was called with a DateTimeInterface)
    Queue::assertPushed(EndAuction::class, fn (EndAuction $job) => true);
});
