<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'buyer_id',
        'shipping_address_id',
        'total_price',
        'shipping_cost',
        'order_status',
        'shipping_courier',
        'shipping_resi',
    ];

    // RELASI: Satu Order dimiliki oleh satu User (pembeli)
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    // RELASI: Satu Order dikirim ke satu Alamat
    public function shippingAddress()
    {
        return $this->belongsTo(UserAddress::class, 'shipping_address_id');
    }

    // RELASI: Satu Order punya banyak Item Produk
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // RELASI: Satu Order punya satu data Pembayaran
    public function payment()
    {
        return $this->hasOne(Payment::class);
    }
    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}