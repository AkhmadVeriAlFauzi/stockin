<?php

namespace App\Providers;

// ...
use App\Models\Product;   // <-- Tambahkan ini
use App\Policies\ProductPolicy; // <-- Tambahkan ini

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Product::class => ProductPolicy::class, // <-- Tambahkan ini
    ];

    // ...
}