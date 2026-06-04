import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarClock, 
  CheckCircle2, 
  Plus, 
  Clock, 
  Wrench, 
  AlertCircle,
  X,
  Dumbbell
} from 'lucide-react';
import { MaintenanceEntry, GymItem } from '../types';

interface PerawatanViewProps {
  maintenance: MaintenanceEntry[];
  items: GymItem[];
  onToggleStatus: (id: string) => void;
  onAddSchedule: (entry: Omit<MaintenanceEntry, 'id'>) => void;
}

export default function PerawatanView({ maintenance, items, onToggleStatus, onAddSchedule }: PerawatanViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [targetItemId, setTargetItemId] = useState(items[0]?.id || '');
  const [serviceDate, setServiceDate] = useState('');
  const [serviceType, setServiceType] = useState('Routine Checkup');
  const [customType, setCustomType] = useState('');

  // Sorter
  const sortedMaintenance = [...maintenance].sort((a, b) => {
    // Upcoming first, then by date nearest
    if (a.status !== b.status) {
      return a.status === 'Mendatang' ? -1 : 1;
    }
    return new Date(a.nextServiceDate).getTime() - new Date(b.nextServiceDate).getTime();
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetItemId || !serviceDate) {
      alert('Harap isi semua kolom!');
      return;
    }

    const selectedItem = items.find(item => item.id === targetItemId);
    if (!selectedItem) return;

    onAddSchedule({
      itemId: targetItemId,
      itemName: selectedItem.name,
      nextServiceDate: serviceDate,
      maintenanceType: serviceType === 'Lainnya' ? customType : serviceType,
      status: 'Mendatang'
    });

    // Reset
    setServiceDate('');
    setCustomType('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Jadwal Perawatan</h1>
          <p className="text-xs text-[#8E8E8E] mt-0.5">Timeline pemeliharaan berkala, pencegahan kerusakan, dan inspeksi rutin garmen fisik.</p>
        </div>
        <button
          onClick={() => {
            if (items.length === 0) {
              alert('Harap daftarkan barang terlebih dahulu di Katalog!');
              return;
            }
            setTargetItemId(items[0].id);
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Jadwalkan Servis</span>
        </button>
      </div>

      {/* Main timeline listing in a dual viewport layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Left Column: Vertical chronological timeline */}
        <div className="lg:col-span-8 bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 shadow-sm">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#FFB300] mb-6 flex items-center gap-2">
            <CalendarClock className="w-4.5 h-4.5" /> Garis Waktu Perawatan
          </h3>

          <div className="relative border-l border-[#2A2A2A] ml-3.5 pl-6 space-y-6 pb-2">
            {sortedMaintenance.length === 0 ? (
              <div className="text-center py-16 text-[#8E8E8E] font-sans">
                Belum ada jadwal pengerjaan servis terdaftar.
              </div>
            ) : (
              sortedMaintenance.map((m) => {
                const isPending = m.status === 'Mendatang';
                
                return (
                  <div key={m.id} className="relative group">
                    {/* Circle Node pointer on vertical line */}
                    <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shadow-md transition-colors ${
                      isPending 
                        ? 'bg-[#121212] border-amber-500 text-amber-500' 
                        : 'bg-[#00C853] border-[#00C853] text-black'
                    }`}>
                      {isPending ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </span>

                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#00C853]/15 p-4.5 rounded-xl transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Schedule Information details */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                            isPending 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                              : 'bg-emerald-500/10 text-[#00C853] border border-emerald-500/15'
                          }`}>
                            {m.status}
                          </span>
                          <span className="text-[10px] text-[#8E8E8E] font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#8E8E8E]" /> Servis terjadwal: {m.nextServiceDate}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-white truncate pr-2">{m.itemName}</p>
                        
                        <div className="flex items-center gap-1.5 text-xs text-[#8E8E8E]">
                          <Wrench className="w-3.5 h-3.5 text-gray-600" />
                          <span className="truncate leading-none">{m.maintenanceType}</span>
                        </div>
                      </div>

                      {/* Right: Quick State Change Button */}
                      {isPending ? (
                        <button
                          onClick={() => onToggleStatus(m.id)}
                          className="px-3.5 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black hover:scale-[1.01] text-[11px] font-semibold border border-amber-500/20 active:scale-[0.99] transition-all shrink-0 cursor-pointer font-sans"
                        >
                          Tandai Selesai
                        </button>
                      ) : (
                        <span className="text-xs font-sans text-[#8E8E8E] flex items-center gap-1 px-3 py-1.5 bg-[#00C853]/5 rounded-lg border border-[#00C853]/15">
                          <CheckCircle2 className="w-4.5 h-4.5 text-[#00C853]" /> Selesai
                        </span>
                      )}

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Mini Guidelines list and FAQ details */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#121212] border border-[#2A2A2A] p-5 rounded-xl shadow-inner">
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono mb-3">Panduan Inspeksi</h4>
            <ul className="space-y-3.5 text-[11px] text-[#8E8E8E] leading-normal font-sans">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] shrink-0 mt-1.5" />
                <span><strong>Harian</strong>: Lakukan pembersihan sisa peluh tubuh di kolong mesin kardio tiap pagi demi memperpanjang keawetan filter statis.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                <span><strong>Bulanan</strong>: Berikan minyak pelumas silikon khusus di lajur baja kabel pulley & silinder Smith Machine demi pergerakan minim polusi suara.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                <span><strong>Penyelamatan</strong>: Tandai alat yang memiliki kerusakan fatal dengan label kuning / merah segera, geser lokasinya ke area penanganan darurat.</span>
              </li>
            </ul>
          </div>
          
          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/15 flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-300">Pemberitahuan Sistem</p>
              <p className="text-[10px] text-[#8E8E8E] mt-1 leading-normal">Seluruh log penyelesaian status pemeliharaan akan terekam ke sistem audit internal Panglima Gym secara permanen dan otomatis.</p>
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
                    <CalendarClock className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white font-mono tracking-widest">JADWALKAN SERVICE</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-[#8E8E8E] hover:text-white hover:bg-white/[0.05] rounded-md cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans">
                  
                  {/* Select Item */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Target Peralatan Gym *</label>
                    <select
                      value={targetItemId}
                      onChange={(e) => setTargetItemId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg focus:outline-none cursor-pointer appearance-none font-sans"
                    >
                      {items.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.brand})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service type Selection */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Jenis Layanan Pemeliharaan *</label>
                    <select
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-white rounded-lg focus:outline-none cursor-pointer appearance-none font-sans"
                    >
                      <option value="Lubrikasi Lintasan Rel & Kalibrasi Kabel">Lubrikasi & Kalibrasi Kabel</option>
                      <option value="Pembersihan Debu Motor & Vakum Karpet">Pembersihan Motor & Karpet</option>
                      <option value="Pengencangan Kerangka Baut & Struktur">Pengencangan Baut & Roda</option>
                      <option value="Kalibrasi Konsol Monitor & Sensor Jantung">Kalibrasi Sensor Elektronik</option>
                      <option value="Lainnya">Layanan Kustom (Jelaskan di bawah)</option>
                    </select>
                  </div>

                  {/* Kustom manual field */}
                  {serviceType === 'Lainnya' && (
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Deskripsi Layanan Baru *</label>
                      <input
                        type="text"
                        required
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Contoh: Pengelasan poros pemberat statis"
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white font-sans"
                      />
                    </div>
                  )}

                  {/* Target Date */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Batas Tanggal Pengerjaan *</label>
                    <input
                      type="date"
                      required
                      value={serviceDate}
                      onChange={(e) => setServiceDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white font-mono"
                    />
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
                  onClick={handleCreate}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Daftarkan Pengerjaan
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
