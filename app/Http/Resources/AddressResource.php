<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AddressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Ambil semua data dari model, $casts sudah handle boolean
        // return parent::toArray($request);

        // Atau jika ingin lebih eksplisit:
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'label' => $this->label,
            'recipient_name' => $this->recipient_name,
            'phone_number' => $this->phone_number,
            'full_address' => $this->full_address,
            'is_default' => $this->is_default, // Casting di model sudah handle ini
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}

