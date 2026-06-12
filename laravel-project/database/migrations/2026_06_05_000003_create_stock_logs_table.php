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
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('type'); // 'Masuk' atau 'Keluar'
            $table->string('item_id');
            $table->string('item_name')->nullable();
            $table->integer('quantity')->default(0);
            $table->string('user_email')->nullable();
            $table->string('user_name')->nullable();
            $table->string('destination_or_source')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_logs');
    }
};
