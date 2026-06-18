<?php

use App\Http\Controllers\BidController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProductController::class, 'index'])->name('home');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/bids', [BidController::class, 'store'])
    ->middleware('throttle:60,1')
    ->name('products.bids.store');
