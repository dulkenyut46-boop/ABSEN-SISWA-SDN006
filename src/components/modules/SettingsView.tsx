import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  School,
  Clock,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Shield,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  UserCheck,
  Building2,
  Compass,
  FileText,
  Plus,
  Trash2,
  Eye,
  Check,
  Copy,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SchoolProfile } from '../../types';
import { RolePermissionsManager } from './RolePermissionsManager';

export const SettingsView: React.FC = () => {
  const { schoolProfile, updateSchoolProfile, resetDataToDefault, setActiveTab } = useApp();

  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [activeSubTab, setActiveSubTab] = useState<'profil' | 'alamat' | 'kontak' | 'sdm' | 'jadwal' | 'visimisi' | 'hak-akses'>('profil');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Sync state if context changes externally
  useEffect(() => {
    setFormData({ ...schoolProfile });
  }, [schoolProfile]);

  // Helper to auto-update full address string from components
  const autoComposeAddress = () => {
    const parts = [
      formData.street?.trim(),
      formData.village?.trim() ? `Kel. ${formData.village.replace(/^(desa|kelurahan|kel\.|des\.)\s*/i, '')}` : '',
      formData.district?.trim() ? `Kec. ${formData.district.replace(/^(kecamatan|kec\.)\s*/i, '')}` : '',
      formData.regency?.trim(),
      formData.province?.trim(),
      formData.postalCode?.trim() ? formData.postalCode.trim() : '',
    ].filter(Boolean);

    if (parts.length > 0) {
      setFormData((prev) => ({ ...prev, address: parts.join(', ') }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
  };

  const handleConfirmReset = () => {
    resetDataToDefault();
    setIsResetConfirmOpen(false);
  };

  const handleAddMissionPoint = () => {
    const currentMissions = formData.mission || [];
    setFormData({
      ...formData,
      mission: [...currentMissions, 'Menyelenggarakan kegiatan pembiasaan karakter positif dan literasi.'],
    });
  };

  const handleRemoveMissionPoint = (index: number) => {
    const currentMissions = formData.mission || [];
    setFormData({
      ...formData,
      mission: currentMissions.filter((_, i) => i !== index),
    });
  };

  const handleUpdateMissionPoint = (index: number, val: string) => {
    const currentMissions = [...(formData.mission || [])];
    currentMissions[index] = val;
    setFormData({
      ...formData,
      mission: currentMissions,
    });
  };

  const copyFullAddress = () => {
    if (formData.address) {
      navigator.clipboard.writeText(formData.address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-6xl">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#4a0404] text-white flex items-center justify-center shadow-sm shrink-0">
            <School className="w-8 h-8 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-white">
                {formData.name || 'Profil & Pengaturan Sekolah Dasar'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {formData.akreditasi || 'Akreditasi A'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                NPSN: {formData.npsn || '-'}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1.5 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>{formData.district || 'Kecamatan'}, {formData.regency || 'Kabupaten/Kota'}, {formData.province || 'Provinsi'}</span>
              <span className="text-stone-300 dark:text-stone-600">•</span>
              <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>TA {formData.academicYear} ({formData.semester})</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={copyFullAddress}
          className="px-3 py-1.5 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          title="Salin Alamat Lengkap Sekolah"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
          <span>{isCopied ? 'Alamat Disalin!' : 'Salin Alamat'}</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-sky-200 dark:border-sky-800">
        {[
          { id: 'profil', label: '1. Identitas & Legalitas', icon: School },
          { id: 'alamat', label: '2. Alamat & Wilayah Geografis', icon: MapPin },
          { id: 'kontak', label: '3. Instansi & Kontak Resmi', icon: Phone },
          { id: 'sdm', label: '4. Kepala Sekolah & Operator', icon: UserCheck },
          { id: 'jadwal', label: '5. Jam Masuk & Presensi', icon: Clock },
          { id: 'visimisi', label: '6. Visi, Misi & Karakter', icon: Award },
          { id: 'hak-akses', label: '7. Hak Akses (Admin & Guru)', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-white dark:bg-[#0a1b35] text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-sky-900/40 border border-sky-200/80 dark:border-sky-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-200' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 7: Hak Akses & RBAC */}
      {activeSubTab === 'hak-akses' ? (
        <RolePermissionsManager />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* SUBTAB 1: Identitas & Legalitas Sekolah */}
        {activeSubTab === 'profil' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-[#4a0404] dark:text-rose-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Identitas Satuan Pendidikan & Legalitas
                </h3>
              </div>
              <span className="text-[11px] text-stone-400 font-medium">KOP Dokumen Resmi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Satuan Pendidikan (Sekolah): *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: SD NEGERI 01 HARAPAN BANGSA"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  NPSN (Nomor Pokok Sekolah Nasional): *
                </label>
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  placeholder="8 digit angka, contoh: 20108922"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  NSS (Nomor Statistik Sekolah):
                </label>
                <input
                  type="text"
                  value={formData.nss || ''}
                  onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                  placeholder="Contoh: 101016001001"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Bentuk Pendidikan:
                </label>
                <input
                  type="text"
                  value={formData.bentukPendidikan || 'Sekolah Dasar (SD)'}
                  onChange={(e) => setFormData({ ...formData, bentukPendidikan: e.target.value })}
                  placeholder="Sekolah Dasar (SD) / MI"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Sekolah:
                </label>
                <select
                  value={formData.statusSekolah || 'Negeri'}
                  onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                >
                  <option value="Negeri">Negeri (Pemerintah)</option>
                  <option value="Swasta">Swasta / Yayasan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Peringkat Akreditasi:
                </label>
                <select
                  value={formData.akreditasi || 'A (Unggul)'}
                  onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                >
                  <option value="A (Unggul)">A (Unggul)</option>
                  <option value="B (Baik)">B (Baik)</option>
                  <option value="C (Cukup)">C (Cukup)</option>
                  <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  No. SK Akreditasi BAN-S/M:
                </label>
                <input
                  type="text"
                  value={formData.skAkreditasi || ''}
                  onChange={(e) => setFormData({ ...formData, skAkreditasi: e.target.value })}
                  placeholder="Contoh: 1347/BAN-SM/SK/2023"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Kurikulum Pembelajaran:
                </label>
                <input
                  type="text"
                  value={formData.kurikulum || 'Kurikulum Merdeka'}
                  onChange={(e) => setFormData({ ...formData, kurikulum: e.target.value })}
                  placeholder="Contoh: Kurikulum Merdeka (Profil Pelajar Pancasila)"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: Alamat Lengkap & Wilayah Geografis */}
        {activeSubTab === 'alamat' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Alamat Lengkap & Struktur Wilayah Administratif
                </h3>
              </div>
              <button
                type="button"
                onClick={autoComposeAddress}
                className="px-3 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Gabungkan isian jalan, desa, kecamatan, kabupaten, provinsi ke kolom alamat lengkap"
              >
                <span>⚡ Sinkronkan Alamat Lengkap</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Jalan */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  1. Jalan / Dusun / RT & RW / No. Bangunan: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.street || ''}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Contoh: Jl. Merdeka Raya No. 45, RT. 004 / RW. 002"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Desa / Kelurahan */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  2. Desa / Kelurahan: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.village || ''}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Contoh: Kelurahan Selong"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Kecamatan */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  3. Kecamatan: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Contoh: Kecamatan Kebayoran Baru"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Kabupaten / Kota */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  4. Kabupaten / Kota: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.regency || ''}
                  onChange={(e) => setFormData({ ...formData, regency: e.target.value })}
                  placeholder="Contoh: Kota Administrasi Jakarta Selatan"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Provinsi */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  5. Provinsi: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.province || ''}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  placeholder="Contoh: DKI Jakarta / Jawa Barat / Jawa Timur"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Kode Pos */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  6. Kode Pos:
                </label>
                <input
                  type="text"
                  value={formData.postalCode || ''}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="Contoh: 12110"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Titik Koordinat GPS */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  7. Titik Koordinat Geografis (Lat, Long):
                </label>
                <input
                  type="text"
                  value={formData.coordinates || ''}
                  onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
                  placeholder="Contoh: -6.2382, 106.8045"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              {/* Composite Full Address Box */}
              <div className="md:col-span-2 lg:col-span-3 pt-2">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700 space-y-1.5">
                  <label className="block text-xs font-extrabold text-stone-800 dark:text-stone-200">
                    Alamat Lengkap Resmi (Muncul pada KOP Surat & Kartu Pelajar):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-medium text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Format alamat ini yang akan dicetak pada laporan presensi bulanan dan kartu tanda pelajar siswa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 3: Instansi Pembina & Kontak Komunikasi */}
        {activeSubTab === 'kontak' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Instansi Pembina Pendidikan & Saluran Kontak Resmi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Suku Dinas / Dinas Pendidikan Kabupaten/Kota:
                </label>
                <input
                  type="text"
                  value={formData.dinasPendidikan || ''}
                  onChange={(e) => setFormData({ ...formData, dinasPendidikan: e.target.value })}
                  placeholder="Contoh: Suku Dinas Pendidikan Wilayah I Jakarta Selatan"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Dinas Pendidikan Provinsi:
                </label>
                <input
                  type="text"
                  value={formData.provinsiDinas || ''}
                  onChange={(e) => setFormData({ ...formData, provinsiDinas: e.target.value })}
                  placeholder="Contoh: Dinas Pendidikan Provinsi DKI Jakarta"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Telepon / Hotline Sekolah: *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: (021) 7890-1234"
                    className="w-full pl-8 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Faksimili (Fax):
                </label>
                <input
                  type="text"
                  value={formData.fax || ''}
                  onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                  placeholder="Contoh: (021) 7890-1235"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Email Resmi Sekolah: *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Contoh: sdn01harapanbangsa@kemdikbud.go.id"
                    className="w-full pl-8 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Website / Portal Informasi:
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="Contoh: https://sdn01harapanbangsa.sch.id"
                    className="w-full pl-8 pr-3 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: Kepala Sekolah & Tenaga Administrasi */}
        {activeSubTab === 'sdm' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Pimpinan Satuan Pendidikan & Pengelola Data (Operator)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kepala Sekolah */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <h4 className="font-bold text-xs text-[#4a0404] dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️</span> Kepala Sekolah (Penanggung Jawab Lembaga)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Kepala Sekolah & Gelar: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="Contoh: Dra. Hj. Siti Rahmawati, M.Pd."
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    NIP Kepala Sekolah: *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.principalNip}
                    onChange={(e) => setFormData({ ...formData, principalNip: e.target.value })}
                    placeholder="Contoh: 19680512 199303 2 004"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nomor WhatsApp / HP Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={formData.principalPhone || ''}
                    onChange={(e) => setFormData({ ...formData, principalPhone: e.target.value })}
                    placeholder="Contoh: 0811-9876-5432"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>
              </div>

              {/* Operator Sekolah / Dapodik */}
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-3">
                <h4 className="font-bold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💻</span> Operator Sekolah (Dapodik & Admin Presensi)
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Operator Data / TU:
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName || ''}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    placeholder="Contoh: Ferry Ramadhani, S.Kom."
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    NIP / NUPTK Operator:
                  </label>
                  <input
                    type="text"
                    value={formData.operatorNip || ''}
                    onChange={(e) => setFormData({ ...formData, operatorNip: e.target.value })}
                    placeholder="Contoh: 19920815 201802 1 003"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nomor WhatsApp Operator (Bantuan Teknis):
                  </label>
                  <input
                    type="text"
                    value={formData.operatorPhone || ''}
                    onChange={(e) => setFormData({ ...formData, operatorPhone: e.target.value })}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full p-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: Jam Operasional & Jadwal Belajar */}
        {activeSubTab === 'jadwal' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                Waktu Pembelajaran & Parameter Toleransi Presensi
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tahun Ajaran:
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  placeholder="2025/2026"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Semester:
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                >
                  <option value="Ganjil">Ganjil (Juli - Des)</option>
                  <option value="Genap">Genap (Jan - Juni)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Jam Masuk Sekolah:
                </label>
                <input
                  type="time"
                  value={formData.schoolStartTime}
                  onChange={(e) => setFormData({ ...formData, schoolStartTime: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Toleransi Keterlambatan:
                </label>
                <input
                  type="time"
                  value={formData.lateThresholdTime}
                  onChange={(e) => setFormData({ ...formData, lateThresholdTime: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Jam Kepulangan Siswa:
                </label>
                <input
                  type="time"
                  value={formData.schoolEndTime || '13:30'}
                  onChange={(e) => setFormData({ ...formData, schoolEndTime: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-200">
              📌 <strong>Aturan Otomatis Presensi:</strong> Siswa yang melakukan scan kartu pelajar atau tercatat masuk setelah pukul <strong>{formData.lateThresholdTime}</strong> akan secara otomatis diklasifikasikan sebagai status <strong>Terlambat (T)</strong>.
            </div>
          </div>
        )}

        {/* SUBTAB 6: Visi, Misi & Karakter */}
        {activeSubTab === 'visimisi' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  Motto, Visi, & Misi Satuan Pendidikan
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Semboyan / Motto Sekolah:
                </label>
                <input
                  type="text"
                  value={formData.motto || ''}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  placeholder="Contoh: Cerdas, Berkarakter, Berakhlak Mulia, dan Berwawasan Lingkungan"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Visi Sekolah Dasar:
                </label>
                <textarea
                  rows={2}
                  value={formData.vision || ''}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  placeholder="Tuliskan visi sekolah..."
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Misi Satuan Pendidikan (Butir Poin):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddMissionPoint}
                    className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Butir Misi</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(formData.mission || []).map((point, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => handleUpdateMissionPoint(index, e.target.value)}
                        className="flex-1 p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:ring-1 focus:ring-[#4a0404]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMissionPoint(index)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                        title="Hapus poin misi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live KOP Surat & Profile Preview Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-stone-700 dark:text-stone-300">
            <Eye className="w-4 h-4 text-stone-500" />
            <span>Pratinjau KOP Surat Resmi Laporan Kehadiran</span>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 text-center space-y-1">
            <h4 className="text-xs md:text-sm font-black uppercase text-stone-900 dark:text-white tracking-wider">
              {formData.provinsiDinas || 'PEMERINTAH DAERAH'}
            </h4>
            <h5 className="text-[11px] md:text-xs font-extrabold uppercase text-[#4a0404] dark:text-rose-400">
              {formData.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
            </h5>
            <h3 className="text-sm md:text-base font-black text-stone-900 dark:text-white uppercase">
              {formData.name}
            </h3>
            <p className="text-[10px] text-stone-600 dark:text-stone-400 pt-0.5">
              {formData.address}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400">
              NPSN: <strong>{formData.npsn}</strong> • NSS: <strong>{formData.nss || '-'}</strong> • Akreditasi: <strong>{formData.akreditasi || 'A'}</strong> • Telp: <strong>{formData.phone}</strong> • Email: <strong>{formData.email}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 hover:bg-stone-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Data Awal
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup-restore')}
              className="px-3.5 py-2 bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 hover:bg-sky-200 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              Buka Simpan & Pulihkan Database
            </button>
          </div>

          <button
            type="submit"
            id="save-settings-button"
            className="px-6 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 text-sky-200" />
            <span>Simpan Seluruh Profil Sekolah</span>
          </button>
        </div>
      </form>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsResetConfirmOpen(false)}
          title="Konfirmasi Reset Data Profil"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Apakah Anda yakin ingin mengembalikan seluruh profil sekolah dan pengaturan sistem ke data bawaan demo?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
