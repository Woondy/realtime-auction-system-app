<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @use \Database\Factories\ProductFactory<\App\Models\Product>
 */
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'image',
        'starting_price',
        'status',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'starting_price' => 'decimal:2',
            'ends_at' => 'datetime',
        ];
    }

    /** @return HasMany<Bid, $this> */
    public function bids(): HasMany
    {
        return $this->hasMany(Bid::class);
    }
}
