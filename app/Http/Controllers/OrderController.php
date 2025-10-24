<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Inertia\Inertia;


class OrderController extends Controller
{
    public function index(Request $request)
    {
        // Ambil user yang sedang login
        $user = $request->user();

        // PENJAGA: Pastikan user punya toko
        if (!$user->store) {
            // Tampilkan halaman kosong atau setup jika belum punya toko
            return Inertia::render('cms/manageOrder/index', ['orders' => []]);
        }

        // MULAI DARI SINI: Ambil order HANYA dari toko milik user
        $ordersQuery = $user->store->orders()
            ->with('buyer:id,name')
            ->withCount('items')
            ->latest();

        // Sisa kode filter lo udah bener
        $ordersQuery->when($request->input('status'), function ($query, $status) {
            $query->where('order_status', $status);
        });

        $ordersQuery->when($request->input('search'), function ($query, $search) {
            $query->where('id', 'like', "%{$search}%")
                ->orWhereHas('buyer', function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%");
                });
        });

        $orders = $ordersQuery->paginate(15)->withQueryString();
        
        // ... sisa kode return Inertia-nya udah bener
        return Inertia::render('cms/manageOrder/index', [
            'orders' => $orders,
            'statuses' => ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'],
            'filters' => $request->only(['search', 'status']),
        ]);
    }
    public function show(Order $order)
    {
        // Eager load semua relasi yang kita butuhkan untuk halaman detail
        $order->load([
            'buyer:id,name,email', // Ambil info pembeli
            'shippingAddress',     // Ambil info alamat pengiriman
            'items.product:id,name,price,image_url' // Ambil item & produk di dalamnya
        ]);

        return Inertia::render('cms/manageOrder/Show', [
            'order' => $order,
        ]);
    }

    public function edit(Order $order)
    {
        $order->load('buyer:id,name');
        // Kirim daftar status ke frontend untuk mengisi dropdown
        $statuses = [
            'pending_payment', 
            'processing', 
            'shipped', 
            'completed', 
            'cancelled', 
            'refunded'
        ];

        return Inertia::render('cms/manageOrder/Edit', [
            'order' => $order,
            'statuses' => $statuses,
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order)
    {
        // 1. Validasi otomatis dijalankan oleh UpdateOrderRequest
        $validated = $request->validated();

        // 2. Update data order di database
        $order->update($validated);

        // 3. Redirect kembali ke halaman detail dengan pesan sukses
        return redirect()->route('orders.show', $order->id)->with('success', 'Order berhasil diperbarui.');
    }

    public function destroy(Order $order)
    {
        // 1. Hapus dulu semua "anak"-nya (order_items) secara manual
        $order->items()->delete();

        // 2. Baru hapus "induk"-nya (order)
        $order->delete();

        return redirect()->back()->with('success', 'Order berhasil dihapus.');
    }


    public function createDummyOrder(Store $store)
    {
        if (!app()->isLocal()) {
            abort(404);
        }

        $product = $store->products()->inRandomOrder()->first();
        if (!$product) {
            return "Error: Toko '{$store->store_name}' tidak punya produk.";
        }

        // Kode untuk membuat buyer dan address sudah benar, kita biarkan.
        $buyer = User::firstOrCreate(/*...*/);
        $address = UserAddress::firstOrCreate(/*...*/);

        // Kode untuk membuat order utama juga sudah benar.
        $order = $store->orders()->create([
            'buyer_id'            => $buyer->id,
            'shipping_address_id' => $address->id,
            'total_price'         => $product->price * 2,
            'shipping_cost'       => 15000,
            'order_status'        => 'pending_payment',
            'shipping_courier'    => 'JNE',
        ]);

        // ===== INI BAGIAN YANG DISESUAIKAN DENGAN DATABASE ASLI LO =====
        $order->items()->create([
            'product_id'   => $product->id,
            'quantity'     => 2,
            'price'        => $product->price,
            // 'product_name' dan 'store_id' kita hapus total
        ]);
        // =============================================================

        return response()->json([
            'message' => "SUKSES! Order dummy baru berhasil dibuat untuk toko: {$store->store_name}.",
            'order_id' => $order->id,
        ], 201);
    }
}