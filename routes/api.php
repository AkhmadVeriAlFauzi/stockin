<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\AddressController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Rute Publik (Browse) ---
// Ini yang barusan kita tambahin
Route::get('/products', [ProductController::class, 'index']);      // List semua produk
Route::get('/products/{product}', [ProductController::class, 'show']); // Detail produk
Route::get('/stores', [StoreController::class, 'index']);          // List semua toko
Route::get('/stores/{store}', [StoreController::class, 'show']);       // Detail toko + produknya

// Rute Publik (Tidak perlu login)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rute Terproteksi (Perlu login/token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Info user yang sedang login (termasuk role & store jika ada)
    Route::get('/user', function (Request $request) {
        // Eager load store jika ada
        $user = $request->user()->load('store'); 
        return response()->json([
            'user' => $user,
            // 'store' => $user->store // Bisa juga dipisah gini
        ]);
    });

    // Endpoint untuk upgrade role dari 'user' ke 'umkm_admin'
    Route::post('/user/request-seller-role', [UserController::class, 'requestSellerRole']);

    // Endpoint untuk setup/update toko (HANYA untuk umkm_admin)
    // POST untuk membuat jika belum ada, PUT untuk update jika sudah ada
    Route::post('/stores', [StoreController::class, 'store'])->middleware('role:umkm_admin'); 
    Route::put('/store', [StoreController::class, 'update'])->middleware('role:umkm_admin'); // Update toko milik user yg login

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cartItem}', [CartController::class, 'update']);
    Route::delete('/cart/{cartItem}', [CartController::class, 'destroy']);

    // --- Rute Checkout ---
    Route::post('/checkout', [CheckoutController::class, 'store']);

    // --- Rute Alamat Pengiriman ---
    // Menggunakan apiResource untuk CRUD standar
    // Ini otomatis membuat endpoint berikut (semua diawali /api/addresses):
    // GET    /                -> index()   (Lihat semua alamat user)
    // POST   /                -> store()   (Tambah alamat baru)
    // GET    /{address}       -> show()    (Lihat detail satu alamat)
    // PUT    /{address}       -> update()  (Update satu alamat)
    // DELETE /{address}       -> destroy() (Hapus satu alamat)
    Route::apiResource('addresses', AddressController::class);

    // Route tambahan khusus untuk set default (pakai PATCH lebih cocok)
    // PATCH /api/addresses/{address}/set-default
    Route::patch('/addresses/{address}/set-default', [AddressController::class, 'setDefault']);

});
