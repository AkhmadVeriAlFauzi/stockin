<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
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
            'store_name' => $this->store_name,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'logo_url' => $this->logo_url,
            // 'owner' => new UserResource($this->whenLoaded('user')),
            'registered_at' => $this->created_at ? $this->created_at->format('Y-m-d H:i:s') : null,
        ];
    }
}