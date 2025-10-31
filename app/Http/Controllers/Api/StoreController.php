<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\StoreResource;
use App\Http\Resources\ProductResource;

class StoreController extends Controller
{
    /**
     * [BARU] Menampilkan daftar semua toko (untuk publik/buyer).
     * Route: GET /api/stores
     */
    public function index(Request $request)
    {
        $storesQuery = Store::where('status', 'active'); 
        // --- AKHIR PERUBAHAN ---

        if ($request->has('search')) {
            $storesQuery->where('store_name', 'like', '%' . $request->search . '%');
        }
        if ($request->has('city')) {
            $storesQuery->where('city', 'like', '%' . $request->city . '%');
        }

        $stores = $storesQuery->latest()->paginate(15)->withQueryString();
        return StoreResource::collection($stores);
    }

    /**
     * [BARU] Menampilkan detail satu toko beserta produknya.
     * Route: GET /api/stores/{store}
     */
    public function show(Store $store)
    {
        // --- BAGIAN INI UDAH BENER, NGGAK USAH DIUBAH ---
        // Kenapa? Karena $store adalah Model, jadi Accessor 'status()' jalan.
        // Dia otomatis nerjemahin angka 1 -> string 'active'
        if ($store->status !== 'active') { 
        // --- 
            return response()->json(['message' => 'Store not found or inactive.'], 404);
        }

        $products = $store->products()
                          // Kita juga harus benerin ini di ProductController nanti
                          ->where('status', 'active') // Asumsi produk juga punya status
                          ->where('stock', '>', 0)
                          ->latest()
                          ->paginate(10, ['*'], 'productsPage');

        return (new StoreResource($store))
                    ->additional(['products' => ProductResource::collection($products)]);
    }


    /**
     * [LAMA] Create a new store for the authenticated user (must be umkm_admin).
     */
    public function store(UpdateStoreRequest $request)
    {
        // ... (Kode store() lo udah BENER, jangan diubah lagi) ...
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
        $dataToCreate = array_merge($validated, [
            'status' => 'pending_verification' 
        ]);

        $store = $user->store()->create($dataToCreate); // Ini udah bener

        $user->load('store');

        return response()->json([
            'message' => 'Store created successfully and is awaiting approval.',
            'store'   => $store,
        ], 201);
    }

    /**
     * [LAMA] Update the authenticated user's existing store (must be umkm_admin).
     */
    public function update(UpdateStoreRequest $request)
    {
        // ... (Kode update() lo udah BENER, jangan diubah lagi) ...
        $user = $request->user();
        $store = $user->store;

        if (!$store) {
            return response()->json(['message' => 'Store not found for this user.'], 404);
        }

        $validated = $request->validated();
        unset($validated['status']);
        
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