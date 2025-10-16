<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrderRequest;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {

        $statuses = [
            'pending_payment', 'processing', 'shipped', 
            'completed', 'cancelled', 'refunded'
        ];

        $orders = Order::query()
            // Eager load relasi 'buyer', kita cuma butuh id dan name-nya
            ->with('buyer:id,name') 
            ->withCount('items')
            ->when($request->input('status'), function ($query, $status) {
                $query->where('order_status', $status);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where('id', 'like', "%{$search}%") // Search berdasarkan ID Order
                    // Search berdasarkan nama di tabel relasi 'users' (buyer)
                    ->orWhereHas('buyer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%{$search}%");
                    });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('cms/manageOrder/index', [
            'orders' => $orders,
            'statuses' => $statuses,
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
}