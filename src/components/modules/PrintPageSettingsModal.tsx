import React from 'react';
import {
  Settings,
  FileText,
  Sliders,
  Maximize2,
  Minimize2,
  Printer,
  Check,
  RotateCcw,
  Eye,
  Layers,
  Sparkles,
  School,
  X,
  FileSpreadsheet,
  Info,
  Calendar,
  Grid,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export type PaperSize = 'A4' | 'F4' | 'A3' | 'Letter' | 'Legal';
export type PageOrientation = 'landscape' | 'portrait';
export type MarginPreset = 'narrow' | 'normal' | 'wide' | 'compact' | 'custom';
export type FontScale = '75%' | '80%' | '85%' | '90%' | '95%' | '100%';

export interface PrintPageSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  marginPreset: MarginPreset;
  customMarginMm: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  fontSizeScale: FontScale;
  rowsPerPage: number; // 0 = all in continuous / auto
  showKop: boolean;
  showLogoLeft: boolean;
  showLogoRight: boolean;
  showSchoolMeta: boolean;
  showDoubleLine: boolean;
  showSundays: boolean;
  showHolidays: boolean;
  showDailySummaryFooter: boolean;
  showLegend: boolean;
  showSignatures: boolean;
  showPageNumbers: boolean;
  showPrintTimestamp: boolean;
  signatureDateOption: 'today' | 'end_of_month' | 'custom';
  customSignatureDate: string;
  customCity: string;
  realPaperPreview: boolean;
}

export const DEFAULT_PRINT_SETTINGS: PrintPageSettings = {
  paperSize: 'F4', // F4/Folio is the Indonesian elementary school standard for attendance books
  orientation: 'landscape', // Highly recommended for 31-day attendance matrix
  marginPreset: 'narrow', // 5mm-6mm to maximize table columns
  customMarginMm: {
    top: 6,
    bottom: 6,
    left: 8,
    right: 8,
  },
  fontSizeScale: '85%',
  rowsPerPage: 0, // Auto / continuous
  showKop: true,
  showLogoLeft: true,
  showLogoRight: true,
  showSchoolMeta: true,
  showDoubleLine: true,
  showSundays: true,
  showHolidays: true,
  showDailySummaryFooter: true,
  showLegend: true,
  showSignatures: true,
  showPageNumbers: true,
  showPrintTimestamp: true,
  signatureDateOption: 'today',
  customSignatureDate: new Date().toISOString().split('T')[0],
  customCity: '',
  realPaperPreview: false,
};

interface PrintPageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PrintPageSettings;
  onChangeSettings: (newSettings: PrintPageSettings) => void;
  onPrintNow: () => void;
  totalStudents: number;
}

