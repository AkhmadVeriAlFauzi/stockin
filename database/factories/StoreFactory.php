<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(), // Otomatis membuat user baru untuk toko ini jika tidak disediakan
            'store_name' => fake()->company() . ' Supplier',
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'status' => 'active',
        ];
    }
}