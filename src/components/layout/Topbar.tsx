import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Sun,
  Moon,
  QrCode,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  Layers,
  Sparkles,
  Check,
  Minimize2,
  Maximize2,
  FoldHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Shield,
  UserCheck,
} from 'lucide-react';

interface TopbarProps {
  onToggleMobileSidebar: () => void;
  onOpenQRScanner: () => void;
  onOpenUserSwitcher: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onToggleMobileSidebar,
  onOpenQRScanner,
  onOpenUserSwitcher,
}) => {
  const {
    activeTab,
    classes,
    selectedClassId,
    setSelectedClassId,
    darkMode,
    setDarkMode,
    currentUser,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveTab,
    dashboardSize,
    setDashboardSize,
    toggleDashboardSize,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    logout,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageHeading = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Kehadiran',
          subtitle: 'Ringkasan performa dan akurasi presensi siswa hari ini',
        };
      case 'presensi-harian':
        return {
          title: 'Input Presensi Harian',
          subtitle: 'Pencatatan status kehadiran siswa per kelas secara real-time',
        };
      case 'data-siswa':
        return {
          title: 'Master Data Siswa',
          subtitle: 'Pengelolaan data induk dan profil siswa sekolah dasar',
        };
      case 'data-kelas':
        return {
          title: 'Data Kelas & Wali',
          subtitle: 'Daftar rombongan belajar dan penanggung jawab kelas',
        };
      case 'import-data':
        return {
          title: 'Import Data Excel & Template',
          subtitle: 'Unggah data siswa massal dan unduh format template Excel resmi',
        };
      case 'rekap-laporan':
        return {
          title: 'Rekapitulasi & Laporan Presensi',
          subtitle: 'Laporan kehadiran berkala & format cetak resmi sekolah',
        };
      case 'pengajuan-izin':
        return {
          title: 'Surat Izin & Sakit Online',
          subtitle: 'Verifikasi pengajuan izin dan surat keterangan dari wali murid',
        };
      case 'kartu-pelajar':
        return {
          title: 'Kartu Pelajar & QR Presensi',
          subtitle: 'Cetak kartu identitas siswa dengan barcode presensi digital',
        };
      case 'pengaturan':
        return {
          title: 'Pengaturan Sekolah',
          subtitle: 'Konfigurasi profil institusi, jam toleransi, dan sistem',
        };
      default:
        return { title: 'Absensi Siswa SD', subtitle: '' };
    }
  };

  const pageInfo = getPageHeading();

  // Format today's date in Indonesian
  const todayFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-30 h-16 bg-[#cde4f7]/95 dark:bg-[#0a182f]/95 backdrop-blur-sm border-b border-sky-300 dark:border-sky-800 px-4 md:px-8 flex items-center justify-between transition-colors shadow-xs"
    >
      {/* Left: Mobile/Desktop Toggle & Page Titles */}
      <div className="flex items-center gap-2 md:gap-3.5 min-w-0">
        <button
          id="mobile-sidebar-toggle"
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl text-sky-900 dark:text-sky-200 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 lg:hidden"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Toggle / Minimize Button */}
        <button
          id="desktop-sidebar-toggle-topbar"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-2 rounded-xl text-sky-900 dark:text-sky-200 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 border border-sky-300 dark:border-sky-800 transition-all active:scale-95"
          title={isSidebarCollapsed ? 'Perluas Menu Kiri (Mode Lengkap)' : 'Perkecil Menu Kiri (Mode Kompak)'}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-sky-800 dark:text-sky-300" />
          )}
        </button>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
            {pageInfo.title}
          </h2>
          <p className="text-xs text-sky-900/90 dark:text-sky-300/80 truncate hidden sm:block">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Class Quick Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 bg-white/95 dark:bg-sky-950/70 p-1 rounded-xl border border-sky-300 dark:border-sky-800">
          <Layers className="w-4 h-4 text-sky-600 ml-2 shrink-0" />
          <select
            id="topbar-class-select"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-transparent text-xs font-bold text-sky-950 dark:text-sky-100 py-1.5 pr-3 pl-1 focus:outline-hidden cursor-pointer"
          >
            <option value="all" className="dark:bg-slate-900">
              Semua Kelas (1-6)
            </option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id} className="dark:bg-slate-900">
                {cls.name} ({cls.teacherName.split(' ')[0]} {cls.teacherName.split(' ')[1] || ''})
              </option>
            ))}
          </select>
        </div>

        {/* Date Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white/95 dark:bg-sky-950/60 rounded-xl border border-sky-300 dark:border-sky-800 text-xs font-semibold text-sky-950 dark:text-sky-200">
          <CalendarIcon className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
          <span>{todayFormatted}</span>
        </div>

        {/* Quick QR Scanner Button */}
        <button
          id="topbar-quick-qr-button"
          onClick={onOpenQRScanner}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs shadow-sky-300/50 transition-all active:scale-95"
          title="Pindai Kartu Siswa (QR/Barcode)"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden md:inline">Pindai QR</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="topbar-notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-sky-900 dark:text-sky-200 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 transition-colors"
            title="Pemberitahuan"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#eaf4fc] dark:bg-[#0f1d33] rounded-2xl shadow-lg border border-sky-300 dark:border-sky-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-4 border-b border-sky-200 dark:border-sky-800 flex items-center justify-between bg-sky-200/70 dark:bg-sky-950/60">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-sky-950 dark:text-white">
                    Pemberitahuan
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-300 dark:bg-sky-900 text-sky-950 dark:text-sky-200">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-sky-700 dark:text-sky-400 hover:underline font-semibold"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
              </div>

              <div className="divide-y divide-sky-200/70 dark:divide-sky-800 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-sky-700/80 dark:text-sky-400">
                    Tidak ada pemberitahuan baru.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) {
                          setActiveTab(n.linkTab);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 hover:bg-sky-200/60 dark:hover:bg-sky-900/60 cursor-pointer transition-colors ${
                        !n.read ? 'bg-sky-200/50 dark:bg-sky-950/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-sky-950 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-sky-600 shrink-0">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-sky-900/80 dark:text-sky-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Width / Minimize Toggle */}
        <div className="relative">
          <button
            id="topbar-shrink-dashboard-button"
            onClick={toggleDashboardSize}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
              dashboardSize !== 'full'
                ? 'bg-sky-200 dark:bg-sky-950/60 border-sky-400 text-sky-900 dark:text-sky-200 shadow-2xs'
                : 'text-sky-900 dark:text-sky-200 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 border-sky-300 dark:border-sky-800'
            }`}
            title={
              dashboardSize === 'full'
                ? 'Perkecil Tampilan Dasbor (Mode Kompak)'
                : dashboardSize === 'compact'
                ? 'Perkecil Lebih Lanjut (Mode Ramping)'
                : 'Kembalikan Ukuran Dasbor (Mode Penuh)'
            }
          >
            {dashboardSize === 'full' ? (
              <Minimize2 className="w-4 h-4 text-sky-800 dark:text-sky-300" />
            ) : (
              <Maximize2 className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            )}
            <span className="hidden lg:inline font-semibold text-xs">
              {dashboardSize === 'full' ? 'Perkecil Dasbor' : dashboardSize === 'compact' ? 'Ukuran: 75%' : 'Ukuran: 55%'}
            </span>
          </button>
        </div>

        {/* Dark Mode Switcher */}
        <button
          id="topbar-dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl text-sky-900 dark:text-sky-200 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 transition-colors"
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Account Trigger & Role Badge */}
        <div className="flex items-center gap-1.5">
          <button
            id="topbar-user-profile-button"
            onClick={onOpenUserSwitcher}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-sky-950/60 hover:bg-sky-200/70 dark:hover:bg-sky-900/80 border border-sky-300 dark:border-sky-800 transition-colors cursor-pointer"
            title="Klik untuk Ganti Akun / Hak Akses"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-700 text-white font-bold text-xs flex items-center justify-center">
              {currentUser.name[0]}
            </div>
            <div className="hidden md:block text-left">
              <span className="block text-xs font-bold text-sky-950 dark:text-white leading-none truncate max-w-[120px]">
                {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}
              </span>
              <span className="text-[10px] text-sky-700 dark:text-sky-400 font-medium">
                {currentUser.role === 'admin' ? 'Administrator' : currentUser.roleTitle}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-sky-600" />
          </button>

          {/* Quick Logout Button */}
          <button
            id="topbar-logout-button"
            onClick={logout}
            className="p-2 rounded-xl text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/60 transition-all cursor-pointer"
            title="Keluar / Logout dari Dasbor"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
