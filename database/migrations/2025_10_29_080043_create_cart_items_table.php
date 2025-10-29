<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            // Siapa pemilik keranjang ini?
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); 
            // Produk apa yang ditambah?
            $table->foreignId('product_id')->constrained()->onDelete('cascade'); 
             // Berapa banyak?
            $table->unsignedInteger('quantity');
            $table->timestamps();

            // Opsional: Pastikan user nggak nambah produk yg sama 2x (cukup update quantity)
            $table->unique(['user_id', 'product_id']); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};