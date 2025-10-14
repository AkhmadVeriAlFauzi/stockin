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
        // Perintah untuk MENGUBAH tabel users
        Schema::table('users', function (Blueprint $table) {
            // Tambahkan kolom baru setelah kolom 'email'
            $table->string('phone_number')->unique()->nullable()->after('email');
            $table->string('profile_picture')->nullable()->after('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Perintah untuk MENGHAPUS kolom jika migration di-rollback
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone_number', 'profile_picture']);
        });
    }
};