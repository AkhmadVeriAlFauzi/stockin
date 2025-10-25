<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;

class FinanceController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $store = $user->store()->firstOrFail();

        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $completedOrdersQuery = $store->orders()->where('order_status', 'completed');

        $totalRevenue = (clone $completedOrdersQuery)->sum('total_price');
        $totalOrdersCompleted = (clone $completedOrdersQuery)->count();

        $filteredQuery = (clone $completedOrdersQuery)
            ->whereMonth('created_at', $month)
            ->whereYear('created_at', $year);

        $revenueForPeriod = (clone $filteredQuery)->sum('total_price');

        $periodName = Carbon::create($year, $month)->isoFormat('MMMM YYYY');

        $recentTransactions = (clone $filteredQuery)
            ->with(['buyer:id,name', 'items.product:id,name','shippingAddress'])
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('cms/finance/index', [
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalOrdersCompleted' => $totalOrdersCompleted,
                'revenueForPeriod' => (float) $revenueForPeriod, // Ganti dari revenueThisMonth
                'periodName' => $periodName, // Kirim nama periode
            ],
            'transactions' => $recentTransactions,
            'filters' => [ // Kirim filter yang aktif biar dropdown-nya ke-select
                'month' => (int) $month,
                'year' => (int) $year,
            ],
        ]);
    }
    public function export(Request $request)
    {
        $store = Auth::user()->store()->firstOrFail();

        // Ambil filter yang sama persis dengan method index
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        // Buat nama file yang dinamis
        $period = Carbon::create($year, $month)->isoFormat('MMMM-YYYY');
        $fileName = 'laporan-keuangan-' . $period . '.xlsx'; // <-- Ekstensi .xlsx

        // Panggil resep export dan download filenya
        return Excel::download(
            new TransactionsExport($store->id, (int)$month, (int)$year), 
            $fileName
        );
    }
}