<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'label',
        'recipient_name',
        'phone_number',
        'full_address',
        'is_default',
    ];

    // RELASI: Satu Alamat dimiliki oleh satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}