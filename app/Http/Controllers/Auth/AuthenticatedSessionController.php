<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    /**
     * Menampilkan halaman/form login.
     */
    public function create()
    {
        return Inertia::render('Auth/Login');
    }

    /**
     * Memproses permintaan login.
     */
    public function store(Request $request)
    {
        // 1. Validasi email dan password
        $credentials = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 2. Coba lakukan otentikasi
        if (Auth::attempt($credentials)) {
            // Jika berhasil, regenerate session
            $request->session()->regenerate();
            // Redirect ke dashboard
            return redirect()->intended('/dashboard');
        }

        // 3. Jika gagal, kembali ke halaman login dengan pesan error
        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }
    // app/Http/Controllers/Auth/AuthenticatedSessionController.php

// ... (tambahkan di bawah method store)
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/'); // Redirect ke halaman utama setelah logout
    }
}