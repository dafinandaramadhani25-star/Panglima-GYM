import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Key, 
  Mail, 
  Plus, 
  X,
  AlertTriangle,
  FileMinus,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserManagementViewProps {
  currentUser: { email: string; displayName: string };
  users: UserProfile[];
  onAddUser: (profile: Omit<UserProfile, 'uid'>) => void;
  onModifyRole: (uid: string, role: 'Admin' | 'Staff') => void;
  onDeleteUser: (uid: string) => void;
}

export default function UserManagementView({ currentUser, users, onAddUser, onModifyRole, onDeleteUser }: UserManagementViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'Staff'>('Staff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) {
      alert('Harap isi nama dan alamat email!');
      return;
    }

    onAddUser({
      email: newEmail,
      displayName: newName,
      photoURL: null,
      role: newRole
    });

    // Reset
    setNewEmail('');
    setNewName('');
    setNewRole('Staff');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen User</h1>
          <p className="text-xs text-[#8E8E8E] mt-0.5">Atur hak akses otorisasi petugas garmen gudang, pantau peran (Admin vs. Staff), dan audit operasi personel.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00C853] hover:bg-[#00E676] text-black text-xs font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 shrink-0 cursor-pointer"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Tambah Petugas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Left Column: Personnel Table List */}
        <div className="lg:col-span-8 bg-[#121212] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#2A2A2A] bg-[#0A0A0A]/20 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-widest">Daftar Petugas Gudang</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]/30 text-[#8E8E8E] font-mono uppercase tracking-widest text-[9px]">
                  <th className="py-3 px-5">Nama Petugas</th>
                  <th className="py-3 px-4">Jabatan Kontak</th>
                  <th className="py-3 px-4 text-center">Tingkat Peran</th>
                  <th className="py-3 px-5 text-right w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A2A2A]">
                {users.map((profile) => {
                  const isSelf = profile.email === currentUser.email;
                  
                  return (
                    <tr key={profile.uid} className={`hover:bg-white/[0.005] transition-colors ${isSelf ? 'bg-emerald-500/[0.015]' : ''}`}>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-[#00C853]/10 border border-[#00C853]/15 text-[#00C853] flex items-center justify-center font-bold font-mono text-sm shadow-inner uppercase shrink-0">
                            {profile.displayName ? profile.displayName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-white">{profile.displayName || 'Petugas'}</span>
                              {isSelf && (
                                <span className="text-[8px] font-mono bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30 font-bold uppercase">Sesi Anda</span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8E8E8E] font-mono mt-0.5">{profile.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-xs font-mono text-[#8E8E8E]">
                        {profile.role === 'Admin' ? 'Supervisior Utama' : 'Staf Gudang Lapangan'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={profile.role}
                            disabled={isSelf}
                            onChange={(e) => onModifyRole(profile.uid, e.target.value as 'Admin' | 'Staff')}
                            className={`px-2 py-1 border text-[10px] font-mono leading-none rounded cursor-pointer focus:outline-none transition-colors ${
                              profile.role === 'Admin'
                                ? 'bg-[#00C853]/10 border-[#00C853]/30 text-emerald-400'
                                : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#8E8E8E] hover:border-gray-700'
                            } disabled:opacity-50`}
                          >
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          disabled={isSelf}
                          onClick={() => {
                            if (confirm(`Yakin ingin mencabut hak akses ${profile.displayName}?`)) {
                              onDeleteUser(profile.uid);
                            }
                          }}
                          className="p-1.5 text-[#8E8E8E] hover:text-red-400 hover:bg-red-500/5 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                          title="Hapus Hak Akses"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Key Permissions Checklist */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#121212] border border-[#2A2A2A] p-5 rounded-xl shadow-inner space-y-4">
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono flex items-center gap-2 border-b border-[#2A2A2A] pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Ringkasan Peran Keamanan
            </h4>

            <div className="space-y-4 text-[11px] text-[#8E8E8E] leading-relaxed">
              <div>
                <p className="text-emerald-400 font-bold uppercase font-mono text-[9px] tracking-wider mb-0.5">★ PERAN ADMIN</p>
                <p>Menguasai mutasi penuh persediaan, hak akses hapus, mendaftar petugas gudang baru, mengubah profil serial, memantau rincian biaya, serta memantulkan pemulihan arsip log.</p>
              </div>

              <div>
                <p className="text-amber-500 font-bold uppercase font-mono text-[9px] tracking-wider mb-0.5">★ PERAN STAFF</p>
                <p>Melakukan input mutasi keluar-masuk, scanning tag QR barang terbatas, merekam catatan inspeksi pemeliharaan, serta mengekspor format rincian katalog.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex gap-2.5">
            <Key className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-emerald-300 font-mono uppercase tracking-wider">Zero-Trust Standard</p>
              <p className="text-[10px] text-[#8E8E8E] mt-1 leading-normal">Otoritas peran langsung disinkronkan ke aturan database Firestore secara waktu-nyata demi mencegah eksploitasi data perantara.</p>
            </div>
          </div>

        </div>

      </div>

      {/* Booking Form Overlay Modal Drawer */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            <div className="absolute inset-0 cursor-default" onClick={() => setIsModalOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-[#121212] border-l border-[#2A2A2A] h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-white font-mono tracking-widest uppercase">Petugas Baru</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-[#8E8E8E] hover:text-white hover:bg-white/[0.05] rounded-md cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Nama Lengkap Petugas *</label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Contoh: Muhammad Thariq"
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white font-sans"
                    />
                  </div>

                  {/* Mail field */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Alamat Email Resmi *</label>
                    <div className="relative font-sans">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="thariq@panglimagym.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white font-sans"
                      />
                    </div>
                  </div>

                  {/* Role Type */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Tingkat Otoritas Peran *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'Admin' | 'Staff')}
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg focus:outline-none cursor-pointer appearance-none font-sans"
                    >
                      <option value="Staff">Petugas Gudang Terbatas (Staff)</option>
                      <option value="Admin">Supervisor Kontrol Kuasa (Admin)</option>
                    </select>
                  </div>

                </form>
              </div>

              {/* Action feet */}
              <div className="pt-4 border-t border-[#2A2A2A] flex gap-3 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-800 hover:border-gray-750 bg-transparent hover:bg-white/[0.02] text-xs font-semibold text-[#8E8E8E] rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-[#00C853] hover:bg-[#00E676] text-black text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Daftarkan Petugas
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
