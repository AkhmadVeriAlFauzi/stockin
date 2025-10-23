<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Cek apakah user sudah login DAN rolenya sesuai dengan yang diizinkan.
        //    Contoh: Jika rute butuh role 'superadmin', maka $role akan berisi 'superadmin'.
        if (! $request->user() || ! $request->user()->hasRole($role)) {
            // 2. Jika tidak cocok, tolak aksesnya.
            //    abort(403) akan menampilkan halaman "403 Forbidden | Access Denied".
            abort(403);
        }

        // 3. Jika cocok, izinkan request untuk melanjutkan ke halaman tujuan.
        return $next($request);
    }
}