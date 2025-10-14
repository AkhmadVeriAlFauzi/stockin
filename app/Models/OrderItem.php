<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'store_id',
        'quantity',
        'price',
        'product_name',
    ];

    // RELASI: Satu Order Item adalah bagian dari satu Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // RELASI: Satu Order Item merujuk ke satu Produk
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    // RELASI: Satu Order Item merujuk ke satu Toko
    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}