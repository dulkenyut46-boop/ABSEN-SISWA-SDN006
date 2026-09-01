import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Lock,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  KeyRound,
  Shield,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  QrCode,
  SlidersHorizontal,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RoleType, RolePermissionConfig, NavigationTab, UserSession } from '../../types';
import { Modal } from '../common/Modal';

export const RolePermissionsManager: React.FC = () => {
  const {
    currentUser,
    allUsers,
    addUser,
    updateUser,
    deleteUser,
    deleteAllTeachers,
    toggleUserStatus,
    rolePermissions,
    updateRolePermissions,
    updateRoleAllowedTabs,
    resetRolePermissionsToDefault,
    classes,
  } = useApp();

  const [activeRoleTab, setActiveRoleTab] = useState<RoleType>('guru');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);
  const [activeTabSection, setActiveTabSection] = useState<'matrix' | 'users'>('matrix');
  const [isDeleteAllTeachersModalOpen, setIsDeleteAllTeachersModalOpen] = useState(false);
  const [clearClassTeachersOption, setClearClassTeachersOption] = useState(true);
  const [confirmTeacherSafetyCheck, setConfirmTeacherSafetyCheck] = useState(false);

  // Total guru count
  const teacherCount = allUsers.filter((u) => u.role === 'guru').length;

  // Form State for Adding / Editing User
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'guru' as RoleType,
    roleTitle: '',
    nip: '',
    assignedClass: '',
    phone: '',
    isActive: true,
  });

  const availableNavigationTabs: { id: NavigationTab; label: string; desc: string }[] = [
    { id: 'dashboard', label: 'Dasbor Utama', desc: 'Ringkasan statistik kehadiran sekolah & grafik' },
    { id: 'presensi-harian', label: 'Presensi Harian', desc: 'Pengisian absensi kelas, checklist & QR Scanner' },
    { id: 'data-siswa', label: 'Master Data Siswa', desc: 'Database biodata peserta didik & NISN' },
    { id: 'data-kelas', label: 'Rombel & Wali Kelas', desc: 'Struktur kelas, ruangan & penetapan guru' },
    { id: 'rekap-laporan', label: 'Rekap & Laporan Presensi', desc: 'Laporan bulanan/semester format Kemdikbud' },
    { id: 'kartu-pelajar', label: 'Cetak Kartu Siswa (QR)', desc: 'Generator kartu identitas barcode presensi' },
    { id: 'pengajuan-izin', label: 'Surat Izin & Sakit', desc: 'Verifikasi & persetujuan surat izin digital' },
    { id: 'import-data', label: 'Import / Export Data', desc: 'Sinkronisasi Excel Dapodik & format data' },
    { id: 'backup-restore', label: 'Simpan & Pulihkan Database', desc: 'Backup berkas JSON lengkap, restore data, dan snapshot sistem' },
    { id: 'pengaturan', label: 'Pengaturan Sekolah & Hak Akses', desc: 'Profil sekolah, jam masuk & izin peran' },
  ];

  const permissionItemsList: {
    key: keyof RolePermissionConfig;
    title: string;
    description: string;
    category: 'Master Data' | 'Presensi' | 'Surat Izin' | 'Sistem';
  }[] = [
    {
      key: 'canViewDashboard',
      title: 'Akses Dasbor Statistik Utama',
      description: 'Melihat widget ringkasan kehadiran harian, persentase hadir, dan grafik tren.',
      category: 'Presensi',
    },
    {
      key: 'canMarkAttendance',
      title: 'Input & Catat Presensi Harian',
      description: 'Mencatat status kehadiran Hadir, Sakit, Izin, Terlambat, dan Alpa.',
      category: 'Presensi',
    },
    {
      key: 'canEditAttendance',
      title: 'Edit & Perbarui Rekam Kehadiran',
      description: 'Mengubah catatan presensi yang sudah tersimpan sebelumnya.',
      category: 'Presensi',
    },
    {
      key: 'restrictedToAssignedClass',
      title: 'Batasi Hanya Kelas Binaan Sendiri (Wali Kelas)',
      description: 'Jika aktif, guru hanya dapat mengelola presensi siswa di kelas binaannya saja.',
      category: 'Presensi',
    },
    {
      key: 'canManageStudents',
      title: 'Kelola Master Data Siswa',
      description: 'Menambah, mengubah biodata, mutasi, dan menghapus data siswa.',
      category: 'Master Data',
    },
    {
      key: 'canManageClasses',
      title: 'Kelola Rombongan Belajar (Kelas)',
      description: 'Menambah rombel baru, mengganti wali kelas, dan nomor ruangan.',
      category: 'Master Data',
    },
    {
      key: 'canGenerateCards',
      title: 'Generate & Cetak Kartu Pelajar (QR)',
      description: 'Mencetak kartu presensi barcode untuk siswa di sekolah.',
      category: 'Master Data',
    },
    {
      key: 'canApproveLeave',
      title: 'Verifikasi & Setujui Surat Izin / Sakit',
      description: 'Menerima dan menyetujui pengajuan izin/sakit siswa secara digital.',
      category: 'Surat Izin',
    },
    {
      key: 'canViewReports',
      title: 'Unduh Rekap Laporan (Excel & Cetak)',
      description: 'Mengekspor berkas rekapitulasi presensi bulanan dan semester.',
      category: 'Sistem',
    },
    {
      key: 'canImportExportData',
      title: 'Import & Export Excel Dapodik Massal',
      description: 'Impor template Excel data siswa dan kelas secara cepat.',
      category: 'Sistem',
    },
    {
      key: 'canManageSettings',
      title: 'Ubah Profil Sekolah & Jam Operasional',
      description: 'Konfigurasi NPSN, jam masuk sekolah, dan toleransi keterlambatan.',
      category: 'Sistem',
    },
    {
      key: 'canManagePermissions',
      title: 'Kelola Akun Pengguna & Hak Akses (RBAC)',
      description: 'Menambah user guru/admin baru, reset kata sandi, dan mengatur matriks izin.',
      category: 'Sistem',
    },
  ];

  const currentRoleConfig = rolePermissions[activeRoleTab];

  const handleToggleTab = (tabId: NavigationTab) => {
    const currentTabs = currentRoleConfig.allowedTabs;
    const exists = currentTabs.includes(tabId);
    let nextTabs: NavigationTab[];
    if (exists) {
      nextTabs = currentTabs.filter((t) => t !== tabId);
    } else {
      nextTabs = [...currentTabs, tabId];
    }
    updateRoleAllowedTabs(activeRoleTab, nextTabs);
  };

  const handleTogglePermission = (permKey: keyof RolePermissionConfig) => {
    const currentVal = Boolean(currentRoleConfig.permissions[permKey]);
    updateRolePermissions(activeRoleTab, {
      [permKey]: !currentVal,
    });
  };

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserFormData({
      name: '',
      email: '',
      username: '',
      password: 'password123',
      role: 'guru',
      roleTitle: 'Guru / Wali Kelas',
      nip: '',
      assignedClass: 'c1',
      phone: '',
      isActive: true,
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserSession) => {
    setEditingUserId(user.id);
    setUserFormData({
      name: user.name,
      email: user.email,
      username: user.username || '',
      password: user.password || 'password123',
      role: user.role,
      roleTitle: user.roleTitle,
      nip: user.nip || '',
      assignedClass: user.assignedClass || '',
      phone: user.phone || '',
      isActive: user.isActive !== false,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) return;

    if (editingUserId) {
      updateUser(editingUserId, userFormData);
    } else {
      addUser(userFormData);
    }
    setIsUserModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6 text-sky-200" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pengaturan Hak Akses & Akun Pengguna (RBAC)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                Sistem Izin Berlapis
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atur izin spesifik untuk Administrator, Guru / Wali Kelas, dan Wali Murid secara fleksibel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            type="button"
            onClick={resetRolePermissionsToDefault}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700"
            title="Kembalikan semua izin peran ke standar default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Izin ke Default</span>
          </button>
        </div>
      </div>

      {/* Main Section Navigation (Matriks Hak Akses vs Manajemen Akun) */}
      <div className="flex items-center gap-2 border-b border-sky-200 dark:border-sky-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTabSection('matrix')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTabSection === 'matrix'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white dark:bg-sky-950/40 text-slate-600 dark:text-slate-400 hover:bg-sky-50 border border-sky-200 dark:border-sky-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>1. Konfigurasi Matriks Hak Akses (Admin / Guru)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabSection('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTabSection === 'users'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-white dark:bg-sky-950/40 text-slate-600 dark:text-slate-400 hover:bg-sky-50 border border-sky-200 dark:border-sky-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. Daftar Akun Pengguna & Password ({allUsers.length})</span>
        </button>
      </div>

      {/* SECTION 1: MATRIKS HAK AKSES */}
      {activeTabSection === 'matrix' && (
        <div className="space-y-6">
          {/* Role Selection Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'admin' as RoleType,
                title: 'Administrator / Kepala Sekolah',
                subtitle: 'Hak Akses Penuh Sekolah & Sistem',
                icon: ShieldCheck,
                color: 'amber',
              },
              {
                id: 'guru' as RoleType,
                title: 'Guru / Wali Kelas',
                subtitle: 'Presensi Harian, Izin & Rekap Rombel',
                icon: GraduationCap,
                color: 'sky',
              },
              {
                id: 'wali_murid' as RoleType,
                title: 'Wali Murid / Orang Tua',
                subtitle: 'Pengajuan Izin & Pantau Kehadiran',
                icon: Users,
                color: 'emerald',
              },
            ].map((roleItem) => {
              const Icon = roleItem.icon;
              const isSelected = activeRoleTab === roleItem.id;
              return (
                <button
                  key={roleItem.id}
                  type="button"
                  onClick={() => setActiveRoleTab(roleItem.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-700 text-white border-sky-800 shadow-md ring-2 ring-sky-500'
                      : 'bg-white dark:bg-sky-950/40 text-slate-700 dark:text-slate-200 border-sky-200 dark:border-sky-800 hover:border-sky-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold leading-tight truncate">
                        {roleItem.title}
                      </h4>
                      <p
                        className={`text-[11px] mt-0.5 truncate ${
                          isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {roleItem.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Role Header Description */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-sky-950 dark:text-sky-200">
                Mengatur Peran: {currentRoleConfig.roleTitle} ({activeRoleTab.toUpperCase()})
              </span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                {currentRoleConfig.description} Perubahan yang Anda pilih di bawah akan langsung berlaku secara real-time untuk semua pengguna dengan peran ini.
              </p>
            </div>
          </div>

          {/* Sub-Card 1: Modul & Tab yang Diizinkan */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1b35] border border-sky-300 dark:border-sky-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  <span>Modul Menu yang Dapat Diakses</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Centang modul yang diizinkan tampil pada bilah navigasi pengguna peran ini.
                </p>
              </div>
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/60">
                {currentRoleConfig.allowedTabs.length} Modul Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableNavigationTabs.map((tab) => {
                const isAllowed = currentRoleConfig.allowedTabs.includes(tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleToggleTab(tab.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isAllowed
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                        isAllowed
                          ? 'bg-sky-700 text-white border-sky-800'
                          : 'bg-white dark:bg-slate-800 text-transparent border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {tab.label}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Card 2: Izin Fungsional Granular */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0a1b35] border border-sky-300 dark:border-sky-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-800">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  <span>Izin Aksi & Operasi Data Spesifik</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kontrol mendalam hak melakukan tindakan spesifik di dalam aplikasi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {permissionItemsList.map((perm) => {
                const isEnabled = Boolean(currentRoleConfig.permissions[perm.key]);
                return (
                  <div
                    key={perm.key}
                    onClick={() => handleTogglePermission(perm.key)}
                    className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-all cursor-pointer ${
                      isEnabled
                        ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700'
                        : 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {perm.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-300">
                          {perm.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {perm.description}
                      </p>
                    </div>

                    {/* Toggle Switch */}
                    <div
                      className={`w-10 h-5.5 rounded-full transition-colors relative shrink-0 mt-0.5 ${
                        isEnabled ? 'bg-sky-700' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                          isEnabled ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DAFTAR AKUN PENGGUNA & PASSWORD */}
      {activeTabSection === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Daftar Akun Guru, Admin & Operator
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola kredensial login, penetapan wali kelas, dan status keaktifan akun.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="delete-all-teachers-btn"
                onClick={() => {
                  setConfirmTeacherSafetyCheck(false);
                  setIsDeleteAllTeachersModalOpen(true);
                }}
                disabled={teacherCount === 0}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  teacherCount === 0
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700 cursor-not-allowed opacity-60'
                    : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 active:scale-95'
                }`}
                title="Hapus semua akun guru dari database"
              >
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Hapus Semua Guru ({teacherCount})</span>
              </button>

              <button
                type="button"
                id="add-user-btn"
                onClick={handleOpenAddUser}
                className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Akun Baru</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-[#0a1b35]">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead className="bg-sky-100/70 dark:bg-sky-950/80 text-sky-950 dark:text-sky-200 border-b border-sky-200 dark:border-sky-800 font-extrabold">
                <tr>
                  <th className="py-3 px-4">Nama Lengkap & NIP</th>
                  <th className="py-3 px-4">Role / Peran</th>
                  <th className="py-3 px-4">Kredensial Login</th>
                  <th className="py-3 px-4">Kelas Binaan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100 dark:divide-sky-900/60">
                {allUsers.map((user) => {
                  const assignedClassName = classes.find((c) => c.id === user.assignedClass)?.name || user.assignedClass || '-';
                  return (
                    <tr key={user.id} className="hover:bg-sky-50/50 dark:hover:bg-sky-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          NIP: {user.nip || '-'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                              : user.role === 'guru'
                              ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {user.roleTitle}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                          {user.email}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          User: {user.username || '-'} • Sandi: {user.password || '******'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-sky-900 dark:text-sky-200 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                          {assignedClassName}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                            user.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                          title="Klik untuk ubah status aktif/nonaktif"
                        >
                          {user.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/60 hover:bg-sky-100 dark:hover:bg-sky-800 text-sky-800 dark:text-sky-200 transition-all"
                            title="Edit Data Pengguna & Sandi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {currentUser.id !== user.id && (
                            <button
                              type="button"
                              onClick={() => deleteUser(user.id)}
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition-all"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Add / Edit Modal */}
      {isUserModalOpen && (
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          title={editingUserId ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
        >
          <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd."
                className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIP (Nomor Induk Pegawai)
                </label>
                <input
                  type="text"
                  value={userFormData.nip}
                  onChange={(e) => setUserFormData({ ...userFormData, nip: e.target.value })}
                  placeholder="18 digit angka NIP"
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran / Hak Akses *
                </label>
                <select
                  value={userFormData.role}
                  onChange={(e) => {
                    const r = e.target.value as RoleType;
                    const defTitle =
                      r === 'admin'
                        ? 'Kepala Sekolah / Admin'
                        : r === 'guru'
                        ? 'Guru / Wali Kelas'
                        : 'Wali Murid';
                    setUserFormData({ ...userFormData, role: r, roleTitle: defTitle });
                  }}
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white font-bold"
                >
                  <option value="admin">Administrator / Kepala Sekolah</option>
                  <option value="guru">Guru / Wali Kelas</option>
                  <option value="wali_murid">Wali Murid / Orang Tua</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun *
                </label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="contoh@sdn01.sch.id"
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pengguna (Username)
                </label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="username_guru"
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi (Password) *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInForm ? 'text' : 'password'}
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Kata sandi akun"
                    className="w-full p-2.5 pr-9 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                  >
                    {showPasswordInForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kelas Binaan (Wali Kelas)
                </label>
                <select
                  value={userFormData.assignedClass}
                  onChange={(e) => setUserFormData({ ...userFormData, assignedClass: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/40 text-slate-900 dark:text-white"
                >
                  <option value="">-- Bukan Wali Kelas / Semua Kelas --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Kelas {c.grade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-sky-200 dark:border-sky-800">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold"
              >
                Simpan Akun
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete All Teachers Confirmation Modal */}
      {isDeleteAllTeachersModalOpen && (
        <Modal
          isOpen={isDeleteAllTeachersModalOpen}
          onClose={() => {
            setIsDeleteAllTeachersModalOpen(false);
            setConfirmTeacherSafetyCheck(false);
          }}
          title="Hapus Semua Data Akun Guru"
          maxWidth="md"
        >
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">
                  Peringatan Penghapusan Akun Guru!
                </h4>
                <p className="text-rose-700 dark:text-rose-300 leading-relaxed">
                  Tindakan ini akan menghapus seluruh data akun guru/wali kelas ({teacherCount} akun) dari sistem database. Akun administrator utama akan tetap dipertahankan agar Anda tidak terkunci dari sistem.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-sky-50/50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearClassTeachersOption}
                  onChange={(e) => setClearClassTeachersOption(e.target.checked)}
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    Kosongkan juga penetapan Guru/Wali Kelas di seluruh Rombel
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Otomatis mereset nama dan NIP wali kelas di data rombongan belajar menjadi kosong/strip (-).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 cursor-pointer">
                <input
                  id="confirm-delete-all-teachers-checkbox"
                  type="checkbox"
                  checked={confirmTeacherSafetyCheck}
                  onChange={(e) => setConfirmTeacherSafetyCheck(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 select-none">
                  Saya menyetujui penghapusan seluruh data akun guru ({teacherCount} guru) secara permanen.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteAllTeachersModalOpen(false);
                  setConfirmTeacherSafetyCheck(false);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                id="execute-delete-all-teachers-btn"
                type="button"
                disabled={!confirmTeacherSafetyCheck}
                onClick={() => {
                  if (!confirmTeacherSafetyCheck) return;
                  deleteAllTeachers({ clearClassTeachers: clearClassTeachersOption });
                  setIsDeleteAllTeachersModalOpen(false);
                  setConfirmTeacherSafetyCheck(false);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                  confirmTeacherSafetyCheck
                    ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                    : 'bg-rose-200 dark:bg-rose-950 text-rose-400 dark:text-rose-600 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua ({teacherCount} Guru)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
