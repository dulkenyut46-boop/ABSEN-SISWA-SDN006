import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, AttendanceRecord } from '../../types';
import {
  Calendar,
  Layers,
  CheckCircle2,
  Users,
  Search,
  Sparkles,
  Save,
  FileText,
  Clock,
  CheckCheck,
  AlertCircle,
  PhoneCall,
  Edit3,
  CalendarCheck,
  Flag,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { NationalHolidaysManager } from './NationalHolidaysManager';
import confetti from 'canvas-confetti';

interface DailyAttendanceViewProps {
  onOpenQRScanner?: () => void;
}

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = () => {
  const {
    students,
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedDate,
    setSelectedDate,
    attendanceRecords,
    markAttendance,
    markAllPresentForClass,
    markAllHolidayForClass,
    markAllHolidayForAllClasses,
    saveBatchAttendance,
    schoolProfile,
    holidays,
    isHoliday,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AttendanceStatus>('all');
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingNoteStudent, setEditingNoteStudent] = useState<{
    id: string;
    name: string;
    note: string;
  } | null>(null);

  // Local draft state for batch edits
  const [localRecords, setLocalRecords] = useState<{
    [studentId: string]: { status: AttendanceStatus; notes: string; timeIn?: string };
  }>({});

  // Detect if selected date is a National Holiday
  const currentDayHoliday = useMemo(() => {
    return isHoliday(selectedDate);
  }, [selectedDate, isHoliday]);

  // Active class info
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Filter students for current class
  const classStudents = useMemo(() => {
    let list = students.filter(
      (s) => s.classId === selectedClassId && s.status === 'aktif'
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nisn.includes(q) ||
          s.nis.includes(q)
      );
    }
    return list;
  }, [students, selectedClassId, searchQuery]);

  // Sync with global attendanceRecords whenever class or date changes
  useEffect(() => {
    const existing = attendanceRecords.filter(
      (r) => r.classId === selectedClassId && r.date === selectedDate
    );

    const initialMap: {
      [studentId: string]: { status: AttendanceStatus; notes: string; timeIn?: string };
    } = {};

    existing.forEach((rec) => {
      initialMap[rec.studentId] = {
        status: rec.status,
        notes: rec.notes || '',
        timeIn: rec.timeIn,
      };
    });

    setLocalRecords(initialMap);
  }, [selectedClassId, selectedDate, attendanceRecords]);

  // Handle single student status toggle
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const defaultTime = status === 'H' || status === 'T' ? timeStr : undefined;
    const defaultNotes =
      status === 'LN' && currentDayHoliday ? `Libur Nasional: ${currentDayHoliday.name}` : undefined;

    setLocalRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        notes: prev[studentId]?.notes || defaultNotes || '',
        timeIn: prev[studentId]?.timeIn || defaultTime,
      },
    }));

    // Auto mark instantly into global state as well
    markAttendance(
      studentId,
      status,
      selectedDate,
      localRecords[studentId]?.notes || defaultNotes,
      defaultTime
    );
  };

  // Handle saving notes
  const handleSaveNote = () => {
    if (!editingNoteStudent) return;
    const { id, note } = editingNoteStudent;

    setLocalRecords((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: note,
      },
    }));

    markAttendance(
      id,
      localRecords[id]?.status || 'H',
      selectedDate,
      note,
      localRecords[id]?.timeIn
    );

    setEditingNoteStudent(null);
  };

  // Batch save all
  const handleSaveAll = () => {
    const recordsToSave: AttendanceRecord[] = classStudents.map((st) => {
      const rec = localRecords[st.id] || { status: 'H', notes: '', timeIn: '07:00' };
      return {
        id: `att-${st.id}-${selectedDate}`,
        studentId: st.id,
        studentName: st.name,
        studentNisn: st.nisn,
        classId: st.classId,
        className: st.className,
        date: selectedDate,
        status: rec.status,
        timeIn: rec.timeIn,
        notes: rec.notes,
        recordedBy: 'Wali Kelas',
        verifiedAt: `${selectedDate} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      };
    });

    saveBatchAttendance(recordsToSave);

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch (e) {}
  };

  // Calculate live counts for summary bar
  const summaryStats = useMemo(() => {
    const total = classStudents.length;
    let hadir = 0;
    let terlambat = 0;
    let sakit = 0;
    let izin = 0;
    let alpa = 0;
    let libur = 0;

    classStudents.forEach((st) => {
      const rec = localRecords[st.id];
      if (!rec) {
        return;
      }
      if (rec.status === 'H') hadir++;
      else if (rec.status === 'T') terlambat++;
      else if (rec.status === 'S') sakit++;
      else if (rec.status === 'I') izin++;
      else if (rec.status === 'A') alpa++;
      else if (rec.status === 'LN') libur++;
    });

    const totalMarked = hadir + terlambat + sakit + izin + alpa + libur;
    const rate = total > 0 ? Math.round(((hadir + terlambat) / total) * 100) : 0;

    return { total, hadir, terlambat, sakit, izin, alpa, libur, totalMarked, rate };
  }, [classStudents, localRecords]);

  // Filter students by table status filter
  const displayedStudents = useMemo(() => {
    if (statusFilter === 'all') return classStudents;
    return classStudents.filter((st) => {
      const currentStatus = localRecords[st.id]?.status || 'H';
      return currentStatus === statusFilter;
    });
  }, [classStudents, localRecords, statusFilter]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Holiday Notification Banner (if date matches holiday) */}
      {currentDayHoliday && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                  Libur Nasional (LN)
                </span>
                <span className="text-xs font-mono opacity-90">{currentDayHoliday.date}</span>
              </div>
              <h3 className="text-sm font-extrabold mt-0.5">
                {currentDayHoliday.name}
              </h3>
              {currentDayHoliday.description && (
                <p className="text-xs text-indigo-100 opacity-90 mt-0.5">
                  {currentDayHoliday.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => markAllHolidayForClass(selectedClassId, selectedDate, currentDayHoliday.name)}
              className="px-3.5 py-1.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Tandai Kelas Ini (LN)</span>
            </button>

            <button
              onClick={() => markAllHolidayForAllClasses(selectedDate, currentDayHoliday.name)}
              className="px-3.5 py-1.5 bg-indigo-900/60 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold transition-all border border-white/30 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4" />
              <span>Tandai Seluruh Sekolah (LN)</span>
            </button>

            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Lihat Kalender
            </button>
          </div>
        </div>
      )}

      {/* Top Filter and Controls Header */}
      <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Class & Date Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Dropdown */}
            <div className="flex items-center gap-2 bg-sky-50/80 dark:bg-sky-950/60 px-3.5 py-2 rounded-xl border border-sky-200 dark:border-sky-800">
              <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Kelas:</span>
              <select
                id="attendance-class-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id} className="dark:bg-slate-900">
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div className="flex items-center gap-2 bg-sky-50/80 dark:bg-sky-950/60 px-3.5 py-2 rounded-xl border border-sky-200 dark:border-sky-800">
              <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300">Tanggal:</span>
              <input
                id="attendance-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
              />
            </div>

            {/* Homeroom teacher badge */}
            <div className="text-xs text-sky-800/80 dark:text-sky-300/80 font-medium px-2.5 py-1 bg-sky-50 dark:bg-sky-950/60 rounded-lg border border-sky-200/60 dark:border-sky-800/60 hidden sm:block">
              Wali Kelas:{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {currentClass?.teacherName}
              </strong>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              id="attendance-mark-all-present-button"
              onClick={() => markAllPresentForClass(selectedClassId, selectedDate)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Semua Hadir</span>
            </button>

            <button
              id="attendance-holiday-modal-button"
              onClick={() => setIsHolidayModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              title="Input & Kelola Hari Libur Nasional (Status LN)"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Libur Nasional</span>
            </button>

            <button
              id="attendance-save-all-button"
              onClick={handleSaveAll}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* Live Attendance Mini Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-3 border-t border-sky-100 dark:border-sky-900/60">
          <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-slate-800/60 border border-sky-200/60 dark:border-sky-900/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-sky-800 dark:text-sky-300">Total Siswa</p>
              <p className="text-base font-black text-slate-900 dark:text-white">
                {summaryStats.total}
              </p>
            </div>
            <Users className="w-4 h-4 text-sky-400" />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Hadir (H)
              </p>
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300">
                {summaryStats.hadir}
              </p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                Terlambat (T)
              </p>
              <p className="text-base font-black text-amber-700 dark:text-amber-300">
                {summaryStats.terlambat}
              </p>
            </div>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300">
                Sakit (S)
              </p>
              <p className="text-base font-black text-blue-700 dark:text-blue-300">
                {summaryStats.sakit}
              </p>
            </div>
            <span className="text-xs font-extrabold text-blue-600 bg-blue-200/50 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-md">
              S
            </span>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-sky-700 dark:text-sky-300">
                Izin (I)
              </p>
              <p className="text-base font-black text-sky-700 dark:text-sky-300">
                {summaryStats.izin}
              </p>
            </div>
            <span className="text-xs font-extrabold text-sky-600 bg-sky-200/50 dark:bg-sky-900/50 px-1.5 py-0.5 rounded-md">
              I
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                Alpa (A)
              </p>
              <p className="text-base font-black text-rose-700 dark:text-rose-300">
                {summaryStats.alpa}
              </p>
            </div>
            <span className="text-xs font-extrabold text-rose-600 bg-rose-200/50 dark:bg-rose-900/50 px-1.5 py-0.5 rounded-md">
              A
            </span>
          </div>

          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                Libur Nas (LN)
              </p>
              <p className="text-base font-black text-indigo-700 dark:text-indigo-300">
                {summaryStats.libur}
              </p>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-200/50 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded-md">
              LN
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
          <input
            id="attendance-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NISN siswa..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-900/60 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'H', label: 'Hadir' },
              { id: 'T', label: 'Terlambat' },
              { id: 'S', label: 'Sakit' },
              { id: 'I', label: 'Izin' },
              { id: 'A', label: 'Alpa' },
              { id: 'LN', label: 'Libur Nas (LN)' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-sky-200 dark:border-slate-800 hover:bg-sky-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-100 dark:border-slate-800 bg-sky-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Profil Siswa</th>
                <th className="py-3.5 px-4 hidden md:table-cell">NISN / NIS</th>
                <th className="py-3.5 px-4 text-center">Status Kehadiran</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Jam Masuk</th>
                <th className="py-3.5 px-4">Keterangan / Alasan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800 text-xs">
              {displayedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Tidak ada data siswa</p>
                    <p className="text-xs mt-1">
                      Coba sesuaikan kata kunci pencarian atau filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedStudents.map((student, idx) => {
                  const currentRecord = localRecords[student.id] || {
                    status: 'H',
                    notes: '',
                    timeIn: '07:00',
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* No */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-slate-800 flex items-center justify-center font-bold text-sky-800 dark:text-sky-300 shrink-0 text-xs border border-sky-200 dark:border-slate-700">
                            {student.gender === 'L' ? '👦' : '👧'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {student.name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>{student.className}</span>
                              <span>•</span>
                              <span>
                                {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* NISN */}
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                          {student.nisn}
                        </span>
                        <div className="text-[10px] text-slate-400">NIS: {student.nis}</div>
                      </td>

                      {/* 1-Click Status Button Chips */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1 bg-sky-100/60 dark:bg-slate-800/80 p-1 rounded-xl border border-sky-200 dark:border-slate-700 w-fit mx-auto">
                          {(
                            [
                              {
                                key: 'H',
                                label: 'Hadir',
                                activeBg: 'bg-emerald-600 text-white shadow-xs',
                              },
                              {
                                key: 'T',
                                label: 'Telat',
                                activeBg: 'bg-amber-500 text-white shadow-xs',
                              },
                              {
                                key: 'S',
                                label: 'Sakit',
                                activeBg: 'bg-blue-600 text-white shadow-xs',
                              },
                              {
                                key: 'I',
                                label: 'Izin',
                                activeBg: 'bg-sky-500 text-white shadow-xs',
                              },
                              {
                                key: 'A',
                                label: 'Alpa',
                                activeBg: 'bg-rose-600 text-white shadow-xs',
                              },
                              {
                                key: 'LN',
                                label: 'Libur Nas',
                                activeBg: 'bg-indigo-600 text-white shadow-xs',
                              },
                            ] as const
                          ).map((btn) => {
                            const isSelected = currentRecord.status === btn.key;
                            return (
                              <button
                                key={btn.key}
                                id={`status-btn-${student.id}-${btn.key}`}
                                onClick={() => handleStatusChange(student.id, btn.key)}
                                className={`px-2 py-1 rounded-lg font-extrabold text-[11px] transition-all cursor-pointer ${
                                  isSelected
                                    ? btn.activeBg
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-sky-200/60 dark:hover:bg-slate-700'
                                }`}
                                title={`Tandai ${btn.label}`}
                              >
                                {btn.key}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Jam Masuk */}
                      <td className="py-3.5 px-4 hidden lg:table-cell">
                        {currentRecord.status === 'H' || currentRecord.status === 'T' ? (
                          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{currentRecord.timeIn || '07:00'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">-</span>
                        )}
                      </td>

                      {/* Catatan / Keterangan */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <button
                          onClick={() =>
                            setEditingNoteStudent({
                              id: student.id,
                              name: student.name,
                              note: currentRecord.notes,
                            })
                          }
                          className="flex items-center gap-1.5 text-left text-xs text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 group truncate w-full cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                          <span className="truncate">
                            {currentRecord.notes ? (
                              currentRecord.notes
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">
                                Tambah catatan...
                              </span>
                            )}
                          </span>
                        </button>
                      </td>

                      {/* Aksi / WhatsApp Orang Tua */}
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`https://wa.me/62${student.parentPhone.replace(/^0/, '')}?text=Assalamu'alaikum%20Bapak/Ibu%20wali%20dari%20${encodeURIComponent(student.name)},%20kami%20menginformasikan%20status%20kehadiran%20hari%20ini%20adalah%20${currentRecord.status === 'H' ? 'HADIR' : currentRecord.status === 'S' ? 'SAKIT' : currentRecord.status === 'I' ? 'IZIN' : currentRecord.status === 'LN' ? 'LIBUR NASIONAL' : 'ALPA'}.%20Terima%20kasih.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                          title="Kirim Notifikasi WA ke Orang Tua"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span className="hidden sm:inline">WA Wali</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note Editing Modal */}
      {editingNoteStudent && (
        <Modal
          isOpen={Boolean(editingNoteStudent)}
          onClose={() => setEditingNoteStudent(null)}
          title={`Catatan Presensi: ${editingNoteStudent.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Keterangan / Alasan Khusus:
              </label>
              <textarea
                id="attendance-note-textarea"
                rows={4}
                value={editingNoteStudent.note}
                onChange={(e) =>
                  setEditingNoteStudent((prev) =>
                    prev ? { ...prev, note: e.target.value } : null
                  )
                }
                placeholder="Contoh: Mengikuti lomba sains tingkat kecamatan / Acara keluarga berizin..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingNoteStudent(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="attendance-save-note-button"
                onClick={handleSaveNote}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* National Holidays Modal */}
      <NationalHolidaysManager
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
};

