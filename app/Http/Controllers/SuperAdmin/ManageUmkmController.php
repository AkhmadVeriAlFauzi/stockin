<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse; 
use Illuminate\Support\Facades\Redirect;

class ManageUmkmController extends Controller
{
    /**
     * Menampilkan daftar semua UMKM (toko).
     */
    public function index()
    {
        // Ambil semua data toko, beserta data user (pemiliknya)
        $users = User::where('role', 'umkm_admin')
            ->with('store')
            ->latest()
            ->paginate(10);

        return Inertia::render('SuperAdmin/UMKM/Index', [
            'users' => $users,
        ]);
    }

    public function approve(Store $store): RedirectResponse
    {
        $store->update(['status' => 'active' ]);
        
        // Kirim notifikasi ke user (Opsional, tapi bagus)
        // Mail::to($store->user->email)->send(new StoreApprovedMail($store));

        return Redirect::route('superadmin.umkm.index')->with('success', 'Store approved successfully.');
    }

    public function suspend(Store $store): RedirectResponse
    {
        $store->update(['status' => 'inactive' ]);
        return Redirect::route('superadmin.umkm.index')->with('success', 'Store has been suspended.');
    }

    public function reactivate(Store $store): RedirectResponse
    {
        $store->update(['status' => 'active' ]);
        return Redirect::route('superadmin.umkm.index')->with('success', 'Store has been reactivated.');
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(Store $store)
    {
        //
    }

    public function edit(Store $store)
    {
        //
    }

    public function update(Request $request, Store $store)
    {
        //
    }

    public function destroy(Store $store)
    {
        //
    }
}