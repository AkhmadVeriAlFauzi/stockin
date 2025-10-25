<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        // Pastikan user punya toko
        $store = $user->store()->first();

        if (!$store) {
            // Redirect atau tampilkan view tanpa data jika toko belum disetup
            return Inertia::render('cms/dashboard/index', [
                'stats' => [],
                'recentOrders' => [],
                'salesData' => [],
            ]);
        }

        // 1. STATISTIK UTAMA
        $completedOrdersQuery = $store->orders()->where('order_status', 'completed');
        $allOrdersQuery = $store->orders();

        $totalRevenue = $completedOrdersQuery->sum('total_price');
        $totalOrders = $allOrdersQuery->count();
        $totalProducts = $store->products()->count();
        $pendingOrders = $allOrdersQuery->whereIn('order_status', ['pending_payment', 'processing'])->count();
        
        // Pendapatan Bulan Ini (untuk perbandingan)
        $revenueThisMonth = (clone $completedOrdersQuery)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_price');

        // 2. TRANSAKSI TERBARU
        $recentOrders = $store->orders()
            ->with('buyer:id,name')
            ->latest()
            ->take(5)
            ->get();

        // 3. DATA UNTUK GRAFIK (6 bulan terakhir)
        $salesData = $this->getMonthlySalesData($store->id);

        return Inertia::render('cms/dashboard/index', [
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalOrders' => $totalOrders,
                'totalProducts' => $totalProducts,
                'pendingOrders' => $pendingOrders,
                'revenueThisMonth' => (float) $revenueThisMonth,
            ],
            'recentOrders' => $recentOrders,
            'salesData' => $salesData,
        ]);
    }
    
    /**
     * Helper untuk mengambil data penjualan bulanan selama 6 bulan terakhir.
     */
    protected function getMonthlySalesData($storeId)
    {
        $months = [];
        $current = Carbon::now();
        
        // Siapkan list 6 bulan terakhir
        for ($i = 5; $i >= 0; $i--) {
            $date = (clone $current)->subMonths($i);
            $months[] = [
                'month' => $date->month,
                'year' => $date->year,
                'label' => $date->isoFormat('MMM YYYY'),
            ];
        }

        $results = DB::table('orders')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->where('store_id', $storeId)
            ->where('order_status', 'completed')
            ->where('created_at', '>=', (clone $current)->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

        // Gabungkan data DB dengan list bulan (untuk memastikan 0 jika tidak ada penjualan)
        $finalData = [];
        foreach ($months as $month) {
            $match = $results->first(fn($r) => $r->month == $month['month'] && $r->year == $month['year']);
            $finalData[] = [
                'name' => $month['label'],
                'total' => (float) ($match->revenue ?? 0),
            ];
        }

        return $finalData;
    }
}