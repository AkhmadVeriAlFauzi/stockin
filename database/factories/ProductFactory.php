<?php

namespace Database\Factories;

use App\Models\ProductCategory;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'store_id' => Store::factory(), // Otomatis membuat store baru jika tidak disediakan
            'category_id' => ProductCategory::inRandomOrder()->first()->id, // Mengambil ID kategori secara acak
            'name' => fake()->words(3, true),
            'description' => fake()->paragraph(3),
            'price' => fake()->numberBetween(5000, 150000),
            'stock' => fake()->numberBetween(20, 200),
            'status' => 'active',
        ];
    }
}