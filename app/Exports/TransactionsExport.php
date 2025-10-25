<?php

namespace App\Exports;

use App\Models\Order;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize; // Biar kolom rapi

class TransactionsExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    protected $month;
    protected $year;
    protected $storeId;

    // Kita terima filter dari controller
    public function __construct(int $storeId, int $month, int $year)
    {
        $this->storeId = $storeId;
        $this->month = $month;
        $this->year = $year;
    }

    /**
    * Query ini mengambil data yang mau diexport
    */
    public function query()
    {
        return Order::query()
            ->where('store_id', $this->storeId)
            ->where('order_status', 'completed')
            ->whereMonth('created_at', $this->month)
            ->whereYear('created_at', $this->year)
            ->with(['buyer:id,name', 'shippingAddress']) // Ambil relasi
            ->latest();
    }

    /**
    * Ini adalah judul kolom (baris pertama) di Excel
    */
    public function headings(): array
    {
        return [
            'Order ID',
            'Tanggal',
            'Pembeli',
            'Alamat Pengiriman',
            'Subtotal',
            'Ongkir',
            'Total',
        ];
    }

    /**
    * Ini adalah data untuk setiap baris di Excel
    */
    public function map($order): array
    {
        $subtotal = $order->total_price - $order->shipping_cost;
        
        return [
            $order->id,
            $order->created_at->format('d-m-Y H:i'),
            $order->buyer ? $order->buyer->name : 'N/A',
            $order->shippingAddress ? $order->shippingAddress->full_address : 'N/A',
            $subtotal,
            $order->shipping_cost,
            $order->total_price,
        ];
    }
}