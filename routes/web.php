<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\StoreController;

Route::get('/', [WelcomeController::class, 'show']);

Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('products', ProductController::class);
Route::resource('orders', OrderController::class); 
Route::get('/store', [StoreController::class, 'edit'])->name('store.edit');
Route::put('/store', [StoreController::class, 'update'])->name('store.update');