export const PrintPageSettingsModal: React.FC<PrintPageSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  onPrintNow,
  totalStudents,
}) => {
  const updateSetting = <K extends keyof PrintPageSettings>(
    key: K,
    value: PrintPageSettings[K]
  ) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleReset = () => {
    onChangeSettings(DEFAULT_PRINT_SETTINGS);
  };

  const paperSizeOptions: { id: PaperSize; name: string; dims: string; desc: string; badge?: string }[] = [
    {
      id: 'F4',
      name: 'F4 / Folio (Indonesia)',
      dims: '215 × 330 mm',
      desc: 'Standar format resmi buku presensi & laporan sekolah di Indonesia',
      badge: 'Paling Pas',
    },
    {
      id: 'A4',
      name: 'A4 Standar',
      dims: '210 × 297 mm',
      desc: 'Standar kertas kantor dan dokumen PDF internasional',
    },
    {
      id: 'A3',
      name: 'A3 Format Besar',
      dims: '297 × 420 mm',
      desc: 'Ukuran besar untuk kelas dengan jumlah siswa banyak',
    },
    {
      id: 'Legal',
      name: 'Legal (US)',
      dims: '216 × 356 mm',
      desc: 'Format memanjang standar internasional',
    },
    {
      id: 'Letter',
      name: 'Letter / Kuarto',
      dims: '216 × 279 mm',
      desc: 'Ukuran cetak ringkas',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Halaman & Ukuran Kertas Cetak PDF"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-slate-800 dark:text-slate-200">
        {/* Banner Guide */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-tight">
              Kustomisasi Format Dokumen & KOP Resmi
            </h4>
            <p className="text-xs text-sky-100 mt-0.5 leading-relaxed">
              Atur ukuran kertas (F4/A4), orientasi <em>Landscape</em>, skala tabel, margin, pembagian baris siswa per halaman, dan elemen KOP Surat agar hasil cetak PDF rapi tanpa terpotong.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* LEFT SECTION: Paper & Layout */}
          <div className="space-y-5">
            {/* 1. Paper Size Selector */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-[#0a182f] border border-sky-200 dark:border-sky-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  1. Ukuran Kertas Cetak
                </label>
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  {settings.paperSize === 'F4' ? '215 × 330 mm' : settings.paperSize === 'A4' ? '210 × 297 mm' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {paperSizeOptions.map((opt) => {
                  const isSelected = settings.paperSize === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => updateSetting('paperSize', opt.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-sky-600 bg-white dark:bg-sky-950/80 shadow-xs ring-1 ring-sky-500'
                          : 'border-sky-200/80 dark:border-sky-800/80 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {opt.name}
                          </span>
                          {opt.badge && (
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          {opt.dims} — {opt.desc}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 dark:border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Orientation & Margin Preset */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-[#0a182f] border border-sky-200 dark:border-sky-800 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                2. Orientasi & Batas Tepi (Margin)
              </label>

              {/* Orientation Toggle */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Orientasi Kertas:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSetting('orientation', 'landscape')}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      settings.orientation === 'landscape'
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800 hover:bg-sky-50'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5 rotate-45" />
                    <span>Landscape (Mendatar)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateSetting('orientation', 'portrait')}
                    className={`py-2 px-3 rounded-xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      settings.orientation === 'portrait'
                        ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800 hover:bg-sky-50'
                    }`}
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Portrait (Tegak)</span>
                  </button>
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium pt-0.5">
                  * <strong>Landscape</strong> sangat direkomendasikan untuk tabel matriks presensi 1 bulan (31 kolom).
                </p>
              </div>

              {/* Margin Selector */}
              <div className="space-y-1 pt-2 border-t border-sky-200/60 dark:border-sky-800/60">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Preset Margin (Batas Tepi Cetak):
                </span>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[
                    { id: 'narrow', label: 'Sempit (5mm)' },
                    { id: 'normal', label: 'Standar (10mm)' },
                    { id: 'wide', label: 'Lebar (15mm)' },
                    { id: 'custom', label: 'Kustom' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateSetting('marginPreset', m.id as MarginPreset)}
                      className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer text-[11px] ${
                        settings.marginPreset === m.id
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {settings.marginPreset === 'custom' && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Atas (mm)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={settings.customMarginMm.top}
                        onChange={(e) =>
                          updateSetting('customMarginMm', {
                            ...settings.customMarginMm,
                            top: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-sky-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Bawah (mm)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={settings.customMarginMm.bottom}
                        onChange={(e) =>
                          updateSetting('customMarginMm', {
                            ...settings.customMarginMm,
                            bottom: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-sky-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Kiri (mm)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={settings.customMarginMm.left}
                        onChange={(e) =>
                          updateSetting('customMarginMm', {
                            ...settings.customMarginMm,
                            left: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-sky-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500">Kanan (mm)</label>
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={settings.customMarginMm.right}
                        onChange={(e) =>
                          updateSetting('customMarginMm', {
                            ...settings.customMarginMm,
                            right: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-sky-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Scale & Pagination */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-[#0a182f] border border-sky-200 dark:border-sky-800 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                3. Skala Font Tabel & Pembagian Lembar
              </label>

              {/* Font Scale */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Skala Font Tabel:</span>
                  <span className="text-sky-700 dark:text-sky-400">{settings.fontSizeScale}</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {(['75%', '80%', '85%', '90%', '95%', '100%'] as FontScale[]).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => updateSetting('fontSizeScale', scale)}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        settings.fontSizeScale === scale
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {scale}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  * <strong>85% atau 80%</strong> adalah skala ideal agar tabel 31 hari + rekapitulasi pas dalam 1 lembar A4/F4.
                </p>
              </div>

              {/* Rows Per Page (Pagination) */}
              <div className="space-y-1 pt-2 border-t border-sky-200/60 dark:border-sky-800/60">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600 dark:text-slate-400">Bagi Siswa Per Halaman:</span>
                  <span className="text-sky-700 dark:text-sky-400">
                    {settings.rowsPerPage === 0 ? 'Otomatis (Semua)' : `${settings.rowsPerPage} Siswa / Lembar`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-xs">
                  {[
                    { val: 0, label: 'Auto' },
                    { val: 12, label: '12 Siswa' },
                    { val: 15, label: '15 Siswa' },
                    { val: 20, label: '20 Siswa' },
                    { val: 25, label: '25 Siswa' },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => updateSetting('rowsPerPage', r.val)}
                      className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer text-[11px] ${
                        settings.rowsPerPage === r.val
                          ? 'bg-sky-700 text-white border-sky-700'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {settings.rowsPerPage > 0 && totalStudents > 0 && (
                  <p className="text-[10px] text-sky-800 dark:text-sky-300 font-semibold pt-0.5">
                    Dokumen akan terbagi menjadi <strong>{Math.ceil(totalStudents / settings.rowsPerPage)} Halaman</strong> terpisah dengan KOP Surat di setiap lembarnya.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: Visual Elements & Header Options */}
          <div className="space-y-5">
            {/* 4. Document & KOP Surat Elements */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-[#0a182f] border border-sky-200 dark:border-sky-800 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <School className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                4. Elemen KOP Surat & Tabel
              </label>

              <div className="space-y-2 text-xs">
                {[
                  {
                    key: 'showKop' as const,
                    label: 'Tampilkan KOP Surat Resmi Sekolah',
                    desc: 'Nama dinas, satuan pendidikan, alamat, kontak & garis ganda',
                  },
                  {
                    key: 'showLogoLeft' as const,
                    label: 'Tampilkan Logo Kiri (Logo Sekolah)',
                    desc: 'Logo resmi instansi di pojok kiri atas KOP',
                  },
                  {
                    key: 'showLogoRight' as const,
                    label: 'Tampilkan Logo Kanan (Logo Pendamping / Tut Wuri)',
                    desc: 'Logo pendamping di pojok kanan atas KOP',
                  },
                  {
                    key: 'showSchoolMeta' as const,
                    label: 'Tampilkan NPSN, Akreditasi, & Kurikulum',
                    desc: 'Informasi legalitas dan akreditasi pada KOP',
                  },
                  {
                    key: 'showSundays' as const,
                    label: 'Arsir Kolom Hari Minggu (Abu-abu / Merah)',
                    desc: 'Pembeda hari libur mingguan otomatis',
                  },
                  {
                    key: 'showHolidays' as const,
                    label: 'Tandai Hari Libur Nasional (LN)',
                    desc: 'Sesuai daftar libur nasional SKB 3 Menteri',
                  },
                  {
                    key: 'showDailySummaryFooter' as const,
                    label: 'Tampilkan Baris Rekapitulasi Hadir Harian (Footer)',
                    desc: 'Jumlah siswa hadir di bagian bawah kolom tabel',
                  },
                  {
                    key: 'showLegend' as const,
                    label: 'Tampilkan Keterangan Kode (H, T, S, I, A, LN)',
                    desc: 'Panduan singkatan status kehadiran siswa',
                  },
                  {
                    key: 'showSignatures' as const,
                    label: 'Tampilkan Kolom Tanda Tangan Resmi',
                    desc: 'Tanda tangan Kepala Sekolah & Guru Wali Kelas',
                  },
                  {
                    key: 'showPageNumbers' as const,
                    label: 'Tampilkan Penomoran Halaman (Hal X dari Y)',
                    desc: 'Dicetak di footer setiap lembar',
                  },
                  {
                    key: 'showPrintTimestamp' as const,
                    label: 'Tampilkan Tanggal & Waktu Cetak Otomatis',
                    desc: 'Waktu penerbitan dokumen laporan',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800/80 cursor-pointer hover:bg-sky-50/50"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(settings[item.key])}
                      onChange={(e) => updateSetting(item.key, e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Signature Date Setup */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-[#0a182f] border border-sky-200 dark:border-sky-800 space-y-3">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                5. Tanggal Pengesahan Tanda Tangan
              </label>

              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateSetting('signatureDateOption', 'today')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer text-[11px] ${
                      settings.signatureDateOption === 'today'
                        ? 'bg-sky-700 text-white border-sky-700'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('signatureDateOption', 'end_of_month')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer text-[11px] ${
                      settings.signatureDateOption === 'end_of_month'
                        ? 'bg-sky-700 text-white border-sky-700'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                    }`}
                  >
                    Akhir Bulan
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('signatureDateOption', 'custom')}
                    className={`py-1.5 rounded-lg font-bold border transition-all text-center cursor-pointer text-[11px] ${
                      settings.signatureDateOption === 'custom'
                        ? 'bg-sky-700 text-white border-sky-700'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
                    }`}
                  >
                    Kustom
                  </button>
                </div>

                {settings.signatureDateOption === 'custom' && (
                  <div className="pt-1">
                    <input
                      type="date"
                      value={settings.customSignatureDate}
                      onChange={(e) => updateSetting('customSignatureDate', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-sky-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-sky-200 dark:border-sky-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan ke Default F4 Landscape</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Tutup & Terapkan
            </button>

            <button
              type="button"
              id="modal-print-direct-btn"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  onPrintNow();
                }, 200);
              }}
              className="px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Cetak Sekarang (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
