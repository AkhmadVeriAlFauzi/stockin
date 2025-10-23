<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Menampilkan halaman edit profil.
     */
    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit');
    }

    /**
     * Mengupdate password user.
     */
    public function updatePassword(Request $request)
    {
        // 1. Lakukan validasi
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        // 2. Update password di database
        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        // 3. Redirect kembali dengan pesan sukses
        return back()->with('success', 'Password berhasil diperbarui.');
    }
}