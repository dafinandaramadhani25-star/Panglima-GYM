import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Lock, Mail, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { isFirebaseConfigured, auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; displayName: string; role?: 'Admin' | 'Staff' }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Harap isi alamat email dan password Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1. First search in simulated / admin-defined local accounts
    try {
      const storedUsers = localStorage.getItem('gymstock_personnel');
      const localProfiles: any[] = storedUsers ? JSON.parse(storedUsers) : [];
      const matchedLocal = localProfiles.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (matchedLocal) {
        const storedPassword = matchedLocal.password || 'panglimagym2026';
        if (storedPassword === password) {
          onLoginSuccess({
            email: matchedLocal.email,
            displayName: matchedLocal.displayName || matchedLocal.email.split('@')[0],
            role: matchedLocal.role || 'Staff'
          });
          setLoading(false);
          return;
        }
      }

      // 2. Search in online Firestore database profiles
      if (isFirebaseConfigured && db) {
        const { getDocs, collection } = await import('firebase/firestore');
        const querySnapshot = await getDocs(collection(db, 'userProfiles'));
        let firestoreProfile: any = null;
        querySnapshot.forEach((docSnap) => {
          const p = docSnap.data();
          if (p.email?.toLowerCase() === email.toLowerCase()) {
            firestoreProfile = p;
          }
        });

        if (firestoreProfile) {
          const storedPassword = firestoreProfile.password || 'panglimagym2026';
          if (storedPassword === password) {
            // Success! Cache profile in local storage for instant access
            const currentLocal = localStorage.getItem('gymstock_personnel');
            const parsedLocal: any[] = currentLocal ? JSON.parse(currentLocal) : [];
            const filteredLocal = parsedLocal.filter(u => u.email?.toLowerCase() !== email.toLowerCase());
            const updatedProfile = {
              uid: firestoreProfile.uid,
              email: firestoreProfile.email,
              displayName: firestoreProfile.displayName,
              photoURL: firestoreProfile.photoURL || null,
              role: firestoreProfile.role || 'Staff',
              password: storedPassword
            };
            localStorage.setItem('gymstock_personnel', JSON.stringify([...filteredLocal, updatedProfile]));

            onLoginSuccess({
              email: firestoreProfile.email,
              displayName: firestoreProfile.displayName || email.split('@')[0],
              role: firestoreProfile.role || 'Staff'
            });
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Custom profiles check failed, falling back to direct Firebase Auth:", err);
    }

    // 3. Fallback to direct Firebase Authentication
    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const u = userCredential.user;

        // Retrieve or determine role
        const storedUsers = localStorage.getItem('gymstock_personnel');
        const localProfiles: any[] = storedUsers ? JSON.parse(storedUsers) : [];
        const matched = localProfiles.find(p => p.email?.toLowerCase() === email.toLowerCase());
        const role = matched?.role || 'Staff';

        onLoginSuccess({
          email: u.email || email,
          displayName: u.displayName || matched?.displayName || u.email?.split('@')[0] || 'Operator',
          role: role
        });
      } catch (err: any) {
        console.error(err);
        setError('Email atau password salah. Silakan periksa kembali.');
        setLoading(false);
      }
    } else {
      // Local fallback error when no custom credentials match
      setTimeout(() => {
        setError('Email atau password tidak terdaftar atau password salah.');
        setLoading(false);
      }, 800);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-[#0A0A0A] text-[#ffffff] flex flex-col items-center justify-center relative overflow-hidden px-4 font-sans">
      {/* Absolute Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Radiant Accent Bloom */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00C853] opacity-[0.06] blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#121212]/95 border border-[#2A2A2A] backdrop-blur-md rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 relative"
      >
        {/* Connection status tag */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          {isFirebaseConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Firebase
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono bg-amber-500/20 text-amber-300 border border-amber-500/20 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Demo Mode Active
            </span>
          )}
        </div>

        {/* Logo and Headings */}
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1A1A1A] to-[#252525] border border-emerald-500/25 rounded-2xl mb-4 shadow-inner">
            <Dumbbell className="w-7 h-7 text-[#00C853]" />
          </div>
          <h1 className="text-2xl font-sans font-bold tracking-tight text-white flex items-center justify-center gap-2">
            GymStock <span className="text-[#00C853] font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">PRO</span>
          </h1>
          <p className="text-xs text-emerald-400/80 font-mono mt-1 tracking-widest uppercase">Panglima GYM System</p>
          <h2 className="text-lg font-medium text-gray-300 mt-5">Selamat Datang Kembali</h2>
          <p className="text-xs text-[#8E8E8E] mt-1 pr-1 pl-1">Masuk untuk mengelola inventaris & jadwal perawatan garmen.</p>
        </div>

        {/* Error Notification */}
        {error && (() => {
          const isOperationNotAllowed = error.includes('operation-not-allowed') || 
                                       error.includes('auth/operation_not_allowed') || 
                                       error.includes('auth/operation-not-allowed');
          
          if (isOperationNotAllowed) {
            return (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-950/40 border border-red-500/20 rounded-xl flex flex-col gap-3 text-xs text-red-200"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <span className="font-bold text-white block">Metode Login Belum Diaktifkan di Firebase Console</span>
                    <span className="leading-relaxed text-[#FF8A80] block text-[11px]">
                      Firebase mengembalikan error: <code className="bg-red-950 px-1.5 py-0.5 rounded font-mono font-bold text-white">auth/operation-not-allowed</code>.
                    </span>
                  </div>
                </div>
                
                <div className="bg-[#140808] p-3 rounded-lg border border-red-500/10 space-y-2 text-[#E0E0E0] leading-relaxed text-[11px]">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider font-mono">Langkah Mengaktifkan:</span>
                  <ol className="list-decimal list-inside space-y-1.5 text-left text-gray-300">
                    <li>Buka <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold">Firebase Console</a>.</li>
                    <li>Pilih proyek Anda (<strong className="text-white">methodical-exchanger-9tgzl</strong>).</li>
                    <li>Klik menu <strong className="text-white">Authentication</strong> &gt; tab <strong className="text-white">Sign-in method</strong>.</li>
                    <li>Klik <strong className="text-white">Add new provider</strong>, pilih <strong className="text-white">Email/Password</strong>, aktifkan (<strong className="text-emerald-400">Enable</strong>), lalu simpan.</li>
                    <li>Aktifkan juga provider <strong className="text-white">Google</strong> jika Anda ingin login dengan Google.</li>
                  </ol>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('disable_firebase_override', 'true');
                      window.location.reload();
                    }}
                    className="w-full py-2.5 bg-[#00C853] hover:bg-[#00E676] text-black font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Masuk ke Mode Demo Sementara
                  </button>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-sm text-red-200 animate-pulse"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-tight text-xs">{error}</span>
            </motion.div>
          );
        })()}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#8E8E8E] uppercase tracking-wider mb-1.5">Alamat Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-sm focus:outline-none transition-colors duration-200 placeholder-gray-600 font-sans text-white focus:ring-0"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-mono text-[#8E8E8E] uppercase tracking-wider">Password</label>
              <button 
                type="button"
                onClick={() => alert('Sistem reset password sedang dalam pengembangan. Silakan hubungi Administrator Panglima GYM.')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans hover:underline focus:outline-none transition-colors"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-sm focus:outline-none transition-colors duration-200 placeholder-gray-600 font-sans text-white focus:ring-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#00C853] hover:bg-[#00E676] disabled:opacity-55 text-black font-semibold rounded-xl text-sm transition-all duration-200 shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Masuk ke Aplikasi
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>


      </motion.div>
    </div>
  );
}
