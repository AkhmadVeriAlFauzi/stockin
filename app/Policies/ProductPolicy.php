<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ProductPolicy
{
    /**
     * Aturan untuk menentukan apakah user boleh mengupdate produk.
     */
    public function update(User $user, Product $product): bool
    {
        // User boleh update produk JIKA ID tokonya sama dengan ID toko si produk
        return $user->store->id === $product->store_id;
    }

    /**
     * Aturan untuk menentukan apakah user boleh menghapus produk.
     */
    public function delete(User $user, Product $product): bool
    {
        // Aturannya sama dengan update
        return $user->store->id === $product->store_id;
    }

    // Biarkan method lain seperti ini untuk sekarang
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, Product $product): bool { return true; }
    public function create(User $user): bool { return true; }
    public function restore(User $user, Product $product): bool { return true; }
    public function forceDelete(User $user, Product $product): bool { return true; }
}