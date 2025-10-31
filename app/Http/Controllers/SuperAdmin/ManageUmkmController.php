<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request; // <-- 1. TAMBAH INI
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse; 
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Route; 

class ManageUmkmController extends Controller
{
    /**
     * Menampilkan daftar semua UMKM (toko).
     */
    public function index(Request $request) // <-- 2. TAMBAH 'Request $request'
    {
        // 3. UBAH JADI 'query()' DULU
        $usersQuery = User::where('role', 'umkm_admin')
            ->with('store')
            ->latest();

        // --- 4. TAMBAHKAN LOGIC FILTER ---

        // Filter by Search (User Name OR Store Name)
        $usersQuery->when($request->input('search'), function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($storeQuery) use ($search) {
                      $storeQuery->where('store_name', 'like', "%{$search}%");
                  });
            });
        });

        // Filter by Status
        $usersQuery->when($request->input('status'), function ($query, $status) {
            match ($status) {
                'pending_setup' => $query->doesntHave('store'),
                // Ganti 'pending_approval' jadi 'pending_verification' (sesuai ENUM DB lo)
                'pending_verification' => $query->whereHas('store', fn($q) => $q->where('status', 'pending_verification')), 
                'active' => $query->whereHas('store', fn($q) => $q->where('status', 'active')),
                'inactive' => $query->whereHas('store', fn($q) => $q->where('status', 'inactive')),
                default => null,
            };
        });
        
        // --- AKHIR LOGIC FILTER ---

        // 5. EKSEKUSI QUERY & TAMBAH withQueryString()
        $users = $usersQuery->paginate(10)->withQueryString();

        // (Logic 'through' buat nambahin URL biarin aja, udah bener)
        $users->through(function ($user) {
            if ($user->store) {
                $user->store->approve_url = Route::has('umkm.approve') ? route('umkm.approve', $user->store->id) : null;
                $user->store->suspend_url = Route::has('umkm.suspend') ? route('umkm.suspend', $user->store->id) : null;
                $user->store->reactivate_url = Route::has('umkm.reactivate') ? route('umkm.reactivate', $user->store->id) : null;
            }
            return $user;
        });

        return Inertia::render('SuperAdmin/UMKM/Index', [
            'users' => $users,
            // 6. OPER FILTER KEMBALI KE VIEW
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    // ... (sisa method approve, suspend, reactivate, dll biarin aja, udah bener) ...

    public function approve(Store $store): RedirectResponse
    {
        $store->update(['status' => 'active' ]);
        return Redirect::route('manage-umkm.index')->with('success', 'Store approved successfully.');
    }

    public function suspend(Store $store): RedirectResponse
    {
        $store->update(['status' => 'inactive' ]);
        return Redirect::route('manage-umkm.index')->with('success', 'Store has been suspended.');
    }

    public function reactivate(Store $store): RedirectResponse
    {
        $store->update(['status' => 'active' ]);
        return Redirect::route('manage-umkm.index')->with('success', 'Store has been reactivated.');
    }
    
    public function create() { /* ... */ }
    public function store(Request $request) { /* ... */ }
    public function show(Store $store) { /* ... */ }
    public function edit(Store $store) { /* ... */ }
    public function update(Request $request, Store $store) { /* ... */ }
    public function destroy(Store $store) { /* ... */ }
}