<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FinanceController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $store = $user->store()->firstOrFail();

        // 1. Buat query dasar untuk semua pesanan yang sudah selesai
        $completedOrdersQuery = $store->orders()->where('order_status', 'completed');

        // 2. Hitung statistik utama
        $totalRevenue = (clone $completedOrdersQuery)->sum('total_price');
        $totalOrdersCompleted = (clone $completedOrdersQuery)->count();

        // 3. Hitung statistik untuk periode waktu tertentu (contoh: bulan ini)
        $revenueThisMonth = (clone $completedOrdersQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');

        // 4. Ambil daftar transaksi terakhir yang sudah selesai untuk ditampilkan di tabel
        $recentTransactions = (clone $completedOrdersQuery)
            ->with('buyer:id,name', 'items.product:id,name','shippingAddress') // Ambil info pembeli biar efisien
            ->latest() // Urutkan dari yang paling baru
            ->paginate(10);

        // 5. Kirim semua data ke frontend
        return Inertia::render('cms/finance/index', [
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalOrdersCompleted' => $totalOrdersCompleted,
                'revenueThisMonth' => (float) $revenueThisMonth,
            ],
            'transactions' => $recentTransactions,
        ]);
    }
}