<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // ===========================================
        // 1. JIKA DIA SUPERADMIN
        // ===========================================
        if ($user->role === 'superadmin') {
            
            // Ambil data-data untuk Superadmin (Agregat)
            $totalPlatformRevenue = Order::where('order_status', 'completed')->sum('total_price');
            $totalStores = Store::count();
            $totalUsers = User::count();
            // UMKM yang daftar (role) tapi belum setup (store)
            $pendingUmkm = User::where('role', 'umkm_admin')->doesntHave('store')->count();

            // --- PERBAIKAN DI SINI ---
            // Ganti relasi 'owner' jadi 'user' (sesuai error)
            $recentStores = Store::with('user:id,name')->latest()->take(5)->get();
            // --- AKHIR PERBAIKAN ---
            
            $salesData = $this->getPlatformMonthlySalesData();

            // Render komponen Dashboard Superadmin
            return Inertia::render('SuperAdmin/Dashboard/index', [
                'stats' => [
                    'totalPlatformRevenue' => (float) $totalPlatformRevenue,
                    'totalStores' => $totalStores,
                    'totalUsers' => $totalUsers,
                    'pendingUmkm' => $pendingUmkm,
                ],
                'recentStores' => $recentStores,
                'salesData' => $salesData,
            ]);
        }

        // ===========================================
        // 2. JIKA DIA UMKM ADMIN
        // ===========================================
        else if ($user->role === 'umkm_admin') {
            
            // Pastikan user punya toko
            $store = $user->store()->first();

            if (!$store) {
                // Tampilkan view tanpa data jika toko belum disetup
                return Inertia::render('cms/dashboard/index', [
                    'stats' => [],
                    'recentOrders' => [],
                    'salesData' => [],
                ]);
            }

            // 1. STATISTIK UTAMA (Kode Asli Kamu)
            $completedOrdersQuery = $store->orders()->where('order_status', 'completed');
            $allOrdersQuery = $store->orders();

            $totalRevenue = $completedOrdersQuery->sum('total_price');
            $totalOrders = (clone $allOrdersQuery)->count(); 
            $totalProducts = $store->products()->count();
            $pendingOrders = (clone $allOrdersQuery)->whereIn('order_status', ['pending_payment', 'processing'])->count(); 
            
            $revenueThisMonth = (clone $completedOrdersQuery)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_price');

            // 2. TRANSAKSI TERBARU (Kode Asli Kamu)
            $recentOrders = $store->orders()
                ->with('buyer:id,name')
                ->latest()
                ->take(5)
                ->get();

            // 3. DATA UNTUK GRAFIK (Kode Asli Kamu)
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

        // Fallback jika ada role aneh
        return redirect('/');
    }
    
    /**
     * Helper untuk mengambil data penjualan bulanan selama 6 bulan terakhir.
     * (KHUSUS UNTUK SATU TOKO / UMKM)
     */
    protected function getMonthlySalesData($storeId)
    {
        $months = [];
        $current = Carbon::now();
        
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

    /**
     * Helper BARU untuk mengambil data penjualan bulanan selama 6 bulan terakhir.
     * (UNTUK SELURUH PLATFORM / SUPERADMIN)
     */
    protected function getPlatformMonthlySalesData()
    {
        $months = [];
        $current = Carbon::now();
        
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
            // <-- TIDAK ADA 'where store_id'
            ->where('order_status', 'completed')
            ->where('created_at', '>=', (clone $current)->subMonths(5)->startOfMonth())
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get();

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

