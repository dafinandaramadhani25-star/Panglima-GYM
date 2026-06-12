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
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->string('id')->primary(); // ID penanda jadwal
            $table->string('item_id');
            $table->string('item_name')->nullable();
            $table->date('next_service_date')->nullable();
            $table->string('maintenance_type')->nullable();
            $table->string('status')->default('Mendatang'); // 'Mendatang' atau 'Selesai'
            $table->timestamps();

            // Set relasi asing ke tabel gym_items
            $table->foreign('item_id')
                  ->references('id')
                  ->on('gym_items')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};
