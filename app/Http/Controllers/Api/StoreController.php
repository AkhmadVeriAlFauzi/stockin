<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
// Use your existing web request or create a specific one for API
// If UpdateStoreRequest is too strict for creation, consider a CreateStoreRequest
use App\Http\Requests\UpdateStoreRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // <-- Import Auth facade
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    /**
     * Create a new store for the authenticated user (must be umkm_admin).
     * Route: POST /api/stores (requires auth & role umkm_admin)
     */
    public function store(UpdateStoreRequest $request) // <-- Consider changing Request Type if validation differs
    {
        $user = $request->user(); // Get authenticated user

        // Ensure user doesn't already have a store
        if ($user->store) {
            return response()->json(['message' => 'User already has a store. Use PUT /api/store to update.'], 409); // Conflict status code
        }

        $validated = $request->validated();

        // Handle logo upload if provided
        $logoUrl = null; // Default to null
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $logoUrl = Storage::url($path);
            $validated['logo_url'] = $logoUrl; // Add logo_url to validated data if uploaded
        }

        // Create the new store, status is active by default
        // Merge validated data with default status
        $store = $user->store()->create(array_merge($validated, [
            'status' => 'active' // Set default status on creation
        ]));

        // Load the relationship before returning for consistency
        $user->load('store');

        return response()->json([
            'message' => 'Store created successfully',
            'store'   => $store, // Return the newly created store data
            // 'user'    => $user // Optionally return the updated user object too
        ], 201); // Status Created
    }

    /**
     * Update the authenticated user's existing store (must be umkm_admin).
     * Route: PUT /api/store (requires auth & role umkm_admin)
     */
    public function update(UpdateStoreRequest $request) // <-- Validation request
    {
        $user = $request->user(); // Get authenticated user
        $store = $user->store;

        // Ensure user has a store to update
        if (!$store) {
            return response()->json(['message' => 'Store not found for this user. Use POST /api/stores to create.'], 404); // Not Found status code
        }

        $validated = $request->validated();
        $oldLogoPath = $store->logo_url ? str_replace('/storage/', '', $store->logo_url) : null;

        // Handle logo upload if provided
        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_url'] = Storage::url($path); // Add/overwrite logo_url in validated data

            // Delete old logo only if a new one is successfully stored AND old one exists
            if ($oldLogoPath) {
                 Storage::disk('public')->delete($oldLogoPath);
            }
        }
        // Optional: Handle logo deletion if 'logo' is sent as null or empty?
        // else if ($request->exists('logo') && is_null($request->input('logo'))) {
             // Handle deletion? Or maybe a separate endpoint is better.
             // if ($oldLogoPath) { Storage::disk('public')->delete($oldLogoPath); }
             // $validated['logo_url'] = null;
        // }


        // Update the store data
        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully',
            'store' => $store->fresh() // Return updated data by refetching from DB
        ]);
    }
}