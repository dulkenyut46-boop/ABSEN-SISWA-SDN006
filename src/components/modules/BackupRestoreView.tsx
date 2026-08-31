import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Download,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  HardDrive,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Trash2,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  FileJson,
  FileArchive,
  ArrowRight,
  School,
  Users,
  ClipboardList,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { DatabaseBackupData } from '../../types';

export const BackupRestoreView: React.FC = () => {
  const {
    schoolProfile,
    students,
    classes,
    attendanceRecords,
    leaveRequests,
    allUsers,
    rolePermissions,
    currentUser,
    exportDatabaseBackup,
    downloadDatabaseBackupFile,
    restoreDatabaseFromBackup,
    restorePoints,
    createLocalRestorePoint,
    restoreFromLocalPoint,
    deleteLocalRestorePoint,
    resetDataToDefault,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'snapshots' | 'danger'>('backup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackupData, setParsedBackupData] = useState<DatabaseBackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [isConfirmRestoreOpen, setIsConfirmRestoreOpen] = useState(false);
  const [isNewSnapshotModalOpen, setIsNewSnapshotModalOpen] = useState(false);
  const [newSnapshotName, setNewSnapshotName] = useState('');
  const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read and validate JSON file for Restore
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setParseError(null);
    setParsedBackupData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);

        // Validation: must have either students, classes, attendanceRecords, or schoolProfile
        if (
          !json ||
          typeof json !== 'object' ||
          (!json.students && !json.classes && !json.attendanceRecords && !json.schoolProfile)
        ) {
          setParseError('Berkas JSON tidak memiliki format data presensi yang valid.');
          return;
        }

        // Normalize data
        const normalizedData: DatabaseBackupData = {
          version: json.version || '1.0.0',
          appName: json.appName || 'Presensi SD',
          exportedAt: json.exportedAt || new Date().toISOString(),
          exportedBy: json.exportedBy,
          checksum: json.checksum,
          metadata: {
            totalStudents: json.students?.length || json.metadata?.totalStudents || 0,
            totalClasses: json.classes?.length || json.metadata?.totalClasses || 0,
            totalAttendance: json.attendanceRecords?.length || json.metadata?.totalAttendance || 0,
            totalLeaveRequests: json.leaveRequests?.length || json.metadata?.totalLeaveRequests || 0,
            totalUsers: json.users?.length || json.metadata?.totalUsers || 0,
            schoolName: json.schoolProfile?.name || json.metadata?.schoolName || 'Data Sekolah',
            npsn: json.schoolProfile?.npsn || json.metadata?.npsn || '-',
          },
          schoolProfile: json.schoolProfile || schoolProfile,
          classes: json.classes || [],
          students: json.students || [],
          attendanceRecords: json.attendanceRecords || [],
          leaveRequests: json.leaveRequests || [],
          users: json.users || allUsers,
          rolePermissions: json.rolePermissions || rolePermissions,
        };

        setParsedBackupData(normalizedData);
      } catch (err: any) {
        setParseError(`Gagal membaca berkas JSON: ${err.message || 'Format JSON rusak'}`);
      }
    };
    reader.readAsText(file);
  };

  // Copy raw JSON string
  const handleCopyJson = () => {
    const backup = exportDatabaseBackup();
    navigator.clipboard.writeText(JSON.stringify(backup, null, 2));
    setIsCopied(true);
    addToast({
      type: 'success',
      title: 'Disalin ke Clipboard',
      message: 'String data backup berhasil disalin ke papan klip.',
    });
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Handle Restore Execution
  const handleExecuteRestore = () => {
    if (!parsedBackupData) return;
    setIsProcessing(true);

    setTimeout(() => {
      const res = restoreDatabaseFromBackup(parsedBackupData, restoreMode);
      setIsProcessing(false);
      setIsConfirmRestoreOpen(false);
      setSelectedFile(null);
      setParsedBackupData(null);
    }, 400);
  };

  // Handle Create Manual Snapshot
  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapshotName.trim()) {
      addToast({
        type: 'warning',
        title: 'Nama Wajib Diisi',
        message: 'Mohon isi nama titik pemulihan.',
      });
      return;
    }
    createLocalRestorePoint(newSnapshotName, newSnapshotDesc, false);
    setIsNewSnapshotModalOpen(false);
    setNewSnapshotName('');
    setNewSnapshotDesc('');
  };

  // Handle Factory Reset
  const handleExecuteReset = () => {
    if (resetConfirmInput !== 'RESET') {
      addToast({
        type: 'error',
        title: 'Konfirmasi Salah',
        message: 'Ketik kata "RESET" dengan huruf kapital untuk melanjutkan.',
      });
      return;
    }
    resetDataToDefault();
    setIsResetConfirmOpen(false);
    setResetConfirmInput('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-sky-950 rounded-2xl p-6 text-white shadow-md border border-sky-700/50 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-700/60 border border-sky-500/40 text-xs font-semibold text-sky-200">
              <Database className="w-3.5 h-3.5" />
              <span>Manajemen Database & Keamanan Data</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Simpan & Kembalikan Database
            </h1>
            <p className="text-sm text-sky-200/90 leading-relaxed">
              Unduh cadangan data lengkap (*Full JSON Backup*) untuk arsip aman sekolah, pulihkan data lama saat pindah perangkat, atau gunakan titik pemulihan (*snapshot*) cepat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="backup-download-header-button"
              onClick={() => downloadDatabaseBackupFile()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Backup Sekarang</span>
            </button>
            <button
              id="backup-create-snapshot-header-button"
              onClick={() => setIsNewSnapshotModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-700/80 hover:bg-sky-600 text-white font-bold text-xs border border-sky-500/50 shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Snapshot Baru</span>
            </button>
          </div>
        </div>

        {/* Database Health Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-sky-700/60">
          <div className="bg-sky-950/60 rounded-xl p-3 border border-sky-700/40">
            <span className="text-[11px] text-sky-300 font-medium block">Total Siswa Aktif</span>
            <span className="text-lg font-bold text-white">{students.length} Siswa</span>
          </div>
          <div className="bg-sky-950/60 rounded-xl p-3 border border-sky-700/40">
            <span className="text-[11px] text-sky-300 font-medium block">Rombongan Belajar</span>
            <span className="text-lg font-bold text-white">{classes.length} Kelas</span>
          </div>
          <div className="bg-sky-950/60 rounded-xl p-3 border border-sky-700/40">
            <span className="text-[11px] text-sky-300 font-medium block">Riwayat Presensi</span>
            <span className="text-lg font-bold text-white">{attendanceRecords.length} Catatan</span>
          </div>
          <div className="bg-sky-950/60 rounded-xl p-3 border border-sky-700/40">
            <span className="text-[11px] text-sky-300 font-medium block">Titik Pemulihan Lokal</span>
            <span className="text-lg font-bold text-amber-300">{restorePoints.length} Snapshot</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-sky-300/80 dark:border-sky-800 gap-1 overflow-x-auto no-scrollbar">
        <button
          id="tab-backup-btn"
          onClick={() => setActiveTab('backup')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white hover:bg-sky-100/60 dark:hover:bg-sky-950/50'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>1. Simpan & Unduh Cadangan</span>
        </button>

        <button
          id="tab-restore-btn"
          onClick={() => setActiveTab('restore')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'restore'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white hover:bg-sky-100/60 dark:hover:bg-sky-950/50'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>2. Kembalikan / Pulihkan Database</span>
        </button>

        <button
          id="tab-snapshots-btn"
          onClick={() => setActiveTab('snapshots')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all cursor-pointer ${
            activeTab === 'snapshots'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white hover:bg-sky-100/60 dark:hover:bg-sky-950/50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Titik Pemulihan (Snapshots)</span>
          {restorePoints.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
              {restorePoints.length}
            </span>
          )}
        </button>

        <button
          id="tab-danger-btn"
          onClick={() => setActiveTab('danger')}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all ml-auto cursor-pointer ${
            activeTab === 'danger'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Reset Pabrik</span>
        </button>
      </div>

      {/* TAB 1: SIMPAN & UNDUH CADANGAN */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Action Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-sky-950/60 rounded-2xl p-6 border border-sky-300/80 dark:border-sky-800 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                    Unduh Cadangan Database Utama (.JSON)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-sky-300/80 mt-1">
                    Semua database tersimpan dalam satu berkas terstruktur yang dapat dipulihkan kapan saja ke aplikasi ini.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Status: Siap Unduh
                </span>
              </div>

              {/* Data Items Included List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-sky-50/70 dark:bg-sky-900/30 border border-sky-200/70 dark:border-sky-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Master Data Siswa ({students.length})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-sky-300">NISN, NIS, biodata lengkap & kontak</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                    <School className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Rombel & Wali Kelas ({classes.length})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-sky-300">Struktur rombel & penugasan guru</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Rekam Presensi ({attendanceRecords.length})
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-sky-300">Riwayat H/S/I/T/A & jam masuk</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Profil & Hak Akses ({allUsers.length} Akun)
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-sky-300">Matriks RBAC & izin pengguna</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-download-full-backup"
                  onClick={() => downloadDatabaseBackupFile()}
                  className="px-5 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas Cadangan (.JSON)</span>
                </button>

                <button
                  id="btn-copy-json-backup"
                  onClick={handleCopyJson}
                  className="px-4 py-3 rounded-xl bg-white dark:bg-sky-950 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-900 text-slate-800 dark:text-sky-200 font-bold text-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Tersalin ke Papan Klip!' : 'Salin String JSON'}</span>
                </button>

                <button
                  id="btn-create-snapshot-quick"
                  onClick={() => setIsNewSnapshotModalOpen(true)}
                  className="px-4 py-3 rounded-xl bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-200 font-bold text-xs border border-sky-300 dark:border-sky-700 transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Clock className="w-4 h-4" />
                  <span>Simpan ke Snapshot Lokal</span>
                </button>
              </div>
            </div>

            {/* Instruction Box */}
            <div className="bg-sky-50 dark:bg-sky-950/40 rounded-2xl p-5 border border-sky-200/80 dark:border-sky-800/80 space-y-3">
              <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-2">
                <Info className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Kapan Sebaiknya Melakukan Simpan Cadangan Database?
              </h4>
              <ul className="text-xs text-slate-600 dark:text-sky-300/90 space-y-1.5 list-disc pl-5">
                <li>Sebelum melakukan pembaruan semester atau perubahan data siswa secara massal.</li>
                <li>Setiap akhir pekan atau akhir bulan untuk rekapitulasi data fisik sekolah yang aman.</li>
                <li>Sebelum membersihkan *cache* browser atau berpindah ke komputer/laptop operator baru.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Database Profile & Schema Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-sky-950/60 rounded-2xl p-6 border border-sky-300/80 dark:border-sky-800 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-sky-400">
                Informasi Database Saat Ini
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-sky-400 block text-[11px]">Nama Satuan Pendidikan:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{schoolProfile.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-sky-400 block text-[11px]">NPSN & Semester:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-sky-200">
                    {schoolProfile.npsn} • {schoolProfile.academicYear} ({schoolProfile.semester})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-sky-400 block text-[11px]">Terakhir Dicadangkan:</span>
                  <span className="font-medium text-slate-700 dark:text-sky-300">
                    {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-sky-400 block text-[11px]">Akun Operator:</span>
                  <span className="font-medium text-slate-800 dark:text-sky-200">
                    {currentUser.name} ({currentUser.roleTitle})
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-sky-200 dark:border-sky-800 text-[11px] text-slate-500 dark:text-sky-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Format JSON terenkripsi dan kompatibel dengan skema Dapodik.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEMBALIKAN / PULIHKAN DATABASE */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-sky-950/60 rounded-2xl p-6 border border-sky-300/80 dark:border-sky-800 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                Pulihkan Database dari Berkas Cadangan (.JSON)
              </h3>
              <p className="text-xs text-slate-500 dark:text-sky-300/80 mt-1">
                Pilih atau seret berkas backup (.json) yang pernah Anda unduh sebelumnya untuk mengembalikan seluruh data sekolah secara otomatis.
              </p>
            </div>

            {/* Drag and drop / file input box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-sky-600 bg-sky-50/60 dark:bg-sky-900/30'
                  : 'border-sky-300 dark:border-sky-800 hover:border-sky-600 dark:hover:border-sky-600 bg-sky-50/30 dark:bg-sky-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-700 dark:text-sky-300 mb-3">
                <FileJson className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-sky-400">
                    Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB • Klik untuk ganti berkas
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    Pilih atau Seret Berkas Cadangan (.JSON) ke Sini
                  </p>
                  <p className="text-xs text-slate-500 dark:text-sky-400">
                    Mendukung berkas backup resmi format JSON dari Sistem Presensi
                  </p>
                </div>
              )}
            </div>

            {/* Parse Error Display */}
            {parseError && (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Pre-Restore Preview Card */}
            {parsedBackupData && (
              <div className="space-y-5 p-5 rounded-2xl bg-sky-50/70 dark:bg-sky-900/30 border border-sky-300/80 dark:border-sky-800">
                <div className="flex items-center justify-between border-b border-sky-200 dark:border-sky-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Berkas Cadangan Terverifikasi Valid
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-sky-300">
                        {parsedBackupData.metadata.schoolName} (NPSN: {parsedBackupData.metadata.npsn})
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-sky-400">
                    Versi: {parsedBackupData.version}
                  </span>
                </div>

                {/* Content Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-sky-950 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                    <span className="text-[10px] text-slate-400 dark:text-sky-400 block font-semibold">
                      DATA SISWA
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {parsedBackupData.students.length} Siswa
                    </span>
                  </div>
                  <div className="bg-white dark:bg-sky-950 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                    <span className="text-[10px] text-slate-400 dark:text-sky-400 block font-semibold">
                      ROMBEL & KELAS
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {parsedBackupData.classes.length} Rombel
                    </span>
                  </div>
                  <div className="bg-white dark:bg-sky-950 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                    <span className="text-[10px] text-slate-400 dark:text-sky-400 block font-semibold">
                      REKAM PRESENSI
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {parsedBackupData.attendanceRecords.length} Catatan
                    </span>
                  </div>
                  <div className="bg-white dark:bg-sky-950 p-3 rounded-xl border border-sky-200 dark:border-sky-800">
                    <span className="text-[10px] text-slate-400 dark:text-sky-400 block font-semibold">
                      SURAT IZIN & SAKIT
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {parsedBackupData.leaveRequests.length} Pengajuan
                    </span>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-sky-200 block">
                    Pilih Metode Pemulihan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRestoreMode('replace')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        restoreMode === 'replace'
                          ? 'border-sky-600 dark:border-sky-500 bg-sky-100/70 dark:bg-sky-950 ring-1 ring-sky-600'
                          : 'border-slate-200 dark:border-sky-800 bg-white dark:bg-sky-950/50 hover:border-sky-400'
                      }`}
                    >
                      <span className="block font-bold text-xs text-slate-900 dark:text-white">
                        Timpa Bersih (Full Clean Replace)
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-sky-400 mt-0.5">
                        Mengganti seluruh database saat ini persis seperti pada saat berkas cadangan dibuat.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRestoreMode('merge')}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        restoreMode === 'merge'
                          ? 'border-sky-600 dark:border-sky-500 bg-sky-100/70 dark:bg-sky-950 ring-1 ring-sky-600'
                          : 'border-slate-200 dark:border-sky-800 bg-white dark:bg-sky-950/50 hover:border-sky-400'
                      }`}
                    >
                      <span className="block font-bold text-xs text-slate-900 dark:text-white">
                        Gabungkan Data (Smart Merge)
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-sky-400 mt-0.5">
                        Menambahkan siswa & catatan presensi baru tanpa menghapus data yang sudah ada di sistem.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Action Button */}
                <div className="pt-3 flex items-center justify-end gap-3">
                  <button
                    id="btn-cancel-restore-file"
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedBackupData(null);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-sky-800 text-xs font-bold text-slate-700 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-sky-900 transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    id="btn-open-restore-confirm-modal"
                    onClick={() => setIsConfirmRestoreOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Lanjutkan & Terapkan Pemulihan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TITIK PEMULIHAN & SNAPSHOTS LOKAL */}
      {activeTab === 'snapshots' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-sky-950/60 rounded-2xl p-6 border border-sky-300/80 dark:border-sky-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                  Titik Pemulihan Cepat (*Local System Snapshots*)
                </h3>
                <p className="text-xs text-slate-500 dark:text-sky-300/80 mt-1">
                  Sistem otomatis mencatat snapshot sebelum setiap perubahan besar. Anda dapat kembali ke titik snapshot mana pun dengan satu klik.
                </p>
              </div>

              <button
                id="btn-create-new-snapshot"
                onClick={() => setIsNewSnapshotModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 shrink-0 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Titik Pemulihan Baru</span>
              </button>
            </div>

            {/* List of Snapshots */}
            {restorePoints.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-sky-50/50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/60 space-y-3">
                <Clock className="w-10 h-10 mx-auto text-sky-400" />
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  Belum Ada Titik Pemulihan Tersimpan
                </p>
                <p className="text-xs text-slate-500 dark:text-sky-300 max-w-md mx-auto">
                  Klik tombol "Buat Titik Pemulihan Baru" untuk membuat snapshot memori lokal saat ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {restorePoints.map((point) => (
                  <div
                    key={point.id}
                    className="p-4 rounded-xl border border-sky-200 dark:border-sky-800/80 bg-sky-50/40 dark:bg-sky-950/40 hover:border-sky-400 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {point.name}
                        </span>
                        {point.isAutomatic && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-300">
                            Otomatis Sistem
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-sky-300">
                        {point.description}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-sky-400 pt-0.5">
                        <span>
                          {new Date(point.createdAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>•</span>
                        <span>Oleh: {point.createdBy || 'Administrator'}</span>
                        <span>•</span>
                        <span>{point.data.metadata.totalStudents} Siswa, {point.data.metadata.totalAttendance} Presensi</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              `Apakah Anda yakin ingin memulihkan sistem ke snapshot "${point.name}"? Data saat ini akan digantikan.`
                            )
                          ) {
                            restoreFromLocalPoint(point.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Pulihkan database ke titik ini"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>

                      <button
                        onClick={() => {
                          const jsonStr = JSON.stringify(point.data, null, 2);
                          const blob = new Blob([jsonStr], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `SNAPSHOT_${point.name.replace(/\s+/g, '_')}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-sky-950 border border-sky-300 dark:border-sky-800 text-slate-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 transition-all cursor-pointer"
                        title="Unduh snapshot sebagai file JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteLocalRestorePoint(point.id)}
                        className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                        title="Hapus snapshot ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RESET DATABASE PABRIK */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          <div className="bg-rose-50/80 dark:bg-rose-950/30 rounded-2xl p-6 border border-rose-300 dark:border-rose-800/70 shadow-xs space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-900 dark:text-rose-200">
                  Kembalikan ke Pengaturan & Data Bawaan Pabrik (Factory Reset)
                </h3>
                <p className="text-xs text-rose-800/80 dark:text-rose-300 leading-relaxed">
                  Tindakan ini akan menghapus seluruh data siswa yang baru ditambahkan, kelas custom, rekam presensi baru, dan mengembalikan seluruh isi aplikasi ke data contoh demo awal.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                Saran Keamanan:
              </p>
              <p>
                Sebelum mereset, pastikan Anda telah menekan tombol <strong>"Unduh Cadangan Database"</strong> pada Tab 1 di atas agar Anda tetap memiliki salinan arsip sekolah.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                id="btn-open-factory-reset-modal"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Mulai Reset Data Pabrik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI PEMULIHAN DATABASE */}
      <Modal
        isOpen={isConfirmRestoreOpen}
        onClose={() => setIsConfirmRestoreOpen(false)}
        title="Konfirmasi Pemulihan Database"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Peringatan Penerapan Cadangan
            </p>
            <p>
              Anda akan memulihkan data dengan mode:{' '}
              <span className="font-bold underline">
                {restoreMode === 'replace' ? 'Timpa Bersih (Full Replace)' : 'Gabung Data (Smart Merge)'}
              </span>
              .
            </p>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300">
              Sistem akan secara otomatis membuat snapshot pengaman sebelum data digantikan.
            </p>
          </div>

          {parsedBackupData && (
            <div className="text-xs space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-sky-950/60 border border-slate-200 dark:border-sky-800">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-sky-400">Target Sekolah:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {parsedBackupData.metadata.schoolName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-sky-400">Total Siswa:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {parsedBackupData.students.length} Siswa
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-sky-400">Total Presensi:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {parsedBackupData.attendanceRecords.length} Catatan
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsConfirmRestoreOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-sky-800 text-xs font-bold text-slate-700 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-sky-900 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-execute-restore"
              onClick={handleExecuteRestore}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Ya, Pulihkan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL: BUAT SNAPSHOT BARU */}
      <Modal
        isOpen={isNewSnapshotModalOpen}
        onClose={() => setIsNewSnapshotModalOpen(false)}
        title="Buat Titik Pemulihan / Snapshot Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSnapshot} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-sky-200 mb-1">
              Nama Titik Pemulihan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newSnapshotName}
              onChange={(e) => setNewSnapshotName(e.target.value)}
              placeholder="Contoh: Snapshot Sebelum Input Data Semester Genap"
              className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-sky-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-sky-200 mb-1">
              Deskripsi Catatan (Opsional)
            </label>
            <textarea
              rows={3}
              value={newSnapshotDesc}
              onChange={(e) => setNewSnapshotDesc(e.target.value)}
              placeholder="Catatan tambahan mengenai kondisi database saat ini..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-sky-950 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewSnapshotModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-sky-800 text-xs font-bold text-slate-700 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-sky-900 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Snapshot</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: KONFIRMASI RESET PABRIK */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Konfirmasi Reset Pabrik"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs space-y-2">
            <p className="font-bold text-sm">Apakah Anda benar-benar yakin?</p>
            <p>
              Seluruh data kustom akan terhapus dan kembali ke data bawaan pabrik. Tindakan ini tidak dapat dibatalkan jika Anda belum mengunduh backup.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-sky-200 mb-1">
              Ketik kata <span className="font-mono text-rose-600 font-extrabold">RESET</span> untuk mengonfirmasi:
            </label>
            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="Ketik RESET di sini"
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-sky-950 text-xs text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-rose-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-sky-800 text-xs font-bold text-slate-700 dark:text-sky-300 hover:bg-slate-100 dark:hover:bg-sky-900 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-confirm-factory-reset"
              onClick={handleExecuteReset}
              disabled={resetConfirmInput !== 'RESET'}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus & Reset Database</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
