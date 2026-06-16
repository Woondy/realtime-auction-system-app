<?php

use App\Events\AuctionStarted;
use App\Events\BidPlaced;
use App\Jobs\EndAuction;
use App\Models\Bid;
use App\Models\Product;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Queue;

beforeEach(function () {
    Queue::fake();
    Event::fake();
});

it('starts auction on first bid', function () {
    $product = Product::factory()->pending()->create(['starting_price' => 100]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => 150,
    ]);

    $response->assertRedirect();
    $product->refresh();

    expect($product->status)->toBe('active');
    expect($product->ends_at)->not->toBeNull();
    expect(Bid::count())->toBe(1);
    expect(Bid::first()->amount)->toBe('150.00');
});

it('rejects bid below current max', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 200]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Bob',
        'amount' => 150,
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Bid::count())->toBe(1);
});

it('rejects bid equal to current max', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 200]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Bob',
        'amount' => 200,
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Bid::count())->toBe(1);
});

it('accepts higher bid', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 200]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Bob',
        'amount' => 250,
    ]);

    $response->assertRedirect();
    $response->assertSessionHasNoErrors();
    expect(Bid::count())->toBe(2);
    expect((float) Bid::orderByDesc('id')->first()->amount)->toBe(250.0);
});

it('rejects bid on ended auction', function () {
    $product = Product::factory()->ended()->create(['starting_price' => 100]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Bob',
        'amount' => 200,
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Bid::count())->toBe(0);
});

it('validates required fields', function () {
    $product = Product::factory()->pending()->create();

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => '',
        'amount' => '',
    ]);

    $response->assertSessionHasErrors(['bidder_name', 'amount']);
});

it('validates amount must be positive', function () {
    $product = Product::factory()->pending()->create();

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => -50,
    ]);

    $response->assertSessionHasErrors('amount');
});

it('dispatches EndAuction job on first bid', function () {
    $product = Product::factory()->pending()->create(['starting_price' => 100]);

    $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => 150,
    ]);

    Queue::assertPushed(EndAuction::class, function ($job) use ($product) {
        return $job->product->id === $product->id;
    });
});

it('broadcasts AuctionStarted event on first bid', function () {
    Event::fake([AuctionStarted::class]);

    $product = Product::factory()->pending()->create(['starting_price' => 100]);

    $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => 150,
    ]);

    Event::assertDispatched(AuctionStarted::class);
});

it('broadcasts BidPlaced event', function () {
    Event::fake([BidPlaced::class]);

    $product = Product::factory()->active()->create(['starting_price' => 100]);

    $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => 150,
    ]);

    Event::assertDispatched(BidPlaced::class);
});

it('prevents duplicate bids at same price via lockForUpdate', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 200, 'bidder_name' => 'Existing']);

    // First bid (250 > 200) — should succeed
    $r1 = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'User1',
        'amount' => 250,
    ]);
    $r1->assertSessionHasNoErrors();

    // Second bid (250 <= 250) — should be rejected as equal/lower
    $r2 = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'User2',
        'amount' => 250,
    ]);
    $r2->assertSessionHasErrors('amount');

    expect(Bid::count())->toBe(2); // original + 1 successful new bid
});
