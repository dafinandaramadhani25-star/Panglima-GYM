import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Sparkles, Sliders, ServerCrash } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleFallbackMode = () => {
    localStorage.setItem('disable_firebase_override', 'true');
    window.location.reload();
  };

  private handleResetConfig = () => {
    localStorage.removeItem('disable_firebase_override');
    localStorage.removeItem('gymstock_items');
    localStorage.removeItem('gymstock_maint');
    localStorage.removeItem('gymstock_logs');
    localStorage.removeItem('gymstock_personnel');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errorStr = this.state.error?.message || '';
      
      // Diagnose if it's a Firestore/Firebase related missing permissions or network issue
      const isFirebaseError = errorStr.includes('permission') || 
                            errorStr.includes('Firebase') || 
                            errorStr.includes('api-studio') ||
                            errorStr.includes('auth') ||
                            errorStr.includes('database') ||
                            errorStr.includes('firestore');

      return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 font-sans select-none relative overflow-hidden">
          {/* Decorative backgrounds */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1F1F1F_1px,transparent_1px),linear-gradient(to_bottom,#1F1F1F_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600 opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

          <div className="w-full max-w-xl bg-[#121212]/95 border border-[#2D2D2D] rounded-2xl p-8 z-10 shadow-[0_25px_50px_rgba(0,0,0,0.9)] relative">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-950/30 border border-red-500/35 rounded-2xl mb-4 shadow-inner">
                <ServerCrash className="w-7 h-7 text-red-500" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Integrasi Sistem Bermasalah</h1>
              <p className="text-xs text-red-400 font-mono mt-1 uppercase tracking-wider">SYSTEM DIAGNOSTIC RUNTIME EXCEPTION</p>
            </div>

            {/* Diagnostic Alert Code */}
            <div className="mb-6 p-4 bg-red-950/20 border border-red-500/15 rounded-xl text-left">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#8E8E8E] block mb-1">Pesan Kesalahan:</span>
              <p className="font-mono text-xs text-red-200 leading-relaxed bg-[#0F0F0F] p-3 rounded border border-red-900/20 max-h-40 overflow-y-auto whitespace-pre-wrap">
                {errorStr || 'Runtime error indefinable.'}
              </p>
            </div>

            {/* Actionable explanation */}
            <div className="space-y-4 text-sm text-[#B3B3B3] leading-relaxed mb-8">
              <p className="text-xs">
                Kemungkinan besar kesalahan ini terjadi karena koneksi basis data online (Firebase Firestore) dibatasi di lingkungan rilis (Netlify). 
              </p>
              
              {isFirebaseError && (
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs leading-normal">
                  <span className="text-emerald-400 font-bold block mb-1 font-mono uppercase tracking-wider text-[10px]">Langkah Perbaikan (Netlify):</span>
                  ul dan tambahkan domain <code className="bg-[#1A1A1A] px-1 py-0.5 rounded text-white font-mono">panglimagym.netlify.app</code> ke daftar <strong className="text-white">Authorized Domains</strong> di menu <strong className="text-white">Firebase Authentication &gt; Settings &gt; Authorized Domains</strong> di Firebase Console Anda.
                </div>
              )}
            </div>

            {/* Resolution Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={this.handleFallbackMode}
                className="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold rounded-xl text-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Buka Mode Demo Offline
              </button>
              
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full py-3 border border-[#2D2D2D] hover:border-gray-700 bg-[#1A1A1A] text-gray-300 hover:text-white font-medium rounded-xl text-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Ulang Halaman
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={this.handleResetConfig}
                className="text-[10px] text-gray-500 hover:text-red-400 font-mono transition-colors hover:underline"
              >
                [ RESET SELURUH KONFIGURASI LOKAL ]
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
