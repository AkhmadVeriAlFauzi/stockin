<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        // Ambil filter periode dari request, default-nya 'last_30_days'
        $period = $request->input('period', 'last_30_days');
        $startDate = now();
        $endDate = now();

        // Tentukan rentang tanggal berdasarkan periode yang dipilih
        switch ($period) {
            case 'last_7_days':
                $startDate = now()->subDays(6)->startOfDay();
                break;
            case 'this_month':
                $startDate = now()->startOfMonth();
                break;
            case 'last_month':
                $startDate = now()->subMonth()->startOfMonth();
                $endDate = now()->subMonth()->endOfMonth();
                break;
            default: // last_30_days
                $startDate = now()->subDays(29)->startOfDay();
                break;
        }

        // --- Mulai Query ---
        $completedOrdersQuery = Order::where('order_status', 'completed')
                                     ->whereBetween('created_at', [$startDate, $endDate]);

        // --- 1. Hitung Kartu Statistik (KPIs) ---
        $totalRevenue = (clone $completedOrdersQuery)->sum('total_price');
        $totalOrdersCount = (clone $completedOrdersQuery)->count();
        $averageOrderValue = $totalOrdersCount > 0 ? $totalRevenue / $totalOrdersCount : 0;

        // --- 2. Siapkan Data untuk Grafik ---
        $salesData = (clone $completedOrdersQuery)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get([
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            ])
            ->map(function ($item) {
                return ['x' => $item->date, 'y' => (float) $item->total];
            });

        // --- 3. Ambil Daftar Transaksi Terbaru ---
        $recentTransactions = (clone $completedOrdersQuery)
            ->with('buyer:id,name')
            ->latest()
            ->take(10)
            ->get();
        
        // --- 4. Kirim Semua Data ke Frontend ---
        return Inertia::render('cms/finance/index', [
            'stats' => [
                'total_revenue' => $totalRevenue,
                'total_orders' => $totalOrdersCount,
                'average_order_value' => $averageOrderValue,
            ],
            'salesData' => $salesData,
            'recentTransactions' => $recentTransactions,
            // Kirim filter yang sedang aktif ke frontend
            'filters' => ['period' => $period],
        ]);
    }
}