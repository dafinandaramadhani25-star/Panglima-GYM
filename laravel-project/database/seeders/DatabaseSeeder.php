<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\GymItem;
use App\Models\MaintenanceSchedule;
use App\Models\StockLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Initial Users
        $users = [
            [
                'name' => 'Dafina Ramadhani',
                'email' => 'dafinandaramadhani25@gmail.com',
                'password' => Hash::make('panglimagym2026'),
                'role' => 'Admin',
            ],
            [
                'name' => 'Ahmad Muzakir',
                'email' => 'ahmad@gymstock.com',
                'password' => Hash::make('staffpassword2026'),
                'role' => 'Staff',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@gymstock.com',
                'password' => Hash::make('staffpassword22'),
                'role' => 'Staff',
            ]
        ];

        foreach ($users as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                $u
            );
        }

        // 2. Seed Initial Gym Equipment Items
        $items = [
            [
                'id' => 'item-1',
                'name' => 'Treadmill Commercial T600',
                'brand' => 'Matrix Fitness',
                'serial' => 'MX-TRD-48902-A',
                'category' => 'Cardio',
                'condition' => 'Good',
                'location' => 'Area Kardio Barat',
                'total_stock' => 5,
                'image_url' => 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop',
                'qr_code_url' => 'MOCK-QR-MATRIX-T600',
                'description' => 'Treadmill performansi tinggi dengan motor AC 4.2HP, konsol LED terang, dan sistem peredam kejut Ultimate Deck.',
            ],
            [
                'id' => 'item-2',
                'name' => 'Smith Machine Series 700',
                'brand' => 'Life Fitness',
                'serial' => 'LF-SM-93108-B',
                'category' => 'Strength',
                'condition' => 'In Repairs',
                'location' => 'Zon Bebas Beban Tengah',
                'total_stock' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
                'qr_code_url' => 'MOCK-QR-SMITH-700',
                'description' => 'Sistem pengaman lintasan bar 7 derajat natural dengan bantalan linier presisi tinggi demi keamanan latihan kekuatan.',
            ],
            [
                'id' => 'item-3',
                'name' => 'Olympic Hex Trap Bar 20kg',
                'brand' => 'Rogue Fitness',
                'serial' => 'RG-HEX-10293-F',
                'category' => 'Free Weights',
                'condition' => 'Good',
                'location' => 'Zon Angkat Berat Utama',
                'total_stock' => 8,
                'image_url' => 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=300&auto=format&fit=crop',
                'qr_code_url' => 'MOCK-QR-ROGUE-HEX',
                'description' => 'Bilah hex bar lapis kromium industrial berkualitas tinggi, sangat direkomendasikan untuk sesi deadlift presisi tinggi.',
            ]
        ];

        foreach ($items as $itemData) {
            GymItem::updateOrCreate(
                ['id' => $itemData['id']],
                $itemData
            );
        }

        // 3. Seed Initial Maintenance Schedule
        $schedules = [
            [
                'id' => 'maint-1',
                'item_id' => 'item-2',
                'item_name' => 'Smith Machine Series 700',
                'next_service_date' => '2026-06-10',
                'maintenance_type' => 'Lubrikasi Lintasan Rel & Kalibrasi Kabel',
                'status' => 'Mendatang',
            ],
            [
                'id' => 'maint-2',
                'item_id' => 'item-3',
                'item_name' => 'Olympic Hex Trap Bar 20kg',
                'next_service_date' => '2026-06-15',
                'maintenance_type' => 'Inspeksi Keretakan Pengunci Kerah Logam',
                'status' => 'Mendatang',
            ]
        ];

        foreach ($schedules as $sched) {
            MaintenanceSchedule::updateOrCreate(
                ['id' => $sched['id']],
                $sched
            );
        }

        // 4. Seed Initial Stock Log
        $logs = [
            [
                'id' => 'log-1',
                'type' => 'Masuk',
                'item_id' => 'item-3',
                'item_name' => 'Olympic Hex Trap Bar 20kg',
                'quantity' => 3,
                'user_email' => 'dafinandaramadhani25@gmail.com',
                'user_name' => 'Dafina Ramadhani',
                'destination_or_source' => 'Pemasok Rogue Jakarta Barat',
            ]
        ];

        foreach ($logs as $l) {
            StockLog::updateOrCreate(
                ['id' => $l['id']],
                $l
            );
        }
    }
}
