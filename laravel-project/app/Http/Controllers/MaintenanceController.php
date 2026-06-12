<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MaintenanceSchedule;
use App\Models\GymItem;
use App\Models\StockLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class MaintenanceController extends Controller
{
    /**
     * Tampilkan tabel jadwal pemeliharaan alat
     */
    public function index()
    {
        $schedules = MaintenanceSchedule::orderBy('next_service_date', 'asc')->get();
        
        // Ambi semua alat-alat olahraga untuk dropdown di form pendaftaran servis
        $items = GymItem::orderBy('name', 'asc')->get();

        return view('maintenance.index', compact('schedules', 'items'));
    }

    /**
     * Daftarkan jadwal servis pemeliharaan baru
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|exists:gym_items,id',
            'next_service_date' => 'required|date|after_or_equal:today',
            'maintenance_type' => 'required|string|max:255',
        ]);

        $item = GymItem::findOrFail($validated['item_id']);

        $scheduleId = 'maint-' . Str::uuid();

        MaintenanceSchedule::create([
            'id' => $scheduleId,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'next_service_date' => $validated['next_service_date'],
            'maintenance_type' => $validated['maintenance_type'],
            'status' => 'Mendatang',
        ]);

        // Secara otomatis mengubah kondisi fisik barang menjadi "In Repairs"
        if ($item->condition === 'Good') {
            $item->condition = 'In Repairs';
            $item->save();
        }

        return redirect()->route('maintenance.index')
            ->with('success', "Jadwal servis baru untuk '{$item->name}' sukses didaftarkan.");
    }

    /**
     * Ganti status servis (Mendatang <-> Selesai)
     * Juga secara otomatis mengembalikan kondisi fisik unit ke "Good" bila selesai diservis.
     */
    public function toggleStatus($id)
    {
        $schedule = MaintenanceSchedule::findOrFail($id);
        $newStatus = $schedule->status === 'Mendatang' ? 'Selesai' : 'Mendatang';

        $schedule->status = $newStatus;
        $schedule->save();

        // Logika asisten pintar: Bila ditandai "Selesai", kembalikan kondisi alat ke "Good"
        if ($newStatus === 'Selesai') {
            $item = GymItem::find($schedule->item_id);
            if ($item && ($item->condition === 'Broken' || $item->condition === 'In Repairs')) {
                $item->condition = 'Good';
                $item->save();

                // Daftarkan ke buku log otomatis
                StockLog::create([
                    'id' => 'log-' . Str::uuid(),
                    'type' => 'Masuk',
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                    'quantity' => $item->total_stock,
                    'user_email' => 'system@panglimagym.com',
                    'user_name' => 'Sistem Auto-Repair',
                    'destination_or_source' => "Servis Selesai: {$schedule->maintenance_type}"
                ]);
            }
        }

        return redirect()->route('maintenance.index')
            ->with('success', "Status pengerjaan servis diperbarui menjadi '{$newStatus}'!");
    }
}
