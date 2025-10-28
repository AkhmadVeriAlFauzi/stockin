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
use App\Exports\OrdersExport;
use Maatwebsite\Excel\Facades\Excel;


class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->store) {
            return Inertia::render('cms/manageOrder/index', ['orders' => []]);
        }

        // --- PERUBAHAN UTAMA DI SINI ---
        // Kita load semua relasi yang dibutuhkan untuk modal
        // persis seperti di method show()
        $ordersQuery = $user->store->orders()
            ->with([
                'buyer:id,name,email', // Butuh email untuk modal
                'shippingAddress',     // Butuh alamat lengkap untuk modal
                'items.product:id,name,price,image_url' // Butuh detail item untuk modal
            ])
            ->withCount('items') // withCount tetap ada
            ->latest();
        // --- AKHIR PERUBAHAN ---


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
        
        return Inertia::render('cms/manageOrder/index', [
            'orders' => $orders,
            'statuses' => ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled', 'refunded'],
            'filters' => $request->only(['search', 'status']),
        ]);
    }
    
    // Method show() ini jadi tidak terpakai oleh tabel, 
    // tapi bisa dihapus atau dibiarkan saja.
    public function show(Order $order)
    {
        $order->load([
            'buyer:id,name,email', 
            'shippingAddress',     
            'items.product:id,name,price,image_url' 
        ]);

        return Inertia::render('cms/manageOrder/Show', [
            'order' => $order,
        ]);
    }

    // ... sisa controller (edit, update, destroy, dll) tetap sama ...
    // ... (kode di bawah ini tidak saya ubah, hanya method index di atas) ...

    public function edit(Order $order)
    {
        $order->load('buyer:id,name');
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
        $statusBefore = $order->order_status;
        $statusAfter = $validated['order_status'];

        $order->load('items.product');

        try {
            DB::beginTransaction();
            $order->update($validated);

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

            if (in_array($statusBefore, ['processing', 'shipped']) && $statusAfter === 'cancelled') {
                 foreach ($order->items as $item) {
                    if ($item->product) {
                        $item->product->increment('stock', $item->quantity);
                    }
                }
            }

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', $e->getMessage());
        }

        // Redirect sukses, mungkin mau ke index? atau biarkan ke show?
        return redirect()->route('orders.show', $order->id)->with('success', 'Order berhasil diperbarui & stok telah diupdate.');
    }

    public function destroy(Order $order)
    {
        $order->items()->delete();
        $order->delete();
        return redirect()->back()->with('success', 'Order berhasil dihapus.');
    }

    public function export(Request $request)
    {
        // Ambil filter dari request
        $filters = $request->only(['search', 'status']);

        // Buat nama file yang dinamis
        $fileName = 'orders_' . date('Y-m-d_His') . '.xlsx';

        // Panggil class export kamu, kirim filternya, dan download
        return Excel::download(new OrdersExport($filters), $fileName);
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

        $order = $store->orders()->create([
            'buyer_id'            => $buyer->id,
            'shipping_address_id' => $address->id,
            'total_price'         => $product->price * 2,
            'shipping_cost'       => 5000,
            'order_status'        => 'pending_payment',
            'shipping_courier'    => 'JNE',
        ]);

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
