<?php

use App\Http\Controllers\BidController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => inertia('welcome'))->name('home');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
Route::post('/products/{product}/bids', [BidController::class, 'store'])->name('products.bids.store');
