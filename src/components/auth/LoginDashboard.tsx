import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  School,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Sparkles,
  KeyRound,
  Fingerprint,
} from 'lucide-react';
import { RoleType } from '../../types';

export const LoginDashboard: React.FC = () => {
  const {
    schoolProfile,
    allUsers,
    login,
    loginAs,
    darkMode,
    setDarkMode,
    replayIntro,
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | RoleType>('all');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Silakan masukkan NIP, Email, atau Nama Pengguna Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 350);
  };

  const handleQuickLogin = (userId: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      loginAs(userId);
      setIsLoading(false);
    }, 250);
  };

  const filteredDemoUsers = allUsers.filter((u) => {
    if (selectedRoleFilter === 'all') return true;
    return u.role === selectedRoleFilter;
  });

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'guru':
        return <GraduationCap className="w-4 h-4 text-sky-700 dark:text-sky-400" />;
      case 'wali_murid':
        return <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <User className="w-4 h-4 text-slate-600" />;
    }
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'admin':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800';
      case 'guru':
        return 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-800';
      case 'wali_murid':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#dbeefa] dark:bg-[#071324] text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      {/* Top Navigation Bar */}
      <header className="w-full bg-[#0369a1] dark:bg-[#061830] text-white border-b border-sky-800/60 dark:border-sky-900/80 shadow-sm py-3 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-800 dark:bg-sky-900 flex items-center justify-center text-white border border-sky-500/30 shadow-xs shrink-0 overflow-hidden p-1">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <School className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm font-black tracking-tight uppercase">
                  Sistem Presensi Siswa SD
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-sky-100 border border-white/20">
                  {schoolProfile.akreditasi || 'Akreditasi A'}
                </span>
              </div>
              <p className="text-xs font-semibold text-sky-200 truncate">
                {schoolProfile.name} • NPSN: {schoolProfile.npsn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Button to replay opening animation */}
            <button
              id="replay-intro-animation-btn"
              onClick={replayIntro}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 dark:bg-amber-950/60 dark:hover:bg-amber-900 border border-amber-300/40 text-xs text-amber-200 hover:text-amber-100 font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Lihat Kembali Animasi Pembuka (ABSENSI SISWA & Profil Sekolah)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Animasi Pembuka</span>
            </button>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 dark:bg-sky-950/60 border border-white/15 text-xs text-sky-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono font-bold">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
              </span>
              <span className="opacity-40">•</span>
              <Calendar className="w-3.5 h-3.5 text-sky-300" />
              <span>
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 dark:bg-sky-950/60 dark:hover:bg-sky-900 border border-white/15 text-xs text-sky-100 transition-all cursor-pointer"
              title="Ganti Mode Gelap / Terang"
            >
              {darkMode ? '☀️ Terang' : '🌙 Gelap'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Welcome & Info Banner */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#0a1b35] border border-sky-300 dark:border-sky-800 shadow-md space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-900 dark:text-sky-300 text-xs font-bold border border-sky-300 dark:border-sky-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Portal Presensi Digital Terpadu</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Selamat Datang di Portal Presensi Sekolah Dasar
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-sky-200/80 mt-2 leading-relaxed">
                  Platform manajemen kehadiran siswa berbasis kelas terintegrasi dengan pemindaian barcode/QR, rekap otomatis Dapodik, dan verifikasi surat izin digital.
                </p>
              </div>

              {/* School Academic Info Pills */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Tahun Ajaran</span>
                  <span className="text-sm font-extrabold text-sky-950 dark:text-sky-200">
                    TA {schoolProfile.academicYear}
                  </span>
                  <span className="text-[10px] text-sky-700 dark:text-sky-400 font-bold block mt-0.5">
                    Semester {schoolProfile.semester}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-900">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Jam Masuk Sekolah</span>
                  <span className="text-sm font-extrabold text-sky-950 dark:text-sky-200 font-mono">
                    {schoolProfile.schoolStartTime} WIB
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-0.5">
                    Batas Toleransi: {schoolProfile.lateThresholdTime}
                  </span>
                </div>
              </div>

              {/* Roles Security Notice */}
              <div className="p-3.5 rounded-2xl bg-[#e3f2fd] dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-950 dark:text-sky-200">
                  <Fingerprint className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
                  <span>Hak Akses Terbagi Sesuai Peran:</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span><strong>Admin / Kepala Sekolah:</strong> Kontrol penuh master data, rombel & hak akses.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                    <span><strong>Guru / Wali Kelas:</strong> Presensi harian, verifikasi izin, & rekap kelas.</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span><strong>Wali Murid:</strong> Pemantauan presensi anak & kirim surat izin.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form & Quick Demo Logins */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Login Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#0a1b35] border border-sky-300 dark:border-sky-800 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-sky-200 dark:border-sky-800 mb-5">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                    <span>Masuk ke Akun Anda</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Masukkan NIP, Email, atau Nama Pengguna resmi Anda
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Login Presensi
                </span>
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-rose-900 dark:text-rose-200">Gagal Masuk</p>
                    <p className="text-rose-700 dark:text-rose-300 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    NIP / Email / Nama Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="login-identifier-input"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Contoh: kepsek@sdn01harapanbangsa.sch.id / ratnadewi / NIP"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-sky-50/50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold cursor-pointer hover:underline" onClick={() => setErrorMessage('Gunakan tombol "Pilih Akun Cepat" di bawah atau hubungi Administrator untuk reset sandi.')}>
                      Lupa sandi?
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi akun Anda"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-sky-50/50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:bg-white dark:focus:bg-slate-900 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-700 focus:ring-sky-600 border-sky-300"
                    />
                    <span>Ingat saya di perangkat ini</span>
                  </label>
                </div>

                <button
                  id="login-submit-button"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Masuk ke Sistem Presensi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Login Selector (1-Click Login) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white/95 dark:bg-[#0a1b35] border border-sky-300 dark:border-sky-800 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-sky-200 dark:border-sky-800">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                    <span>Pilih Akun Cepat (Simulasi Peran)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Klik salah satu akun di bawah untuk langsung login & menguji hak akses:
                  </p>
                </div>

                {/* Filter Tabs for Quick Selection */}
                <div className="flex items-center gap-1 bg-sky-100 dark:bg-sky-950 p-1 rounded-xl border border-sky-300 dark:border-sky-800">
                  <button
                    onClick={() => setSelectedRoleFilter('all')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRoleFilter === 'all'
                        ? 'bg-sky-700 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setSelectedRoleFilter('admin')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRoleFilter === 'admin'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => setSelectedRoleFilter('guru')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRoleFilter === 'guru'
                        ? 'bg-sky-700 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Guru
                  </button>
                  <button
                    onClick={() => setSelectedRoleFilter('wali_murid')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      selectedRoleFilter === 'wali_murid'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Wali
                  </button>
                </div>
              </div>

              {/* Demo Account Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDemoUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user.id)}
                    className="p-3.5 rounded-2xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/60 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 hover:border-sky-400 transition-all text-left flex items-start gap-3 group active:scale-98"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-sky-900 flex items-center justify-center shrink-0 border border-sky-300 dark:border-sky-800 shadow-2xs">
                      {getRoleIcon(user.role)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-800 dark:group-hover:text-sky-300">
                          {user.name}
                        </p>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${getRoleBadge(user.role)} shrink-0`}>
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-sky-800 dark:text-sky-300 font-semibold mt-0.5 truncate">
                        {user.roleTitle}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        <span className="truncate">{user.email}</span>
                        <span className="font-mono font-bold text-sky-700 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                          Login →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0369a1] dark:bg-[#061830] text-white/80 border-t border-sky-800/60 py-3 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            © {new Date().getFullYear()} {schoolProfile.name} • Sistem Presensi & Manajemen Siswa SD
          </p>
          <p className="text-[11px] text-sky-200">
            Terintegrasi Kurikulum Merdeka & Standar Dapodik Kemendikbudristek
          </p>
        </div>
      </footer>
    </div>
  );
};
