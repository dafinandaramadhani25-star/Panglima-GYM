@extends('layouts.app')

@section('content')
<div class="space-y-8">
    
    <!-- Title Page -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">System Stock Logs</h1>
            <p class="text-xs text-gray-500 mt-1">Audit trail lengkap dan pencatatan riwayat masuk-keluar penyesuaian unit inventaris Panglima GYM.</p>
        </div>
        
        @if(Auth::user()->role === 'Admin')
            <div>
                <form action="{{ route('logs.clear') }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat stock logs secara permanen? Catatan audit akan hilang!')">
                    @csrf
                    <button type="submit" class="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 text-red-400 font-semibold text-xs tracking-wide uppercase font-mono rounded-lg transition-colors cursor-pointer">
                        Kosongkan Riwayat Logs (Admin)
                    </button>
                </form>
            </div>
        @endif
    </div>

    <!-- Logs Audit list card -->
    <div class="bg-[#121212] border border-[#222] rounded-2xl p-6">
        <h3 class="text-sm font-semibold text-white tracking-tight mb-5 font-mono uppercase">Laporan Catatan Audit</h3>

        <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
                <thead>
                    <tr class="border-b border-[#222] font-mono uppercase text-gray-500">
                        <th class="py-3 px-4">Waktu (Date)</th>
                        <th class="py-3 px-4">Tipe</th>
                        <th class="py-3 px-4">Nama Unit Barang</th>
                        <th class="py-3 px-4">Jumlah Penyesuaian</th>
                        <th class="py-3 px-4">Petugas Penanggung Jawab</th>
                        <th class="py-3 px-4">Asal / Tujuan / Keterangan</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#1C1C1C] font-sans">
                    @forelse($logs as $log)
                        <tr class="hover:bg-[#151515] transition-colors leading-relaxed">
                            <td class="py-4 px-4 text-gray-400 font-mono">
                                {{ $log->created_at ? $log->created_at->timezone('Asia/Jakarta')->format('d M Y - H:i') : '-' }} WIB
                            </td>
                            <td class="py-4 px-4 font-mono">
                                @if($log->type === 'Masuk')
                                    <span class="inline-block px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                        MASUK (IN)
                                    </span>
                                @else
                                    <span class="inline-block px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold">
                                        KELUAR (OUT)
                                    </span>
                                @endif
                            </td>
                            <td class="py-4 px-4 font-bold text-white">{{ $log->item_name }}</td>
                            <td class="py-4 px-4 font-mono text-white font-bold text-sm">
                                {{ $log->type === 'Masuk' ? '+' : '-' }}{{ $log->quantity }} Pcs
                            </td>
                            <td class="py-4 px-4">
                                <span class="text-white block font-semibold">{{ $log->user_name }}</span>
                                <span class="text-gray-500 text-[10px] font-mono block">{{ $log->user_email }}</span>
                            </td>
                            <td class="py-4 px-4 text-gray-400 font-mono leading-tight max-w-xs truncate">
                                {{ $log->destination_or_source }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="py-12 px-4 text-center text-gray-500 font-mono">
                                Belum ada riwayat aktivitas stock log dicatat di sistem.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection
