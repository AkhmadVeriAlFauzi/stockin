<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'store_name',
        'description',
        'address',
        'city',
        'logo_url',
        'status',
    ];

    // RELASI: Satu Toko dimiliki oleh satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // RELASI: Satu Toko punya banyak Produk
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // RELASI: Satu Toko punya banyak item yang diorder
    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }
}