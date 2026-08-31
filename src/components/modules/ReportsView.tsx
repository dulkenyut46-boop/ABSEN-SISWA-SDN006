import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Layers,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  School,
  FileDown,
  Info,
} from 'lucide-react';
import { exportAttendanceMatrixToExcel } from '../../utils/excelHelpers';

export const ReportsView: React.FC = () => {
  const {
    students,
    classes,
    attendanceRecords,
    schoolProfile,
    selectedClassId,
    setSelectedClassId,
    holidays,
    isHoliday,
  } = useApp();

  // Period mode: 'monthly' (1 month full) | 'weekly' (last 7 days) | 'biweekly_1' (1-15) | 'biweekly_2' (16-end) | 'custom' (range)
  const [periodMode, setPeriodMode] = useState<'monthly' | 'weekly' | 'biweekly_1' | 'biweekly_2' | 'custom'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [customStartDate, setCustomStartDate] = useState('2026-08-01');
  const [customEndDate, setCustomEndDate] = useState('2026-08-31');

  const activeClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Helper to check if a date string is Sunday
  const isSunday = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === 0;
  };

  // Generate date list based on selected period
  const reportDates = useMemo(() => {
    if (periodMode === 'weekly') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });
    }

    if (periodMode === 'custom') {
      const start = new Date(customStartDate + 'T00:00:00');
      const end = new Date(customEndDate + 'T00:00:00');
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [customStartDate];
      }
      const dates: string[] = [];
      const curr = new Date(start);
      while (curr <= end) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    }

    // Monthly modes
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    if (periodMode === 'biweekly_1') {
      return Array.from({ length: Math.min(15, daysInMonth) }, (_, i) => {
        const dayStr = (i + 1).toString().padStart(2, '0');
        return `${year}-${month.toString().padStart(2, '0')}-${dayStr}`;
      });
    }

    if (periodMode === 'biweekly_2') {
      const length = daysInMonth - 15;
      return Array.from({ length: Math.max(0, length) }, (_, i) => {
        const dayStr = (i + 16).toString().padStart(2, '0');
        return `${year}-${month.toString().padStart(2, '0')}-${dayStr}`;
      });
    }

    // Default 'monthly': FULL days of the selected month (1 s/d 28/29/30/31)
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayStr = (i + 1).toString().padStart(2, '0');
      return `${year}-${month.toString().padStart(2, '0')}-${dayStr}`;
    });
  }, [periodMode, selectedMonth, customStartDate, customEndDate]);

  // Students in selected class
  const classStudents = useMemo(() => {
    return students.filter(
      (s) =>
        (selectedClassId === 'all' || s.classId === selectedClassId) &&
        s.status === 'aktif'
    );
  }, [students, selectedClassId]);

  // Sunday count & Holiday counts
  const sundayDates = useMemo(() => {
    return reportDates.filter((d) => isSunday(d));
  }, [reportDates]);

  const holidayDates = useMemo(() => {
    return reportDates.filter((d) => !isSunday(d) && isHoliday(d));
  }, [reportDates, isHoliday]);

  const effectiveSchoolDaysCount = useMemo(() => {
    return Math.max(0, reportDates.length - sundayDates.length - holidayDates.length);
  }, [reportDates, sundayDates, holidayDates]);

  // Compute student matrix records
  const studentMatrix = useMemo(() => {
    return classStudents.map((student) => {
      let hCount = 0;
      let sCount = 0;
      let iCount = 0;
      let aCount = 0;
      let tCount = 0;
      let lnCount = 0;

      const dateStatuses = reportDates.map((dateStr) => {
        const isSun = isSunday(dateStr);
        const hol = isHoliday(dateStr);
        const rec = attendanceRecords.find(
          (r) => r.studentId === student.id && r.date === dateStr
        );

        // If record exists, use it; otherwise if holiday, default to LN; if Sunday, default to L; else H
        let status = rec ? rec.status : hol ? 'LN' : isSun ? 'L' : 'H';

        if (status === 'H') hCount++;
        else if (status === 'T') {
          tCount++;
          hCount++;
        } else if (status === 'S') sCount++;
        else if (status === 'I') iCount++;
        else if (status === 'A') aCount++;
        else if (status === 'LN') lnCount++;

        return {
          date: dateStr,
          status,
          isSunday: isSun,
          isHoliday: Boolean(hol),
          holidayName: hol ? hol.name : '',
          notes: rec?.notes || '',
        };
      });

      // Calculate attendance rate based on effective school days (excluding Sundays & National Holidays)
      const baseDays = effectiveSchoolDaysCount > 0 ? effectiveSchoolDaysCount : reportDates.length;
      const rate = baseDays > 0 ? Math.min(100, Math.round((hCount / baseDays) * 100)) : 100;

      return {
        student,
        dateStatuses,
        hCount,
        sCount,
        iCount,
        aCount,
        tCount,
        lnCount,
        rate,
      };
    });
  }, [classStudents, reportDates, attendanceRecords, effectiveSchoolDaysCount, isHoliday]);

  // Overall Class summary metrics
  const classOverallStats = useMemo(() => {
    let totalH = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;
    let totalLN = 0;

    studentMatrix.forEach((m) => {
      totalH += m.hCount;
      totalS += m.sCount;
      totalI += m.iCount;
      totalA += m.aCount;
      totalLN += m.lnCount;
    });

    const baseDays = effectiveSchoolDaysCount > 0 ? effectiveSchoolDaysCount : reportDates.length;
    const totalSlots = studentMatrix.length * baseDays;
    const avgRate = totalSlots > 0 ? Math.round((totalH / totalSlots) * 100) : 0;

    return { totalH, totalS, totalI, totalA, totalLN, avgRate };
  }, [studentMatrix, reportDates, effectiveSchoolDaysCount]);

  // Daily totals per column for footer
  const dailyColumnStats = useMemo(() => {
    return reportDates.map((dateStr) => {
      const isSun = isSunday(dateStr);
      const hol = isHoliday(dateStr);
      if (isSun) {
        return { isSunday: true, isHoliday: false, presentCount: 0, absentCount: 0 };
      }
      if (hol) {
        return { isSunday: false, isHoliday: true, holidayName: hol.name, presentCount: 0, absentCount: 0 };
      }
      let presentCount = 0;
      let absentCount = 0;
      studentMatrix.forEach((m) => {
        const ds = m.dateStatuses.find((d) => d.date === dateStr);
        if (ds?.status === 'H' || ds?.status === 'T') {
          presentCount++;
        } else if (ds?.status === 'A' || ds?.status === 'S' || ds?.status === 'I') {
          absentCount++;
        }
      });
      return { isSunday: false, isHoliday: false, presentCount, absentCount };
    });
  }, [reportDates, studentMatrix, isHoliday]);

  // Trigger browser print dialog for formal school attendance sheet
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    exportAttendanceMatrixToExcel(schoolProfile, activeClass, reportDates, studentMatrix);
  };

  // Export CSV
  const handleExportReportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'NIS',
      'Nama Siswa',
      'L/P',
      'Kelas',
      ...reportDates.map((d) => {
        const isSun = isSunday(d);
        const hol = isHoliday(d);
        const dayNum = d.slice(8);
        return `${dayNum}${isSun ? '(Min)' : hol ? '(LN)' : ''}`;
      }),
      'Total H',
      'Total T',
      'Total S',
      'Total I',
      'Total A',
      'Total LN',
      '% Kehadiran',
    ];

    const rows = studentMatrix.map((m, idx) => [
      idx + 1,
      `'${m.student.nisn}`,
      `'${m.student.nis}`,
      `"${m.student.name}"`,
      m.student.gender,
      `"${m.student.className}"`,
      ...m.dateStatuses.map((ds) => ds.status),
      m.hCount,
      m.tCount,
      m.sCount,
      m.iCount,
      m.aCount,
      m.lnCount,
      `${m.rate}%`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_Presensi_${activeClass?.name ? activeClass.name.replace(/\s+/g, '_') : 'Sekolah'}_${reportDates[0]}_sd_${reportDates[reportDates.length - 1]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format Month Display Name
  const formatMonthTitle = (monthStr: string) => {
    const [y, m] = monthStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(dateObj);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Filter and Actions */}
      <div className="no-print p-6 rounded-2xl bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Rekapitulasi & Laporan Presensi Siswa
            </h2>
            <p className="text-xs text-sky-800/80 dark:text-sky-300/80 mt-0.5">
              Rekap kehadiran harian sesuai tanggal dan bulan dengan pembedaan hari Minggu dan Libur Nasional
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              id="export-report-excel-button"
              type="button"
              onClick={handleExportExcel}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
              title="Unduh format spreadsheet Excel lengkap"
            >
              <FileDown className="w-4 h-4" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              id="export-report-csv-button"
              type="button"
              onClick={handleExportReportCSV}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-sky-200 dark:border-sky-800 cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>CSV</span>
            </button>

            <button
              id="print-report-button"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak KOP Resmi (PDF)</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sky-100 dark:border-sky-900/60">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Selector */}
            <div className="flex items-center gap-2 bg-sky-50/80 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 text-xs">
              <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span className="font-bold text-sky-800 dark:text-sky-300">Kelas:</span>
              <select
                id="report-filter-class"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent font-extrabold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Semua Kelas</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Period Mode Selector */}
            <div className="flex items-center gap-1 bg-sky-100/60 dark:bg-sky-950/80 p-1 rounded-xl border border-sky-200 dark:border-sky-800 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setPeriodMode('monthly')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  periodMode === 'monthly'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white'
                }`}
              >
                1 Bulan Penuh
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('weekly')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  periodMode === 'weekly'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('biweekly_1')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  periodMode === 'biweekly_1'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white'
                }`}
              >
                Tgl 1 - 15
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('biweekly_2')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  periodMode === 'biweekly_2'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white'
                }`}
              >
                Tgl 16 - Akhir
              </button>
              <button
                type="button"
                onClick={() => setPeriodMode('custom')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  periodMode === 'custom'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white'
                }`}
              >
                Kustom
              </button>
            </div>

            {/* Month Picker for Monthly & Biweekly modes */}
            {periodMode !== 'weekly' && periodMode !== 'custom' && (
              <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-xl border border-sky-200 dark:border-sky-800 text-xs">
                <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
                />
              </div>
            )}

            {/* Custom Range Picker */}
            {periodMode === 'custom' && (
              <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-xl border border-sky-200 dark:border-sky-800 text-xs">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden"
                />
                <span className="text-sky-600 dark:text-sky-400 font-bold">s/d</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-sky-800 dark:text-sky-300 font-medium">Rata-rata Kehadiran:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold border border-emerald-200 dark:border-emerald-800">
              {classOverallStats.avgRate}%
            </span>
          </div>
        </div>

        {/* Informative summary chips for days, Sundays, and Holidays */}
        <div className="flex items-center gap-2 pt-2 border-t border-sky-100 dark:border-sky-900/60 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
          <div className="flex items-center gap-1 bg-sky-100/60 dark:bg-sky-950/70 px-2.5 py-1 rounded-lg border border-sky-200/60 dark:border-sky-900/60">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Total Hari: <strong>{reportDates.length} Hari</strong></span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Hari Efektif Belajar: <strong>{effectiveSchoolDaysCount} Hari</strong></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-300 dark:bg-slate-900 text-rose-800 dark:text-rose-300 px-2.5 py-1 rounded-lg border border-slate-400 dark:border-slate-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Hari Minggu: <strong>{sundayDates.length} Hari</strong> (Diarsir)</span>
          </div>
          {holidayDates.length > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800/60 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span>Libur Nasional: <strong>{holidayDates.length} Hari</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Printable School Attendance Document Container */}
      <div
        id="attendance-printable-report"
        className="print-container bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 shadow-xs p-6 md:p-8 space-y-6"
      >
        {/* Formal Elementary School KOP Surat Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-200 pb-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center text-xl font-bold">
              <School className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h3 className="text-sm md:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase">
                {schoolProfile.provinsiDinas ? schoolProfile.provinsiDinas.toUpperCase() : `PEMERINTAH ${schoolProfile.regency ? schoolProfile.regency.toUpperCase() : 'DAERAH'}`}
              </h3>
              <h4 className="text-xs md:text-sm font-extrabold text-sky-700 dark:text-sky-400 uppercase">
                {schoolProfile.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
              </h4>
              <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase">
                {schoolProfile.name}
              </h2>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            {schoolProfile.address} • Telp: {schoolProfile.phone} • Email: {schoolProfile.email}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            NPSN: <strong>{schoolProfile.npsn}</strong> {schoolProfile.nss ? `• NSS: ${schoolProfile.nss}` : ''} • Akreditasi: <strong>{schoolProfile.akreditasi || 'A'}</strong> • Kurikulum: <strong>{schoolProfile.kurikulum || 'Kurikulum Merdeka'}</strong>
          </p>
          <div className="pt-2 text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            LAPORAN REKAPITULASI KEHADIRAN SISWA BULAN {periodMode === 'monthly' || periodMode === 'biweekly_1' || periodMode === 'biweekly_2' ? formatMonthTitle(selectedMonth).toUpperCase() : 'BERJALAN'}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            Kelas: <strong>{activeClass ? activeClass.name : 'Semua Kelas'}</strong> •
            Periode: <strong>{reportDates[0]} s/d {reportDates[reportDates.length - 1]}</strong> ({reportDates.length} Hari, {effectiveSchoolDaysCount} Hari Efektif) •
            Tahun Ajaran: <strong>{schoolProfile.academicYear} ({schoolProfile.semester})</strong>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700 text-xs">
            <thead>
              <tr className="bg-sky-100/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 text-[11px]">
                <th className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 text-center w-8 shrink-0">
                  No
                </th>
                <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 min-w-[150px]">
                  Nama Siswa
                </th>
                <th className="py-2.5 px-1.5 border-r border-slate-300 dark:border-slate-700 text-center w-10 shrink-0">
                  L/P
                </th>

                {/* Date Columns: Sundays and Holidays are highlighted */}
                {reportDates.map((dateStr) => {
                  const d = new Date(dateStr + 'T00:00:00');
                  const dayNum = d.getDate();
                  const isSun = isSunday(dateStr);
                  const hol = isHoliday(dateStr);
                  const dayName = isSun ? 'Min' : new Intl.DateTimeFormat('id-ID', {
                    weekday: 'short',
                  }).format(d);

                  return (
                    <th
                      key={dateStr}
                      className={`py-1.5 px-1 border-r text-center min-w-[28px] max-w-[34px] ${
                        isSun
                          ? 'sunday-col bg-slate-300 dark:bg-slate-950 text-rose-700 dark:text-rose-400 font-black border-slate-400 dark:border-slate-700 shadow-inner'
                          : hol
                          ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black border-slate-400 dark:border-slate-700'
                          : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                      title={isSun ? `${dateStr}: Hari Minggu (Libur)` : hol ? `${dateStr}: ${hol.name} (Libur Nasional)` : dateStr}
                    >
                      <div className={`text-[8.5px] leading-tight ${isSun ? 'text-rose-600 dark:text-rose-400 font-extrabold uppercase' : hol ? 'text-indigo-600 dark:text-indigo-400 font-extrabold uppercase' : 'text-slate-500 dark:text-slate-400'}`}>
                        {hol ? 'LN' : dayName}
                      </div>
                      <div className={`text-[11px] ${isSun ? 'text-rose-800 dark:text-rose-300 font-black' : hol ? 'text-indigo-800 dark:text-indigo-200 font-black' : 'font-bold'}`}>
                        {dayNum}
                      </div>
                    </th>
                  );
                })}

                {/* Totals */}
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 w-9 shrink-0" title="Hadir">
                  H
                </th>
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 w-9 shrink-0" title="Terlambat">
                  T
                </th>
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 w-9 shrink-0" title="Sakit">
                  S
                </th>
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 w-9 shrink-0" title="Izin">
                  I
                </th>
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 w-9 shrink-0" title="Alpa">
                  A
                </th>
                <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 w-9 shrink-0" title="Libur Nasional">
                  LN
                </th>
                <th className="py-2 px-1.5 text-center bg-sky-200/80 dark:bg-slate-700 font-extrabold w-12 shrink-0">
                  %
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {studentMatrix.map((item, idx) => (
                <tr
                  key={item.student.id}
                  className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-400 text-[11px]">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                    {item.student.name}
                  </td>
                  <td className="py-2 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-mono text-slate-500 text-[11px]">
                    {item.student.gender}
                  </td>

                  {/* Status cells per date */}
                  {item.dateStatuses.map((ds) => {
                    if (ds.isSunday) {
                      return (
                        <td
                          key={ds.date}
                          className="sunday-col py-1.5 px-0.5 text-center border-r border-slate-300 dark:border-slate-700 bg-slate-300/80 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold text-[10px]"
                          title={`${ds.date}: Hari Minggu (Libur)`}
                        >
                          {ds.status === 'L' ? (
                            <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Libur</span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{ds.status}</span>
                          )}
                        </td>
                      );
                    }

                    if (ds.isHoliday || ds.status === 'LN') {
                      return (
                        <td
                          key={ds.date}
                          className="py-1.5 px-0.5 text-center border-r border-slate-300 dark:border-slate-700 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px]"
                          title={`${ds.date}: ${ds.holidayName || 'Libur Nasional'}`}
                        >
                          LN
                        </td>
                      );
                    }

                    const colorMap: Record<string, string> = {
                      H: 'text-emerald-700 dark:text-emerald-400 font-bold',
                      T: 'text-purple-700 dark:text-purple-400 font-bold bg-purple-50/60 dark:bg-purple-950/30',
                      S: 'text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/30',
                      I: 'text-sky-700 dark:text-sky-400 font-bold bg-sky-50 dark:bg-sky-950/30',
                      A: 'text-rose-700 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/30',
                      LN: 'text-indigo-700 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/30',
                    };

                    return (
                      <td
                        key={ds.date}
                        className={`py-1.5 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-mono text-[11px] ${
                          colorMap[ds.status] || ''
                        }`}
                        title={`${ds.date}: ${ds.status} ${ds.notes ? `(${ds.notes})` : ''}`}
                      >
                        {ds.status}
                      </td>
                    );
                  })}

                  {/* Summary Totals */}
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">
                    {item.hCount}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                    {item.tCount}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-amber-700 dark:text-amber-300 text-[11px]">
                    {item.sCount}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-[11px]">
                    {item.iCount}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-rose-700 dark:text-rose-300 text-[11px]">
                    {item.aCount}
                  </td>
                  <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                    {item.lnCount}
                  </td>
                  <td className="py-1.5 px-1 text-center font-extrabold text-slate-800 dark:text-slate-100 bg-sky-50/80 dark:bg-slate-800 text-[11px]">
                    {item.rate}%
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Table Footer: Daily Attendance Totals */}
            <tfoot>
              <tr className="bg-sky-100/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-t-2 border-slate-300 dark:border-slate-700 text-[10px]">
                <td colSpan={3} className="py-2 px-2 border-r border-slate-300 dark:border-slate-700 text-right font-black uppercase">
                  Jumlah Hadir:
                </td>
                {dailyColumnStats.map((stat, i) => {
                  if (stat.isSunday) {
                    return (
                      <td
                        key={i}
                        className="sunday-col py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-slate-300 dark:bg-slate-950 text-slate-500 font-bold"
                        title="Hari Minggu"
                      >
                        -
                      </td>
                    );
                  }
                  if (stat.isHoliday) {
                    return (
                      <td
                        key={i}
                        className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-[9px]"
                        title={stat.holidayName}
                      >
                        LN
                      </td>
                    );
                  }
                  return (
                    <td
                      key={i}
                      className="py-1 px-0.5 border-r border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400"
                    >
                      {stat.presentCount}
                    </td>
                  );
                })}
                <td colSpan={7} className="py-2 px-2 text-center font-black bg-sky-200/80 dark:bg-slate-700">
                  Rata-rata: {classOverallStats.avgRate}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs pt-2 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-white">Keterangan:</span>
          <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
            <strong>H:</strong> Hadir Tepat Waktu
          </span>
          <span className="flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-400">
            <strong>T:</strong> Terlambat
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
            <strong>S:</strong> Sakit
          </span>
          <span className="flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400">
            <strong>I:</strong> Izin
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
            <strong>A:</strong> Alpa
          </span>
          <span className="flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400">
            <strong>LN:</strong> Libur Nasional
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded">
            <strong>Hari Minggu:</strong> Libur Mingguan (Kolom Diarsir)
          </span>
        </div>

        {/* Official Signature Area (Signatures of Principal & Homeroom Teacher) */}
        <div className="pt-6 grid grid-cols-2 text-center text-xs text-slate-800 dark:text-slate-200 gap-8">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala {schoolProfile.name}</p>
            <div className="h-16" />
            <p className="font-extrabold underline">{schoolProfile.principalName}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              NIP. {schoolProfile.principalNip}
            </p>
          </div>

          <div>
            <p>
              {schoolProfile.regency ? schoolProfile.regency.replace(/^(kota|kabupaten|kab\.|kota adm\.)\s*/i, '') : 'Jakarta'}, {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date())}
            </p>
            <p className="font-bold">Guru Wali Kelas {activeClass ? activeClass.name : ''}</p>
            <div className="h-16" />
            <p className="font-extrabold underline">{activeClass ? activeClass.teacherName : 'Wali Kelas'}</p>
            <p className="text-[11px] text-slate-500 font-mono">
              NIP. {activeClass ? activeClass.teacherNip : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
