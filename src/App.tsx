import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  Database, 
  CalendarClock, 
  History, 
  Users 
} from 'lucide-react';
import { 
  getLocalItems, 
  setLocalItems, 
  getLocalMaintenance, 
  setLocalMaintenance, 
  getLocalLogs, 
  setLocalLogs,
  isFirebaseConfigured,
  auth,
  db,
  handleFirestoreError,
  OperationType
} from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import { GymItem, MaintenanceEntry, StockLog, UserProfile } from './types';
import Sidebar, { SidebarTab } from './components/Sidebar';
import DashboardView from './components/DashboardView';
import KatalogView from './components/KatalogView';
import PerawatanView from './components/PerawatanView';
import LogView from './components/LogView';
import UserManagementView from './components/UserManagementView';
import LoginView from './components/LoginView';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { api } from './lib/api';

const INITIAL_USERS: (UserProfile & { password?: string })[] = [
  {
    uid: 'user-1',
    email: 'dafinandaramadhani25@gmail.com',
    displayName: 'Dafina Ramadhani',
    photoURL: null,
    role: 'Admin',
    password: 'panglimagym2026'
  },
  {
    uid: 'user-2',
    email: 'ahmad@gymstock.com',
    displayName: 'Ahmad Muzakir',
    photoURL: null,
    role: 'Staff',
    password: 'staffpassword2026'
  },
  {
    uid: 'user-3',
    email: 'budi@gymstock.com',
    displayName: 'Budi Santoso',
    photoURL: null,
    role: 'Staff',
    password: 'staffpassword22'
  }
];

