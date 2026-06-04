import React, { useState, useMemo } from 'react';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  SlidersHorizontal,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { StockLog } from '../types';

interface LogViewProps {
  logs: StockLog[];
  onClearLogs?: () => void;
}

export default function LogView({ logs, onClearLogs }: LogViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  // Filter logs based on inputs
  const filteredLogs = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter(log => {
        const matchesSearch = 
          log.itemName.toLowerCase().includes(search.toLowerCase()) ||
          log.userName.toLowerCase().includes(search.toLowerCase()) ||
          log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
          log.destinationOrSource.toLowerCase().includes(search.toLowerCase());

        const matchesType = typeFilter === 'All' || log.type === typeFilter;

        return matchesSearch && matchesType;
      });
  }, [logs, search, typeFilter]);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Log Mutasi Stok</h1>
          <p className="text-xs text-[#8E8E8E] mt-0.5">Riwayat kronologis keluar-masuk barang, penambahan jumlah, alokasi internal, dan pengiriman vendor.</p>
        </div>
        
        {onClearLogs && logs.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log mutasi stok? Ini tidak dapat dibatalkan.')) {
                onClearLogs();
              }
            }}
            className="px-3.5 py-2.5 border border-red-500/10 hover:border-red-500/35 text-red-400/80 hover:text-red-300 text-xs font-semibold bg-red-500/[0.01] hover:bg-red-500/[0.05] rounded-xl transition-all cursor-pointer font-sans"
          >
            Bersihkan Riwayat
          </button>
        )}
      </div>

      {/* Filter and search bars */}
      <div className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm shadow-black font-sans">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari log berdasarkan nama alat, operator, atau keterangan..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/35 rounded-lg text-xs placeholder-gray-500 focus:outline-none focus:ring-0 text-white transition-colors"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded-lg border border-[#2A2A2A] shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-[10px] text-[#8E8E8E] font-mono tracking-wider uppercase mr-1">Tipe Mutasi</span>
          </div>

          <div className="relative flex-1 md:flex-initial">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full md:w-44 px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white rounded-lg focus:outline-none hover:border-gray-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="All">Semua Riwayat Pergerakan</option>
              <option value="Masuk">Stok Masuk (Barang Masuk)</option>
              <option value="Keluar">Stok Keluar (Barang Keluar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database log table */}
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-md font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#0A0A0A]/50 text-[#8E8E8E] font-mono uppercase tracking-widest text-[9px]">
                <th className="py-4 px-5">Waktu & Tanggal</th>
                <th className="py-4 px-4 text-center">Tipe</th>
                <th className="py-4 px-4">Nama Peralatan Gym</th>
                <th className="py-4 px-4 text-center">Jumlah</th>
                <th className="py-4 px-4">Operator</th>
                <th className="py-4 px-5">Tujuan / Sumber Pengiriman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8E8E8E] text-xs">
                    <History className="w-10 h-10 text-gray-600 mx-auto opacity-30 mb-3" />
                    Belum ada rekaman histori mutasi stok terdaftar di database.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });
                  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.005] transition-colors">
                      {/* DateTime Stamp */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="text-xs text-white font-medium">{formattedDate}</span>
                          <span className="text-[10px] text-[#8E8E8E] font-mono mt-0.5">{formattedTime} WIB</span>
                        </div>
                      </td>

                      {/* Movement Type Badges */}
                      <td className="py-4 px-4 text-center">
                        {log.type === 'Masuk' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-emerald-400 bg-[#00C853]/10 border border-[#00C853]/15 rounded-full uppercase tracking-wider">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-400" /> Masuk
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-red-400 bg-red-400/10 border border-red-500/15 rounded-full uppercase tracking-wider">
                            <ArrowUpRight className="w-3 h-3 text-red-400" /> Keluar
                          </span>
                        )}
                      </td>

                      {/* Equipment Name */}
                      <td className="py-4 px-4 text-xs font-semibold text-white">
                        {log.itemName}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-4 text-center font-mono text-xs font-bold text-white">
                        {log.quantity} unit
                      </td>

                      {/* User Email & name */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-xs text-gray-300 font-medium">{log.userName}</span>
                          <span className="text-[10px] text-[#8E8E8E] font-mono truncate max-w-[170px]">{log.userEmail}</span>
                        </div>
                      </td>

                      {/* Destination or supplier source */}
                      <td className="py-4 px-5 text-xs text-[#8E8E8E] font-medium">
                        {log.destinationOrSource}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
