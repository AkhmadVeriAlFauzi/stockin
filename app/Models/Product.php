<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'description',
        'price',
        'stock',
        'image_url',
        'status',
    ];

    // RELASI: Satu Produk dimiliki oleh satu Toko
    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    // RELASI: Satu Produk masuk dalam satu Kategori
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }
}