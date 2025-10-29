<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store; // <-- Import model Store
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\StoreResource; // <-- Import Resource Store
use App\Http\Resources\ProductResource; // <-- Import Resource Product

class StoreController extends Controller
{
    /**
     * [BARU] Menampilkan daftar semua toko (untuk publik/buyer).
     * Hanya tampilkan toko yang statusnya 'active'.
     * Route: GET /api/stores
     */
    public function index(Request $request)
    {
        $storesQuery = Store::where('status', 'active');

        // Filter: Search (berdasarkan nama toko)
        if ($request->has('search')) {
            $storesQuery->where('store_name', 'like', '%' . $request->search . '%');
        }
        
        // Filter: Kota
        if ($request->has('city')) {
            $storesQuery->where('city', 'like', '%' . $request->city . '%');
        }

        $stores = $storesQuery->latest()->paginate(15)->withQueryString();

        // Gunakan API Resource
        return StoreResource::collection($stores);
    }

    /**
     * [BARU] Menampilkan detail satu toko beserta produknya.
     * Hanya tampilkan jika status toko 'active'.
     * Route: GET /api/stores/{store}
     */
    public function show(Store $store)
    {
        if ($store->status !== 'active') {
            return response()->json(['message' => 'Store not found or inactive.'], 404);
        }

        // Load produk milik toko ini (yang aktif & ada stok) + paginasi
        $products = $store->products()
                          ->where('status', 'active')
                          ->where('stock', '>', 0)
                          ->latest()
                          ->paginate(10, ['*'], 'productsPage'); // Nama query param beda

        // Gunakan API Resource untuk Store, dan sertakan data produk yg sudah dipaginasi
        return (new StoreResource($store))
                    ->additional(['products' => ProductResource::collection($products)]);
    }


    // --- Method store() dan update() yang lama tetap di sini ---
    // (Method untuk UMKM Admin membuat/mengupdate tokonya sendiri)

    /**
     * [LAMA] Create a new store for the authenticated user (must be umkm_admin).
     * Route: POST /api/stores (requires auth & role umkm_admin)
     */
    public function store(UpdateStoreRequest $request)
    {
        $user = $request->user();

        if ($user->store) {
            return response()->json(['message' => 'User already has a store. Use PUT /api/store to update.'], 409);
        }

        $validated = $request->validated();
        $logoUrl = null;
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $logoUrl = Storage::url($path);
            $validated['logo_url'] = $logoUrl;
        }

        $store = $user->store()->create(array_merge($validated, [
            'status' => 'active'
        ]));

        $user->load('store');

        return response()->json([
            'message' => 'Store created successfully',
            'store'   => $store,
        ], 201);
    }

    /**
     * [LAMA] Update the authenticated user's existing store (must be umkm_admin).
     * Route: PUT /api/store (requires auth & role umkm_admin)
     */
    public function update(UpdateStoreRequest $request)
    {
        $user = $request->user();
        $store = $user->store;

        if (!$store) {
            return response()->json(['message' => 'Store not found for this user.'], 404);
        }

        $validated = $request->validated();
        $oldLogoPath = $store->logo_url ? str_replace('/storage/', '', $store->logo_url) : null;

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = Storage::url($path);
            if ($oldLogoPath) {
                 Storage::disk('public')->delete($oldLogoPath);
            }
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'store' => $store->fresh()
        ]);
    }
}