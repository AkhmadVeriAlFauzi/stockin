<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ProductCategoryController extends Controller
{
    /**
     * Menampilkan daftar semua kategori produk.
     */
    public function index()
    {
        $categories = ProductCategory::latest()->paginate(10);

        return Inertia::render('SuperAdmin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Method create tidak kita gunakan karena form akan ditampilkan via modal.
     */
    public function create()
    {
        //
    }

    /**
     * Menyimpan kategori produk baru ke database.
     */
    public function store(Request $request)
{
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_categories,name',
            'description' => 'nullable|string',
        ]);

        // Baris ini yang membuat slug secara otomatis
        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

        ProductCategory::create($validated);

        return back()->with('success', 'Kategori berhasil ditambahkan.');
    }

    /**
     * Menampilkan detail kategori (tidak kita gunakan).
     */
    public function show(ProductCategory $productCategory)
    {
        //
    }

    /**
     * Method edit tidak kita gunakan karena form akan ditampilkan via modal.
     */
    public function edit(ProductCategory $productCategory)
    {
        //
    }

    /**
     * Mengupdate kategori produk yang ada.
     */
    public function update(Request $request, ProductCategory $productCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:product_categories,name,' . $productCategory->id,
            'description' => 'nullable|string',
        ]);

        $productCategory->update($request->all());

        return back()->with('success', 'Kategori berhasil diperbarui.');
    }

    /**
     * Menghapus kategori produk dari database.
     */
    public function destroy(ProductCategory $productCategory)
    {
        // TODO: Tambahkan logika untuk cek apakah kategori ini sedang dipakai oleh produk.
        // Jika iya, jangan izinkan hapus. Untuk sekarang, kita langsung hapus saja.

        $productCategory->delete();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }
}