<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Izinkan semua user yang sudah login untuk update tokonya sendiri
        return true;
    }

    public function rules(): array
    {
        return [
            'store_name'  => 'required|string|max:255',
            'description' => 'nullable|string',
            'address'     => 'nullable|string',
            'city'        => 'nullable|string|max:100',
            'logo'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // Max 2MB
        ];
    }
}