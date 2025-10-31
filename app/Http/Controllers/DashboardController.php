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

        if ($user->role === 'superadmin') {
            
            $totalPlatformRevenue = Order::where('order_status', 'completed')->sum('total_price');
            $totalStores = Store::count();
            $totalUsers = User::count();

            $pendingUmkm = Store::where('status', 'pending_verification')->count();

            $recentStores = Store::with('user:id,name')->latest()->take(5)->get();
            
            $salesData = $this->getPlatformMonthlySalesData();

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

        else if ($user->role === 'umkm_admin') {
            
            $store = $user->store()->first();

            if (!$store) {
        
                return Inertia::render('cms/dashboard/index', [
                    'stats' => [],
                    'recentOrders' => [],
                    'salesData' => [],
                ]);
            }

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

            $recentOrders = $store->orders()
                ->with('buyer:id,name')
                ->latest()
                ->take(5)
                ->get();

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

        return redirect('/');
    }
    
    
    protected function getMonthlySalesData($storeId)
    {
        $months = [];

        $date = Carbon::now()->startOfMonth();
        for ($i = 0; $i < 6; $i++) {
            $months[] = [
                'month' => $date->month,
                'year' => $date->year,
                'label' => $date->isoFormat('MMM YYYY'),
            ];
            $date->subMonth();
        }
        $months = array_reverse($months);

        $results = DB::table('orders')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->where('store_id', $storeId)
            ->where('order_status', 'completed')
            ->where('created_at', '>=', Carbon::create($months[0]['year'], $months[0]['month'], 1))
            ->groupBy('year', 'month')
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

    protected function getPlatformMonthlySalesData()
    {
        $months = [];
        $date = Carbon::now()->startOfMonth();
        for ($i = 0; $i < 6; $i++) {
            $months[] = [
                'month' => $date->month,
                'year' => $date->year,
                'label' => $date->isoFormat('MMM YYYY'),
            ];
            $date->subMonth();
        }
        $months = array_reverse($months);

        $results = DB::table('orders')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total_price) as revenue')
            )
            ->where('order_status', 'completed')
            ->where('created_at', '>=', Carbon::create($months[0]['year'], $months[0]['month'], 1))
            ->groupBy('year', 'month')
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

