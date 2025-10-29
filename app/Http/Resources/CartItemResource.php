<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, // ID item keranjang, bukan ID produk
            'quantity' => (int) $this->quantity,
            // Sertakan detail produknya
            'product' => new ProductResource($this->whenLoaded('product')), 
            'added_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
