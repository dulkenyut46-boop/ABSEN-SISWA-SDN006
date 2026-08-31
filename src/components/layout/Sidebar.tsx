import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  GraduationCap,
  FileSpreadsheet,
  MailCheck,
  QrCode,
  Settings,
  ChevronRight,
  BookOpen,
  School,
  ChevronsLeft,
  ChevronsRight,
  PanelLeftClose,
  PanelLeftOpen,
  FileUp,
  Database,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenUserSwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  onOpenUserSwitcher,
}) => {
  const {
    activeTab,
    setActiveTab,
    schoolProfile,
    currentUser,
    leaveRequests,
    students,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    sidebarWidth,
    hasTabAccess,
    logout,
  } = useApp();

  const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'Pending').length;
  const totalActiveStudents = students.filter((s) => s.status === 'aktif').length;

  const allNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Utama',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'presensi-harian',
      label: 'Presensi Harian',
      icon: <ClipboardCheck className="w-5 h-5" />,
    },
    {
      id: 'data-siswa',
      label: 'Data Siswa',
      icon: <Users className="w-5 h-5" />,
      badge: totalActiveStudents,
      badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    },
    {
      id: 'data-kelas',
      label: 'Data Kelas & Wali',
      icon: <GraduationCap className="w-5 h-5" />,
    },
    {
      id: 'import-data',
      label: 'Import Excel',
      icon: <FileUp className="w-5 h-5" />,
      badge: 'Excel',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold',
    },
    {
      id: 'rekap-laporan',
      label: 'Rekap & Laporan',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'pengajuan-izin',
      label: 'Surat Izin / Sakit',
      icon: <MailCheck className="w-5 h-5" />,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
      badgeColor: 'bg-amber-500 text-white font-bold animate-pulse',
    },
    {
      id: 'kartu-pelajar',
      label: 'Kartu QR Siswa',
      icon: <QrCode className="w-5 h-5" />,
    },
    {
      id: 'backup-restore',
      label: 'Simpan & Pulihkan DB',
      icon: <Database className="w-5 h-5" />,
      badge: 'Backup',
      badgeColor: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold',
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan Sekolah',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  // Filter navigation items by role permissions
  const navItems = allNavItems.filter((item) => hasTabAccess(item.id));

  // Dynamic width styling for desktop
  const desktopWidth = isSidebarCollapsed ? 76 : sidebarWidth || 260;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        style={{
          width: undefined, // Handled responsive via inline/classes
        }}
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#dbeefa] dark:bg-[#0a182f] border-r border-sky-300 dark:border-sky-800 flex flex-col transition-all duration-300 ease-in-out lg:sticky lg:top-4 lg:z-30 lg:h-[calc(100vh-2rem)] lg:rounded-2xl lg:shadow-sm lg:border lg:border-sky-300 dark:lg:border-sky-800 shrink-0 ${
          isOpen ? 'translate-x-0 w-64 md:w-72' : '-translate-x-full lg:translate-x-0'
        } ${isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[250px]'}`}
      >
        {/* Brand Header */}
        <div
          className={`border-b border-sky-300/80 dark:border-sky-800 flex items-center transition-all shrink-0 ${
            isSidebarCollapsed
              ? 'p-2.5 flex-col gap-1.5 justify-center text-center'
              : 'px-3.5 py-3 justify-between gap-2.5'
          }`}
        >
          <div className={`flex items-center gap-2.5 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl bg-sky-700 flex items-center justify-center text-white shadow-xs shrink-0 overflow-hidden p-1 border border-sky-400/40">
              {schoolProfile.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <School className="w-4 h-4" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <h1 className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white uppercase truncate leading-tight">
                  Absensi Siswa SD
                </h1>
                <p className="text-[10.5px] font-semibold text-sky-800 dark:text-sky-300 truncate leading-tight" title={schoolProfile.name}>
                  {schoolProfile.name}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Minimize / Collapse Button */}
          <button
            id="sidebar-collapse-toggle-button"
            onClick={toggleSidebarCollapsed}
            className="hidden lg:flex p-1 rounded-lg text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white hover:bg-sky-200/80 dark:hover:bg-sky-900/60 transition-colors shrink-0 active:scale-95"
            title={isSidebarCollapsed ? 'Perluas Menu Kiri' : 'Perkecil Menu Kiri'}
          >
            {isSidebarCollapsed ? (
              <ChevronsRight className="w-4 h-4" />
            ) : (
              <ChevronsLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Academic Year Info Pill (Only shown when expanded) */}
        {!isSidebarCollapsed ? (
          <div className="px-3.5 py-1.5 bg-sky-200/70 dark:bg-sky-950/60 border-b border-sky-300/80 dark:border-sky-800 flex items-center justify-between text-[11px] transition-all shrink-0">
            <div className="flex items-center gap-1.5 text-sky-950 dark:text-sky-200 font-medium truncate">
              <BookOpen className="w-3 h-3 text-sky-700 dark:text-sky-400 shrink-0" />
              <span className="truncate">TA {schoolProfile.academicYear}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-sky-700/15 text-sky-900 dark:text-sky-200 border border-sky-400/40 shrink-0">
              {schoolProfile.semester}
            </span>
          </div>
        ) : (
          <div className="py-0.5 text-center border-b border-sky-300/80 dark:border-sky-800 text-[9.5px] font-bold text-sky-800 dark:text-sky-400 shrink-0">
            TA {schoolProfile.academicYear.split('/')[0]}
          </div>
        )}

        {/* Navigation Links - Clean, Compact, Zero Scroll Overflow */}
        <nav
          className={`flex-1 flex flex-col justify-between py-1.5 overflow-hidden ${
            isSidebarCollapsed ? 'px-1.5' : 'px-2.5'
          }`}
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile();
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs transition-all group relative ${
                    isSidebarCollapsed
                      ? 'justify-center p-2'
                      : 'justify-between px-3 py-2'
                  } ${
                    isActive
                      ? 'bg-sky-700 hover:bg-sky-800 text-white shadow-xs font-bold border border-sky-800'
                      : 'bg-white/90 dark:bg-sky-950/40 text-sky-950 dark:text-sky-200 border border-sky-300/80 dark:border-sky-800 hover:bg-sky-200/80 dark:hover:bg-sky-900/60 font-semibold'
                  }`}
                >
                  <div
                    className={`flex items-center gap-2.5 min-w-0 ${
                      isSidebarCollapsed ? 'justify-center' : ''
                    }`}
                  >
                    <span
                      className={`transition-colors shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-sky-700 dark:text-sky-400 group-hover:text-sky-900'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isSidebarCollapsed && (
                      <span className="truncate text-[11.5px]">{item.label}</span>
                    )}
                  </div>

                  {/* Badge for Expanded Mode */}
                  {!isSidebarCollapsed && (
                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none ${
                            isActive
                              ? 'bg-white text-sky-800'
                              : 'bg-sky-200 dark:bg-sky-900 text-sky-950 dark:text-sky-100'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-white" />}
                    </div>
                  )}

                  {/* Badge Indicator Dot for Collapsed Mode */}
                  {isSidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                        item.id === 'pengajuan-izin'
                          ? 'bg-amber-400 ring-2 ring-white dark:ring-slate-900 animate-pulse'
                          : 'bg-sky-700 ring-2 ring-white dark:ring-slate-900'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Current User Card & Switcher Trigger */}
        <div
          className={`border-t border-sky-300/80 dark:border-sky-800 bg-sky-200/50 dark:bg-sky-950/50 shrink-0 ${
            isSidebarCollapsed ? 'p-1.5 space-y-1' : 'p-2.5 flex items-center gap-2'
          }`}
        >
          <button
            id="sidebar-user-switcher-trigger"
            onClick={onOpenUserSwitcher}
            title={isSidebarCollapsed ? `${currentUser.name} (${currentUser.roleTitle}) - Ganti Pengguna` : undefined}
            className={`flex-1 rounded-xl bg-white dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 hover:border-sky-600 dark:hover:border-sky-500 flex items-center text-left transition-all group cursor-pointer ${
              isSidebarCollapsed ? 'w-full p-1.5 justify-center' : 'p-2 gap-2.5'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-sky-200 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-300 dark:border-sky-800">
              {currentUser.name
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-sky-800 dark:group-hover:text-sky-300">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-sky-800/90 dark:text-sky-300/80 truncate">
                  {currentUser.roleTitle}
                </p>
              </div>
            )}
          </button>

          {/* Quick Logout */}
          <button
            id="sidebar-logout-button"
            onClick={logout}
            title="Keluar / Logout"
            className={`rounded-xl text-rose-600 hover:text-rose-700 dark:text-rose-400 bg-white/80 dark:bg-sky-950/70 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-sky-300 dark:border-sky-800 hover:border-rose-300 transition-all flex items-center justify-center cursor-pointer ${
              isSidebarCollapsed ? 'w-full p-1.5' : 'p-2 shrink-0'
            }`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
