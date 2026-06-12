<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StockLog;
use Illuminate\Support\Facades\Auth;

class StockLogController extends Controller
{
    /**
     * Tampilkan riwayat lengkap aktivitas stock log
     */
    public function index()
    {
        $logs = StockLog::orderBy('created_at', 'desc')->get();
        return view('logs.index', compact('logs'));
    }

    /**
     * Kosongkan seluruh log (Hanya Admin yang diizinkan)
     */
    public function clearLogs()
    {
        // Pastikan hanya role Admin yang bisa menghapus total log
        if (Auth::user()->role !== 'Admin') {
            return redirect()->route('logs.index')
                ->with('error', 'Hanya administrator Utama yang diizinkan mengosongkan riwayat stock logs.');
        }

        StockLog::truncate();

        return redirect()->route('logs.index')
            ->with('info', 'Seluruh riwayat transaksi log berhasil dikosongkan.');
    }
}
