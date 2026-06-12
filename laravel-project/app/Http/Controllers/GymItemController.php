<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GymItem;
use App\Models\StockLog;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class GymItemController extends Controller
{
    /**
     * Tampilkan katalog inventaris barang
     */
    public function index(Request $request)
    {
        $query = GymItem::query();

        // Pencarian berdasarkan nama, brand, serial, atau lokasi
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('serial', 'LIKE', "%{$search}%")
                  ->orWhere('location', 'LIKE', "%{$search}%");
            });
        }

        // Filter berdasarkan Kategori
        if ($request->filled('category') && $request->input('category') !== 'Semua') {
            $query->where('category', $request->input('category'));
        }

        // Filter berdasarkan Kondisi fisik
        if ($request->filled('condition') && $request->input('condition') !== 'Semua') {
            $query->where('condition', $request->input('condition'));
        }

        $items = $query->orderBy('created_at', 'desc')->get();
        
        // Dapatkan semua kategori unik untuk opsi filter dropdown
        $allCategories = GymItem::distinct()->pluck('category')->filter()->values();

        return view('catalog.index', compact('items', 'allCategories'));
    }

    /**
     * Simpan alat olahraga baru ke inventaris
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'serial' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'condition' => 'required|string|in:Good,In Repairs,Broken',
            'location' => 'nullable|string|max:255',
            'total_stock' => 'required|integer|min:0',
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $itemId = 'item-' . Str::uuid();

        // Buat url kode QR tiruan
        $qrUrl = 'MOCK-QR-' . ($validated['serial'] ?: strtoupper(Str::random(10)));

        $item = GymItem::create([
            'id' => $itemId,
            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'serial' => $validated['serial'],
            'category' => $validated['category'] ?: 'Umum',
            'condition' => $validated['condition'],
            'location' => $validated['location'],
            'total_stock' => $validated['total_stock'],
            'image_url' => $validated['image_url'] ?: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=300&auto=format&fit=crop',
            'qr_code_url' => $qrUrl,
            'description' => $validated['description'],
        ]);

        // Buat detail log masuk awal
        StockLog::create([
            'id' => 'log-' . Str::uuid(),
            'type' => 'Masuk',
            'item_id' => $item->id,
            'item_name' => $item->name,
            'quantity' => $item->total_stock,
            'user_email' => Auth::user()->email,
            'user_name' => Auth::user()->name,
            'destination_or_source' => 'Registrasi Unit Awal'
        ]);

        return redirect()->route('catalog.index')
            ->with('success', "Alat olahraga '{$item->name}' baru berhasil ditambahkan!");
    }

    /**
     * Update detail informasi alat olahraga
     */
    public function update(Request $request, $id)
    {
        $item = GymItem::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'serial' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'condition' => 'required|string|in:Good,In Repairs,Broken',
            'location' => 'nullable|string|max:255',
            'image_url' => 'nullable|url',
            'description' => 'nullable|string',
        ]);

        $item->update([
            'name' => $validated['name'],
            'brand' => $validated['brand'],
            'serial' => $validated['serial'],
            'category' => $validated['category'] ?: 'Umum',
            'condition' => $validated['condition'],
            'location' => $validated['location'],
            'image_url' => $validated['image_url'],
            'description' => $validated['description'],
        ]);

        return redirect()->route('catalog.index')
            ->with('success', "Informasi '{$item->name}' berhasil diperbarui!");
    }

    /**
     * Hapus barang dari inventaris secara permanen
     */
    public function destroy($id)
    {
        $item = GymItem::findOrFail($id);
        $itemName = $item->name;
        $item->delete();

        return redirect()->route('catalog.index')
            ->with('info', "Barang '{$itemName}' telah berhasil dihapus dari sistem.");
    }

    /**
     * Proses penyesuaian stok masuk / keluar
     */
    public function adjustStock(Request $request, $id)
    {
        $item = GymItem::findOrFail($id);

        $validated = $request->validate([
            'type' => 'required|in:Masuk,Keluar',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:255',
        ]);

        $qty = $validated['quantity'];
        $type = $validated['type'];

        if ($type === 'Masuk') {
            $item->total_stock += $qty;
            $defaultReason = 'Pengadaan Penambahan Stok';
        } else {
            $item->total_stock = max(0, $item->total_stock - $qty);
            $defaultReason = 'Penarikan/Peralihan Unit';
        }

        $item->save();

        // Tambahkan catatan logs transaksi stok
        StockLog::create([
            'id' => 'log-' . Str::uuid(),
            'type' => $type,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'quantity' => $qty,
            'user_email' => Auth::user()->email,
            'user_name' => Auth::user()->name,
            'destination_or_source' => $validated['reason'] ?: $defaultReason
        ]);

        return redirect()->route('catalog.index')
            ->with('success', "Status stok '{$item->name}' berhasil disesuaikan ({$type} {$qty} Unit).");
    }
}
