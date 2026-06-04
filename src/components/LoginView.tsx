import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Dumbbell, Lock, Mail, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { isFirebaseConfigured, auth, googleProvider } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; displayName: string }) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState('dafinandaramadhani25@gmail.com');
  const [password, setPassword] = useState('panglimagym2026');
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

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const u = userCredential.user;
        onLoginSuccess({
          email: u.email || email,
          displayName: u.displayName || u.email?.split('@')[0] || 'Operator',
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal masuk. Silakan periksa kembali email & password Anda.');
        setLoading(false);
      }
    } else {
      // High-fidelity fallback login
      setTimeout(() => {
        onLoginSuccess({
          email: email,
          displayName: email === 'dafinandaramadhani25@gmail.com' ? 'Dafina Ramadhani' : email.split('@')[0],
        });
        setLoading(false);
      }, 800);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    if (isFirebaseConfigured && auth) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        onLoginSuccess({
          email: result.user.email || '',
          displayName: result.user.displayName || 'Google Operator',
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Gagal masuk menggunakan Google Sign-In.');
        setLoading(false);
      }
    } else {
      setTimeout(() => {
        onLoginSuccess({
          email: 'dafinandaramadhani25@gmail.com',
          displayName: 'Dafina Ramadhani (Google Demo)',
        });
        setLoading(false);
      }, 700);
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
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 text-sm text-red-200 animate-pulse"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-tight text-xs">{error}</span>
          </motion.div>
        )}

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

        {/* Divider */}
        <div className="relative flex py-5 items-center justify-center">
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-[10px] uppercase font-mono tracking-wider">Atau Masuk dengan</span>
          <div className="flex-grow border-t border-[#2A2A2A]"></div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 border border-[#2A2A2A] hover:border-gray-700 bg-[#1A1A1A] text-gray-300 hover:text-white font-medium rounded-xl text-sm transition-colors duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
        >
          {/* Subtle Google Logo Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Sign-In
        </button>

        {/* Demo Credentials Alert Helper */}
        <div className="mt-6 p-3 rounded-lg bg-[#00C853]/5 border border-emerald-500/15 text-center text-[11px] text-gray-400">
          <span className="text-emerald-400 font-mono font-bold flex items-center justify-center gap-1 mb-0.5">
            <Sparkles className="w-3.5 h-3.5" /> TRIAL CREDENTIALS
          </span>
          Email: <span className="text-gray-300 font-mono">dafinandaramadhani25@gmail.com</span><br/>
          Password: <span className="text-gray-300 font-mono">panglimagym2026</span>
        </div>
      </motion.div>
    </div>
  );
}
