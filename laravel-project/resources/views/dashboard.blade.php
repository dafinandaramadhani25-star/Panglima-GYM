@extends('layouts.app')

@section('content')
<div class="space-y-8">
    
    <!-- Top Greeting Section -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p class="text-xs text-gray-500 mt-1">Status dan statistik terkini inventaris alat olahraga Panglima GYM.</p>
        </div>
        <div class="text-right font-mono text-xs text-gray-400">
            <span>Hari ini: {{ now()->timezone('Asia/Jakarta')->format('d M Y - H:i') }} WIB</span>
        </div>
    </div>

    <!-- Quick Stats Cards Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <!-- Total Items -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/5 opacity-40 blur-lg rounded-full"></div>
            <div class="flex items-center gap-4">
                <div class="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                    <span class="text-xs font-mono text-gray-500 uppercase tracking-wider block">Total Jenis Alat</span>
                    <span class="text-2xl font-bold text-white font-mono mt-1 block">{{ $totalItems }}</span>
                </div>
            </div>
        </div>

        <!-- Total Stock Sum -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-500/5 opacity-40 blur-lg rounded-full"></div>
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                <div>
                    <span class="text-xs font-mono text-gray-500 uppercase tracking-wider block">Total Fisik Unit</span>
                    <span class="text-2xl font-bold text-white font-mono mt-1 block">{{ $totalStock }}</span>
                </div>
            </div>
        </div>

        <!-- Pending Maintenance -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/5 opacity-40 blur-lg rounded-full"></div>
            <div class="flex items-center gap-4">
                <div class="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                    <span class="text-xs font-mono text-gray-500 uppercase tracking-wider block">Jadwal Pemeliharaan</span>
                    <span class="text-2xl font-bold text-white font-mono mt-1 block">{{ $pendingMaintenance }}</span>
                </div>
            </div>
        </div>

        <!-- Total Personnel -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 shadow-sm relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-[#00C853]/5 opacity-40 blur-lg rounded-full"></div>
            <div class="flex items-center gap-4">
                <div class="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <div>
                    <span class="text-xs font-mono text-gray-500 uppercase tracking-wider block">Petugas Aktif</span>
                    <span class="text-2xl font-bold text-white font-mono mt-1 block">{{ $totalPersonnel }}</span>
                </div>
            </div>
        </div>

    </div>

    <!-- Visual Charts & Distribution Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Condition Breakdown Charts -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 lg:col-span-1">
            <h3 class="text-sm font-semibold text-white tracking-tight mb-6">Status Fisik Alat</h3>
            
            <div class="space-y-5">
                <div>
                    <div class="flex justify-between text-xs font-mono mb-2">
                        <span class="text-emerald-400">BAGUS (Good)</span>
                        <span class="text-gray-400">{{ $goodConditionCount }} Alat</span>
                    </div>
                    <div class="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#2A2A2A]">
                        @php
                            $goodPct = $totalItems > 0 ? ($goodConditionCount / $totalItems) * 100 : 0;
                        @endphp
                        <div class="bg-[#00C853] h-full" style="width: {{ $goodPct }}%"></div>
                    </div>
                </div>

                <div>
                    <div class="flex justify-between text-xs font-mono mb-2">
                        <span class="text-amber-400">RUST / DALAM PERAWATAN (In Repairs / Broken)</span>
                        <span class="text-gray-400">{{ $brokenOrRepairCount }} Alat</span>
                    </div>
                    <div class="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#2A2A2A]">
                        @php
                            $repairPct = $totalItems > 0 ? ($brokenOrRepairCount / $totalItems) * 100 : 0;
                        @endphp
                        <div class="bg-[#FF9100] h-full" style="width: {{ $repairPct }}%"></div>
                    </div>
                </div>
            </div>

            <div class="mt-8 p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl text-center text-xs text-gray-400 font-mono">
                Rasio Kelayakan Operasional:
                <span class="text-[#00C853] font-bold text-sm block mt-1">
                    {{ $totalItems > 0 ? round(($goodConditionCount / $totalItems) * 100, 1) : 100 }}% Layak Pakai
                </span>
            </div>
        </div>

        <!-- Category Distribution Charts -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 lg:col-span-2">
            <h3 class="text-sm font-semibold text-white tracking-tight mb-5">Penyebaran Berdasarkan Kategori</h3>
            
            <div class="h-44 flex items-end justify-between px-4 pb-2 border-b border-[#2A2A2A] gap-4">
                @forelse($categoriesCount as $catObj)
                    <div class="flex-1 flex flex-col items-center group">
                        <span class="text-[10px] font-mono text-emerald-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {{ $catObj->total }} unit
                        </span>
                        @php
                            $maxVal = $categoriesCount->max('total') ?: 1;
                            $barHeight = ($catObj->total / $maxVal) * 80; // skala tinggi maks 80%
                        @endphp
                        <div class="w-full bg-[#00C853]/20 border border-[#00C853]/40 rounded-t-lg transition-all duration-300 group-hover:bg-[#00C853]" style="height: {{ max($barHeight, 15) }}px"></div>
                        <span class="text-[11px] font-mono text-gray-500 mt-2 truncate w-full text-center">
                            {{ $catObj->category ?: 'Tanpa Kategori' }}
                        </span>
                    </div>
                @empty
                    <div class="w-full h-full flex items-center justify-center text-xs text-gray-500 font-mono">
                        Belum ada data persebaran kategori.
                    </div>
                @endforelse
            </div>
        </div>

    </div>

    <!-- Active Events & Recents Logs -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Closest Upcoming Maintenance -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm font-semibold text-white tracking-tight">Agenda Servis Mendatang</h3>
                <a href="{{ route('maintenance.index') }}" class="text-[10px] uppercase font-mono text-emerald-400 hover:underline">Lihat Seluruhnya</a>
            </div>

            <div class="space-y-4">
                @forelse($upcomingMaintenance as $service)
                    <div class="p-4 bg-[#181818] border border-[#222] rounded-xl flex justify-between items-center gap-3">
                        <div class="flex-1 min-w-0">
                            <span class="text-xs font-bold text-white block truncate">{{ $service->item_name }}</span>
                            <span class="text-[11px] text-[#8E8E8E] block mt-1 font-mono truncate">{{ $service->maintenance_type }}</span>
                        </div>
                        <div class="text-right shrink-0">
                            <span class="text-[11px] font-mono font-semibold text-amber-500 block">
                                {{ \Carbon\Carbon::parse($service->next_service_date)->format('d/m/Y') }}
                            </span>
                            <span class="text-[9px] font-mono text-gray-500 uppercase mt-0.5 inline-block px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/10">
                                {{ $service->status }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center text-xs text-gray-500 font-mono border border-dashed border-[#222] rounded-xl">
                        Tidak ada agenda servis terdekat. Pemeliharaan aman!
                    </div>
                @endforelse
            </div>
        </div>

        <!-- Recents Stock Logging Actions -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-sm font-semibold text-white tracking-tight">Audit Log Aktivitas Terakhir</h3>
                <a href="{{ route('logs.index') }}" class="text-[10px] uppercase font-mono text-emerald-400 hover:underline">Lihat Semua Log</a>
            </div>

            <div class="space-y-3">
                @forelse($recentLogs as $log)
                    <div class="p-3.5 bg-[#181818]/60 border border-[#2A2A2A]/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div class="flex items-center gap-3 min-w-0">
                            @if($log->type === 'Masuk')
                                <span class="bg-emerald-500/10 border border-emerald-500/20 text-[#00C853] font-bold text-[9px] uppercase px-1.5 py-0.5 rounded font-mono shrink-0">
                                    IN
                                </span>
                            @else
                                <span class="bg-red-500/10 border border-red-500/20 text-red-400 class font-bold text-[9px] uppercase px-1.5 py-0.5 rounded font-mono shrink-0">
                                    OUT
                                </span>
                            @endif
                            
                            <div class="min-w-0">
                                <span class="text-gray-200 font-bold block truncate">{{ $log->item_name }}</span>
                                <span class="text-[10px] text-gray-500 truncate block mt-0.5">Oleh {{ $log->user_name }}</span>
                            </div>
                        </div>

                        <div class="text-right shrink-0">
                            <span class="font-mono text-white font-bold block">
                                {{ $log->type === 'Masuk' ? '+' : '-' }}{{ $log->quantity }} Pcs
                            </span>
                            <span class="text-[9px] text-[#8E8E8E] font-mono mt-0.5 block">
                                {{ $log->created_at ? $log->created_at->diffForHumans() : '-' }}
                            </span>
                        </div>
                    </div>
                @empty
                    <div class="p-8 text-center text-xs text-gray-500 font-mono border border-dashed border-[#222] rounded-xl">
                        Log transaksi penyesuaian inventaris kosong.
                    </div>
                @endforelse
            </div>
        </div>

    </div>

</div>
@endsection
