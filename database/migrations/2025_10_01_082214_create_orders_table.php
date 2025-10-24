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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('shipping_address_id')->constrained('user_addresses');
            $table->decimal('total_price', 15, 2);
            $table->decimal('shipping_cost', 12, 2);
            $table->enum('order_status', ['pending_payment', 'processing', 'shipped', 'completed', 'cancelled', 'refunded']);
            $table->string('shipping_courier', 50);
            $table->string('shipping_resi', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
