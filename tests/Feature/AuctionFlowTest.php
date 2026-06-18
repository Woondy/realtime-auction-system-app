<?php

use App\Jobs\EndAuction;
use App\Models\Bid;
use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Support\Facades\Queue;

it('completes full auction flow from pending to ended', function () {
    Queue::fake([EndAuction::class]);

    $product = Product::factory()->pending()->create(['starting_price' => 100]);

    // Step 1: First bid starts auction
    $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Alice',
        'amount' => 150,
    ]);
    $product->refresh();
    expect($product->status)->toBe('active');
    Queue::assertPushed(EndAuction::class);

    // Step 2: Second bid raises price
    $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Bob',
        'amount' => 200,
    ]);
    expect((float) Bid::orderByDesc('amount')->first()->amount)->toBe(200.0);

    // Step 3: EndAuction job runs (via service, with optimistic lock)
    app(AuctionService::class)->endAuction($product);
    $product->refresh();
    expect($product->status)->toBe('ended');
});

it('end auction job sets correct status and finds winner', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 500, 'bidder_name' => 'Charlie']);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 300, 'bidder_name' => 'Alice']);

    app(AuctionService::class)->endAuction($product);

    $product->refresh();
    expect($product->status)->toBe('ended');

    $winner = Bid::where('product_id', $product->id)->orderByDesc('amount')->first();
    expect($winner->bidder_name)->toBe('Charlie');
    expect((float) $winner->amount)->toBe(500.0);
});

it('does not end already ended auction', function () {
    $product = Product::factory()->ended()->create(['starting_price' => 100]);

    $result = app(AuctionService::class)->endAuction($product);

    expect($result)->toBeFalse();
    $product->refresh();
    expect($product->status)->toBe('ended');
});

it('end auction is idempotent via optimistic lock', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->create(['product_id' => $product->id, 'amount' => 500, 'bidder_name' => 'Alice']);

    $service = app(AuctionService::class);

    // First call ends the auction
    $first = $service->endAuction($product);
    expect($first)->toBeTrue();

    // Second call is a no-op (already ended)
    $second = $service->endAuction($product);
    expect($second)->toBeFalse();

    $product->refresh();
    expect($product->status)->toBe('ended');
});

it('displays auction waiting state when pending', function () {
    $product = Product::factory()->pending()->create();

    $response = $this->get("/products/{$product->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('product/show')
        ->where('product.status', 'pending')
        ->where('highestBid', null)
    );
});

it('displays highest bid when active', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    $bid = Bid::factory()->create(['product_id' => $product->id, 'amount' => 250]);

    $response = $this->get("/products/{$product->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('product/show')
        ->where('product.status', 'active')
        ->where('highestBid.id', $bid->id)
    );
});

it('does not start auction when bidding on ended product', function () {
    $product = Product::factory()->ended()->create(['starting_price' => 100]);

    $response = $this->post("/products/{$product->id}/bids", [
        'bidder_name' => 'Dave',
        'amount' => 500,
    ]);

    $response->assertSessionHasErrors('amount');
    expect(Bid::count())->toBe(0);
});

it('limits bids returned in product show to top 20', function () {
    $product = Product::factory()->active()->create(['starting_price' => 100]);
    Bid::factory()->count(25)->create(['product_id' => $product->id]);

    $response = $this->get("/products/{$product->id}");

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('product/show')
        ->has('product.bids', 20)
    );
});
