<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
// Kamu mungkin perlu bikin CategoryResource juga
// use App\Http\Resources\CategoryResource; 

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price, // Pastikan jadi angka
            'stock' => (int) $this->stock,   // Pastikan jadi integer
            'image_url' => $this->image_url, // URL gambar utama
            'status' => $this->status,
            'category_id' => $this->product_category_id, // Ambil dari info file kamu
            
            // Tampilkan data relasi jika sudah di-load (pakai whenLoaded)
            'store' => new StoreResource($this->whenLoaded('store')),
            'category' => new CategoryResource($this->whenLoaded('category')), // Ganti CategoryResource
            
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}