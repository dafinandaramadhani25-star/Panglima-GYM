<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GymItem;
use App\Models\MaintenanceSchedule;
use App\Models\StockLog;
use App\Models\User;

class DashboardController extends Controller
{
    /**
     * Tampilkan halaman utama (Dashboard)
     */
    public function index()
    {
        $totalItems = GymItem::count();
        $totalStock = GymItem::sum('total_stock');
        $pendingMaintenance = MaintenanceSchedule::where('status', 'Mendatang')->count();
        $totalPersonnel = User::count();

        // Items dalam perbaikan atau rusak
        $brokenOrRepairCount = GymItem::whereIn('condition', ['Broken', 'In Repairs'])->count();
        $goodConditionCount = GymItem::where('condition', 'Good')->count();

        // Kategori-kategori alat olahraga
        $categoriesCount = GymItem::select('category', \DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        // Ambil riwayat log terbaru (maksimal 5 baris)
        $recentLogs = StockLog::orderBy('created_at', 'desc')->take(5)->get();

        // Ambil jadwal perawatan mendatang terdekat
        $upcomingMaintenance = MaintenanceSchedule::where('status', 'Mendatang')
            ->orderBy('next_service_date', 'asc')
            ->take(5)
            ->get();

        return view('dashboard', compact(
            'totalItems',
            'totalStock',
            'pendingMaintenance',
            'totalPersonnel',
            'brokenOrRepairCount',
            'goodConditionCount',
            'categoriesCount',
            'recentLogs',
            'upcomingMaintenance'
        ));
    }
}
