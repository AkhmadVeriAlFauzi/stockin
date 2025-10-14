<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Store;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat Kategori Produk secara manual karena datanya cenderung tetap
        $this->command->info('Creating product categories...');
        $categories = [
            ['name' => 'Tepung & Biji-bijian', 'slug' => 'tepung-biji-bijian'],
            ['name' => 'Bumbu & Rempah', 'slug' => 'bumbu-rempah'],
            ['name' => 'Bahan Kue', 'slug' => 'bahan-kue'],
            ['name' => 'Produk Susu & Olahannya', 'slug' => 'produk-susu'],
            ['name' => 'Daging Beku', 'slug' => 'daging-beku'],
            ['name' => 'Kemasan & Label', 'slug' => 'kemasan-label'],
        ];
        foreach ($categories as $category) {
            ProductCategory::create($category);
        }
        $this->command->info('Product categories created.');

        // 2. Buat satu Akun Admin untuk testing
        $this->command->info('Creating admin user...');
        User::create([
            'name' => 'Admin Platform',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '081234567890',
        ]);
        $this->command->info('Admin user created. Email: admin@example.com, Pass: password');

        // 3. Buat beberapa User yang juga punya Toko dan Produk
        $this->command->info('Creating users with stores and products...');
        User::factory(5) // Buat 5 user baru
            ->has(
                Store::factory() // Setiap user punya 1 toko
                    ->has(
                        Product::factory()->count(20) // Setiap toko punya 20 produk acak
                    )
            )
            ->has(
                \App\Models\UserAddress::factory()->count(2) // Setiap user punya 2 alamat
            )
            ->create();
        $this->command->info('5 users with stores, products, and addresses created.');
        
        // 4. Buat beberapa User biasa (hanya pembeli)
        $this->command->info('Creating regular buyer users...');
        User::factory(10)
            ->has(
                \App\Models\UserAddress::factory()->count(1)
            )
            ->create();
        $this->command->info('10 regular buyer users created.');
    }
}