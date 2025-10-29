<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade

class UserController extends Controller
{
    /**
     * Update user role from 'user' to 'umkm_admin'.
     * Route: POST /api/user/request-seller-role (requires auth)
     */
    public function requestSellerRole(Request $request)
    {
        $user = $request->user(); // Get authenticated user

        // Prevent update if already seller or other roles
        if ($user->role !== 'user') {
             return response()->json([
                'message' => $user->role === 'umkm_admin' ? 'User already has seller role.' : 'Invalid user role for this action.',
                'user' => $user->load('store') // Return current user state
            ], $user->role === 'umkm_admin' ? 200 : 403); // OK if already seller, Forbidden otherwise
        }

        // Update role
        $user->role = 'umkm_admin';
        $user->save();

        return response()->json([
            'message' => 'User role updated to umkm_admin. Please proceed to store setup.',
            'user' => $user // Store is still null here
        ]);
    }

    // You can add other user-related API methods here later (e.g., get profile)
    // public function profile(Request $request) {
    //     return response()->json(['user' => $request->user()->load('store')]);
    // }
}