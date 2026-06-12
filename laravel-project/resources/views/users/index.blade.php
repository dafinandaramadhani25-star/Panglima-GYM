@extends('layouts.app')

@section('content')
<div class="space-y-8">
    
    <!-- Title Page & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold text-white tracking-tight">Manajemen Akun Petugas Staff</h1>
            <p class="text-xs text-gray-500 mt-1">Daftar operator dan pengawas yang memiliki hak akses log masuk ke dashboard GymStock PRO.</p>
        </div>
        <div>
            <button onclick="toggleModal('add-user-modal', true)" class="w-full sm:w-auto px-4 py-2.5 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold text-xs tracking-wide uppercase font-mono rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Daftarkan Petugas Baru
            </button>
        </div>
    </div>

    <!-- Users Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @foreach($users as $usr)
            <div class="bg-[#121212] border border-[#222] rounded-2xl p-6 flex flex-col justify-between shadow relative overflow-hidden group">
                
                <!-- Role Tag overlay -->
                <div class="absolute top-4 right-4">
                    @if($usr->role === 'Admin')
                        <span class="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[#00C853] font-mono text-[9px] uppercase font-bold tracking-wider">
                            Administrator
                        </span>
                    @else
                        <span class="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[9px] uppercase font-bold tracking-wider">
                            Staff Lapangan
                        </span>
                    @endif
                </div>

                <!-- Avatar and main statistics card -->
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-12 h-12 rounded-full bg-[#181818] border border-[#2A2A2A] text-gray-400 flex items-center justify-center font-mono font-bold text-lg select-none">
                        {{ strtoupper(substr($usr->name, 0, 1)) }}
                    </div>
                    <div class="min-w-0 flex-1">
                        <strong class="text-sm font-bold text-white block truncate leading-tight">{{ $usr->name }}</strong>
                        <span class="text-[11px] text-gray-500 font-mono mt-1 block truncate select-all">{{ $usr->email }}</span>
                    </div>
                </div>

                <!-- Details block -->
                <div class="space-y-2 text-xs font-mono text-[#8E8E8E] bg-[#181818]/60 p-3.5 border border-[#1E1E1E] rounded-xl mb-6">
                    <div class="flex justify-between items-center">
                        <span>Hype Status:</span>
                        <span class="text-emerald-400 font-bold uppercase select-none">AKTIF</span>
                    </div>
                </div>

                <!-- Action handlers -->
                <div class="flex items-center gap-2 pt-4 border-t border-[#1C1C1C]">
                    <button onclick='openEditUserModal({!! $usr->toJson() !!})' class="flex-1 py-2 bg-[#1F1F1F] hover:bg-[#252525] text-white border border-[#2E2E2E] rounded-lg text-[10px] uppercase font-mono font-bold tracking-wide transition-colors cursor-pointer text-center">
                        Edit Akun
                    </button>

                    @if(Auth::user()->id != $usr->id)
                        <form action="{{ route('users.destroy', $usr->id) }}" method="POST" onsubmit="return confirm('Apakah Anda yakin ingin memberhentikan petugas \'{{ $usr->name }}\' dan mencabut seluruh kredensialnya?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="px-3 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded-lg text-[10px] uppercase font-mono font-bold tracking-wide transition-all cursor-pointer">
                                Hapus
                            </button>
                        </form>
                    @endif
                </div>

            </div>
        @endforeach
    </div>

    <!-- MODAL 1: REGISTER USER -->
    <div id="add-user-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="flex items-center justify-center min-h-screen p-4 relative">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-100 transition-opacity" onclick="toggleModal('add-user-modal', false)"></div>
            
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden max-w-sm w-full z-10 p-6 shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider">Kredensial Petugas Baru</h3>
                    <button onclick="toggleModal('add-user-modal', false)" class="text-gray-500 hover:text-white font-bold font-mono">X</button>
                </div>

                <form action="{{ route('users.store') }}" method="POST" class="space-y-4 text-xs">
                    @csrf
                    <div>
                        <label class="block text-gray-500 mb-1">Nama Lengkap</label>
                        <input type="text" name="name" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="contoh: Gema Satria">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Alamat Email Kredensial</label>
                        <input type="email" name="email" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="contoh: gema@panglimagym.com">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Set Password Awal (min. 6 karakter)</label>
                        <input type="password" name="password" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="••••••••••••">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Tingkatan Otoritas / Role</label>
                        <select name="role" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                            <option value="Staff">Staff Lapangan (Default)</option>
                            <option value="Admin">Administrator Utama</option>
                        </select>
                    </div>

                    <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold font-mono uppercase rounded-lg cursor-pointer">Buat Akun Petugas</button>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL 2: EDIT USER -->
    <div id="edit-user-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
        <div class="flex items-center justify-center min-h-screen p-4 relative">
            <div class="fixed inset-0 bg-black/80 backdrop-blur-md opacity-100 transition-opacity" onclick="toggleModal('edit-user-modal', false)"></div>
            
            <div class="bg-[#121212] border border-[#222] rounded-2xl overflow-hidden max-w-sm w-full z-10 p-6 shadow-2xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-sm font-bold text-white font-mono uppercase tracking-wider">Perbarui Informasi Petugas</h3>
                    <button onclick="toggleModal('edit-user-modal', false)" class="text-gray-500 hover:text-white font-bold font-mono">X</button>
                </div>

                <form id="edit-user-form" method="POST" class="space-y-4 text-xs">
                    @csrf
                    @method('PUT')
                    <div>
                        <label class="block text-gray-500 mb-1">Nama Lengkap</label>
                        <input type="text" id="edit-user-name" name="name" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Email Kredensial</label>
                        <input type="email" id="edit-user-email" name="email" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Ganti Password Baru (kosongkan jika tidak diganti)</label>
                        <input type="password" name="password" class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white" placeholder="••••••••••••">
                    </div>
                    <div>
                        <label class="block text-gray-500 mb-1">Role Kredensial</label>
                        <select id="edit-user-role" name="role" required class="w-full bg-[#1C1C1C] border border-[#2D2D2D] p-3 rounded-lg text-white">
                            <option value="Staff">Staff Lapangan</option>
                            <option value="Admin">Administrator Utama</option>
                        </select>
                    </div>

                    <button type="submit" class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold font-mono uppercase rounded-lg cursor-pointer">Simpan Perubahan Kredensial</button>
                </form>
            </div>
        </div>
    </div>

</div>

<!-- Admin UI Vanilla JS state handlers -->
<script>
    function toggleModal(modalId, isOpen) {
        var modal = document.getElementById(modalId);
        if (isOpen) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
        }
    }

    function openEditUserModal(user) {
        document.getElementById('edit-user-name').value = user.name;
        document.getElementById('edit-user-email').value = user.email;
        document.getElementById('edit-user-role').value = user.role || 'Staff';

        // Hubungkan Action Form langsung ke Laravel route parameter id
        var form = document.getElementById('edit-user-form');
        form.action = '/users/' + user.id;

        toggleModal('edit-user-modal', true);
    }
</script>
@endsection
