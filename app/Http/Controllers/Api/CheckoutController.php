<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\UserAddress; // <-- Model alamat user
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutController extends Controller
{
    /**
     * Memproses checkout: membuat order dari isi keranjang.
     * Route: POST /api/checkout (requires auth)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // --- Validasi Input Checkout ---
        $validated = $request->validate([
            // User harus milih alamat pengiriman dia yg mana
            'shipping_address_id' => 'required|exists:user_addresses,id,user_id,'.$user->id, 
            // Opsional: Metode pembayaran, kurir, dll.
            // 'payment_method' => 'required|string',
            // 'shipping_courier' => 'required|string',
        ]);

        // --- Ambil Item Keranjang ---
        $cartItems = $user->cartItems()->with('product.store')->get(); // Load product & store

        // Cek apakah keranjang kosong
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty.'], 400);
        }

        // Ambil alamat pengiriman yg dipilih
        $shippingAddress = UserAddress::find($validated['shipping_address_id']);
        
        // Asumsi sementara: Ongkir & Kurir fix (bisa dikembangkan)
        $shippingCost = 10000; // Contoh ongkir flat
        $shippingCourier = 'JNE'; // Contoh kurir fix

        // Variabel untuk menampung order items & total
        $orderItemsData = [];
        $subtotal = 0;
        $totalWeight = 0; // Jika perlu buat ongkir nanti
        $storeIds = []; // Lacak ID toko

        // ===================================
        // MULAI DATABASE TRANSACTION
        // ===================================
        try {
            DB::beginTransaction();

            // --- Iterasi Cart Items untuk Validasi & Persiapan ---
            foreach ($cartItems as $item) {
                $product = $item->product;

                // 1. Cek stok lagi (penting!)
                if ($product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'cart' => "Insufficient stock for product: {$product->name} (available: {$product->stock})",
                    ]);
                }
                 // 2. Cek toko aktif lagi
                 if ($product->store->status !== 'active') {
                      throw ValidationException::withMessages([
                         'cart' => "Store for product {$product->name} is currently inactive.",
                     ]);
                 }
                // 3. User tidak bisa beli produknya sendiri (jika dia juga seller)
                if ($user->store && $user->store->id === $product->store_id) {
                     throw ValidationException::withMessages([
                         'cart' => "You cannot buy your own product: {$product->name}.",
                     ]);
                 }


                // Tambah ke data order items
                $orderItemsData[] = [
                    // 'order_id' akan diisi nanti setelah order dibuat
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'price' => $product->price, // Simpan harga saat checkout
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Hitung subtotal
                $subtotal += $product->price * $item->quantity;
                
                // Kurangi stok produk
                $product->decrement('stock', $item->quantity);

                // Lacak ID toko (untuk relasi order-store)
                $storeIds[$product->store_id] = $product->store_id; 
            }

            // --- Buat Order Baru ---
            // Asumsi B2B bisa beli dari BANYAK toko sekaligus dalam 1 checkout?
            // Jika YA, kita perlu bikin 1 order per toko.
            // Jika TIDAK (1 checkout = 1 toko), logic-nya beda.
            
            // !! ASUMSI SEMENTARA: 1 Checkout bisa dari banyak toko, tapi Order cuma 1 !!
            // Ini mungkin perlu disesuaikan tergantung model bisnismu
            if (count($storeIds) > 1) {
                 // Jika perlu dipisah per toko, logic-nya lebih kompleks
                 // Untuk sekarang, kita gabung aja dulu (anggap order ke platform)
                 // throw new \Exception("Multi-store checkout not yet supported.");
            }
            // Ambil ID toko pertama (sementara)
            $storeId = key($storeIds); 
            
            $order = Order::create([
                'store_id' => $storeId, // <-- Relasi ke toko mana? Ini perlu dipikirin lagi
                'buyer_id' => $user->id,
                'shipping_address_id' => $shippingAddress->id,
                'total_price' => $subtotal + $shippingCost,
                'shipping_cost' => $shippingCost,
                'order_status' => 'pending_payment', // Status awal
                'shipping_courier' => $shippingCourier,
                // 'payment_method' => $validated['payment_method'],
            ]);

            // --- Tambahkan order_id ke Order Items & Insert ---
            foreach ($orderItemsData as &$itemData) { // Pakai reference '&'
                $itemData['order_id'] = $order->id;
            }
            OrderItem::insert($orderItemsData); // Insert massal lebih efisien

            // --- Kosongkan Keranjang User ---
            $user->cartItems()->delete();

            // ===================================
            // COMMIT DATABASE TRANSACTION
            // ===================================
            DB::commit();

            // Berhasil! Kirim response
            return response()->json([
                'message' => 'Checkout successful! Order created.',
                'order_id' => $order->id, // Kirim ID order baru
                'total_price' => $order->total_price,
                // Bisa kirim detail order juga jika perlu
            ], 201); // Status Created


        } catch (ValidationException $e) {
            // ===================================
            // ROLLBACK JIKA ADA VALIDASI GAGAL
            // ===================================
            DB::rollBack();
            return response()->json([
                'message' => 'Checkout failed due to validation errors.',
                'errors' => $e->errors(),
            ], 422); // Unprocessable Entity

        } catch (\Exception $e) {
            // ===================================
            // ROLLBACK JIKA ADA ERROR LAIN
            // ===================================
            DB::rollBack();
            // Log errornya untuk debug
             \Log::error('Checkout failed: ' . $e->getMessage() . ' - Trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'An unexpected error occurred during checkout. Please try again later.',
                // 'error' => $e->getMessage() // Jangan tampilkan detail error ke user
            ], 500); // Internal Server Error
        }
    }
}

