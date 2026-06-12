@extends('layouts.app')

@section('content')
<div class="space-y-8">
    
    <!-- Title Page & Banner -->
    <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Jadwal Pemeliharaan Alat</h1>
        <p class="text-xs text-gray-500 mt-1">Daftarkan agenda inspeksi servis, reparasi log, lubrikasi, hingga kalibrasi alat gym disini.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Standard Register Form card -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 h-fit">
            <h3 class="text-sm font-semibold text-white tracking-tight font-mono uppercase mb-5">Daftarkan Jadwal Servis</h3>

            <form action="{{ route('maintenance.store') }}" method="POST" class="space-y-4 text-xs">
                @csrf
                
                <!-- Gym items choice -->
                <div>
                    <label class="block text-gray-500 mb-1.5">Pilih Alat Olahraga</label>
                    <select name="item_id" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white font-sans focus:outline-none">
                        <option value="" disabled selected>-- Pilih Alat target --</option>
                        @foreach($items as $gym)
                            <option value="{{ $gym->id }}">{{ $gym->name }} ({{ $gym->condition }})</option>
                        @endforeach
                    </select>
                </div>

                <!-- Next service date picker -->
                <div>
                    <label class="block text-gray-500 mb-1.5">Tanggal Servis Berikutnya</label>
                    <input type="date" name="next_service_date" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white font-mono" min="{{ date('Y-m-d') }}">
                </div>

                <!-- Maintenance type / message details -->
                <div>
                    <label class="block text-gray-500 mb-1.5">Keterangan / Jenis Pemeliharaan</label>
                    <input type="text" name="maintenance_type" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="contoh: Lubrikasi rel kabel, Kalibrasi motor AC">
                </div>

                <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold uppercase rounded-lg cursor-pointer">
                    Simpan Agenda
                </button>
            </form>

            <div class="mt-6 p-4 bg-[#181818] border border-[#2A2A2A] rounded-xl text-xs leading-relaxed text-gray-400">
                <span class="text-emerald-400 font-bold block uppercase tracking-wide mb-1 font-mono text-[10px]">💡 Sistem Asisten Pintar:</span>
                Ketika agenda pemeliharaan dibuat, kondisi alat tersebut otomatis berubah menjadi <strong class="text-amber-500">Dalam Perbaikan (In Repairs)</strong>. Ketika ditandai selesai, kondisi kembali <strong class="text-[#00C853]">Bagus (Good)</strong>.
            </div>
        </div>

        <!-- Schedules Grid Table List -->
        <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 lg:col-span-2">
            <h3 class="text-sm font-semibold text-white tracking-tight mb-5">Daftar Agenda & Status Servis</h3>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead>
                        <tr class="border-b border-[#222] font-mono uppercase text-gray-500">
                            <th class="py-3 px-4">Nama Barang</th>
                            <th class="py-3 px-4">Jenis Perawatan</th>
                            <th class="py-3 px-4">Tanggal Rencana</th>
                            <th class="py-3 px-4">Status</th>
                            <th class="py-3 px-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#1C1C1C] font-sans">
                        @forelse($schedules as $sched)
                            <tr class="hover:bg-[#151515] transition-colors leading-relaxed">
                                <td class="py-4 px-4 font-bold text-white">{{ $sched->item_name }}</td>
                                <td class="py-4 px-4 text-gray-400 font-mono">{{ $sched->maintenance_type }}</td>
                                <td class="py-4 px-4 text-gray-200 font-mono">
                                    {{ \Carbon\Carbon::parse($sched->next_service_date)->format('d M Y') }}
                                </td>
                                <td class="py-4 px-4">
                                    @if($sched->status === 'Mendatang')
                                        <span class="inline-block px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 font-mono text-[9px] uppercase font-bold tracking-wider animate-pulse">
                                            Mendatang
                                        </span>
                                    @else
                                        <span class="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                                            Selesai
                                        </span>
                                    @endif
                                </td>
                                <td class="py-4 px-4 text-right">
                                    <form action="{{ route('maintenance.toggle', $sched->id) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="px-3 py-1.5 {{ $sched->status === 'Mendatang' ? 'bg-[#00C853] hover:bg-[#00E676] text-black' : 'bg-gray-800 hover:bg-gray-700 text-gray-400' }} rounded-lg text-[10px] font-mono tracking-wide uppercase font-bold cursor-pointer transition-colors shadow">
                                            {{ $sched->status === 'Mendatang' ? 'Selesai ✓' : 'Batal Selesai' }}
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="py-12 px-4 text-center text-gray-500 font-mono">
                                    Belum ada agenda pemeliharaan alat gym yang dicanangkan.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

    </div>

</div>
@endsection
