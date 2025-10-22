<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class RegisteredUserController extends Controller
{
    /**
     * Menampilkan halaman/form registrasi.
     */
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Menerima dan memproses data dari form registrasi.
     */
    public function store(Request $request)
    {
        // 1. Validasi data yang masuk
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // 2. Buat user baru di database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Password WAJIB di-hash!
        ]);

        // 3. Login-kan user yang baru dibuat secara otomatis
        Auth::login($user);

        // 4. Redirect ke halaman dashboard
        return redirect('/dashboard');
    }
}