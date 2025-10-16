<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule; // <-- Jangan lupa import ini

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Ubah jadi true untuk mengizinkan request
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Daftar status yang valid, sesuai dengan migrasi database
        $validStatuses = [
            'pending_payment', 
            'processing', 
            'shipped', 
            'completed', 
            'cancelled', 
            'refunded'
        ];

        return [
            // 'order_status' wajib diisi dan harus salah satu dari daftar di atas
            'order_status' => ['required', 'string', Rule::in($validStatuses)],
            
            // 'shipping_resi' boleh kosong, tapi kalau diisi harus string
            'shipping_resi' => ['nullable', 'string', 'max:100'],
        ];
    }
}