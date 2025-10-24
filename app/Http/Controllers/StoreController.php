<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateStoreRequest;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoreController extends Controller
{
    /**
     * Menampilkan form untuk mengedit info toko.
     */
    public function edit()
    {
        // Ambil data toko pertama yang ada di database.
        // Jika tidak ada, akan error 404.
        $store = Auth::user()->store()->firstOrFail();

        // Render halaman frontend dan kirim data toko
        return Inertia::render('cms/manageStore/Edit', [
            'store' => $store,
        ]);
    }

    /**
     * Memproses update data info toko.
     */
    public function update(UpdateStoreRequest $request)
    {
        // Ambil data toko yang mau di-update
        $store = Auth::user()->store()->firstOrFail();
        
        // Validasi otomatis dijalankan oleh UpdateStoreRequest
        $validated = $request->validated();

        // Cek apakah ada file logo baru yang di-upload
        if ($request->hasFile('logo')) {
            // Hapus logo lama jika ada
            if ($store->logo_url) {
                // Ubah URL (/storage/logos/...) menjadi path (logos/...)
                $oldPath = str_replace('/storage/', '', $store->logo_url);
                Storage::disk('public')->delete($oldPath);
            }

            // Simpan logo baru ke folder 'public/logos'
            $path = $request->file('logo')->store('logos', 'public');
            // Tambahkan URL logo baru yang bisa diakses publik ke data tervalidasi
            $validated['logo_url'] = Storage::url($path);
        }

        // Update data toko di database
        $store->update($validated);

        // Redirect kembali ke halaman yang sama dengan pesan sukses
        return redirect()->back()->with('success', 'Informasi toko berhasil diperbarui.');
    }
}