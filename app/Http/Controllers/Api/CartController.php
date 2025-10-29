<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Resources\CartItemResource;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Menampilkan isi keranjang user yang login.
     * Route: GET /api/cart (requires auth)
     */
    public function index(Request $request)
    {
        $user = $request->user();
        // Ambil item cart, sertakan detail produk & tokonya
        $cartItems = $user->cartItems()->with('product.store:id,store_name')->latest()->get();

        // Hitung subtotal (opsional, bisa di frontend juga)
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->product->price ?? 0) * $item->quantity;
        });

        return CartItemResource::collection($cartItems)
                ->additional(['meta' => ['subtotal' => (float) $subtotal]]);
    }

    /**
     * Menambahkan item ke keranjang.
     * Route: POST /api/cart (requires auth)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::with('store:id,status') // Cek status toko juga
                           ->findOrFail($validated['product_id']);

        // --- Validasi Tambahan ---
        // 1. Cek Toko Aktif?
        if ($product->store->status !== 'active') {
             return response()->json(['message' => 'Cannot add product from inactive store.'], 400);
        }
        // 2. Cek Stok Cukup?
        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient product stock.'], 400);
        }
        // 3. User tidak bisa beli produknya sendiri (jika dia juga seller)
        if ($user->store && $user->store->id === $product->store_id) {
             return response()->json(['message' => 'You cannot buy your own products.'], 403);
        }
        // --- Akhir Validasi Tambahan ---


        // Coba cari item yg sama di cart user
        $cartItem = $user->cartItems()
                         ->where('product_id', $validated['product_id'])
                         ->first();

        if ($cartItem) {
            // Jika sudah ada, update quantity
            $newQuantity = $cartItem->quantity + $validated['quantity'];
             // Cek stok lagi setelah ditambah
             if ($product->stock < $newQuantity) {
                 return response()->json(['message' => 'Insufficient product stock for updated quantity.'], 400);
             }
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            // Jika belum ada, buat baru
            $cartItem = $user->cartItems()->create($validated);
        }

        // Load relasi produk untuk response
        $cartItem->load('product.store:id,store_name');

        return response()->json([
            'message' => 'Item added to cart successfully.',
            'cart_item' => new CartItemResource($cartItem)
        ], 200); // Bisa 201 kalau selalu create, tapi 200 lebih cocok krn bisa update
    }

    /**
     * Mengupdate quantity item di keranjang.
     * Route: PUT /api/cart/{cartItem} (requires auth)
     */
    public function update(Request $request, CartItem $cartItem)
    {
        // Pastikan item ini milik user yg login (Authorization)
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $product = $cartItem->product; // Ambil produk dari relasi

        // Cek Stok Cukup?
        if ($product->stock < $validated['quantity']) {
            return response()->json(['message' => 'Insufficient product stock.'], 400);
        }

        $cartItem->update(['quantity' => $validated['quantity']]);
        
        // Load relasi produk untuk response
        $cartItem->load('product.store:id,store_name');

        return response()->json([
            'message' => 'Cart item updated successfully.',
            'cart_item' => new CartItemResource($cartItem)
        ]);
    }

    /**
     * Menghapus item dari keranjang.
     * Route: DELETE /api/cart/{cartItem} (requires auth)
     */
    public function destroy(Request $request, CartItem $cartItem)
    {
        // Pastikan item ini milik user yg login (Authorization)
         if ($cartItem->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart successfully.']);
    }
}