export default function App() {
  // 1. Auth states
  const [user, setUser] = useState<{ email: string; displayName: string; role?: 'Admin' | 'Staff' } | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);

  // 2. Navigation states
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Database States
  const [items, setItems] = useState<GymItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEntry[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [personnel, setPersonnel] = useState<UserProfile[]>([]);
  const [dbStatus, setDbStatus] = useState<{ mode: string; database: string; host: string } | null>(null);

  // Initialize data from Full-Stack Express Server (interfaced to local MySQL or high-fidelity JSON files folder)
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [status, fetchedItems, fetchedMaint, fetchedLogs, fetchedUsers] = await Promise.all([
          api.getStatus(),
          api.getItems(),
          api.getMaintenance(),
          api.getLogs(),
          api.getUsers()
        ]);
        
        setDbStatus(status);
        setItems(fetchedItems);
        setMaintenance(fetchedMaint);
        setLogs(fetchedLogs);
        setPersonnel(fetchedUsers);

        // Keep direct local copy updated for safety
        setLocalItems(fetchedItems);
        setLocalMaintenance(fetchedMaint);
        setLocalLogs(fetchedLogs);
        localStorage.setItem('gymstock_personnel', JSON.stringify(fetchedUsers));
      } catch (err) {
        console.warn("Backend server API is unreachable or not running. Loading sandbox LocalStorage fallback.", err);
        // Load fallback storage
        setItems(getLocalItems());
        setMaintenance(getLocalMaintenance());
        setLogs(getLocalLogs());
        
        const storedUsers = localStorage.getItem('gymstock_personnel');
        if (storedUsers) {
          setPersonnel(JSON.parse(storedUsers));
        } else {
          setPersonnel(INITIAL_USERS);
          localStorage.setItem('gymstock_personnel', JSON.stringify(INITIAL_USERS));
        }
      }
    }
    loadBackendData();
  }, []);

  // Monitor Auth Changes if Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          // Look up user's role from personnel database
          const storedUsers = localStorage.getItem('gymstock_personnel');
          const localProfiles: any[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
          const matched = localProfiles.find(u => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
          const role = matched?.role || 'Staff';
          const displayName = matched?.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Operator';

          const profile = {
            email: firebaseUser.email || 'operator@panglimagym.com',
            displayName: displayName,
            role: role as 'Admin' | 'Staff'
          };
          setUser(profile);
          
          // Seed to personnel list if not exist
          setPersonnel((prev) => {
            const hasCorrectUid = prev.some(u => u.email?.toLowerCase() === profile.email?.toLowerCase() && u.uid === firebaseUser.uid);
            if (!hasCorrectUid) {
              const existsByEmail = prev.some(u => u.email?.toLowerCase() === profile.email?.toLowerCase());
              let updated;
              if (existsByEmail) {
                updated = prev.map(u => u.email?.toLowerCase() === profile.email?.toLowerCase() 
                  ? { ...u, uid: firebaseUser.uid, displayName: profile.displayName, role: role as 'Admin' | 'Staff' } 
                  : u
                );
              } else {
                updated = [
                  ...prev,
                  {
                    uid: firebaseUser.uid,
                    email: profile.email,
                    displayName: profile.displayName,
                    photoURL: firebaseUser.photoURL || null,
                    role: role as 'Admin' | 'Staff'
                  }
                ];
              }
              localStorage.setItem('gymstock_personnel', JSON.stringify(updated));
              
              // Seed/sync to Firestore newly logging-in user under their real Firebase Auth UID
              if (db) {
                const userDocRef = doc(db, 'userProfiles', firebaseUser.uid);
                setDoc(userDocRef, {
                  uid: firebaseUser.uid,
                  email: profile.email,
                  displayName: profile.displayName,
                  role: role as 'Admin' | 'Staff'
                }).catch((err) => {
                  console.warn("Could not sync profile to Firestore yet.", err.message);
                });
              }
              return updated;
            }
            return prev;
          });
        } else {
          setUser(null);
        }
        setAuthLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // 4. Live Firebase Real-Time Synchronization Flow
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db || !user || !auth.currentUser) return;

    const unsubscribes: (() => void)[] = [];

    // Subscribe to gymItems
    try {
      const qItems = collection(db, 'gymItems');
      const unsubItems = onSnapshot(qItems, (snapshot) => {
        const fetchedItems: GymItem[] = [];
        snapshot.forEach((docSnap) => {
          fetchedItems.push(docSnap.data() as GymItem);
        });
        
        // If Firestore has items, set state. If it is completely empty, we can seed our INITIAL_ITEMS!
        if (fetchedItems.length > 0) {
          fetchedItems.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          setItems(fetchedItems);
          setLocalItems(fetchedItems);
        } else {
          // Seed initial items if database is totally empty
          const fallback = getLocalItems();
          fallback.forEach(async (item) => {
            try {
              await setDoc(doc(db, 'gymItems', item.id), item);
            } catch (err) {
              console.error("Failed to seed fallback item to firestore:", err);
            }
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'gymItems');
      });
      unsubscribes.push(unsubItems);
    } catch (err) {
      console.error(err);
    }

    // Subscribe to maintenanceSchedule
    try {
      const qMaint = collection(db, 'maintenanceSchedule');
      const unsubMaint = onSnapshot(qMaint, (snapshot) => {
        const fetchedMaint: MaintenanceEntry[] = [];
        snapshot.forEach((docSnap) => {
          fetchedMaint.push(docSnap.data() as MaintenanceEntry);
        });
        
        if (fetchedMaint.length > 0) {
          setMaintenance(fetchedMaint);
          setLocalMaintenance(fetchedMaint);
        } else {
          // Seed initial maintenance schedules
          const fallback = getLocalMaintenance();
          fallback.forEach(async (entry) => {
            try {
              await setDoc(doc(db, 'maintenanceSchedule', entry.id), entry);
            } catch (err) {
              console.error("Failed to seed fallback maintenance to firestore:", err);
            }
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'maintenanceSchedule');
      });
      unsubscribes.push(unsubMaint);
    } catch (err) {
      console.error(err);
    }

    // Subscribe to stockLogs
    try {
      const qLogs = collection(db, 'stockLogs');
      const unsubLogs = onSnapshot(qLogs, (snapshot) => {
        const fetchedLogs: StockLog[] = [];
        snapshot.forEach((docSnap) => {
          fetchedLogs.push(docSnap.data() as StockLog);
        });
        
        if (fetchedLogs.length > 0) {
          fetchedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLogs(fetchedLogs);
          setLocalLogs(fetchedLogs);
        } else {
          // Seed initial stock logs
          const fallback = getLocalLogs();
          fallback.forEach(async (log) => {
            try {
              await setDoc(doc(db, 'stockLogs', log.id), log);
            } catch (err) {
              console.error("Failed to seed fallback log to firestore:", err);
            }
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'stockLogs');
      });
      unsubscribes.push(unsubLogs);
    } catch (err) {
      console.error(err);
    }

    // Subscribe to userProfiles
    try {
      const qProfiles = collection(db, 'userProfiles');
      const unsubProfiles = onSnapshot(qProfiles, (snapshot) => {
        const fetchedProfiles: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          fetchedProfiles.push(docSnap.data() as UserProfile);
        });
        
        if (fetchedProfiles.length > 0) {
          setPersonnel(fetchedProfiles);
          localStorage.setItem('gymstock_personnel', JSON.stringify(fetchedProfiles));
        } else {
          // Seed initial personnel lists
          const storedUsers = localStorage.getItem('gymstock_personnel');
          const fallback: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
          fallback.forEach(async (prof) => {
            try {
              await setDoc(doc(db, 'userProfiles', prof.uid), prof);
            } catch (err) {
              console.error("Failed to seed fallback userProfile to firestore:", err);
            }
          });
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'userProfiles');
      });
      unsubscribes.push(unsubProfiles);
    } catch (err) {
      console.error(err);
    }

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  // Logout Handler
  const handleLogout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    }
    setUser(null);
    setActiveTab('dashboard');
  };

  // 5. DATABASE MUTATIONS TRIGGERS
  // Add item
  const handleAddItem = async (newRaw: Omit<GymItem, 'id' | 'qrCodeUrl' | 'updatedAt'>) => {
    try {
      const response = await api.saveItem(newRaw);
      const newItem = response.item;
      setItems(prev => [newItem, ...prev]);

      // Dynamic stock log creation of the initial stock
      const newLog: Omit<StockLog, 'id' | 'timestamp'> = {
        type: 'Masuk',
        itemId: newItem.id,
        itemName: newItem.name,
        quantity: newItem.totalStock,
        userEmail: user?.email || 'trial@panglimagym.com',
        userName: user?.displayName || 'Dafina Ramadhani',
        destinationOrSource: 'Registrasi Unit Awal'
      };
      const logRes = await api.saveLog(newLog);
      setLogs(prev => [logRes.log, ...prev]);

      // Synchronize to Cloud Firestore if connected
      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'gymItems', newItem.id), newItem).catch(() => {});
        setDoc(doc(db, 'stockLogs', logRes.log.id), logRes.log).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      // Memory state fallback
      const id = 'item-' + Date.now();
      const newItem: GymItem = {
        ...newRaw,
        id,
        qrCodeUrl: 'MOCK-QR-' + newRaw.serial,
        updatedAt: new Date().toISOString()
      };
      const updated = [newItem, ...items];
      setItems(updated);
      setLocalItems(updated);
    }
  };

  // Edit Item
  const handleEditItem = async (updatedItem: GymItem) => {
    try {
      await api.saveItem(updatedItem);
      setItems(prev => prev.map(it => it.id === updatedItem.id ? updatedItem : it));
      
      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'gymItems', updatedItem.id), updatedItem).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      const updated = items.map(it => it.id === updatedItem.id ? updatedItem : it);
      setItems(updated);
      setLocalItems(updated);
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      setItems(prev => prev.filter(it => it.id !== id));

      if (isFirebaseConfigured && db && auth?.currentUser) {
        deleteDoc(doc(db, 'gymItems', id)).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      const updated = items.filter(it => it.id !== id);
      setItems(updated);
      setLocalItems(updated);
    }
  };

  // Adjust stock in/out
  const handleStockInOut = async (itemId: string, type: 'Masuk' | 'Keluar', qty: number, reason: string) => {
    const target = items.find(it => it.id === itemId);
    if (!target) return;

    let newStock = target.totalStock;
    if (type === 'Masuk') {
      newStock += qty;
    } else {
      newStock = Math.max(0, newStock - qty);
    }

    const updatedItem = {
      ...target,
      totalStock: newStock,
      updatedAt: new Date().toISOString()
    };

    const newLog: Omit<StockLog, 'id' | 'timestamp'> = {
      type,
      itemId,
      itemName: target.name,
      quantity: qty,
      userEmail: user?.email || 'trial@panglimagym.com',
      userName: user?.displayName || 'Dafina Ramadhani',
      destinationOrSource: reason || (type === 'Masuk' ? 'Pengadaan Stok' : 'Pengurangan Unit')
    };

    try {
      // Save item and save log
      const [itemRes, logRes] = await Promise.all([
        api.saveItem(updatedItem),
        api.saveLog(newLog)
      ]);

      setItems(prev => prev.map(it => it.id === itemId ? itemRes.item : it));
      setLogs(prev => [logRes.log, ...prev]);

      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'gymItems', itemId), itemRes.item).catch(() => {});
        setDoc(doc(db, 'stockLogs', logRes.log.id), logRes.log).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setItems(prev => prev.map(it => it.id === itemId ? updatedItem : it));
      setLocalItems(items.map(it => it.id === itemId ? updatedItem : it));

      const fallbackLog: StockLog = {
        ...newLog,
        id: 'log-' + Date.now(),
        timestamp: new Date().toISOString()
      };
      setLogs(prev => [fallbackLog, ...prev]);
      setLocalLogs([fallbackLog, ...logs]);
    }
  };

  // Toggle Maintenance Status and automatically restore equipment condition to "Good"!
  const handleToggleMaint = async (maintId: string) => {
    const targetScheduler = maintenance.find(m => m.id === maintId);
    if (!targetScheduler) return;

    const completedStatus: 'Selesai' | 'Mendatang' = 
      targetScheduler.status === 'Mendatang' ? 'Selesai' : 'Mendatang';

    const updatedScheduler = {
      ...targetScheduler,
      status: completedStatus
    };

    try {
      await api.saveMaintenance(updatedScheduler);
      setMaintenance(prev => prev.map(m => m.id === maintId ? updatedScheduler : m));

      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'maintenanceSchedule', maintId), updatedScheduler).catch(() => {});
      }

      // If we mark a maintenance schedule as "Selesai", auto-repair and mark "Good"!
      if (completedStatus === 'Selesai') {
        const targetItem = items.find(it => it.id === targetScheduler.itemId);
        if (targetItem && (targetItem.condition === 'Broken' || targetItem.condition === 'In Repairs')) {
          const updatedItem: GymItem = {
            ...targetItem,
            condition: 'Good',
            updatedAt: new Date().toISOString()
          };

          const repairLog: Omit<StockLog, 'id' | 'timestamp'> = {
            type: 'Masuk',
            itemId: targetItem.id,
            itemName: targetItem.name,
            quantity: targetItem.totalStock,
            userEmail: user?.email || 'system@panglimagym.com',
            userName: 'System Auto Repair',
            destinationOrSource: `Service Selesai: ${targetScheduler.maintenanceType}`
          };

          const [itemRes, logRes] = await Promise.all([
            api.saveItem(updatedItem),
            api.saveLog(repairLog)
          ]);

          setItems(prev => prev.map(it => it.id === targetItem.id ? itemRes.item : it));
          setLogs(prev => [logRes.log, ...prev]);

          if (isFirebaseConfigured && db && auth?.currentUser) {
            setDoc(doc(db, 'gymItems', targetItem.id), itemRes.item).catch(() => {});
            setDoc(doc(db, 'stockLogs', logRes.log.id), logRes.log).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Local fallback
      setMaintenance(prev => prev.map(m => m.id === maintId ? updatedScheduler : m));
      setLocalMaintenance(maintenance.map(m => m.id === maintId ? updatedScheduler : m));
    }
  };

  // Add Maintenance schedule
  const handleAddSchedule = async (rawEntry: Omit<MaintenanceEntry, 'id'>) => {
    try {
      const res = await api.saveMaintenance(rawEntry);
      setMaintenance(prev => [res.entry, ...prev]);

      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'maintenanceSchedule', res.entry.id), res.entry).catch(() => {});
      }

      // Automatically flip physical condition to "In Repairs"
      const targetItem = items.find(it => it.id === rawEntry.itemId);
      if (targetItem && targetItem.condition === 'Good') {
        const updatedItem: GymItem = {
          ...targetItem,
          condition: 'In Repairs',
          updatedAt: new Date().toISOString()
        };
        const itemRes = await api.saveItem(updatedItem);
        setItems(prev => prev.map(it => it.id === targetItem.id ? itemRes.item : it));

        if (isFirebaseConfigured && db && auth?.currentUser) {
          setDoc(doc(db, 'gymItems', targetItem.id), itemRes.item).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const newEntry: MaintenanceEntry = {
        ...rawEntry,
        id: 'maint-' + Date.now()
      };
      setMaintenance(prev => [newEntry, ...prev]);
      setLocalMaintenance([newEntry, ...maintenance]);
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await api.clearLogs();
      setLogs([]);

      if (isFirebaseConfigured && db && auth?.currentUser) {
        const snapshot = await getDocs(collection(db, 'stockLogs'));
        snapshot.forEach((docSnap) => {
          deleteDoc(doc(db, 'stockLogs', docSnap.id)).catch(() => {});
        });
      }
    } catch (err) {
      console.error(err);
      setLogs([]);
      setLocalLogs([]);
    }
  };

  // Personnel Mutations
  const handleAddPersonnel = async (profile: Omit<UserProfile, 'uid'> & { password?: string }) => {
    try {
      const res = await api.saveUser(profile);
      setPersonnel(prev => [...prev, res.user]);

      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'userProfiles', res.user.uid), res.user).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const uid = 'user-' + Date.now();
      const raw: UserProfile & { password?: string } = {
        ...profile,
        uid,
        password: profile.password || 'panglimagym2026'
      };
      const updated = [...personnel, raw];
      setPersonnel(updated as any);
      localStorage.setItem('gymstock_personnel', JSON.stringify(updated));
    }
  };

  const handleUpdatePersonnel = async (uid: string, updates: Partial<UserProfile> & { password?: string }) => {
    const origUser = personnel.find(u => u.uid === uid);
    if (!origUser) return;

    const updatedUser = {
      ...origUser,
      ...updates
    };

    try {
      await api.saveUser(updatedUser);
      setPersonnel(prev => prev.map(u => u.uid === uid ? updatedUser : u));

      if (updatedUser.email === user?.email) {
        setUser(prev => prev ? { ...prev, displayName: updatedUser.displayName || prev.displayName, role: updatedUser.role } : null);
      }

      if (isFirebaseConfigured && db && auth?.currentUser) {
        setDoc(doc(db, 'userProfiles', uid), updatedUser).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const updated = personnel.map(u => u.uid === uid ? { ...u, ...updates } : u);
      setPersonnel(updated);
      localStorage.setItem('gymstock_personnel', JSON.stringify(updated));
    }
  };

  const handleDeletePersonnel = async (uid: string) => {
    try {
      await api.deleteUser(uid);
      setPersonnel(prev => prev.filter(u => u.uid !== uid));

      if (isFirebaseConfigured && db && auth?.currentUser) {
        deleteDoc(doc(db, 'userProfiles', uid)).catch(() => {});
      }
    } catch (err) {
      console.error(err);
      // Fallback
      const updated = personnel.filter(u => u.uid !== uid);
      setPersonnel(updated);
      localStorage.setItem('gymstock_personnel', JSON.stringify(updated));
    }
  };


  // Render Auth guard loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center font-mono text-xs text-emerald-400">
        <div className="w-8 h-8 border-2 border-[#00C853] border-t-transparent rounded-full animate-spin mb-4" />
        <span>MENGHUBUNGKAN KE FIRESTORE CLOUD...</span>
      </div>
    );
  }

  // Not Logged in, show Login Screen
  if (!user) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  const menuItemsMobile = [
    { id: 'dashboard' as SidebarTab, label: 'Dasbor', icon: LayoutDashboard },
    { id: 'catalog' as SidebarTab, label: 'Katalog Barang', icon: Database },
    { id: 'maintenance' as SidebarTab, label: 'Jadwal Perawatan', icon: CalendarClock },
    { id: 'logs' as SidebarTab, label: 'Log Stok', icon: History },
    ...(user?.role === 'Admin' ? [{ id: 'users' as SidebarTab, label: 'Manajemen User', icon: Users }] : []),
  ];

  return (
    <div id="gymstock-layout-container" className="flex flex-col md:flex-row min-h-screen bg-[#0A0A0A] text-[#E0E0E0]">
      
      {/* Mobile Header Top Bar */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 bg-[#121212] border-b border-[#2A2A2A] sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#00C853] rounded flex items-center justify-center font-bold text-black text-sm shrink-0">
            P
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-white tracking-tight text-sm">GymStock</span>
              <span className="text-[8px] font-bold text-[#00C853]">PRO</span>
            </div>
            <p className="text-[8px] text-[#8E8E8E] font-mono tracking-wider mt-0.5">PANGLIMA GYM</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-1.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-gray-300 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Animated Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#121212] border-r border-[#2A2A2A] z-50 p-5 flex flex-col justify-between md:hidden shadow-2xl"
            >
              <div>
                {/* Header inside drawer */}
                <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A] mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#00C853] rounded flex items-center justify-center font-bold text-black text-base shrink-0">
                      P
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white tracking-tight text-sm">GymStock</span>
                        <span className="text-[9px] font-bold text-[#00C853] font-sans">PRO</span>
                      </div>
                      <p className="text-[9px] text-[#8E8E8E] font-mono tracking-wider mt-0.5">PANGLIMA GYM</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 px-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-gray-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Database Connection Info */}
                <div className="mb-4 p-3 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] flex items-center justify-between font-mono text-[9px]">
                  <span className="text-[#8E8E8E] uppercase tracking-widest font-bold">Database</span>
                  {isFirebaseConfigured ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cloud
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Local Sync
                    </span>
                  )}
                </div>

                {/* Nav Items */}
                <nav className="space-y-1.5 font-sans">
                  {menuItemsMobile.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-left text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-[#1A1A1A] text-[#00C853]'
                            : 'text-[#8E8E8E] hover:text-white hover:bg-white/[0.01]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00C853]' : 'text-[#8E8E8E]'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Drawer Bottom panel */}
              <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
                <div className="flex items-center gap-3 p-2.5 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                  <div className="w-9 h-9 rounded-full bg-[#2A2A2A] border border-[#333333] text-white flex items-center justify-center font-semibold font-mono text-xs uppercase shrink-0">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-white truncate">{user.displayName || 'Operator'}</span>
                      <span className={`text-[8px] font-mono font-bold uppercase px-1 rounded border ${
                        user.role === 'Admin' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {user.role || 'Staff'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8E8E8E] truncate font-mono mt-0.5">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8E8E8E] hover:text-red-420 border border-[#2A2A2A] hover:border-red-500/20 bg-transparent hover:bg-red-500/[0.02] transition-all cursor-pointer font-sans"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Sesi</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1. Sidebar Nav */}
      <Sidebar 
        currentTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 h-screen overflow-y-auto relative">
        
        {/* DB Status Badge removed to avoid layout overlapping */}

        {activeTab === 'dashboard' && (
          <DashboardView 
            items={items} 
            logs={logs} 
            maintenance={maintenance} 
            onNavigateTab={(tab) => setActiveTab(tab)} 
          />
        )}

        {activeTab === 'catalog' && (
          <KatalogView 
            items={items} 
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onStockInOut={handleStockInOut}
          />
        )}

        {activeTab === 'maintenance' && (
          <PerawatanView 
            maintenance={maintenance} 
            items={items} 
            onToggleStatus={handleToggleMaint}
            onAddSchedule={handleAddSchedule}
          />
        )}

        {activeTab === 'logs' && (
          <LogView 
            logs={logs} 
            onClearLogs={handleClearLogs} 
          />
        )}

        {activeTab === 'users' && user?.role === 'Admin' && (
          <UserManagementView 
            currentUser={user} 
            users={personnel} 
            onAddUser={handleAddPersonnel} 
            onUpdateUser={handleUpdatePersonnel}
            onDeleteUser={handleDeletePersonnel}
          />
        )}

      </main>

    </div>
  );
}

