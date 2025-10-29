<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product; // <-- Import model Product
use Illuminate\Http\Request;
use App\Http\Resources\ProductResource; // <-- Kita akan buat Resource ini

class ProductController extends Controller
{
    /**
     * Menampilkan daftar semua produk (untuk publik/buyer).
     * Route: GET /api/products
     */
    public function index(Request $request)
    {
        // Ambil produk, sertakan info toko
        $productsQuery = Product::with('store:id,store_name') 
                            ->where('stock', '>', 0) // Hanya tampilkan produk yg ada stok
                            ->where('status', 'active') // Hanya produk yg aktif
                            ->whereHas('store', function($query){ // Pastikan tokonya aktif
                                $query->where('status', 'active');
                            }); 

        // Filter: Search (berdasarkan nama produk)
        if ($request->has('search')) {
            $productsQuery->where('name', 'like', '%' . $request->search . '%');
        }
        
        // Filter: Kategori (berdasarkan product_category_id)
        if ($request->has('category_id')) {
            $productsQuery->where('product_category_id', $request->category_id);
        }
        
        // Filter: Toko (berdasarkan store_id)
         if ($request->has('store_id')) {
            $productsQuery->where('store_id', $request->store_id);
        }

        // Paginasi biar nggak berat
        $products = $productsQuery->latest()->paginate(20)->withQueryString();

        // Gunakan API Resource untuk format output JSON yang rapi
        return ProductResource::collection($products);
    }

    /**
     * Menampilkan detail satu produk.
     * Route: GET /api/products/{product}
     */
    public function show(Product $product)
    {
         // Pastikan produk & tokonya aktif
        if ($product->status !== 'active' || $product->store->status !== 'active') {
             return response()->json(['message' => 'Product not found or inactive.'], 404);
        }
        
        // Load relasi yg mungkin dibutuhkan di detail (toko, kategori)
        $product->load([
            'store:id,store_name,city,logo_url', 
            'category:id,name' // Asumsi nama relasinya 'category'
        ]);

        // Gunakan API Resource
        return new ProductResource($product);
    }
}