import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Upload,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  School,
  Printer,
  Eye,
  Sliders,
  Check,
  Trash2,
  ExternalLink,
  Layers,
  FileCheck,
} from 'lucide-react';
import {
  SCHOOL_LOGO_PRESETS,
  LogoPreset,
  fileToCompressedDataUrl,
  TUT_WURI_HANDAYANI_LOGO,
  LOGO_SD_MERAH_PUTIH,
} from '../../utils/logoPresets';

interface LogoManagerProps {
  onSaveSuccess?: () => void;
}

export const LogoManager: React.FC<LogoManagerProps> = ({ onSaveSuccess }) => {
  const { schoolProfile, updateSchoolProfile, replayIntro, setActiveTab } = useApp();

  const [primaryLogo, setPrimaryLogo] = useState<string>(schoolProfile.logoUrl || TUT_WURI_HANDAYANI_LOGO);
  const [secondaryLogo, setSecondaryLogo] = useState<string>(schoolProfile.secondaryLogoUrl || LOGO_SD_MERAH_PUTIH);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDraggingPrimary, setIsDraggingPrimary] = useState(false);
  const [isDraggingSecondary, setIsDraggingSecondary] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activePreviewTab, setActivePreviewTab] = useState<'splash' | 'dashboard' | 'kop'>('splash');

  const primaryFileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Primary File Upload
  const handlePrimaryFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Format berkas harus berupa gambar (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }

    try {
      const dataUrl = await fileToCompressedDataUrl(file, 400);
      setPrimaryLogo(dataUrl);
    } catch (err) {
      setUploadError('Gagal memproses gambar logo. Silakan coba berkas lain.');
    }
  };

  // Handle Secondary File Upload
  const handleSecondaryFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Format berkas harus berupa gambar (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }

    try {
      const dataUrl = await fileToCompressedDataUrl(file, 400);
      setSecondaryLogo(dataUrl);
    } catch (err) {
      setUploadError('Gagal memproses gambar logo pendamping.');
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setPrimaryLogo(urlInput.trim());
    setUrlInput('');
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSchoolProfile({
      logoUrl: primaryLogo,
      secondaryLogoUrl: secondaryLogo,
    });
    if (onSaveSuccess) onSaveSuccess();
  };

  const handleResetToDefault = () => {
    setPrimaryLogo(TUT_WURI_HANDAYANI_LOGO);
    setSecondaryLogo(LOGO_SD_MERAH_PUTIH);
    updateSchoolProfile({
      logoUrl: TUT_WURI_HANDAYANI_LOGO,
      secondaryLogoUrl: LOGO_SD_MERAH_PUTIH,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Guide */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white shadow-sm border border-sky-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight text-white uppercase">
              Pengaturan & Ubah Logo Resmi Sekolah
            </h3>
            <p className="text-xs text-sky-100 mt-0.5 leading-relaxed">
              Logo yang Anda unggah otomatis diterapkan di <strong>3 Tempat Utama</strong>: Halaman Animasi Pembuka (Splash Screen), Profil Dasbor & Menu Samping (Sidebar), serta KOP Surat Dokumen Resmi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="logo-manager-preview-intro-btn"
            onClick={replayIntro}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="Lihat Animasi Pembuka dengan Logo Baru"
          >
            <Sparkles className="w-4 h-4" />
            <span>Preview Animasi Masuk</span>
          </button>

          <button
            type="button"
            id="logo-manager-save-top-btn"
            onClick={() => handleSave()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-50 text-sky-900 font-extrabold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-emerald-600" />
            <span>Simpan Logo</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Live Multi-Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Upload, Presets & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Logo Utama Sekolah */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0a182f] border border-sky-300 dark:border-sky-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-900/60 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  1. Logo Utama Satuan Pendidikan
                </h4>
              </div>
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-md">
                Tampil di Splash, Dasbor & KOP Kiri
              </span>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingPrimary(true);
              }}
              onDragLeave={() => setIsDraggingPrimary(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingPrimary(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handlePrimaryFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => primaryFileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDraggingPrimary
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60'
                  : 'border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/50'
              }`}
            >
              <input
                ref={primaryFileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePrimaryFile(e.target.files[0]);
                  }
                }}
              />

              {/* Logo Preview Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#071324] border border-sky-300 dark:border-sky-800 p-2 flex items-center justify-center shadow-md overflow-hidden relative group">
                {primaryLogo ? (
                  <img
                    src={primaryLogo}
                    alt="Logo Utama"
                    className="w-full h-full object-contain filter drop-shadow"
                  />
                ) : (
                  <School className="w-10 h-10 text-sky-400" />
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Klik atau Tarik Berkas Logo ke Sini
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mendukung PNG transparan, JPG, SVG, atau WebP (Disarankan rasio 1:1)
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                Pilih Berkas Logo dari Komputer
              </span>
            </div>

            {/* Direct URL Input */}
            <div className="space-y-1.5 pt-2 border-t border-sky-100 dark:border-sky-900/60">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Atau Masukkan Tautan / URL Gambar Online:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://contoh-domain-sekolah.sch.id/logo.png"
                  className="flex-1 p-2.5 bg-sky-50/60 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-3.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Terapkan
                </button>
              </div>
            </div>

            {/* Pilihan Logo Siap Pakai (Presets) */}
            <div className="space-y-2.5 pt-2 border-t border-sky-100 dark:border-sky-900/60">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilihan Logo Siap Pakai (Preset Standar Indonesia):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SCHOOL_LOGO_PRESETS.map((preset) => {
                  const isSelected = primaryLogo === preset.dataUrl;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setPrimaryLogo(preset.dataUrl)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'border-sky-600 bg-sky-100/80 dark:bg-sky-950/80 shadow-xs ring-1 ring-sky-500'
                          : 'border-sky-200 dark:border-sky-800 bg-white dark:bg-[#071324] hover:bg-sky-50 dark:hover:bg-sky-950/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white p-1 border border-sky-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                            {preset.name}
                          </h5>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {preset.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Logo Pendamping (KOP Surat Sebelah Kanan) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0a182f] border border-sky-300 dark:border-sky-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  2. Logo Pendamping / Dinas (KOP Surat Kanan)
                </h4>
              </div>
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-md">
                KOP Surat Kanan
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Di Kop Surat resmi Indonesia, logo sebelah kanan biasanya diisi oleh <strong>Logo SD Merah Putih</strong>, <strong>Logo Tut Wuri Handayani</strong>, atau <strong>Logo Pemerintah Daerah (Pemda)</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-white p-1.5 border border-sky-300 dark:border-sky-800 flex items-center justify-center shrink-0 shadow-xs">
                {secondaryLogo ? (
                  <img
                    src={secondaryLogo}
                    alt="Logo Pendamping"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <School className="w-6 h-6 text-sky-400" />
                )}
              </div>

              <div className="flex-1 min-w-[200px] flex flex-wrap items-center gap-2">
                <input
                  ref={secondaryFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSecondaryFile(e.target.files[0]);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => secondaryFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 text-xs font-bold border border-sky-300 dark:border-sky-800 transition-all cursor-pointer"
                >
                  Unggah Logo Kanan
                </button>

                <button
                  type="button"
                  onClick={() => setSecondaryLogo(LOGO_SD_MERAH_PUTIH)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    secondaryLogo === LOGO_SD_MERAH_PUTIH
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white dark:bg-sky-950 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                  }`}
                >
                  SD Merah Putih
                </button>

                <button
                  type="button"
                  onClick={() => setSecondaryLogo(TUT_WURI_HANDAYANI_LOGO)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                    secondaryLogo === TUT_WURI_HANDAYANI_LOGO
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white dark:bg-sky-950 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                  }`}
                >
                  Tut Wuri Handayani
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#0a182f] border border-sky-300 dark:border-sky-800 shadow-xs">
            <button
              type="button"
              id="logo-manager-reset-btn"
              onClick={handleResetToDefault}
              className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Kembalikan ke Logo Standar</span>
            </button>

            <button
              type="button"
              id="logo-manager-save-btn"
              onClick={() => handleSave()}
              className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>Simpan Perubahan Logo</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Live Previews (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0a182f] border border-sky-300 dark:border-sky-800 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-900/60 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-700 dark:text-sky-400" />
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Live Preview Logo
                </h4>
              </div>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-md">
                Simulasi 3 Tampilan
              </span>
            </div>

            {/* Preview Mode Tabs */}
            <div className="flex items-center gap-1 bg-sky-100/70 dark:bg-sky-950 p-1 rounded-xl border border-sky-200 dark:border-sky-800 text-xs">
              <button
                type="button"
                onClick={() => setActivePreviewTab('splash')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activePreviewTab === 'splash'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1. Animasi Masuk
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('dashboard')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activePreviewTab === 'dashboard'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                2. Profil Dasbor
              </button>
              <button
                type="button"
                onClick={() => setActivePreviewTab('kop')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  activePreviewTab === 'kop'
                    ? 'bg-sky-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                3. KOP Surat
              </button>
            </div>

            {/* PREVIEW 1: Splash Screen Simulator */}
            {activePreviewTab === 'splash' && (
              <div className="p-6 rounded-2xl bg-[#091b35] text-white border border-sky-800 flex flex-col items-center text-center space-y-4 relative overflow-hidden shadow-inner">
                {/* Background lighting */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/20 blur-2xl rounded-full pointer-events-none" />

                {/* Glowing Badge Emblem */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-0.5 shadow-xl shadow-sky-500/40 relative flex items-center justify-center">
                  <div className="w-full h-full bg-[#0d274c] rounded-[14px] flex items-center justify-center relative overflow-hidden border border-sky-400/40 p-2">
                    {primaryLogo ? (
                      <img
                        src={primaryLogo}
                        alt="Logo Preview"
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    ) : (
                      <School className="w-8 h-8 text-sky-200" />
                    )}
                  </div>
                </div>

                <div className="space-y-1 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-extrabold uppercase tracking-wide">
                    Sistem Informasi Presensi
                  </span>
                  <h5 className="text-base font-black tracking-tight text-white uppercase mt-1">
                    ABSENSI SISWA SD
                  </h5>
                  <p className="text-xs font-bold text-sky-200 truncate max-w-[240px]">
                    {schoolProfile.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={replayIntro}
                  className="z-10 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Jalankan Animasi Layar Penuh</span>
                </button>
              </div>
            )}

            {/* PREVIEW 2: Dashboard & Sidebar Profile Simulator */}
            {activePreviewTab === 'dashboard' && (
              <div className="space-y-3">
                {/* Sidebar Brand Mini Item */}
                <div className="p-3 rounded-xl bg-[#cce3f5] dark:bg-[#07172e] border border-sky-300 dark:border-sky-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-700 p-1 flex items-center justify-center text-white shrink-0 overflow-hidden shadow-2xs">
                    {primaryLogo ? (
                      <img
                        src={primaryLogo}
                        alt="Sidebar Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <School className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h6 className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase truncate">
                      Absensi Siswa SD
                    </h6>
                    <p className="text-[10px] font-semibold text-sky-800 dark:text-sky-300 truncate">
                      {schoolProfile.name}
                    </p>
                  </div>
                </div>

                {/* Dashboard Banner Mini Item */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-700 to-blue-800 text-white border border-sky-400/40 flex items-center gap-3 shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-white/20 p-1.5 flex items-center justify-center shrink-0 shadow-inner">
                    {primaryLogo ? (
                      <img
                        src={primaryLogo}
                        alt="Dashboard Logo"
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    ) : (
                      <School className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-400 text-slate-950">
                      {schoolProfile.akreditasi || 'Akreditasi A'}
                    </span>
                    <h6 className="text-xs font-black tracking-tight text-white uppercase truncate mt-1">
                      {schoolProfile.name}
                    </h6>
                    <p className="text-[10px] text-sky-200 truncate">
                      NPSN: {schoolProfile.npsn} • TA {schoolProfile.academicYear}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full py-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border border-sky-300 dark:border-sky-800"
                >
                  Buka Halaman Dasbor
                </button>
              </div>
            )}

            {/* PREVIEW 3: Formal KOP Surat Simulator */}
            {activePreviewTab === 'kop' && (
              <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-sky-300 dark:border-sky-800 shadow-xs space-y-2">
                  <div className="border-b-2 border-double border-slate-900 dark:border-slate-300 pb-3 flex items-center justify-between gap-2">
                    {/* Left Logo */}
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      {primaryLogo ? (
                        <img
                          src={primaryLogo}
                          alt="Logo Kiri"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <School className="w-6 h-6 text-sky-700" />
                      )}
                    </div>

                    {/* Center Text */}
                    <div className="text-center flex-1 min-w-0">
                      <h6 className="text-[8px] font-black text-slate-800 dark:text-slate-200 uppercase leading-none">
                        {schoolProfile.provinsiDinas || 'DINAS PENDIDIKAN PROVINSI'}
                      </h6>
                      <h5 className="text-[9px] font-black text-slate-950 dark:text-white uppercase leading-tight truncate mt-0.5">
                        {schoolProfile.name}
                      </h5>
                      <p className="text-[7px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5">
                        {schoolProfile.address}
                      </p>
                      <p className="text-[6.5px] text-slate-600 dark:text-slate-400 font-semibold leading-none mt-0.5">
                        NPSN: {schoolProfile.npsn} • Akreditasi: {schoolProfile.akreditasi || 'A'}
                      </p>
                    </div>

                    {/* Right Logo */}
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                      {secondaryLogo ? (
                        <img
                          src={secondaryLogo}
                          alt="Logo Kanan"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <School className="w-6 h-6 text-sky-700" />
                      )}
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <p className="text-[8px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                      REKAPITULASI PRESENSI SISWA
                    </p>
                    <p className="text-[7.5px] text-slate-500 dark:text-slate-400">
                      Format Kertas Standar A4 / F4 Siap Cetak
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('rekap-laporan')}
                  className="w-full py-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border border-sky-300 dark:border-sky-800 flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Buka Lembar Cetak Laporan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
