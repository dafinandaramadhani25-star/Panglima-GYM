<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GymItemController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\StockLogController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| Web Routes - GymStock PRO
|--------------------------------------------------------------------------
*/

// Root Redirects
Route::get('/', function () {
    return redirect()->route('login');
});

// Autentikasi / Login (Akses Tamu)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Sesi Terproteksi Login (Harus Terautentikasi)
Route::middleware('auth')->group(function () {
    
    // Proses Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard Utama
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Katalog Alat Olahraga
    Route::get('/catalog', [GymItemController::class, 'index'])->name('catalog.index');
    Route::post('/catalog', [GymItemController::class, 'store'])->name('catalog.store');
    Route::put('/catalog/{id}', [GymItemController::class, 'update'])->name('catalog.update');
    Route::delete('/catalog/{id}', [GymItemController::class, 'destroy'])->name('catalog.destroy');
    Route::post('/catalog/{id}/adjust', [GymItemController::class, 'adjustStock'])->name('catalog.adjust');

    // Jadwal Perawatan (Maintenance)
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance', [MaintenanceController::class, 'store'])->name('maintenance.store');
    Route::post('/maintenance/{id}/toggle', [MaintenanceController::class, 'toggleStatus'])->name('maintenance.toggle');

    // Riwayat Stock Log
    Route::get('/logs', [StockLogController::class, 'index'])->name('logs.index');
    Route::post('/logs/clear', [StockLogController::class, 'clearLogs'])->name('logs.clear');

    // Pengaturan Akun Petugas / Staff (Hanya Admin Utama)
    Route::middleware(function ($request, $next) {
        if (\Illuminate\Support\Facades\Auth::user()->role !== 'Admin') {
            return redirect()->route('dashboard')
                ->with('error', 'Hanya administrator Utama yang diizinkan mengelola data staff.');
        }
        return $next($request);
    })->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{id}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{id}', [UserController::class, 'destroy'])->name('users.destroy');
    });

});
