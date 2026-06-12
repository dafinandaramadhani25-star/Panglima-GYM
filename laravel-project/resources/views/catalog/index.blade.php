@extends('layouts.app')

@section('content')
<div class="space-y-8" x-data="{ addOpen: false }">
    
    <!-- Title Page & Action triggers -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Katalog Inventaris Alat</h1>
            <p class="text-xs text-gray-500 mt-1">Daftar lengkap ketersediaan, serial unit, dan penyesuaian stok otomatis.</p>
        </div>
        <div>
            <button onclick="toggleModal('add-item-modal', true)" class="w-full sm:w-auto px-4 py-2.5 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs tracking-wide uppercase font-mono rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                Registrasi Alat Baru
            </button>
        </div>
    </div>

    <!-- Live Filters Row -->
    <div class="bg-[#121212] border border-[#222] p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-center">
        <form action="{{ route('catalog.index') }}" method="GET" class="w-full flex flex-col md:flex-row gap-4">
            
            <!-- Search bar input -->
            <div class="flex-1">
                <input 
                    type="text" 
                    name="search" 
                    value="{{ request('search') }}"
                    placeholder="Cari berdasarkan nama, merk, kode nomor seri serial, lokasi..." 
                    class="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-xs text-white"
                />
            </div>

            <!-- Categories Dropdowns field -->
            <div class="w-full md:w-48">
                <select name="category" class="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-xs text-white">
                    <option value="Semua">Semua Kategori</option>
                    @foreach($allCategories as $cat)
                        <option value="{{ $cat }}" {{ request('category') == $cat ? 'selected' : '' }}>{{ $cat }}</option>
                    @endforeach
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                </select>
            </div>

            <!-- Operational conditions dropdown field -->
            <div class="w-full md:w-48">
                <select name="condition" class="w-full px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-xs text-white">
                    <option value="Semua">Semua Kondisi</option>
                    <option value="Good" {{ request('condition') == 'Good' ? 'selected' : '' }}>BAGUS (Good)</option>
                    <option value="In Repairs" {{ request('condition') == 'In Repairs' ? 'selected' : '' }}>DALAM PERSETUJUAN (In Repairs)</option>
                    <option value="Broken" {{ request('condition') == 'Broken' ? 'selected' : '' }}>RUSAK (Broken)</option>
                </select>
            </div>

            <!-- Submit Filter Trigger -->
            <div class="shrink-0 flex gap-2">
                <button type="submit" class="px-4 py-2.5 bg-[#1F1F1F] hover:bg-[#252525] border border-[#2D2D2D] rounded-xl text-xs text-white font-mono cursor-pointer">
                    Filter
                </button>
                <a href="{{ route('catalog.index') }}" class="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/10 text-red-400 text-xs rounded-xl font-mono flex items-center justify-center">
                    Reset
                </a>
            </div>

        </form>
    </div>

    <!-- Gym Items Catalog Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @forelse($items as $it)
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden shadow-sm flex flex-col relative group">
                
                <!-- Card Cover Header Image & Condition Badge -->
                <div class="relative h-44 bg-[#1F1F1F] overflow-hidden shrink-0">
                    <img class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" src="{{ $it->image_url }}" alt="{{ $it->name }}" onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop'">
                    <span class="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider text-emerald-400 border border-white/10 uppercase">
                        {{ $it->category }}
                    </span>

                    <!-- Condition indicator badge -->
                    <div class="absolute top-3 right-3">
                        @if($it->condition === 'Good')
                            <span class="px-2 py-1 rounded bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/20 text-[9px] font-mono font-bold uppercase block tracking-wider">
                                ● Bagus
                            </span>
                        @elseif($it->condition === 'In Repairs')
                            <span class="px-2 py-1 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20 text-[9px] font-mono font-bold uppercase block tracking-wider animate-pulse">
                                ● Dalam Perbaikan
                            </span>
                        @else
                            <span class="px-2 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/20 text-[9px] font-mono font-bold uppercase block tracking-wider">
                                ● Rusak
                            </span>
                        @endif
                    </div>
                </div>

                <!-- Card Body Details -->
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="text-sm font-bold text-white tracking-tight truncate leading-tight">{{ $it->name }}</h3>
                            <span class="text-[11px] font-mono font-bold text-gray-500 shrink-0 uppercase bg-[#181818] border border-[#222] px-1.5 py-0.5 rounded leading-none">{{ $it->brand }}</span>
                        </div>

                        <div class="mt-4 space-y-1.5 text-xs text-gray-400 font-mono">
                            <div class="flex justify-between">
                                <span class="text-gray-600">SERIAL:</span>
                                <span class="text-white select-all">{{ $it->serial ?: 'KOSONG' }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">LOKASI:</span>
                                <span class="text-gray-200 truncate">{{ $it->location ?: 'Belum diatur' }}</span>
                            </div>
                        </div>

                        <!-- Barcode QR visual code simulation -->
                        <div class="mt-4 p-2 bg-[#181818] rounded-xl border border-[#222] flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <svg class="w-6 h-6 text-gray-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1M18 8v1M6 8v1M12 16v1M18 16v1M6 16v1M12 20v1" /></svg>
                                <span class="text-[9px] font-mono text-gray-400 uppercase tracking-widest block font-bold">QR Tracker Code:</span>
                            </div>
                            <span class="text-[10px] font-mono text-emerald-400 uppercase select-all font-bold px-2 py-0.5 bg-emerald-500/5 rounded border border-[#222]">
                                {{ $it->qr_code_url }}
                            </span>
                        </div>
                    </div>

                    <!-- Quantity metrics & Action handlers -->
                    <div class="mt-6 pt-4 border-t border-[#1C1C1C]">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-xs text-gray-500 font-mono uppercase tracking-wider block leading-none">Jumlah Inventaris:</span>
                            <span class="font-mono text-lg font-bold text-white flex items-center gap-1">
                                <span class="text-[#00C853]">{{ $it->total_stock }}</span> <span class="text-xs text-gray-500 font-normal">PCS</span>
                            </span>
                        </div>

                        <div class="grid grid-cols-3 gap-2">
                            <!-- Adjust Stock -->
                            <button onclick="openAdjustModal('{{ $it->id }}', '{{ $it->name }}')" class="py-2.5 bg-[#1F1F1F] hover:bg-[#252525] text-white border border-[#2E2E2E] rounded-xl text-[10px] uppercase font-mono tracking-wide font-bold transition-colors cursor-pointer text-center">
                                Stok
                            </button>
                            <!-- Edit info -->
                            <button onclick='openEditModal({!! $it->toJson() !!})' class="py-2.5 bg-[#1F1F1F] hover:bg-[#252525] text-white border border-[#2E2E2E] rounded-xl text-[10px] uppercase font-mono tracking-wide font-bold transition-colors cursor-pointer text-center">
                                Edit
                            </button>
                            <!-- Delete action -->
                            <form action="{{ route('catalog.destroy', $it->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin menghapus alat olahraga \'{{ $it->name }}\' secara permanen dari basis data?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded-xl text-[10px] uppercase font-mono tracking-wide font-bold transition-all cursor-pointer">
                                    Hapus
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        @empty
            <div class="p-16 text-center text-xs text-gray-500 font-mono border border-dashed border-[#222] rounded-2xl md:col-span-2 xl:col-span-3">
                Katalog alat kosong. Silakan daftarkan unit pertama Anda.
            </div>
        @endforelse
    </div>

    <!-- MODAL 1: REGISTRASI BARU -->
    <div id="add-item-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="flex items-center justify-center min-h-screen p-4 relative">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-100 transition-opacity" onclick="toggleModal('add-item-modal', false)"></div>
            
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden max-w-lg w-full z-10 p-6 shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-base font-bold text-white font-mono uppercase tracking-wider">Registrasi Alat Baru</h3>
                    <button onclick="toggleModal('add-item-modal', false)" class="text-gray-500 hover:text-white font-bold font-mono">X</button>
                </div>

                <form action="{{ route('catalog.store') }}" method="POST" class="space-y-4 text-xs">
                    @csrf
                    <div>
                        <label class="block text-gray-500 mb-1">Daftar Nama Alat</label>
                        <input type="text" name="name" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="contoh: Smith Machine Series 500">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-500 mb-1">Merek (Brand)</label>
                            <input type="text" name="brand" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="Life Fitness, Rogue">
                        </div>
                        <div>
                            <label class="block text-gray-500 mb-1">Kode Nomor Seri</label>
                            <input type="text" name="serial" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="LF-SM-93902-12">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-500 mb-1">Kategori</label>
                            <select name="category" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                                <option value="Cardio">Cardio</option>
                                <option value="Strength">Strength</option>
                                <option value="Free Weights">Free Weights</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-500 mb-1">Kondisi Awal</label>
                            <select name="condition" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                                <option value="Good">BAGUS (Good)</option>
                                <option value="In Repairs">DALAM PERBAIKAN (In Repairs)</option>
                                <option value="Broken">RUSAK (Broken)</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-500 mb-1">Lokasi Penyimpanan</label>
                            <input type="text" name="location" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="Zona Barat, Angkat Beban">
                        </div>
                        <div>
                            <label class="block text-gray-500 mb-1">Jumlah Stok Awal</label>
                            <input type="number" name="total_stock" required min="0" value="1" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Gambar URL (opsional)</label>
                        <input type="url" name="image_url" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white text-[11px]" placeholder="https://...">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Keterangan Alat</label>
                        <textarea name="description" rows="3" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="Catatan spesifikasi detail..."></textarea>
                    </div>

                    <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-mono font-bold uppercase rounded-lg cursor-pointer">Registrasikan Unit</button>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL 2: DETAIL EDIT -->
    <div id="edit-item-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="flex items-center justify-center min-h-screen p-4 relative">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-100 transition-opacity" onclick="toggleModal('edit-item-modal', false)"></div>
            
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden max-w-lg w-full z-10 p-6 shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-base font-bold text-white font-mono uppercase tracking-wider">Perbarui Informasi Alat</h3>
                    <button onclick="toggleModal('edit-item-modal', false)" class="text-gray-500 hover:text-white font-bold font-mono">X</button>
                </div>

                <form id="edit-form" method="POST" class="space-y-4 text-xs">
                    @csrf
                    @method('PUT')
                    <div>
                        <label class="block text-gray-500 mb-1">Nama Alat</label>
                        <input type="text" id="edit-name" name="name" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-500 mb-1">Merek (Brand)</label>
                            <input type="text" id="edit-brand" name="brand" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                        </div>
                        <div>
                            <label class="block text-gray-500 mb-1">Kode Nomor Seri</label>
                            <input type="text" id="edit-serial" name="serial" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-gray-500 mb-1">Kategori</label>
                            <select id="edit-category" name="category" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                                <option value="Cardio">Cardio</option>
                                <option value="Strength">Strength</option>
                                <option value="Free Weights">Free Weights</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-500 mb-1">Kondisi Alat</label>
                            <select id="edit-condition" name="condition" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                                <option value="Good">BAGUS (Good)</option>
                                <option value="In Repairs">DALAM PERBAIKAN (In Repairs)</option>
                                <option value="Broken">RUSAK (Broken)</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Lokasi Penyimpanan</label>
                        <input type="text" id="edit-location" name="location" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Gambar URL</label>
                        <input type="url" id="edit-image-url" name="image_url" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white text-[11px]">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Keterangan Alat</label>
                        <textarea id="edit-description" name="description" rows="3" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white"></textarea>
                    </div>

                    <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-mono font-bold uppercase rounded-lg cursor-pointer">Simpan Perubahan</button>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL 3: PENYESUAIAN STOK (IN / OUT) -->
    <div id="adjust-item-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="flex items-center justify-center min-h-screen p-4 relative">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-100 transition-opacity" onclick="toggleModal('adjust-item-modal', false)"></div>
            
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden max-w-sm w-full z-10 p-6 shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider">Sesuaikan Stok Unit</h3>
                    <button onclick="toggleModal('adjust-item-modal', false)" class="text-gray-500 hover:text-white font-bold font-mono">X</button>
                </div>

                <div class="mb-4 bg-[#181818] p-3 rounded-lg border border-[#222]">
                    <span class="text-[10px] text-gray-500 uppercase font-mono block">Nama Barang target:</span>
                    <strong id="adjust-item-title" class="text-xs text-white uppercase tracking-wider mt-0.5 block">Alat Olahraga</strong>
                </div>

                <form id="adjust-form" method="POST" class="space-y-4 text-xs">
                    @csrf
                    <div>
                        <label class="block text-gray-500 mb-1">Jenis Transaksi</label>
                        <select name="type" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white font-mono font-bold text-center">
                            <option value="Masuk">MASUK (+) TAMBAH UNIT</option>
                            <option value="Keluar">KELUAR (-) KURANGI UNIT</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Jumlah Unit (Pcs)</label>
                        <input type="number" name="quantity" required min="1" value="1" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white font-mono font-bold text-center text-sm">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Alasan Penyesuaian / Keterangan</label>
                        <input type="text" name="reason" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="contoh: Kiriman vendor, Kerusakan unit">
                    </div>

                    <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-mono font-bold uppercase rounded-lg cursor-pointer">Simpan Logs & Stok</button>
                </form>
            </div>
        </div>
    </div>

</div>

<!-- Vanilla JS modal state managers -->
<script>
    function toggleModal(modalId, isOpen) {
        var modal = document.getElementById(modalId);
        if (isOpen) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    function openEditModal(item) {
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-brand').value = item.brand || '';
        document.getElementById('edit-serial').value = item.serial || '';
        document.getElementById('edit-category').value = item.category || 'Cardio';
        document.getElementById('edit-condition').value = item.condition || 'Good';
        document.getElementById('edit-location').value = item.location || '';
        document.getElementById('edit-image-url').value = item.image_url || '';
        document.getElementById('edit-description').value = item.description || '';

        // Hubungkan Action Form langsung ke Laravel route parameter id
        var form = document.getElementById('edit-form');
        form.action = '/catalog/' + item.id;

        toggleModal('edit-item-modal', true);
    }

    function openAdjustModal(itemId, itemName) {
        document.getElementById('adjust-item-title').innerText = itemName;
        
        var form = document.getElementById('adjust-form');
        form.action = '/catalog/' + itemId + '/adjust';

        toggleModal('adjust-item-modal', true);
    }
</script>
@endsection
