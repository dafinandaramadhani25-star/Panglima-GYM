import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  QrCode, 
  MapPin, 
  Tag, 
  X, 
  AlertCircle, 
  PackageMinus, 
  PackagePlus,
  Dumbbell
} from 'lucide-react';
import { GymItem, EquipmentCondition } from '../types';

interface KatalogViewProps {
  items: GymItem[];
  onAddItem: (item: Omit<GymItem, 'id' | 'qrCodeUrl' | 'updatedAt'>) => void;
  onEditItem: (item: GymItem) => void;
  onDeleteItem: (id: string) => void;
  onStockInOut: (itemId: string, type: 'Masuk' | 'Keluar', qty: number, reason: string) => void;
}

export default function KatalogView({ items, onAddItem, onEditItem, onDeleteItem, onStockInOut }: KatalogViewProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [conditionFilter, setConditionFilter] = useState('All');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<GymItem | null>(null);

  // New Item and Edit Forms
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formCategory, setFormCategory] = useState('Cardio');
  const [formCondition, setFormCondition] = useState<EquipmentCondition>('Good');
  const [formLocation, setFormLocation] = useState('');
  const [formStock, setFormStock] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Stock mutation State
  const [stockQty, setStockQty] = useState(1);
  const [stockReason, setStockReason] = useState('');

  // 1. Get unique categories
  const categories = useMemo(() => {
    const list = new Set(items.map(item => item.category));
    return ['All', ...Array.from(list)];
  }, [items]);

  // 2. Filter & Search items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase()) ||
        item.serial.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchCondition = conditionFilter === 'All' || item.condition === conditionFilter;

      return matchSearch && matchCategory && matchCondition;
    });
  }, [items, search, categoryFilter, conditionFilter]);

  // Handle open add model
  const openAddModal = () => {
    setIsEditing(false);
    setEditingItem(null);
    setFormName('');
    setFormBrand('');
    setFormSerial('PGL-GYM-' + Math.floor(10000 + Math.random() * 90000));
    setFormCategory('Cardio');
    setFormCondition('Good');
    setFormLocation('Gudang Utama A');
    setFormStock(1);
    setFormDescription('');
    setFormImageUrl('');
    setIsModalOpen(true);
  };

  // Handle open edit modal
  const openEditModal = (e: React.MouseEvent, item: GymItem) => {
    e.stopPropagation(); // prevent expanding row
    setIsEditing(true);
    setEditingItem(item);
    setFormName(item.name);
    setFormBrand(item.brand);
    setFormSerial(item.serial);
    setFormCategory(item.category);
    setFormCondition(item.condition);
    setFormLocation(item.location);
    setFormStock(item.totalStock);
    setFormDescription(item.description || '');
    setFormImageUrl(item.imageUrl || '');
    setIsModalOpen(true);
  };

  // Safe delete handler
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Apakah Anda yakin ingin menghapus barang ini dari katalog?')) {
      onDeleteItem(id);
      if (expandedRowId === id) setExpandedRowId(null);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formBrand || !formSerial || !formLocation) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    if (isEditing && editingItem) {
      onEditItem({
        ...editingItem,
        name: formName,
        brand: formBrand,
        serial: formSerial,
        category: formCategory,
        condition: formCondition,
        location: formLocation,
        totalStock: Number(formStock),
        description: formDescription,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200',
        updatedAt: new Date().toISOString()
      });
    } else {
      onAddItem({
        name: formName,
        brand: formBrand,
        serial: formSerial,
        category: formCategory,
        condition: formCondition,
        location: formLocation,
        totalStock: Number(formStock),
        description: formDescription,
        imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200'
      });
    }

    setIsModalOpen(false);
  };

  // Simple QR Grid Drawing component
  const MiniQRCode = ({ value }: { value: string }) => {
    // Generates a mock but realistic QR code matrix visually
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };

    const hash = hashCode(value);
    const size = 16; // 16x16 grid
    const cells = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        // Create standard QR alignment squares on corners
        const isFinderPattern = 
          (r < 5 && c < 5) || 
          (r < 5 && c > size - 6) || 
          (r > size - 6 && c < 5);
        if (isFinderPattern) {
          // Fill outer frame of corner finders
          const border = r === 0 || r === 4 || c === 0 || c === 4 ||
                         r === 0 || r === 4 || c === size - 5 || c === size - 1 ||
                         r === size - 5 || r === size - 1 || c === 0 || c === 4;
          const center = (r === 2 && c === 2) || (r === 2 && c === size - 3) || (r === size - 3 && c === 2);
          row.push(border || center);
        } else {
          // Semi-random noise from hashing
          row.push(((hash >> (r + c)) % 3 === 0) || ((r * c) % 5 === 0));
        }
      }
      cells.push(row);
    }

    return (
      <div className="bg-[#ffffff] p-2 rounded-lg inline-block shadow-inner border border-white/10">
        <div className="grid grid-cols-16 gap-0 bg-white" style={{ width: '84px', height: '84px' }}>
          {cells.flatMap((row, ri) => 
            row.map((active, ci) => (
              <div 
                key={`${ri}-${ci}`} 
                className={active ? 'bg-black' : 'bg-white'} 
                style={{ width: '5.25px', height: '5.25px' }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title section with Add Equipment trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Katalog Barang</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pantau unit peralatan gym, kelola serial, status kondisi, lokasi penyimpanan, dan QR tracking.</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#00C853] hover:bg-[#00E676] text-black text-xs font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10 shrink-0 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Tambah Barang</span>
        </button>
      </div>

      {/* Advanced Filters Block */}
      <div className="bg-[#121212] border border-[#2A2A2A] p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm font-sans">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8E8E8E]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama, merek, atau serial..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-xs placeholder-[#8E8E8E] focus:outline-none focus:ring-0 text-white transition-colors font-sans"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#1A1A1A] p-2 rounded-lg border border-[#2A2A2A] shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8E8E8E]" />
            <span className="text-[10px] text-[#8E8E8E] font-mono tracking-wider uppercase mr-1">Filter</span>
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-36 px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white rounded-lg focus:outline-none hover:border-gray-700 transition-colors cursor-pointer appearance-none font-sans"
            >
              <option value="All">Semua Kategori</option>
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full md:w-36 px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] text-xs text-white rounded-lg focus:outline-none hover:border-gray-700 transition-colors cursor-pointer appearance-none font-sans"
            >
              <option value="All">Semua Kondisi</option>
              <option value="Good">Siap Pakai (Good)</option>
              <option value="In Repairs">Diservis</option>
              <option value="Broken">Rusak / Mati</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A2A2A] bg-[#1a1a1a]/40 text-[#8E8E8E] font-mono uppercase tracking-widest text-[9px]">
                <th className="py-4 px-5">Nama Alat / Merek</th>
                <th className="py-4 px-4">Serial</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4">Kondisi</th>
                <th className="py-4 px-4">Lokasi</th>
                <th className="py-4 px-4 text-center">Stok</th>
                <th className="py-4 px-5 text-right w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A] font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-xs text-[#8E8E8E]">
                    <Dumbbell className="w-10 h-10 text-[#2A2A2A] mx-auto opacity-30 mb-3" />
                    Tidak ada barang ditemukan yang cocok dengan kriteria filter masukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedRowId === item.id;
                  
                  return (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                        className={`hover:bg-white/[0.01] transition-colors cursor-pointer group ${isExpanded ? 'bg-white/[0.015]' : ''}`}
                      >
                        {/* Nama & Merek row */}
                        <td className="py-4.5 px-5">
                          <div className="flex items-center gap-3">
                            {/* Small thumbnail model */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" />
                              ) : (
                                <Dumbbell className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white group-hover:text-[#00C853] transition-colors">{item.name}</p>
                              <p className="text-[10px] text-[#8E8E8E] font-mono mt-0.5">{item.brand}</p>
                            </div>
                          </div>
                        </td>

                        {/* Serial code */}
                        <td className="py-4.5 px-4 font-mono text-[11px] text-[#8E8E8E]">
                          {item.serial}
                        </td>

                        {/* Kategori */}
                        <td className="py-4.5 px-4">
                          <span className="text-[10px] text-[#8E8E8E] font-medium px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A]">
                            {item.category}
                          </span>
                        </td>

                        {/* Kondisi status */}
                        <td className="py-4.5 px-4">
                          {item.condition === 'Good' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#00C853] font-sans font-medium px-2 py-0.5 rounded bg-[#00C853]/10 border border-[#00C853]/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" /> Ready
                            </span>
                          )}
                          {item.condition === 'In Repairs' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#FFB300] font-sans font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FFB300]" /> Servising
                            </span>
                          )}
                          {item.condition === 'Broken' && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#E53935] font-sans font-medium px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E53935]" /> Broken
                            </span>
                          )}
                        </td>

                        {/* Lokasi */}
                        <td className="py-4.5 px-4 text-xs text-[#8E8E8E]">
                          <div className="flex items-center gap-1 font-sans">
                            <MapPin className="w-3.5 h-3.5 text-[#8E8E8E]" />
                            <span className="truncate max-w-[110px]">{item.location}</span>
                          </div>
                        </td>

                        {/* Total Stock */}
                        <td className="py-4.5 px-4 text-center font-mono text-xs font-semibold text-white">
                          {item.totalStock}
                        </td>

                        {/* Actions pencil & trash */}
                        <td className="py-4.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => openEditModal(e, item)}
                              title="Sunting data"
                              className="p-1.5 text-[#8E8E8E] hover:text-white hover:bg-white/[0.03] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, item.id)}
                              title="Hapus barang"
                              className="p-1.5 text-[#8E8E8E] hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="ml-1">
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#00C853]" /> : <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-300" />}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr className="bg-[#1A1A1A]/40 border-l-2 border-[#00C853] font-sans">
                            <td colSpan={7} className="p-0 border-b border-[#2A2A2A]">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                                  
                                  {/* Section left: Dynamic mock vector QRCode card */}
                                  <div className="md:col-span-3 flex flex-col items-center justify-center p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-center space-y-3">
                                    <MiniQRCode value={item.serial} />
                                    <div>
                                      <span className="text-[10px] text-[#8E8E8E] font-mono">CODE SERIAL</span>
                                      <p className="text-xs font-semibold text-white font-mono tracking-wide">{item.serial}</p>
                                    </div>
                                    <div className="text-[10px] text-[#00C853] font-mono flex items-center justify-center gap-1 bg-[#00C853]/5 px-2 py-0.5 rounded border border-[#00C853]/15">
                                      <QrCode className="w-3.5 h-3.5" /> Pindai untuk Cek Cepat
                                    </div>
                                  </div>

                                  {/* Section center: Detailed specification */}
                                  <div className="md:col-span-5 space-y-4">
                                    <div>
                                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#00C853]">Keterangan Detail</span>
                                      <p className="text-xs text-gray-300 leading-relaxed mt-1">
                                        {item.description || 'Barang komersial bersponsor Panglima GYM, dirawat berkala untuk kepuasan pelanggan.'}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-xs pt-1 border-t border-[#2A2A2A]">
                                      <div>
                                        <p className="text-[#8E8E8E] font-mono text-[10px]">Lokasi Penempatan:</p>
                                        <p className="text-white mt-0.5 font-medium">{item.location}</p>
                                      </div>
                                      <div>
                                        <p className="text-[#8E8E8E] font-mono text-[10px]">Terakhir Diperbarui:</p>
                                        <p className="text-white mt-0.5 font-mono">{new Date(item.updatedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section right: Quick Stock Mutation Panel */}
                                  <div className="md:col-span-4 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl flex flex-col justify-between">
                                    <div>
                                      <span className="text-[10px] text-[#8E8E8E] font-mono uppercase tracking-wider block mb-2">Penyesuaian Cepat Stok</span>
                                      
                                      <div className="flex items-center gap-2 mb-3">
                                        <input
                                          type="number"
                                          min="1"
                                          value={stockQty}
                                          onChange={(e) => setStockQty(Math.max(1, parseInt(e.target.value) || 1))}
                                          className="w-16 px-2 py-1.5 bg-[#121212] border border-[#2A2A2A] text-xs text-white rounded focus:outline-none focus:border-[#00C853]/40 text-center font-mono"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Penyebab perpindahan... (pilihan)"
                                          value={stockReason}
                                          onChange={(e) => setStockReason(e.target.value)}
                                          className="flex-1 px-2.5 py-1.5 bg-[#121212] border border-[#2A2A2A] text-xs text-white rounded focus:outline-none focus:border-[#00C853]/40 placeholder-[#8E8E8E]"
                                        />
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => {
                                          onStockInOut(item.id, 'Masuk', stockQty, stockReason || 'Re-stock gudang');
                                          setStockReason('');
                                        }}
                                        className="flex-1 py-2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[#00C853] text-[11px] font-semibold border border-emerald-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <PackagePlus className="w-3.5 h-3.5" /> Stok Masuk
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (item.totalStock < stockQty) {
                                            alert('Kesalahan: Jumlah stok keluar melebihi sisa stok terdaftar!');
                                            return;
                                          }
                                          onStockInOut(item.id, 'Keluar', stockQty, stockReason || 'Pengambilan unit');
                                          setStockReason('');
                                        }}
                                        className="flex-1 py-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <PackageMinus className="w-3.5 h-3.5" /> Stok Keluar
                                      </button>
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adding & Editing Drawer/Modal Dialog */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
            {/* Modal Backdrop overlay click */}
            <div className="absolute inset-0 cursor-default" onClick={() => setIsModalOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#121212] border-l border-[#2A2A2A] h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-widest">
                      {isEditing ? 'SUNTING ALAT' : 'TAMBAH BARANG GUDANG'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-1 text-[#8E8E8E] hover:text-white hover:bg-white/[0.05] rounded-md cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  
                  {/* Name */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Nama Peralatan Gym *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Contoh: Hex Dumbbell Set 5kg-20kg"
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none"
                    />
                  </div>

                  {/* Brand & Serial Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Merek Dagang *</label>
                      <input
                        type="text"
                        required
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="Contoh: Rogue Fitness"
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Nomor Serial *</label>
                      <input
                        type="text"
                        required
                        value={formSerial}
                        onChange={(e) => setFormSerial(e.target.value)}
                        placeholder="Contoh: RG-DB-29201"
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Categorization & Condition Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Kategori *</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none cursor-pointer appearance-none"
                      >
                        <option value="Cardio">Cardio</option>
                        <option value="Strength">Strength</option>
                        <option value="Free Weights">Free Weights</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Spesifikasi Kondisi *</label>
                      <select
                        value={formCondition}
                        onChange={(e) => setFormCondition(e.target.value as EquipmentCondition)}
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none cursor-pointer appearance-none"
                      >
                        <option value="Good">Siap Pakai (Good)</option>
                        <option value="In Repairs">Diservis (In Repairs)</option>
                        <option value="Broken">Rusak / Mati</option>
                      </select>
                    </div>
                  </div>

                  {/* Location & Total Stock */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Lokasi Gudang *</label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Contoh: Area Lapis Baja B"
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Stok Awal *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        disabled={isEditing}
                        value={formStock}
                        onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2.5 bg-[#1A1A1A] disabled:opacity-50 border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white focus:outline-none font-mono text-center"
                      />
                    </div>
                  </div>

                  {/* Image URL of the item */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Tautan Foto / Ilustrasi (Pilihan)</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none"
                    />
                  </div>

                  {/* Description text area */}
                  <div>
                    <label className="block text-[#8E8E8E] font-mono uppercase tracking-wider mb-1">Catatan Tambahan & Spesifikasi</label>
                    <textarea
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Jelaskan spesifikasi material, lisensi distributor, garansi..."
                      className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-[#00C853]/30 rounded-lg text-white placeholder-[#8E8E8E] focus:outline-none resize-none"
                    />
                  </div>

                </form>
              </div>

              {/* Action feet */}
              <div className="pt-4 border-t border-[#2A2A2A] flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-gray-800 hover:border-gray-750 bg-transparent hover:bg-white/[0.02] text-xs font-semibold text-[#8E8E8E] hover:text-white rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-[#00C853] hover:bg-[#00E676] text-black text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/5 cursor-pointer"
                >
                  {isEditing ? 'Simpan Perubahan' : 'Simpan Barang'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
