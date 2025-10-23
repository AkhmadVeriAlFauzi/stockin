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
        // Ambil user yang sedang login
        $user = $request->user();
        
        // Mulai query dari relasi, bukan dari semua produk.
        // Ini secara otomatis HANYA akan mengambil produk milik toko si user.
        $productsQuery = $user->store->products()->with(['category:id,name']);

        // Terapkan filter yang sudah ada
        $products = $productsQuery
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
            'categories' => ProductCategory::all(['id', 'name']),
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
        $validated = $request->validated(); 

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        // Ambil toko milik user yang login, lalu buat produk di sana.
        $request->user()->store->products()->create($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }
    
    public function edit(Request $request, Product $product)
    {
        // PENTING: Cek kepemilikan produk sebelum menampilkan halaman edit
        if ($product->store_id !== $request->user()->store->id) {
            abort(403); // Tampilkan halaman "Akses Ditolak"
        }

        $categories = ProductCategory::all(['id', 'name']);
        return Inertia::render('cms/manageProduct/Edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        // PENTING: Cek kepemilikan produk sebelum update
        if ($product->store_id !== $request->user()->store->id) {
            abort(403);
        }

        $validated = $request->validated();
        if ($request->hasFile('image')) {
            if ($product->image_url) {
                $oldPath = str_replace('/storage/', '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($path);
        }
        $product->update($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Request $request, Product $product)
    {
        // PENTING: Cek kepemilikan produk sebelum menghapus
        if ($product->store_id !== $request->user()->store->id) {
            abort(403);
        }

        if ($product->image_url) {
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }
        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}