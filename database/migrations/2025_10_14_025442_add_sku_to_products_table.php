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
        Schema::table('products', function (Blueprint $table) {
            // Tambahkan kolom 'sku' setelah kolom 'name'
            // Kita buat nullable() biar data lama yang nggak punya sku nggak error
            $table->string('sku')->nullable()->unique()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Perintah untuk menghapus kolom jika kita mau rollback
            $table->dropColumn('sku');
        });
    }
};