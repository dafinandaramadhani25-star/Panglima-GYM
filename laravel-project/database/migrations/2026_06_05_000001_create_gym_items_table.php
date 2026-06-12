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
        Schema::create('gym_items', function (Blueprint $table) {
            $table->string('id')->primary(); // Menyesuaikan ID string ("item-1", dsb.) dari React
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('serial')->nullable();
            $table->string('category')->nullable();
            $table->string('condition')->default('Good'); // 'Good', 'In Repairs', 'Broken'
            $table->string('location')->nullable();
            $table->integer('total_stock')->default(0);
            $table->text('image_url')->nullable();
            $table->string('qr_code_url')->nullable();
            $table->text('description')->nullable();
            $table->timestamps(); // Menambahkan created_at dan updated_at secara otomatis
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gym_items');
    }
};
