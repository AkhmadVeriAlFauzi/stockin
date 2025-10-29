<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\Request;
use App\Http\Resources\AddressResource;
use Illuminate\Support\Facades\Auth; // <-- Optional, bisa pakai $request->user()
use Illuminate\Validation\Rule; // <-- Untuk validasi
use Illuminate\Support\Facades\DB; // <-- Tambah untuk transaction

class AddressController extends Controller
{
    /**
     * Menampilkan daftar alamat milik user yang login.
     * Route: GET /api/addresses (requires auth)
     */
    public function index(Request $request)
    {
        // Ambil alamat user, urutkan agar default di atas (opsional)
        $addresses = $request->user()->addresses()
                            ->orderBy('is_default', 'desc') // Default address first
                            ->latest() // Then by latest created
                            ->get();
        return AddressResource::collection($addresses);
    }

    /**
     * Menyimpan alamat baru untuk user yang login.
     * Route: POST /api/addresses (requires auth)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Validasi input
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:50'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'phone_number' => ['required', 'string', 'max:20'], // Sesuaikan max
            'full_address' => ['required', 'string', 'max:1000'], // Sesuaikan max
            'is_default' => ['sometimes', 'boolean'], // sometimes = opsional
        ]);

        // Gunakan transaction untuk memastikan konsistensi is_default
        DB::transaction(function () use ($user, $validated, $request) {
            // Jika is_default=true, set alamat lain jadi false dulu
            if ($request->boolean('is_default')) {
                $user->addresses()->update(['is_default' => false]);
                $validated['is_default'] = true; // Pastikan nilai true masuk
            }
            // Jika user belum punya alamat sama sekali, buat ini jadi default
            else if ($user->addresses()->doesntExist()) {
                 $validated['is_default'] = true;
            } else {
                 // Jika tidak diset default, pastikan nilainya false
                 $validated['is_default'] = false;
            }

            // Buat alamat baru
            $address = $user->addresses()->create($validated);

            // Set $address ke variabel luar scope transaction (jika perlu)
             // $createdAddress = $address;
        });

        // Ambil lagi alamat yang baru dibuat (karena $address di dalam transaction)
        // Cara sederhana: ambil yang paling baru
        $newAddress = $user->addresses()->latest('id')->first();


        return response()->json([
            'message' => 'Address created successfully',
            'address' => new AddressResource($newAddress), // Kirim resource
        ], 201); // Status Created
    }

    /**
     * Menampilkan detail satu alamat (opsional).
     * Route: GET /api/addresses/{address} (requires auth)
     */
    public function show(Request $request, UserAddress $address)
    {
        // Pastikan alamat ini milik user yg login (Authorization Policy lebih baik)
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return new AddressResource($address);
    }

    /**
     * Mengupdate alamat yang ada.
     * Route: PUT /api/addresses/{address} (requires auth)
     */
    public function update(Request $request, UserAddress $address)
    {
        // Pastikan alamat ini milik user yg login
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = $request->user(); // Kita butuh user object

        // Validasi input (gunakan sometimes agar field yg tidak dikirim tidak divalidasi)
         $validated = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:50'],
            'recipient_name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone_number' => ['sometimes', 'required', 'string', 'max:20'],
            'full_address' => ['sometimes', 'required', 'string', 'max:1000'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        // Gunakan transaction untuk konsistensi is_default
        DB::transaction(function () use ($user, $address, $validated, $request) {
             // Logic: Jika is_default=true, set alamat lain (milik user ini) jadi false dulu
            if ($request->has('is_default') && $request->boolean('is_default')) {
                $user->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
                $validated['is_default'] = true; // Pastikan nilai true masuk ke update
            }
             // Logic: Mencegah unset default jika ini satu-satunya alamat
             else if ($request->has('is_default') && !$request->boolean('is_default')) {
                 if ($user->addresses()->count() === 1 && $address->is_default) {
                     // Jika ini satu2nya alamat dan sudah default, jangan biarkan jadi false
                     // Kita bisa lempar error atau abaikan saja perubahan is_default
                     unset($validated['is_default']); // Abaikan perubahan is_default
                     // Atau: throw ValidationException::withMessages(['is_default' => 'Cannot unset default on the only address.']);
                 } else {
                     // Jika ada alamat lain, boleh di-set false
                     $validated['is_default'] = false;
                 }
             }

            // Update alamat
            $address->update($validated);
        });


        return response()->json([
            'message' => 'Address updated successfully',
            'address' => new AddressResource($address->fresh()), // Ambil data terbaru
        ]);
    }

    /**
     * Menghapus alamat.
     * Route: DELETE /api/addresses/{address} (requires auth)
     */
    public function destroy(Request $request, UserAddress $address)
    {
        // Pastikan alamat ini milik user yg login
        if ($address->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Logic jika menghapus alamat default: set alamat lain jadi default?
        if ($address->is_default && $request->user()->addresses()->count() > 1) {
            // Ambil alamat lain (misal yg paling baru) dan set jadi default
            $newDefault = $request->user()->addresses()
                                ->where('id', '!=', $address->id)
                                ->latest() // Atau order by lain
                                ->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted successfully.']);
    }

     /**
      * Set alamat sebagai default.
      * Route: PATCH /api/addresses/{address}/set-default (requires auth)
      */
     public function setDefault(Request $request, UserAddress $address)
     {
         // Pastikan alamat ini milik user yg login
         if ($address->user_id !== $request->user()->id) {
             return response()->json(['message' => 'Forbidden'], 403);
         }

         $user = $request->user();

         // Gunakan transaction
         DB::transaction(function () use ($user, $address) {
             // Set semua alamat user ini jadi false dulu
             $user->addresses()->update(['is_default' => false]);
             // Set alamat yg dipilih jadi true
             $address->update(['is_default' => true]);
         });


         return response()->json([
             'message' => 'Default address updated successfully.',
             'address' => new AddressResource($address->fresh()), // Kirim data terbaru
         ]);
     }
}

