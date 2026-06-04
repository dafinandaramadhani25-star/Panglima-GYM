import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

import firebaseConfig from '../firebase-applet-config.json';
import { GymItem, MaintenanceEntry, StockLog } from '../types';

// Operation Types as defined in the rules
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// 1. Initialize Firebase Safety Shield
export const isFirebaseConfigured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "");

let appInstance: any = null;
let dbInstance: any = null;
let authInstance: any = null;

if (isFirebaseConfigured) {
  try {
    appInstance = initializeApp(firebaseConfig);
    dbInstance = getFirestore(appInstance, firebaseConfig.firestoreDatabaseId || '(default)');
    authInstance = getAuth(appInstance);
    
    // Validate Connection to Firestore (As mandated in custom rules)
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(dbInstance, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration (client is offline).");
        }
      }
    };
    testConnection();
  } catch (err) {
    console.error("Failed to initialize Firebase SDK:", err);
  }
}

export const app = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

// 2. Specific Custom Error Handler as mandated by Rule 3 of Firebase Skill
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = authInstance?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('[Firestore Error Response]', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}

// --- LOCAL PERSISTENCE LAYER (Fallback when firebase is offline or not configured) ---
const INITIAL_ITEMS: GymItem[] = [
  {
    id: 'item-1',
    name: 'Treadmill Commercial T600',
    brand: 'Matrix Fitness',
    serial: 'MX-TRD-48902-A',
    category: 'Cardio',
    condition: 'Good',
    location: 'Area Kardio Barat',
    totalStock: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-MATRIX-T600',
    description: 'Treadmill performansi tinggi dengan motor AC 4.2HP, konsol LED terang, dan sistem peredam kejut Ultimate Deck.',
    updatedAt: new Date('2026-06-01T10:00:00Z').toISOString()
  },
  {
    id: 'item-2',
    name: 'Smith Machine Series 700',
    brand: 'Life Fitness',
    serial: 'LF-SM-93108-B',
    category: 'Strength',
    condition: 'In Repairs',
    location: 'Zon Bebas Beban Tengah',
    totalStock: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-SMITH-700',
    description: 'Sistem pengaman lintasan bar 7 derajat natural dengan bantalan linier presisi tinggi demi keamanan latihan kekuatan.',
    updatedAt: new Date('2026-06-03T14:30:00Z').toISOString()
  },
  {
    id: 'item-3',
    name: 'Olympic Hex Trap Bar 20kg',
    brand: 'Rogue Fitness',
    serial: 'RG-HEX-10293-F',
    category: 'Free Weights',
    condition: 'Good',
    location: 'Zon Angkat Berat Utama',
    totalStock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-ROGUE-HEX',
    description: 'Bilah hex bar lapis kromium industrial berkualitas tinggi, sangat direkomendasikan untuk sesi deadlift presisi tinggi.',
    updatedAt: new Date('2026-06-04T08:15:00Z').toISOString()
  },
  {
    id: 'item-4',
    name: 'Adjustable Cable Crossover',
    brand: 'Technogym',
    serial: 'TG-CO-39482-K',
    category: 'Strength',
    condition: 'Broken',
    location: 'Zon Kabel Statis Timur',
    totalStock: 1,
    imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=300&auto=format&fit=crop',
    qrCodeUrl: 'MOCK-QR-TECHNO-CROSS',
    description: 'Kabel baja dilapisi polimer untuk resistensi mulus, pulley yang dapat disesuaikan ketinggiannya. Kabel saat ini putus dan perlu diganti.',
    updatedAt: new Date('2026-06-04T12:00:00Z').toISOString()
  }
];

const INITIAL_MAINTENANCE: MaintenanceEntry[] = [
  {
    id: 'maint-1',
    itemId: 'item-2',
    itemName: 'Smith Machine Series 700',
    nextServiceDate: '2026-06-10',
    maintenanceType: 'Lubrikasi Lintasan Rel & Kalibrasi Kabel',
    status: 'Mendatang'
  },
  {
    id: 'maint-2',
    itemId: 'item-4',
    itemName: 'Adjustable Cable Crossover',
    nextServiceDate: '2026-06-05',
    maintenanceType: 'Pengantian Kabel Utama Baja & Pulley Atas',
    status: 'Mendatang'
  },
  {
    id: 'maint-3',
    itemId: 'item-1',
    itemName: 'Treadmill Commercial T600',
    nextServiceDate: '2026-05-28',
    maintenanceType: 'Pembersihan Debu Motor & Vakum Kolom Karpet',
    status: 'Selesai'
  }
];

const INITIAL_LOGS: StockLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-04T12:00:00Z',
    type: 'Keluar',
    itemId: 'item-4',
    itemName: 'Adjustable Cable Crossover',
    quantity: 1,
    userEmail: 'dafinandaramadhani25@gmail.com',
    userName: 'Dafina Ramadhani',
    destinationOrSource: 'Dikirim ke Bengkel Vendor Utama'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-04T08:15:00Z',
    type: 'Masuk',
    itemId: 'item-3',
    itemName: 'Olympic Hex Trap Bar 20kg',
    quantity: 3,
    userEmail: 'dafinandaramadhani25@gmail.com',
    userName: 'Dafina Ramadhani',
    destinationOrSource: 'Pemasok Rogue Jakarta Barat'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-03T14:30:00Z',
    type: 'Masuk',
    itemId: 'item-2',
    itemName: 'Smith Machine Series 700',
    quantity: 2,
    userEmail: 'admin@panglimagym.com',
    userName: 'Panglima Admin',
    destinationOrSource: 'Gudang Utama Panglima Gym'
  }
];

// Load local helper functions
export const getLocalItems = (): GymItem[] => {
  const raw = localStorage.getItem('gymstock_items');
  if (!raw) {
    localStorage.setItem('gymstock_items', JSON.stringify(INITIAL_ITEMS));
    return INITIAL_ITEMS;
  }
  return JSON.parse(raw);
};

export const setLocalItems = (items: GymItem[]) => {
  localStorage.setItem('gymstock_items', JSON.stringify(items));
};

export const getLocalMaintenance = (): MaintenanceEntry[] => {
  const raw = localStorage.getItem('gymstock_maint');
  if (!raw) {
    localStorage.setItem('gymstock_maint', JSON.stringify(INITIAL_MAINTENANCE));
    return INITIAL_MAINTENANCE;
  }
  return JSON.parse(raw);
};

export const setLocalMaintenance = (maint: MaintenanceEntry[]) => {
  localStorage.setItem('gymstock_maint', JSON.stringify(maint));
};

export const getLocalLogs = (): StockLog[] => {
  const raw = localStorage.getItem('gymstock_logs');
  if (!raw) {
    localStorage.setItem('gymstock_logs', JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  }
  return JSON.parse(raw);
};

export const setLocalLogs = (logs: StockLog[]) => {
  localStorage.setItem('gymstock_logs', JSON.stringify(logs));
};
