<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GymStock PRO - Panglima GYM</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #0A0A0A;
            color: #E0E0E0;
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #0A0A0A;
        }
        ::-webkit-scrollbar-thumb {
            background: #2A2A2A;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #3A3A3A;
        }
    </style>
</head>
<body class="font-sans antialiased">

    <div class="flex min-h-screen">
        
        <!-- SIDEBAR -->
        <aside class="w-64 bg-[#0F0F0F] border-r border-[#1E1E1E] flex flex-col shrink-0 h-screen sticky top-0">
            <!-- Brand Logotype -->
            <div class="p-6 border-b border-[#202020] flex items-center gap-3">
                <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#252525] border border-emerald-500/20 shadow-md">
                    <!-- Dumbbell Icon via SVG -->
                    <svg class="w-5 h-5 text-[#00C853]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <div>
                    <h1 class="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                        GymStock <span class="bg-emerald-500/10 border border-emerald-500/20 text-[#00C853] font-mono text-[9px] font-semibold px-1 py-0.2 rounded uppercase">Prop</span>
                    </h1>
                    <span class="text-[9px] text-gray-500 font-mono tracking-wider block uppercase">Panglima GYM System</span>
                </div>
            </div>

            <!-- Profile Info Card -->
            <div class="p-4 mx-4 my-5 bg-[#121212]/80 border border-[#222] rounded-xl flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00C853] font-mono font-bold text-sm select-none">
                    {{ strtoupper(substr(Auth::user()->name ?? 'O', 0, 1)) }}
                </div>
                <div class="min-w-0 flex-1">
                    <span class="text-xs font-semibold text-white block truncate">{{ Auth::user()->name }}</span>
                    <span class="text-[10px] text-emerald-400 font-mono tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10 inline-block mt-0.5">
                        {{ Auth::user()->role }}
                    </span>
                </div>
            </div>

            <!-- Menus -->
            <nav class="flex-1 px-4 space-y-1">
                <a href="{{ route('dashboard') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wide uppercase font-mono transition-all {{ Route::is('dashboard') ? 'bg-[#181818] text-[#00C853] font-bold border-l-2 border-[#00C853]' : 'text-gray-400 hover:text-white hover:bg-[#121212]' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
                    Dashboard
                </a>

                <a href="{{ route('catalog.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wide uppercase font-mono transition-all {{ Route::is('catalog.index') ? 'bg-[#181818] text-[#00C853] font-bold border-l-2 border-[#00C853]' : 'text-gray-400 hover:text-white hover:bg-[#121212]' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    Katalog Inventaris
                </a>

                <a href="{{ route('maintenance.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wide uppercase font-mono transition-all {{ Route::is('maintenance.index') ? 'bg-[#181818] text-[#00C853] font-bold border-l-2 border-[#00C853]' : 'text-gray-400 hover:text-white hover:bg-[#121212]' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Jadwal Perawatan
                </a>

                <a href="{{ route('logs.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wide uppercase font-mono transition-all {{ Route::is('logs.index') ? 'bg-[#181818] text-[#00C853] font-bold border-l-2 border-[#00C853]' : 'text-gray-400 hover:text-white hover:bg-[#121212]' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    History Stock logs
                </a>

                @if(Auth::user()->role === 'Admin')
                <a href="{{ route('users.index') }}" class="flex items-center gap-3 px-4 py-3 rounded-lg text-xs tracking-wide uppercase font-mono transition-all {{ Route::is('users.index') ? 'bg-[#181818] text-[#00C853] font-bold border-l-2 border-[#00C853]' : 'text-gray-400 hover:text-white hover:bg-[#121212]' }}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Manajemen Staff
                </a>
                @endif
            </nav>

            <!-- Bottom Exit / Sign out -->
            <div class="p-4 border-t border-[#1E1E1E]">
                <form action="{{ route('logout') }}" method="POST">
                    @csrf
                    <button type="submit" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 font-mono tracking-wide uppercase transition-colors cursor-pointer text-left">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Sign out System
                    </button>
                </form>
            </div>
        </aside>

        <!-- MAIN LAYOUT WRAPPER -->
        <main class="flex-1 min-w-0 p-8 relative">
            
            <!-- Live Database Connection Header Status Banner -->
            <div class="absolute top-6 right-8 z-40">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121212] border border-[#2A2A2A] text-[11px] font-mono shadow-md">
                    <span class="w-2 h-2 rounded-full bg-[#00C853] animate-pulse"></span>
                    <span class="text-[#8E8E8E] uppercase tracking-wider text-[9px] font-bold">Db Status:</span>
                    <span class="text-white font-medium">Laravel MySQL Connected</span>
                    <span class="text-emerald-400 text-[10px] px-1.5 py-0.5 bg-emerald-500/10 border border-[#2A2A2A] rounded font-bold uppercase">
                        {{ env('DB_DATABASE', 'gymstock') }}
                    </span>
                </div>
            </div>

            <!-- FLASH ALERTS NOTIFICATION -->
            <div class="mb-6 max-w-4xl">
                @if(session('success'))
                    <div class="p-4 mb-4 rounded-xl bg-emerald-500/10 border border-[#00C853]/20 text-emerald-400 text-xs flex items-center gap-2 font-mono">
                        <span class="w-2 h-2 bg-[#00C853] rounded-full"></span>
                        {{ session('success') }}
                    </div>
                @endif

                @if(session('error'))
                    <div class="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-mono">
                        <span class="w-2 h-2 bg-red-400 rounded-full"></span>
                        {{ session('error') }}
                    </div>
                @endif

                @if(session('info'))
                    <div class="p-4 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs flex items-center gap-2 font-mono">
                        <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {{ session('info') }}
                    </div>
                @endif
            </div>

            <!-- PAGE CONTENT INJECTOR -->
            @yield('content')

        </main>

    </div>

</body>
</html>
