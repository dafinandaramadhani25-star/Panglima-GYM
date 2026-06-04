export type EquipmentCondition = 'Good' | 'In Repairs' | 'Broken';

export interface GymItem {
  id: string;
  name: string;
  brand: string;
  serial: string;
  category: string;
  condition: EquipmentCondition;
  location: string;
  totalStock: number;
  imageUrl?: string;
  qrCodeUrl?: string;
  description?: string;
  updatedAt: string;
}

export interface MaintenanceEntry {
  id: string;
  itemId: string;
  itemName: string;
  nextServiceDate: string;
  maintenanceType: string;
  status: 'Selesai' | 'Mendatang';
}

export interface StockLog {
  id: string;
  timestamp: string;
  type: 'Masuk' | 'Keluar';
  itemId: string;
  itemName: string;
  quantity: number;
  userEmail: string;
  userName: string;
  destinationOrSource: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'Admin' | 'Staff';
}
