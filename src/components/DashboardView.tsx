import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building, 
  Dumbbell, 
  Settings, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  History,
  Timer
} from 'lucide-react';
import { GymItem, StockLog, MaintenanceEntry } from '../types';

interface DashboardViewProps {
  items: GymItem[];
  logs: StockLog[];
  maintenance: MaintenanceEntry[];
  onNavigateTab: (tab: any) => void;
}

export default function DashboardView({ items, logs, maintenance, onNavigateTab }: DashboardViewProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // 1. Calculate Statistics
  const totalItems = items.reduce((acc, curr) => acc + (curr.totalStock || 0), 0);
  const totalUniqueModels = items.length;

  const goodCount = items
    .filter(item => item.condition === 'Good')
    .reduce((acc, curr) => acc + (curr.totalStock || 0), 0);

  const repairCount = items
    .filter(item => item.condition === 'In Repairs')
    .reduce((acc, curr) => acc + (curr.totalStock || 0), 0);

  const brokenCount = items
    .filter(item => item.condition === 'Broken')
    .reduce((acc, curr) => acc + (curr.totalStock || 0), 0);

  const sumStats = goodCount + repairCount + brokenCount;
  
  // Percentages
  const goodPct = sumStats > 0 ? Math.round((goodCount / sumStats) * 100) : 0;
  const repairPct = sumStats > 0 ? Math.round((repairCount / sumStats) * 100) : 0;
  const brokenPct = sumStats > 0 ? Math.round((brokenCount / sumStats) * 100) : 0;

  // Pie chart calculation
  const totalDegrees = 360;
  const goodDeg = (goodPct / 100) * totalDegrees;
  const repairDeg = (repairPct / 100) * totalDegrees;
  const brokenDeg = (brokenPct / 100) * totalDegrees;

  // Recent 5 logs
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  // Maintenance Alerts
  const pendingMaintenance = maintenance.filter(m => m.status === 'Mendatang').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-sans">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dasbor Ringkasan</h1>
          <p className="text-[#8E8E8E] text-xs mt-1">Status gudang, ringkasan pergerakan stok, dan pemantauan kondisi peralatan waktu-nyata.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#121212] border border-[#2A2A2A] p-2 rounded-xl text-xs text-[#8E8E8E] font-mono">
          <Activity className="w-3.5 h-3.5 text-[#00C853]" />
          <span>Sesi Aktif: Operator Panglima Gym</span>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
        {/* Card 1: Total Aset */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          onClick={() => onNavigateTab('catalog')}
          className="bg-[#121212] border border-[#2A2A2A] hover:border-[#00C853]/25 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-md"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute -right-16 -top-16 w-36 h-36 bg-[#00C853]/5 blur-[60px] rounded-full group-hover:bg-[#00C853]/10 transition-colors duration-300" />
          
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-[#8E8E8E] font-mono tracking-widest uppercase">Total Aset Fisik</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white tracking-tight">{totalItems}</span>
                <span className="text-xs text-emerald-450 font-mono bg-[#1A1A1A] border border-[#2A2A2A] px-1.5 py-0.5 rounded">Unit</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#00C853]">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#2A2A2A] flex items-center justify-between text-[11px] text-[#8E8E8E]">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {totalUniqueModels} Model Terdaftar
            </span>
            <span className="text-[#00C853] hover:underline flex items-center gap-0.5">
              Detail Katalog <ArrowUpRight className="w-3 h-3 text-[#00C853]" />
            </span>
          </div>
        </motion.div>

        {/* Card 2: Status Alat (Interactive SVG Chart) */}
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-5 relative overflow-hidden shadow-md col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-12 gap-5"
        >
          <div className="sm:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#8E8E8E] font-mono tracking-widest uppercase">Status Operasional Alat</span>
              <p className="text-xs text-[#8E8E8E] mt-1 mb-4">Persentase kesehatan seluruh armada fisik gudang berdasarkan pemantauan aktual.</p>
            </div>
            
            <div className="space-y-2.5">
              {/* Ready Badge bar */}
              <div 
                onMouseEnter={() => setHoveredSegment('Good')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer ${hoveredSegment === 'Good' ? 'bg-[#00C853]/5 border-[#00C853]/20' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                  <span className="font-medium text-white">Siap Pakai</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#8E8E8E]">({goodCount} unit)</span>
                  <span className="text-xs font-bold text-[#00C853]">{goodPct}%</span>
                </div>
              </div>

              {/* In Repair badge bar */}
              <div 
                onMouseEnter={() => setHoveredSegment('Repair')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer ${hoveredSegment === 'Repair' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#FFB300]" />
                  <span className="font-medium text-white">Diservis</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#8E8E8E]">({repairCount} unit)</span>
                  <span className="text-xs font-bold text-[#FFB300]">{repairPct}%</span>
                </div>
              </div>

              {/* Broken badge bar */}
              <div 
                onMouseEnter={() => setHoveredSegment('Broken')}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer ${hoveredSegment === 'Broken' ? 'bg-red-500/5 border-red-500/20' : 'bg-[#1A1A1A] border-[#2A2A2A]'}`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#E53935]" />
                  <span className="font-medium text-white">Rusak / Mati</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs text-[#8E8E8E]">({brokenCount} unit)</span>
                  <span className="text-xs font-bold text-[#E53935]">{brokenPct}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SVG Pie Chart Canvas */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
            <svg width="150" height="150" viewBox="0 0 42 42" className="transform -rotate-90">
              {/* Pie Background circle */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#2A2A2A" strokeWidth="4" />
              
              {/* Ready Stroke */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke={hoveredSegment === 'Good' ? '#00E676' : '#00C853'} 
                strokeWidth={hoveredSegment === 'Good' ? '5.5' : '4'}
                strokeDasharray={`${goodPct} ${100 - goodPct}`} 
                strokeDashoffset="0"
                className="transition-all duration-300"
              />
              
              {/* Repair Stroke */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke={hoveredSegment === 'Repair' ? '#FFC107' : '#FFB300'} 
                strokeWidth={hoveredSegment === 'Repair' ? '5.5' : '4'}
                strokeDasharray={`${repairPct} ${100 - repairPct}`} 
                strokeDashoffset={-goodPct}
                className="transition-all duration-300"
              />

              {/* Broken Stroke */}
              <circle 
                cx="21" 
                cy="21" 
                r="15.915" 
                fill="transparent" 
                stroke={hoveredSegment === 'Broken' ? '#FF5252' : '#E53935'} 
                strokeWidth={hoveredSegment === 'Broken' ? '5.5' : '4'}
                strokeDasharray={`${brokenPct} ${100 - brokenPct}`} 
                strokeDashoffset={-(goodPct + repairPct)}
                className="transition-all duration-300"
              />
            </svg>
            
            {/* Center Label inside donut */}
            <div className="absolute flex flex-col items-center text-center justify-center font-sans">
              <span className="text-xl font-bold font-mono text-white select-none">{totalItems}</span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-[#8E8E8E]">Total</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Split layout for Activities (Logs) and Actions (Maintenance Calendar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
        
        {/* Left column: Aktivitas Terakhir (Log Stok) */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Aktivitas Log Terakhir</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('logs')}
                className="text-[#8E8E8E] hover:text-emerald-450 text-xs transition-colors flex items-center gap-0.5"
              >
                Semua Log <ArrowUpRight className="w-3 h-3 text-[#00C853]" />
              </button>
            </div>

            {/* Logs List representation */}
            <div className="space-y-3 min-h-[250px]">
              {recentLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#8E8E8E] bg-[#1A1A1A] border border-dashed border-[#2A2A2A] rounded-xl">
                  <History className="w-8 h-8 opacity-25 mb-2" />
                  <p className="text-xs">Belum ada aktivitas stok terdaftar.</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center justify-between gap-4 transition-all hover:bg-[#1A1A1A]/90 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.type === 'Masuk' 
                          ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/15' 
                          : 'bg-red-500/10 text-red-450 border border-red-500/15'
                      }`}>
                        {log.type === 'Masuk' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate leading-tight group-hover:text-[#00C853] transition-colors">{log.itemName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-[#8E8E8E] font-mono tracking-tight shrink-0">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="text-[#2A2A2A] font-mono text-[10px] shrink-0">•</span>
                          <span className="text-[10px] text-[#8E8E8E] truncate tracking-tight">{log.destinationOrSource}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className={`text-xs font-bold ${log.type === 'Masuk' ? 'text-[#00C853]' : 'text-red-400'}`}>
                        {log.type === 'Masuk' ? '+' : '-'}{log.quantity}
                      </div>
                      <span className="text-[9px] text-[#8E8E8E] font-mono">Unit</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="text-[11px] text-[#8E8E8E] font-mono mt-4 pt-3 border-t border-[#2A2A2A] flex justify-between">
            <span>Metode Alokasi: FIFO</span>
            <span>Total Transaksi: {logs.length}</span>
          </div>
        </div>

        {/* Right column: Jadwal Perawatan & Quick Alerts */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#FFB300]" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Jadwal Perawatan Alat</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('maintenance')}
                className="text-[#8E8E8E] hover:text-amber-400 text-xs transition-colors flex items-center gap-0.5"
              >
                Garis Waktu <ArrowUpRight className="w-3 h-3 text-[#FFB300]" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Quick Alert Warning */}
              {pendingMaintenance > 0 && (
                <div className="p-3 bg-amber-500/5 border border-amber-550/20 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-medium">Beban Pemeliharaan Tertunda</p>
                    <p className="text-[#8E8E8E] text-[11px] mt-0.5">Ada {pendingMaintenance} alat gym yang saat ini masuk dalam antrean atau terjadwal untuk perbaikan.</p>
                  </div>
                </div>
              )}

              {/* Maintenance List snippet */}
              <div className="space-y-2.5 min-h-[170px]">
                {maintenance.filter(m => m.status === 'Mendatang').slice(0, 3).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-[#8E8E8E] bg-[#1A1A1A] border border-dashed border-[#2A2A2A] rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                    <p className="text-xs">Semua armada berada dalam status prima!</p>
                  </div>
                ) : (
                  maintenance.filter(m => m.status === 'Mendatang').slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.itemName}</p>
                        <p className="text-[10px] text-amber-400 font-mono mt-0.5 truncate">{item.maintenanceType}</p>
                      </div>
                      <div className="text-right ml-4 shrink-0 font-mono">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          {item.nextServiceDate}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#1A1A1A]/60 border border-[#2A2A2A] rounded-xl flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 font-sans">
              <Sparkles className="w-3.5 h-3.5 text-[#00C853]" />
              <span className="text-[10px] font-mono text-[#8E8E8E]">Rasio Operasional Gudang:</span>
            </div>
            <span className="text-xs font-bold text-[#00C853] font-mono">
              {Math.round(((goodCount + repairCount) / (totalItems || 1)) * 100)}% Layak
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
