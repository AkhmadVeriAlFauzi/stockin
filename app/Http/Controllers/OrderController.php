<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;


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
        $validated = $request->validated();

        // Ambil status order SEBELUM di-update
        $statusBefore = $order->order_status;
        
        // Ambil status order BARU dari request
        $statusAfter = $validated['order_status'];

        // Eager load relasi yang DIBUTUHKAN
        $order->load('items.product');

        try {
            // Mulai "Transaction"
            DB::beginTransaction();

            // Update status ordernya
            $order->update($validated);

            // LOGIKA PENGURANGAN STOK
            if ($statusBefore === 'pending_payment' && $statusAfter === 'processing') {
                foreach ($order->items as $item) {
                    $product = $item->product;
                    if ($product) {
                        if ($product->stock < $item->quantity) {
                            throw new \Exception("Stok produk '{$product->name}' tidak mencukupi (sisa {$product->stock}).");
                        }
                        $product->decrement('stock', $item->quantity);
                    }
                }
            }

            // LOGIKA PENGEMBALIAN STOK
            if (in_array($statusBefore, ['processing', 'shipped']) && $statusAfter === 'cancelled') {
                 foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->increment('stock', $item->quantity);
                    }
                }
            }

            // Jika semua aman, simpan permanen ke database
            DB::commit();

        } catch (\Exception $e) {
            // Kalau ada error (misal stok nggak cukup), batalkan semua
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }

        // Redirect sukses
        return redirect()->route('orders.show', $order->id)->with('success', 'Order berhasil diperbarui & stok telah diupdate.');
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

        // ===== INI YANG DIPERBAIKI DARI '/*...*/' =====
        $buyer = User::firstOrCreate(
            ['email' => 'buyer@example.com'],
            ['name' => 'Dummy Buyer', 'password' => bcrypt('password'), 'role' => 'user']
        );
        $address = UserAddress::firstOrCreate(
            ['user_id' => $buyer->id, 'label' => 'Rumah'],
            [
                'recipient_name' => $buyer->name,
                'phone_number'   => '081234567890',
                'full_address'   => 'Jl. Jend. Sudirman No. 123, Surakarta, Jawa Tengah, 57151',
            ]
        );
        // =============================================

        $order = $store->orders()->create([
            'buyer_id'            => $buyer->id,
            'shipping_address_id' => $address->id,
            'total_price'         => $product->price * 2,
            'shipping_cost'       => 5000,
            'order_status'        => 'pending_payment',
            'shipping_courier'    => 'JNE',
        ]);

        // ... (Kode items()->create lo udah bener) ...
        $order->items()->create([
            'product_id'   => $product->id,
            'quantity'     => 2,
            'price'        => $product->price,
        ]);

        return response()->json([
            'message' => "SUKSES! Order dummy baru berhasil dibuat untuk toko: {$store->store_name}.",
            'order_id' => $order->id,
        ], 201);
    }
}