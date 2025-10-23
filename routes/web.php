<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\SuperAdmin\ProductCategoryController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SuperAdmin\ManageUmkmController;

// ==========================================================
// RUTE PUBLIK & OTENTIKASI DASAR
// ==========================================================
Route::get('/', [WelcomeController::class, 'show']);

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// ==========================================================
// RUTE UMUM (UNTUK SEMUA USER YANG LOGIN)
// ==========================================================
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// ==========================================================
// RUTE KHUSUS UMKM ADMIN
// ==========================================================
Route::middleware(['auth', 'role:umkm_admin'])->group(function () {
    Route::resource('products', ProductController::class);
    Route::resource('orders', OrderController::class);
    Route::get('/store', [StoreController::class, 'edit'])->name('store.edit');
    Route::put('/store', [StoreController::class, 'update'])->name('store.update');
    Route::get('/finance', [FinanceController::class, 'index'])->name('finance.index');
});

// ==========================================================
// RUTE KHUSUS SUPER ADMIN
// ==========================================================
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    // Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::resource('/manage-categories', ProductCategoryController::class);
    // Tambah rute super admin lain di sini
    Route::resource('/manage-umkm', ManageUmkmController::class);
});