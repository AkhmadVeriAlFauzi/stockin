<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        
        $store = Store::firstOrFail();
        $categories = ProductCategory::all(['id', 'name']);

        $products = Product::query()
            ->where('store_id', $store->id)
            ->with('category:id,name')
            ->when($request->input('category'), function ($query, $categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('cms/manageProduct/index', [
            'products' => $products,
            'categories' => $categories, 
            'filters' => $request->only(['search', 'category']),
        ]);
    }
    
    public function create()
    {
        $categories = ProductCategory::all(['id', 'name']);
        return Inertia::render('cms/manageProduct/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        // HAPUS dd() DARI SINI
        
        $store = Store::firstOrFail();
        
        // 1. Ambil SEMUA data yang sudah lolos validasi dari StoreProductRequest
        $validated = $request->validated(); 

        // 2. Cek apakah ada file gambar yang di-upload
        if ($request->hasFile('image')) {
            // Simpan gambar ke folder 'public/products' dan dapatkan path-nya
            $path = $request->file('image')->store('products', 'public');
            
            // Tambahkan URL gambar yang bisa diakses publik ke dalam data tervalidasi
            $validated['image_url'] = Storage::url($path);
        }

        // 3. Buat produk HANYA SEKALI dengan semua data yang sudah lengkap
        Product::create($validated + ['store_id' => $store->id]);

        // 4. Redirect kembali dengan pesan sukses
        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }
    
    public function edit(Product $product)
    {
        // Method ini tugasnya mengambil data produk yang mau diedit
        // dan menampilkannya di halaman form Edit.
        $categories = ProductCategory::all(['id', 'name']);
        return Inertia::render('cms/manageProduct/Edit', [
            'product' => $product, // Kirim data produk yang spesifik ke frontend
            'categories' => $categories,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $validated = $request->validated();

        // Logika untuk handle update gambar
        if ($request->hasFile('image')) {
            // Hapus gambar lama jika ada
            if ($product->image_url) {
                // Hapus '/storage/' dari awal path untuk mendapatkan path file yang benar
                $oldPath = str_replace('/storage/', '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            // Simpan gambar baru dan update path-nya
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        // Update produk dengan data baru
        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        // Hapus file gambar dari storage
        if ($product->image_url) {
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        // Hapus data produk dari database
        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}