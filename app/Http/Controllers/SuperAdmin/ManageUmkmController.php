<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageUmkmController extends Controller
{
    /**
     * Menampilkan daftar semua UMKM (toko).
     */
    public function index()
    {
        // Ambil semua data toko, beserta data user (pemiliknya)
        $users = User::where('role', 'umkm_admin')
            ->with('store') // Ambil relasi store-nya (bisa null kalo belum setup)
            ->latest()      // Urutkan dari user terbaru
            ->paginate(10);

        return Inertia::render('SuperAdmin/UMKM/Index', [
            'users' => $users,
        ]);
    }

    // --- Method lain akan kita isi nanti saat dibutuhkan ---

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