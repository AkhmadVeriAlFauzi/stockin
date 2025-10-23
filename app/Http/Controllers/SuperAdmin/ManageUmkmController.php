<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Store;
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
        $stores = Store::with('user:id,name,email')
            ->latest() // Urutkan dari yang terbaru
            ->paginate(10); // Batasi 10 per halaman

        return Inertia::render('SuperAdmin/UMKM/Index', [
            'stores' => $stores,
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