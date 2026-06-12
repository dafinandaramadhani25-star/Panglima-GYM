<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - GymStock PRO</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#0A0A0A] text-white font-sans overflow-hidden antialiased">

    <!-- Screen Wrapper -->
    <div class="min-h-screen flex flex-col items-center justify-center relative px-4">
        
        <!-- Absolute Decorative Grid Background -->
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#1A1A1A_1px,transparent_1px),linear-gradient(to_bottom,#1A1A1A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        <!-- Radiant Accent Bloom -->
        <div class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00C853] opacity-[0.06] blur-[120px] rounded-full pointer-events-none"></div>

        <!-- Centered Login Box Card -->
        <div class="w-full max-w-sm bg-[#121212]/90 border border-[#2A2A2A] backdrop-blur-md rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10 relative">
            
            <!-- Connection status tag -->
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-md">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Laravel MySQL Live
                </span>
            </div>

            <!-- Header -->
            <div class="text-center mb-8 mt-2">
                <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#1A1A1A] to-[#252525] border border-emerald-500/20 rounded-2xl mb-4">
                    <!-- Dumbbell SVG icon -->
                    <svg class="w-7 h-7 text-[#00C853]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m0 11v1m0-16c3.866 0 7 3.134 7 7s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zm0 0v1" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                    GymStock <span class="text-[#00C853] font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">PRO</span>
                </h1>
                <p class="text-xs text-emerald-400/80 font-mono mt-1 tracking-widest uppercase">Panglima GYM System</p>
                <h2 class="text-lg font-medium text-gray-300 mt-5">Selamat Datang Kembali</h2>
                <p class="text-xs text-gray-500 mt-1">Masuk untuk mengelola inventaris alat olahraga.</p>
            </div>

            <!-- Error Alerts -->
            @if ($errors->any())
                <div class="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    @foreach ($errors->all() as $error)
                        <div class="flex items-start gap-2 text-xs text-red-300">
                            <span class="text-red-400 mt-0.5 font-bold">⚠️</span>
                            <span>{{ $error }}</span>
                        </div>
                    @endforeach
                </div>
            @endif

            <!-- Form -->
            <form action="{{ route('login') }}" method="POST" class="space-y-4">
                @csrf
                <div>
                    <label class="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-1.5">Alamat Email</label>
                    <div class="relative">
                        <input
                            type="email"
                            name="email"
                            required
                            value="{{ old('email') }}"
                            placeholder="nama@email.com"
                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-sm focus:outline-none transition-colors duration-200 placeholder-gray-600 text-white"
                        />
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1.5">
                        <label class="block text-xs font-mono text-gray-400 uppercase tracking-wider">Password</label>
                    </div>
                    <div class="relative">
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••••••"
                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] focus:border-emerald-500/50 rounded-xl text-sm focus:outline-none transition-colors duration-200 placeholder-gray-600 text-white"
                        />
                    </div>
                </div>

                <div class="pt-2">
                    <button
                        type="submit"
                        class="w-full py-3 bg-[#00C853] hover:bg-[#00E676] text-black font-semibold rounded-xl text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                    >
                        Masuk ke Aplikasi
                        <!-- Arrow right SVG icon -->
                        <svg class="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </div>
            </form>

            <div class="mt-6 text-center">
                <p class="text-[11px] text-gray-500">
                    Administrator Default: <br>
                    <code class="text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-1 rounded">dafinandaramadhani25@gmail.com</code> <br>
                    Password: <code class="text-white bg-gray-800 px-1 rounded">panglimagym2026</code>
                </p>
            </div>

        </div>

    </div>

</body>
</html>
