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
        Schema::table('order_items', function (Blueprint $table) {
            // Hapus foreign key constraint dulu jika ada, lalu hapus kolomnya
            // Menambahkan ->nullable() untuk sementara jika ada data
            $table->dropForeign(['store_id']);
            $table->dropColumn('store_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Ini untuk jaga-jaga kalau kita mau rollback migrasinya
            $table->foreignId('store_id')->constrained('stores');
        });
    }
};