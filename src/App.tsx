import React, { useState, useEffect } from 'react';
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

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user-1',
    email: 'dafinandaramadhani25@gmail.com',
    displayName: 'Dafina Ramadhani',
    photoURL: null,
    role: 'Admin'
  },
  {
    uid: 'user-2',
    email: 'ahmad@gymstock.com',
    displayName: 'Ahmad Muzakir',
    photoURL: null,
    role: 'Staff'
  },
  {
    uid: 'user-3',
    email: 'budi@gymstock.com',
    displayName: 'Budi Santoso',
    photoURL: null,
    role: 'Staff'
  }
];

export default function App() {
  // 1. Auth states
  const [user, setUser] = useState<{ email: string; displayName: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);

  // 2. Navigation states
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');

  // 3. Database States
  const [items, setItems] = useState<GymItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceEntry[]>([]);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [personnel, setPersonnel] = useState<UserProfile[]>([]);

  // Initialize data fallback
  useEffect(() => {
    // Loaded from safe fallback local database
    setItems(getLocalItems());
    setMaintenance(getLocalMaintenance());
    setLogs(getLocalLogs());
    
    // Save personnel default
    const storedUsers = localStorage.getItem('gymstock_personnel');
    if (storedUsers) {
      setPersonnel(JSON.parse(storedUsers));
    } else {
      setPersonnel(INITIAL_USERS);
      localStorage.setItem('gymstock_personnel', JSON.stringify(INITIAL_USERS));
    }
  }, []);

  // Monitor Auth Changes if Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const profile = {
            email: firebaseUser.email || 'operator@panglimagym.com',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Operator',
          };
          setUser(profile);
          
          // Seed to personnel list if not exist
          setPersonnel((prev) => {
            const exists = prev.some(u => u.email === profile.email);
            if (!exists) {
              const updated = [
                ...prev,
                {
                  uid: firebaseUser.uid,
                  email: profile.email,
                  displayName: profile.displayName,
                  photoURL: firebaseUser.photoURL || null,
                  role: 'Staff'
                }
              ];
              localStorage.setItem('gymstock_personnel', JSON.stringify(updated));
              
              // Seed to Firestore newly logging-in user
              if (db) {
                const userDocRef = doc(db, 'userProfiles', firebaseUser.uid);
                setDoc(userDocRef, {
                  uid: firebaseUser.uid,
                  email: profile.email,
                  displayName: profile.displayName,
                  role: 'Staff'
                }).catch((err) => {
                  console.warn("Could not sync profile to Firestore yet because rules enforce authorization.", err.message);
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
    if (!isFirebaseConfigured || !auth || !db || !user) return;

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

    // Dynamic stock log creation of the initial stock
    const newLog: StockLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      type: 'Masuk',
      itemId: id,
      itemName: newItem.name,
      quantity: newItem.totalStock,
      userEmail: user?.email || 'trial@panglimagym.com',
      userName: user?.displayName || 'Dafina Ramadhani',
      destinationOrSource: 'Registrasi Unit Awal'
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    setLocalLogs(updatedLogs);

    // Synchronize to Cloud Firestore if connected
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'gymItems', id), newItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `gymItems/${id}`);
      }
      try {
        await setDoc(doc(db, 'stockLogs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `stockLogs/${newLog.id}`);
      }
    }
  };

  // Edit Item
  const handleEditItem = async (updatedItem: GymItem) => {
    const updated = items.map(it => it.id === updatedItem.id ? updatedItem : it);
    setItems(updated);
    setLocalItems(updated);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'gymItems', updatedItem.id), updatedItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `gymItems/${updatedItem.id}`);
      }
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string) => {
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    setLocalItems(updated);

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'gymItems', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `gymItems/${id}`);
      }
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

    // Update items list
    const updatedItems = items.map(it => it.id === itemId ? updatedItem : it);
    setItems(updatedItems);
    setLocalItems(updatedItems);

    // Create log record
    const newLog: StockLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      type,
      itemId,
      itemName: target.name,
      quantity: qty,
      userEmail: user?.email || 'trial@panglimagym.com',
      userName: user?.displayName || 'Dafina Ramadhani',
      destinationOrSource: reason || (type === 'Masuk' ? 'Pengadaan Stok' : 'Pengurangan Unit')
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    setLocalLogs(updatedLogs);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'gymItems', itemId), updatedItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `gymItems/${itemId}`);
      }
      try {
        await setDoc(doc(db, 'stockLogs', newLog.id), newLog);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `stockLogs/${newLog.id}`);
      }
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

    const updatedScheduleList = maintenance.map(m => m.id === maintId ? updatedScheduler : m);
    setMaintenance(updatedScheduleList);
    setLocalMaintenance(updatedScheduleList);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'maintenanceSchedule', maintId), updatedScheduler);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `maintenanceSchedule/${maintId}`);
      }
    }

    // If we mark a maintenance schedule as "Selesai" (Completed), and the current physical equipment's
    // condition is "Broken" or "In Repairs", we automatically repair it and mark it as "Good" (Ready/Siap Pakai)!
    if (completedStatus === 'Selesai') {
      const targetItem = items.find(it => it.id === targetScheduler.itemId);
      if (targetItem && (targetItem.condition === 'Broken' || targetItem.condition === 'In Repairs')) {
        const updatedItem: GymItem = {
          ...targetItem,
          condition: 'Good',
          updatedAt: new Date().toISOString()
        };
        const updatedItems = items.map(it => it.id === targetItem.id ? updatedItem : it);
        setItems(updatedItems);
        setLocalItems(updatedItems);

        // Also add a little notification log for this repair completed
        const repairLog: StockLog = {
          id: 'log-rep-' + Date.now(),
          timestamp: new Date().toISOString(),
          type: 'Masuk',
          itemId: targetItem.id,
          itemName: targetItem.name,
          quantity: targetItem.totalStock,
          userEmail: user?.email || 'system@panglimagym.com',
          userName: 'System Auto Repair',
          destinationOrSource: `Service Selesai: ${targetScheduler.maintenanceType}`
        };
        const updatedLogsList = [repairLog, ...logs];
        setLogs(updatedLogsList);
        setLocalLogs(updatedLogsList);

        if (isFirebaseConfigured && db) {
          try {
            await setDoc(doc(db, 'gymItems', targetItem.id), updatedItem);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `gymItems/${targetItem.id}`);
          }
          try {
            await setDoc(doc(db, 'stockLogs', repairLog.id), repairLog);
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, `stockLogs/${repairLog.id}`);
          }
        }
      }
    }
  };

  // Add Maintenance schedule
  const handleAddSchedule = async (rawEntry: Omit<MaintenanceEntry, 'id'>) => {
    const newEntry: MaintenanceEntry = {
      ...rawEntry,
      id: 'maint-' + Date.now()
    };

    const updatedList = [newEntry, ...maintenance];
    setMaintenance(updatedList);
    setLocalMaintenance(updatedList);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'maintenanceSchedule', newEntry.id), newEntry);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `maintenanceSchedule/${newEntry.id}`);
      }
    }

    // Also reciprocally shift physical equipment's condition to "In Repairs" to match the reality!
    const targetItem = items.find(it => it.id === rawEntry.itemId);
    if (targetItem && targetItem.condition === 'Good') {
      const updatedItem: GymItem = {
        ...targetItem,
        condition: 'In Repairs',
        updatedAt: new Date().toISOString()
      };
      const updatedItems = items.map(it => it.id === targetItem.id ? updatedItem : it);
      setItems(updatedItems);
      setLocalItems(updatedItems);

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'gymItems', targetItem.id), updatedItem);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `gymItems/${targetItem.id}`);
        }
      }
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    setLogs([]);
    setLocalLogs([]);

    if (isFirebaseConfigured && db) {
      try {
        const snapshot = await getDocs(collection(db, 'stockLogs'));
        const batchPromises: Promise<void>[] = [];
        snapshot.forEach((docSnap) => {
          batchPromises.push(deleteDoc(doc(db, 'stockLogs', docSnap.id)));
        });
        await Promise.all(batchPromises);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'stockLogs');
      }
    }
  };

  // Personnel Mutations
  const handleAddPersonnel = async (profile: Omit<UserProfile, 'uid'>) => {
    const uid = 'user-' + Date.now();
    const raw: UserProfile = {
      ...profile,
      uid
    };
    const updated = [...personnel, raw];
    setPersonnel(updated);
    localStorage.setItem('gymstock_personnel', JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'userProfiles', uid), raw);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `userProfiles/${uid}`);
      }
    }
  };

  const handleModifyRole = async (uid: string, role: 'Admin' | 'Staff') => {
    const updated = personnel.map(u => u.uid === uid ? { ...u, role } : u);
    setPersonnel(updated);
    localStorage.setItem('gymstock_personnel', JSON.stringify(updated));

    const updatedUser = updated.find(u => u.uid === uid);
    if (updatedUser && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'userProfiles', uid), updatedUser);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `userProfiles/${uid}`);
      }
    }
  };

  const handleDeletePersonnel = async (uid: string) => {
    const updated = personnel.filter(u => u.uid !== uid);
    setPersonnel(updated);
    localStorage.setItem('gymstock_personnel', JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'userProfiles', uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `userProfiles/${uid}`);
      }
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

  return (
    <div id="gymstock-layout-container" className="flex min-h-screen bg-[#0A0A0A] text-[#E0E0E0]">
      
      {/* 1. Sidebar Nav */}
      <Sidebar 
        currentTab={activeTab} 
        onTabChange={(tab) => setActiveTab(tab)} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 min-w-0 p-8 h-screen overflow-y-auto">
        
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

        {activeTab === 'users' && (
          <UserManagementView 
            currentUser={user} 
            users={personnel} 
            onAddUser={handleAddPersonnel} 
            onModifyRole={handleModifyRole}
            onDeleteUser={handleDeletePersonnel}
          />
        )}

      </main>

    </div>
  );
}

