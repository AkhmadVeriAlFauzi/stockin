<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckStoreActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil user yang lagi login
        $user = Auth::user();

        // 1. Cek dulu, dia udah setup toko belum?
        if (!$user->store) {
            // Kalo belum (status 'Pending Setup'), tendang ke dashboard
            // Asumsi route dashboard CMS adalah 'cms.dashboard'
            // Kalo beda, sesuain 'cms.dashboard' ini
            return redirect()->route('dashboard')
                ->with('error', 'Anda harus setup toko Anda terlebih dahulu.');
        }
        
        // 2. Kalo tokonya ada, cek statusnya udah 'active' belum?
        // Ingat, $user->store->status udah otomatis jadi string ('active', 'pending_verification', 'inactive')
        if ($user->store->status !== 'active') {
             // Kalo statusnya 'pending_verification' atau 'inactive', tendang juga
             return redirect()->route('dashboard')
                 ->with('error', 'Toko Anda belum aktif. Anda belum bisa mengakses halaman ini.');
        }

        // Kalo semua aman (toko ada DAN status 'active'), lolos!
        return $next($request);
    }
}