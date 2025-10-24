<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
// Tambahkan use statement untuk Form Request jika belum ada
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;


class ProductController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user->store) {
            // Pointing ke path lama, tapi dengan prop needsSetup
            return Inertia::render('cms/manageProduct/Index', [
                'needsSetup' => true,
            ]);
        }

        $productsQuery = $user->store->products()->with(['category:id,name'])->latest();

        $productsQuery->when($request->input('search'), function ($query, $search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%");
        });

        $productsQuery->when($request->input('category'), function ($query, $categoryId) {
            $query->where('category_id', $categoryId);
        });

        $products = $productsQuery->paginate(10)->withQueryString();

        return Inertia::render('cms/manageProduct/Index', [
            'products' => $products,
            'needsSetup' => false,
            // Kirim juga data categories dan filters untuk UI
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'category']),
        ]);
    }
    
    public function create()
    {
        if (!Auth::user()->store) {
            return redirect()->route('store.edit')->with('error', 'You need to create a store first.');
        }

        return Inertia::render('cms/manageProduct/Create', [
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $validated = $request->validated(); 

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = Storage::url($path);
        }

        $request->user()->store->products()->create($validated);

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }
    
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        return Inertia::render('cms/manageProduct/Edit', [
            'product' => $product,
            'categories' => ProductCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

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

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        if ($product->image_url) {
            // Hapus '/storage/' dari awal path untuk mendapatkan path file yang benar
            $oldPath = str_replace('/storage/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }
        
        // 3. Hapus data produk dari database
        $product->delete();

        // 4. Kembali ke halaman sebelumnya dengan notifikasi sukses
        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}