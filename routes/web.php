<?php

use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => inertia('welcome'))->name('home');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
