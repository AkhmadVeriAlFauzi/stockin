<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping; // <-- Tambahin ini

class OrdersExport implements FromQuery, WithHeadings, WithMapping // <-- Tambahin WithMapping
{
    protected $filters;

    // Bikin constructor untuk nerima filter
    public function __construct(array $filters = [])
    {
        $this->filters = $filters;
    }

    public function query()
    {
        // Ambil user yang sedang login (asumsi ini untuk admin/store owner)
        $user = auth()->user(); 

        // --- COPY-PASTE LOGIC QUERY DARI METHOD INDEX KAMU ---
        $ordersQuery = $user->store->orders()
            ->with('buyer:id,name') // Kita butuh data buyer
            ->latest();

        // Terapkan filter
        if (!empty($this->filters['status'])) {
            $ordersQuery->where('order_status', $this->filters['status']);
        }

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $ordersQuery->where(function ($query) use ($search) {
                $query->where('id', 'like', "%{$search}%")
                    ->orWhereHas('buyer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }
        // --- AKHIR DARI COPY-PASTE LOGIC ---

        return $ordersQuery;
    }

    // Tentukan data apa yang mau dimasukin ke Excel
    public function map($order): array
    {
        return [
            $order->id,
            $order->buyer->name ?? 'N/A', // Data dari relasi 'buyer'
            $order->created_at->format('Y-m-d H:i:s'),
            $order->order_status,
            $order->shipping_courier,
            $order->shipping_resi,
            $order->total_price,
        ];
    }

    // Ini buat judul kolomnya
    public function headings(): array
    {
        return [
            'Order ID',
            'Customer Name',
            'Date',
            'Status',
            'Courier',
            'Tracking Number',
            'Total Price',
        ];
    }
}