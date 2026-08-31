import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NationalHoliday } from '../../types';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  CalendarCheck,
  Building2,
  GraduationCap,
  Layers,
  Info,
  X,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface NationalHolidaysManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
}

export const NationalHolidaysManager: React.FC<NationalHolidaysManagerProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    resetHolidaysToDefault,
    selectedClassId,
    classes,
    markAllHolidayForClass,
    markAllHolidayForAllClasses,
    selectedDate,
    setSelectedDate,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // State for Add / Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState(initialDate || selectedDate || new Date().toISOString().split('T')[0]);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<NationalHoliday['category']>('nasional');
  const [formDescription, setFormDescription] = useState('');

  // State for Apply Holiday to Attendance Modal
  const [applyTargetHoliday, setApplyTargetHoliday] = useState<NationalHoliday | null>(null);
  const [applyScope, setApplyScope] = useState<'class' | 'all'>('class');

  // Available Years in list
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(holidays.map((h) => h.date.split('-')[0]))).sort();
    return years;
  }, [holidays]);

  // Filtered holidays list
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (selectedYear !== 'all' && !h.date.startsWith(selectedYear)) {
          return false;
        }
        if (selectedCategory !== 'all' && h.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            h.name.toLowerCase().includes(q) ||
            h.date.includes(q) ||
            (h.description && h.description.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, selectedYear, selectedCategory, searchQuery]);

  const openAddModal = (defaultDate?: string) => {
    setEditingHolidayId(null);
    setFormDate(defaultDate || initialDate || selectedDate || new Date().toISOString().split('T')[0]);
    setFormName('');
    setFormCategory('nasional');
    setFormDescription('');
    setIsFormOpen(true);
  };

  const openEditModal = (holiday: NationalHoliday) => {
    setEditingHolidayId(holiday.id);
    setFormDate(holiday.date);
    setFormName(holiday.name);
    setFormCategory(holiday.category || 'nasional');
    setFormDescription(holiday.description || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDate || !formName.trim()) return;

    if (editingHolidayId) {
      updateHoliday(editingHolidayId, {
        date: formDate,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
      });
    } else {
      addHoliday({
        date: formDate,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
      });
    }
    setIsFormOpen(false);
  };

  const handleApplyHolidayAttendance = () => {
    if (!applyTargetHoliday) return;

    if (applyScope === 'class') {
      markAllHolidayForClass(selectedClassId, applyTargetHoliday.date, applyTargetHoliday.name);
    } else {
      markAllHolidayForAllClasses(applyTargetHoliday.date, applyTargetHoliday.name);
    }

    // Also update current active selectedDate so teacher sees the updated sheet immediately
    setSelectedDate(applyTargetHoliday.date);
    setApplyTargetHoliday(null);
    onClose();
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'nasional':
        return {
          bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          label: 'Libur Nasional',
        };
      case 'keagamaan':
        return {
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          label: 'Hari Keagamaan',
        };
      case 'cuti_bersama':
        return {
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          label: 'Cuti Bersama',
        };
      case 'sekolah':
        return {
          bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          label: 'Libur Sekolah',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          label: 'Libur Resmi',
        };
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Kalender & Hari Libur Nasional (Status LN)"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Header Description & Actions */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-sky-50/80 to-purple-50/90 dark:from-slate-800/80 dark:via-slate-800/60 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-extrabold text-[10px] tracking-wide uppercase">
                  Kode: LN
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Manajemen Hari Libur Nasional & Status Presensi
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                Kelola daftar hari libur nasional atau libur khusus sekolah. Siswa dapat ditandai dengan status <strong>LN (Libur Nasional)</strong> secara instan per kelas atau sekaligus seluruh sekolah.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                id="holiday-add-button"
                onClick={() => openAddModal()}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Hari Libur</span>
              </button>

              <button
                id="holiday-reset-button"
                onClick={resetHolidaysToDefault}
                className="px-3 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                title="Reset daftar ke Hari Libur Resmi Pemerintah RI (2025-2027)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reset Standar RI</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="holiday-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari hari libur atau tanggal..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Year Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Tahun:</span>
                <select
                  id="holiday-year-filter"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent font-extrabold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Tahun</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr} className="dark:bg-slate-900">
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold text-slate-600 dark:text-slate-400">Kategori:</span>
                <select
                  id="holiday-category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-extrabold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="nasional">Libur Nasional</option>
                  <option value="keagamaan">Hari Keagamaan</option>
                  <option value="cuti_bersama">Cuti Bersama</option>
                  <option value="sekolah">Libur Sekolah</option>
                </select>
              </div>
            </div>
          </div>

          {/* Holidays List Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100/90 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 backdrop-blur-xs">
                  <tr>
                    <th className="py-3 px-4 w-36">Tanggal</th>
                    <th className="py-3 px-4">Nama Hari Libur</th>
                    <th className="py-3 px-4 w-32">Kategori</th>
                    <th className="py-3 px-4 text-right">Tindakan Presensi & Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredHolidays.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2 opacity-60" />
                        <p className="font-semibold text-xs">Tidak ada hari libur yang cocok dengan filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredHolidays.map((holiday) => {
                      const catBadge = getCategoryBadge(holiday.category);
                      const isToday = holiday.date === new Date().toISOString().split('T')[0];
                      const isCurrentSelected = holiday.date === selectedDate;

                      return (
                        <tr
                          key={holiday.id}
                          className={`hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-colors ${
                            isCurrentSelected
                              ? 'bg-indigo-50/60 dark:bg-indigo-950/40 font-semibold'
                              : isToday
                              ? 'bg-amber-50/40 dark:bg-amber-950/20'
                              : ''
                          }`}
                        >
                          {/* Tanggal */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span>{holiday.date}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {formatDateDisplay(holiday.date)}
                            </div>
                          </td>

                          {/* Nama Hari Libur */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{holiday.name}</span>
                              {holiday.isCustom && (
                                <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                  Kustom
                                </span>
                              )}
                              {isToday && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold animate-pulse">
                                  Hari Ini
                                </span>
                              )}
                            </div>
                            {holiday.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {holiday.description}
                              </p>
                            )}
                          </td>

                          {/* Kategori */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.bg}`}
                            >
                              {catBadge.label}
                            </span>
                          </td>

                          {/* Tindakan */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Terapkan Status LN */}
                              <button
                                id={`holiday-apply-btn-${holiday.id}`}
                                onClick={() => setApplyTargetHoliday(holiday)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                title="Tandai presensi siswa sebagai Libur Nasional (LN)"
                              >
                                <CalendarCheck className="w-3.5 h-3.5" />
                                <span>Terapkan LN</span>
                              </button>

                              {/* Edit */}
                              <button
                                id={`holiday-edit-btn-${holiday.id}`}
                                onClick={() => openEditModal(holiday)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit info hari libur"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                id={`holiday-delete-btn-${holiday.id}`}
                                onClick={() => deleteHoliday(holiday.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus dari kalender"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-4 h-4 text-indigo-500" />
              Menampilkan {filteredHolidays.length} dari total {holidays.length} hari libur terdaftar.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* Form Modal: Add / Edit Holiday */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={editingHolidayId ? 'Edit Data Hari Libur' : 'Tambah Hari Libur Baru'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Libur (YYYY-MM-DD)*
              </label>
              <input
                id="holiday-form-date"
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Hari Libur / Agenda*
              </label>
              <input
                id="holiday-form-name"
                type="text"
                required
                placeholder="Contoh: Hari Guru Nasional / Libur Semester Genap"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Kategori Hari Libur
              </label>
              <select
                id="holiday-form-category"
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              >
                <option value="nasional">Libur Nasional Resmi</option>
                <option value="keagamaan">Hari Raya Keagamaan</option>
                <option value="cuti_bersama">Cuti Bersama Pemerintah</option>
                <option value="sekolah">Libur Khusus Sekolah / Yayasan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan Tambahan (Opsional)
              </label>
              <textarea
                id="holiday-form-desc"
                rows={2}
                placeholder="Catatan edaran dinas, SKB 3 menteri, atau instruksi sekolah..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="holiday-form-submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
              >
                {editingHolidayId ? 'Simpan Perubahan' : 'Tambahkan Hari Libur'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Apply to Attendance Confirmation Modal */}
      {applyTargetHoliday && (
        <Modal
          isOpen={Boolean(applyTargetHoliday)}
          onClose={() => setApplyTargetHoliday(null)}
          title="Terapkan Status Libur Nasional (LN)"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs">
              <p className="font-bold text-indigo-900 dark:text-indigo-200">
                📌 {applyTargetHoliday.name}
              </p>
              <p className="text-indigo-700 dark:text-indigo-400 mt-0.5">
                Tanggal: <strong>{formatDateDisplay(applyTargetHoliday.date)}</strong>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Pilih Cakupan Siswa yang Ditandai LN:
              </label>

              <div className="space-y-2">
                <label
                  onClick={() => setApplyScope('class')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    applyScope === 'class'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="apply-scope"
                    checked={applyScope === 'class'}
                    onChange={() => setApplyScope('class')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>Hanya Kelas Ini ({classes.find((c) => c.id === selectedClassId)?.name || 'Kelas Aktif'})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menandai seluruh siswa aktif di kelas yang sedang dibuka dengan status <strong>LN</strong>.
                    </p>
                  </div>
                </label>

                <label
                  onClick={() => setApplyScope('all')}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    applyScope === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="apply-scope"
                    checked={applyScope === 'all'}
                    onChange={() => setApplyScope('all')}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span>Seluruh Sekolah (Semua Kelas 1 - 6)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menandai seluruh rombongan belajar di sekolah dengan status <strong>LN</strong> untuk tanggal ini.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApplyTargetHoliday(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="confirm-apply-holiday-btn"
                onClick={handleApplyHolidayAttendance}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terapkan Status LN Sekarang</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
