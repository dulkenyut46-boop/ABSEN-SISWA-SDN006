import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  Sliders,
  Maximize2,
  Minimize2,
  FileText,
  Eye,
  RotateCcw,
  Check,
  ChevronDown,
} from 'lucide-react';
import { exportAttendanceMatrixToExcel } from '../../utils/excelHelpers';
import {
  PrintPageSettingsModal,
  DEFAULT_PRINT_SETTINGS,
  PrintPageSettings,
  PaperSize,
  PageOrientation,
  FontScale,
} from './PrintPageSettingsModal';

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

  // Page Setup & Paper Configuration State
  const [printSettings, setPrintSettings] = useState<PrintPageSettings>(DEFAULT_PRINT_SETTINGS);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
    return classStudents.map((student, originalIndex) => {
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
        else if (status === 'T') tCount++;
        else if (status === 'S') sCount++;
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

      // Calculate attendance rate based on effective school days (Hadir + Terlambat)
      const baseDays = effectiveSchoolDaysCount > 0 ? effectiveSchoolDaysCount : reportDates.length;
      const rate = baseDays > 0 ? Math.min(100, Math.round(((hCount + tCount) / baseDays) * 100)) : 100;

      return {
        student,
        originalIndex,
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
    let totalT = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;
    let totalLN = 0;

    studentMatrix.forEach((m) => {
      totalH += m.hCount;
      totalT += m.tCount;
      totalS += m.sCount;
      totalI += m.iCount;
      totalA += m.aCount;
      totalLN += m.lnCount;
    });

    const baseDays = effectiveSchoolDaysCount > 0 ? effectiveSchoolDaysCount : reportDates.length;
    const totalSlots = studentMatrix.length * baseDays;
    const totalPresent = totalH + totalT;
    const grandTotal = totalH + totalT + totalS + totalI + totalA + totalLN;
    const avgRate = totalSlots > 0 ? Math.min(100, Math.round((totalPresent / totalSlots) * 100)) : 0;

    return { totalH, totalT, totalS, totalI, totalA, totalLN, totalPresent, grandTotal, avgRate };
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

  // Paginated student chunks if rowsPerPage > 0
  const paginatedChunks = useMemo(() => {
    if (printSettings.rowsPerPage <= 0) {
      return [studentMatrix];
    }
    const chunks = [];
    for (let i = 0; i < studentMatrix.length; i += printSettings.rowsPerPage) {
      chunks.push(studentMatrix.slice(i, i + printSettings.rowsPerPage));
    }
    return chunks.length > 0 ? chunks : [[]];
  }, [studentMatrix, printSettings.rowsPerPage]);

  // Dynamic CSS margins calculation
  const marginCss = useMemo(() => {
    if (printSettings.marginPreset === 'narrow') return '5mm 6mm';
    if (printSettings.marginPreset === 'normal') return '10mm 12mm';
    if (printSettings.marginPreset === 'wide') return '15mm 18mm';
    if (printSettings.marginPreset === 'compact') return '3mm 4mm';
    return `${printSettings.customMarginMm.top}mm ${printSettings.customMarginMm.right}mm ${printSettings.customMarginMm.bottom}mm ${printSettings.customMarginMm.left}mm`;
  }, [printSettings.marginPreset, printSettings.customMarginMm]);

  // Dynamic Page size string for @page
  const pageSizeCss = useMemo(() => {
    let sizeName = '215mm 330mm'; // F4 default
    if (printSettings.paperSize === 'A4') sizeName = 'A4';
    else if (printSettings.paperSize === 'A3') sizeName = 'A3';
    else if (printSettings.paperSize === 'Legal') sizeName = 'legal';
    else if (printSettings.paperSize === 'Letter') sizeName = 'letter';
    else if (printSettings.paperSize === 'F4') sizeName = '215mm 330mm';

    return `${sizeName} ${printSettings.orientation}`;
  }, [printSettings.paperSize, printSettings.orientation]);

  // Formatted Signature Date
  const signatureFormattedDate = useMemo(() => {
    let d = new Date();
    if (printSettings.signatureDateOption === 'end_of_month') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const days = new Date(y, m, 0).getDate();
      d = new Date(y, m - 1, days);
    } else if (printSettings.signatureDateOption === 'custom' && printSettings.customSignatureDate) {
      d = new Date(printSettings.customSignatureDate + 'T00:00:00');
    }
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(d);
  }, [printSettings.signatureDateOption, printSettings.customSignatureDate, selectedMonth]);

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
      {/* Dynamic Print Styles for Exact Paper Size & Orientation & Font Scaling */}
      <style>
        {`
          @page {
            size: ${pageSizeCss};
            margin: ${marginCss};
          }
          @media print {
            .print-container {
              font-size: ${printSettings.fontSizeScale} !important;
            }
            .matrix-table-print {
              font-size: ${printSettings.fontSizeScale} !important;
            }
          }
        `}
      </style>

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
            {/* Page Setup Button */}
            <button
              id="open-page-setup-modal-btn"
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-900 dark:text-sky-200 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border border-sky-300 dark:border-sky-800 shadow-2xs active:scale-95 cursor-pointer"
              title="Atur ukuran kertas (F4/A4), orientasi landscape, margin, skala tabel, dan KOP resmi"
            >
              <Sliders className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>Atur Halaman & Kertas</span>
              <span className="px-1.5 py-0.2 rounded-md bg-sky-700 text-white text-[10px] font-mono">
                {printSettings.paperSize} {printSettings.orientation === 'landscape' ? 'LS' : 'PT'}
              </span>
            </button>

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

        {/* Quick Page Setup Control Strip (Paper Size, Orientation, Scale, Preview Mode) */}
        <div className="p-3 rounded-xl bg-sky-50/80 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              Ukuran Kertas:
            </span>

            {/* Quick Paper Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
              {(['F4', 'A4', 'A3', 'Legal', 'Letter'] as PaperSize[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrintSettings((prev) => ({ ...prev, paperSize: p }))}
                  className={`px-2 py-1 rounded text-[11px] font-extrabold transition-all cursor-pointer ${
                    printSettings.paperSize === p
                      ? 'bg-sky-700 text-white shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:text-sky-700'
                  }`}
                  title={p === 'F4' ? 'F4 / Folio (215 × 330 mm) - Standar Sekolah Indonesia' : `${p} Standar`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Quick Orientation Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
              <button
                type="button"
                onClick={() => setPrintSettings((prev) => ({ ...prev, orientation: 'landscape' }))}
                className={`px-2 py-1 rounded text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  printSettings.orientation === 'landscape'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-sky-700'
                }`}
                title="Landscape (Mendatar) - Direkomendasikan untuk tabel presensi bulanan"
              >
                <Maximize2 className="w-3 h-3 rotate-45" />
                <span>Landscape</span>
              </button>
              <button
                type="button"
                onClick={() => setPrintSettings((prev) => ({ ...prev, orientation: 'portrait' }))}
                className={`px-2 py-1 rounded text-[11px] font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                  printSettings.orientation === 'portrait'
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-700 dark:text-slate-300 hover:text-sky-700'
                }`}
              >
                <Minimize2 className="w-3 h-3" />
                <span>Portrait</span>
              </button>
            </div>

            {/* Quick Font Scaling */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sky-900 dark:text-sky-300">Skala:</span>
              <select
                value={printSettings.fontSizeScale}
                onChange={(e) =>
                  setPrintSettings((prev) => ({ ...prev, fontSizeScale: e.target.value as FontScale }))
                }
                className="p-1 bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-800 rounded-lg text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="75%">75% (Kompak)</option>
                <option value="80%">80% (Pas 1 Lembar)</option>
                <option value="85%">85% (Ideal F4)</option>
                <option value="90%">90%</option>
                <option value="95%">95%</option>
                <option value="100%">100% (Normal)</option>
              </select>
            </div>
          </div>

          {/* Real Paper Preview Toggle & Modal Opener */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setPrintSettings((prev) => ({ ...prev, realPaperPreview: !prev.realPaperPreview }))
              }
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                printSettings.realPaperPreview
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-2xs font-extrabold'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-sky-200 dark:border-sky-800'
              }`}
              title="Aktifkan simulasi tampilan lembar kertas cetak fisik"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{printSettings.realPaperPreview ? 'Mode Kertas: Aktif' : 'Simulasi Kertas'}</span>
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

        {/* Total Presensi Aggregate Summary Grid (H, T, S, I, A, LN) */}
        <div className="pt-2 border-t border-sky-100 dark:border-sky-900/60">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Akumulasi Total Presensi Periode Ini:
            </span>
            <span className="text-[10px] text-slate-500 font-normal">
              Total {classOverallStats.grandTotal} catatan presensi
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <div className="p-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
              <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Hadir (H)</div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{classOverallStats.totalH}</div>
              <div className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80">Tepat Waktu</div>
            </div>
            <div className="p-2 rounded-xl bg-purple-50/90 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-center">
              <div className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase">Terlambat (T)</div>
              <div className="text-lg font-black text-purple-700 dark:text-purple-400 mt-0.5">{classOverallStats.totalT}</div>
              <div className="text-[9px] text-purple-600/80 dark:text-purple-400/80">Masuk &gt; 07:15</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
              <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Sakit (S)</div>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">{classOverallStats.totalS}</div>
              <div className="text-[9px] text-amber-600/80 dark:text-amber-400/80">Surat Dokter</div>
            </div>
            <div className="p-2 rounded-xl bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-center">
              <div className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase">Izin (I)</div>
              <div className="text-lg font-black text-sky-700 dark:text-sky-400 mt-0.5">{classOverallStats.totalI}</div>
              <div className="text-[9px] text-sky-600/80 dark:text-sky-400/80">Surat Izin Ortu</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-center">
              <div className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase">Alpa (A)</div>
              <div className="text-lg font-black text-rose-700 dark:text-rose-400 mt-0.5">{classOverallStats.totalA}</div>
              <div className="text-[9px] text-rose-600/80 dark:text-rose-400/80">Tanpa Berita</div>
            </div>
            <div className="p-2 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-center">
              <div className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase">Libur (LN)</div>
              <div className="text-lg font-black text-indigo-700 dark:text-indigo-400 mt-0.5">{classOverallStats.totalLN}</div>
              <div className="text-[9px] text-indigo-600/80 dark:text-indigo-400/80">Libur Nasional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Document Body (Supports continuous or multi-page layout) */}
      <div
        className={`print-container transition-all ${
          printSettings.realPaperPreview
            ? 'mx-auto max-w-[1280px] p-4 bg-slate-200/70 dark:bg-slate-950/80 rounded-3xl border border-slate-300 dark:border-slate-800'
            : ''
        }`}
      >
        {paginatedChunks.map((chunk, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === paginatedChunks.length - 1;
          const totalPages = paginatedChunks.length;

          return (
            <div
              key={pageIndex}
              id={`attendance-printable-report-page-${pageIndex + 1}`}
              className={`page-sheet bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 shadow-xs p-6 md:p-8 space-y-5 ${
                printSettings.realPaperPreview ? 'mb-8 shadow-xl ring-1 ring-slate-300 dark:ring-slate-800' : ''
              } ${!isLastPage ? 'avoid-break-inside' : ''}`}
            >
              {/* Formal Elementary School KOP Surat Header */}
              {printSettings.showKop && (
                <div
                  className={`pb-3 text-center space-y-1 ${
                    printSettings.showDoubleLine
                      ? 'border-b-4 border-double border-slate-900 dark:border-slate-300'
                      : 'border-b-2 border-slate-800 dark:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Logo (Logo Utama Sekolah / Dinas) */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                      {printSettings.showLogoLeft && (
                        schoolProfile.logoUrl ? (
                          <img
                            src={schoolProfile.logoUrl}
                            alt="Logo Sekolah"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-sky-700 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                            <School className="w-8 h-8" />
                          </div>
                        )
                      )}
                    </div>

                    {/* Center Heading */}
                    <div className="flex-1 text-center min-w-0 px-2">
                      <h3 className="text-xs sm:text-sm md:text-base font-black tracking-wide text-slate-900 dark:text-white uppercase leading-tight">
                        {schoolProfile.provinsiDinas ? schoolProfile.provinsiDinas.toUpperCase() : `PEMERINTAH ${schoolProfile.regency ? schoolProfile.regency.toUpperCase() : 'DAERAH'}`}
                      </h3>
                      <h4 className="text-[11px] sm:text-xs md:text-sm font-extrabold text-sky-700 dark:text-sky-400 uppercase leading-tight mt-0.5">
                        {schoolProfile.dinasPendidikan || 'DINAS PENDIDIKAN DAN KEBUDAYAAN'}
                      </h4>
                      <h2 className="text-sm sm:text-base md:text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight leading-snug mt-0.5">
                        {schoolProfile.name}
                      </h2>
                      <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 leading-normal">
                        {schoolProfile.address}
                      </p>
                      <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Telp: {schoolProfile.phone} • Email: {schoolProfile.email} • Website: {schoolProfile.website || 'https://kemdikbud.go.id'}
                      </p>
                      {printSettings.showSchoolMeta && (
                        <p className="text-[9.5px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-semibold mt-0.5">
                          NPSN: <strong>{schoolProfile.npsn}</strong> {schoolProfile.nss ? `• NSS: ${schoolProfile.nss}` : ''} • Akreditasi: <strong>{schoolProfile.akreditasi || 'A (Unggul)'}</strong> • Kurikulum: <strong>{schoolProfile.kurikulum || 'Kurikulum Merdeka'}</strong>
                        </p>
                      )}
                    </div>

                    {/* Right Logo (Logo Tut Wuri Handayani / Pendamping) */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                      {printSettings.showLogoRight && (
                        schoolProfile.secondaryLogoUrl ? (
                          <img
                            src={schoolProfile.secondaryLogoUrl}
                            alt="Logo Pendamping"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : schoolProfile.logoUrl ? (
                          <img
                            src={schoolProfile.logoUrl}
                            alt="Logo Sekolah"
                            className="max-h-full max-w-full object-contain opacity-90"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-sky-800 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                            <School className="w-8 h-8" />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="pt-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    LAPORAN REKAPITULASI KEHADIRAN SISWA BULAN {periodMode === 'monthly' || periodMode === 'biweekly_1' || periodMode === 'biweekly_2' ? formatMonthTitle(selectedMonth).toUpperCase() : 'BERJALAN'}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Kelas: <strong>{activeClass ? activeClass.name : 'Semua Kelas'}</strong> •
                    Periode: <strong>{reportDates[0]} s/d {reportDates[reportDates.length - 1]}</strong> ({reportDates.length} Hari, {effectiveSchoolDaysCount} Hari Efektif) •
                    Tahun Ajaran: <strong>{schoolProfile.academicYear} ({schoolProfile.semester})</strong>
                    {totalPages > 1 && (
                      <span> • <strong>Halaman {pageIndex + 1} dari {totalPages}</strong></span>
                    )}
                  </div>
                </div>
              )}

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="matrix-table-print w-full text-left border-collapse border border-slate-300 dark:border-slate-700 text-xs">
                  <thead>
                    <tr className="bg-sky-100/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 text-[11px]">
                      <th className="py-2 px-1.5 border-r border-slate-300 dark:border-slate-700 text-center w-7 shrink-0">
                        No
                      </th>
                      <th className="py-2 px-2 border-r border-slate-300 dark:border-slate-700 min-w-[140px]">
                        Nama Siswa
                      </th>
                      <th className="py-2 px-1 border-r border-slate-300 dark:border-slate-700 text-center w-8 shrink-0">
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
                            className={`py-1 px-0.5 border-r text-center min-w-[24px] max-w-[32px] ${
                              isSun && printSettings.showSundays
                                ? 'sunday-col bg-slate-300 dark:bg-slate-950 text-rose-700 dark:text-rose-400 font-black border-slate-400 dark:border-slate-700 shadow-inner'
                                : hol && printSettings.showHolidays
                                ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-black border-slate-400 dark:border-slate-700'
                                : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                            }`}
                            title={isSun ? `${dateStr}: Hari Minggu (Libur)` : hol ? `${dateStr}: ${hol.name} (Libur Nasional)` : dateStr}
                          >
                            <div className={`text-[8px] leading-tight ${isSun ? 'text-rose-600 dark:text-rose-400 font-extrabold uppercase' : hol ? 'text-indigo-600 dark:text-indigo-400 font-extrabold uppercase' : 'text-slate-500 dark:text-slate-400'}`}>
                              {hol ? 'LN' : dayName}
                            </div>
                            <div className={`text-[10.5px] ${isSun ? 'text-rose-800 dark:text-rose-300 font-black' : hol ? 'text-indigo-800 dark:text-indigo-200 font-black' : 'font-bold'}`}>
                              {dayNum}
                            </div>
                          </th>
                        );
                      })}

                      {/* Totals */}
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 w-8 shrink-0" title="Hadir">
                        H
                      </th>
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 w-8 shrink-0" title="Terlambat">
                        T
                      </th>
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 w-8 shrink-0" title="Sakit">
                        S
                      </th>
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 w-8 shrink-0" title="Izin">
                        I
                      </th>
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 w-8 shrink-0" title="Alpa">
                        A
                      </th>
                      <th className="py-1.5 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 w-8 shrink-0" title="Libur Nasional">
                        LN
                      </th>
                      <th className="py-1.5 px-1 text-center bg-sky-200/80 dark:bg-slate-700 font-extrabold w-10 shrink-0">
                        %
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {chunk.map((item) => (
                      <tr
                        key={item.student.id}
                        className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-1.5 px-1 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-slate-400 text-[10.5px]">
                          {item.originalIndex + 1}
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]">
                          {item.student.name}
                        </td>
                        <td className="py-1.5 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-mono text-slate-500 text-[10px]">
                          {item.student.gender}
                        </td>

                        {/* Status cells per date */}
                        {item.dateStatuses.map((ds) => {
                          if (ds.isSunday && printSettings.showSundays) {
                            return (
                              <td
                                key={ds.date}
                                className="sunday-col py-1 px-0.5 text-center border-r border-slate-300 dark:border-slate-700 bg-slate-300/80 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 font-extrabold text-[9.5px]"
                                title={`${ds.date}: Hari Minggu (Libur)`}
                              >
                                {ds.status === 'L' ? (
                                  <span className="text-[8.5px] font-semibold text-slate-500 dark:text-slate-400">Libur</span>
                                ) : (
                                  <span className="text-[9.5px] font-bold text-slate-700 dark:text-slate-300">{ds.status}</span>
                                )}
                              </td>
                            );
                          }

                          if ((ds.isHoliday || ds.status === 'LN') && printSettings.showHolidays) {
                            return (
                              <td
                                key={ds.date}
                                className="py-1 px-0.5 text-center border-r border-slate-300 dark:border-slate-700 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold text-[9.5px]"
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
                              className={`py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-mono text-[10.5px] ${
                                colorMap[ds.status] || ''
                              }`}
                              title={`${ds.date}: ${ds.status} ${ds.notes ? `(${ds.notes})` : ''}`}
                            >
                              {ds.status}
                            </td>
                          );
                        })}

                        {/* Summary Totals */}
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-emerald-700 dark:text-emerald-300 text-[10.5px]">
                          {item.hCount}
                        </td>
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-purple-700 dark:text-purple-300 text-[10.5px]">
                          {item.tCount}
                        </td>
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-amber-700 dark:text-amber-300 text-[10.5px]">
                          {item.sCount}
                        </td>
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-sky-700 dark:text-sky-300 text-[10.5px]">
                          {item.iCount}
                        </td>
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-rose-700 dark:text-rose-300 text-[10.5px]">
                          {item.aCount}
                        </td>
                        <td className="py-1 px-0.5 text-center border-r border-slate-200 dark:border-slate-700 font-bold text-indigo-700 dark:text-indigo-300 text-[10.5px]">
                          {item.lnCount}
                        </td>
                        <td className="py-1 px-0.5 text-center font-extrabold text-slate-800 dark:text-slate-100 bg-sky-50/80 dark:bg-slate-800 text-[10.5px]">
                          {item.rate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Table Footer: Daily & Total Presensi Summary (Only on Last Page or Single Page) */}
                  {printSettings.showDailySummaryFooter && isLastPage && (
                    <tfoot>
                      {/* Row 1: Daily Counts per date column + column sums */}
                      <tr className="bg-sky-100/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-t-2 border-slate-400 dark:border-slate-600 text-[10px]">
                        <td colSpan={3} className="py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 text-right font-black uppercase tracking-tight">
                          Jml Hadir Harian:
                        </td>
                        {dailyColumnStats.map((stat, i) => {
                          if (stat.isSunday && printSettings.showSundays) {
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
                          if (stat.isHoliday && printSettings.showHolidays) {
                            return (
                              <td
                                key={i}
                                className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center bg-indigo-100/70 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-[8.5px]"
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
                        {/* Status Column Sums */}
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50" title="Total Hadir (H)">
                          {classOverallStats.totalH}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-purple-800 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/50" title="Total Terlambat (T)">
                          {classOverallStats.totalT}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50" title="Total Sakit (S)">
                          {classOverallStats.totalS}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/50" title="Total Izin (I)">
                          {classOverallStats.totalI}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-rose-800 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50" title="Total Alpa (A)">
                          {classOverallStats.totalA}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-mono font-black text-indigo-800 dark:text-indigo-300 bg-indigo-100/70 dark:bg-indigo-950/50" title="Total Libur Nasional (LN)">
                          {classOverallStats.totalLN}
                        </td>
                        <td className="py-1 px-0.5 text-center font-mono font-black bg-sky-200 dark:bg-slate-700 text-slate-950 dark:text-white" title="Rata-rata Persentase Kehadiran">
                          {classOverallStats.avgRate}%
                        </td>
                      </tr>

                      {/* Row 2: Total Rekapitulasi Label and Grand Totals */}
                      <tr className="bg-sky-200/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-extrabold border-t border-slate-300 dark:border-slate-700 text-[10.5px]">
                        <td colSpan={3} className="py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 text-right font-black uppercase text-sky-950 dark:text-sky-200">
                          TOTAL REKAP (H,T,S,I,A,LN):
                        </td>
                        <td colSpan={reportDates.length} className="py-1.5 px-2 border-r border-slate-300 dark:border-slate-700 text-left font-bold text-[9.5px] text-slate-700 dark:text-slate-300">
                          Hadir: {classOverallStats.totalPresent} ({classOverallStats.avgRate}%) • Sakit/Izin: {classOverallStats.totalS + classOverallStats.totalI} • Alpa: {classOverallStats.totalA} • Libur: {classOverallStats.totalLN}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-emerald-900 dark:text-emerald-200 bg-emerald-200/80 dark:bg-emerald-900/60">
                          {classOverallStats.totalH}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-purple-900 dark:text-purple-200 bg-purple-200/80 dark:bg-purple-900/60">
                          {classOverallStats.totalT}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-amber-900 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/60">
                          {classOverallStats.totalS}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-sky-900 dark:text-sky-200 bg-sky-200/80 dark:bg-sky-900/60">
                          {classOverallStats.totalI}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-rose-900 dark:text-rose-200 bg-rose-200/80 dark:bg-rose-900/60">
                          {classOverallStats.totalA}
                        </td>
                        <td className="py-1 px-0.5 border-r border-slate-300 dark:border-slate-700 text-center font-black text-indigo-900 dark:text-indigo-200 bg-indigo-200/80 dark:bg-indigo-900/60">
                          {classOverallStats.totalLN}
                        </td>
                        <td className="py-1 px-0.5 text-center font-black bg-sky-300 dark:bg-sky-900 text-sky-950 dark:text-white">
                          {classOverallStats.avgRate}%
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Legend (If enabled and on last page or single page) */}
              {printSettings.showLegend && isLastPage && (
                <div className="flex flex-wrap items-center gap-3 text-[11px] pt-2 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
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
                  {printSettings.showSundays && (
                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 bg-slate-300 dark:bg-slate-800 px-2 py-0.5 rounded">
                      <strong>Hari Minggu:</strong> Libur Mingguan
                    </span>
                  )}
                </div>
              )}

              {/* Official Signature Area (Signatures on final page) */}
              {printSettings.showSignatures && isLastPage && (
                <div className="pt-4 grid grid-cols-2 text-center text-xs text-slate-800 dark:text-slate-200 gap-8 avoid-break-inside">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala {schoolProfile.name}</p>
                    <div className="h-14" />
                    <p className="font-extrabold underline">{schoolProfile.principalName}</p>
                    <p className="text-[10.5px] text-slate-500 font-mono">
                      NIP. {schoolProfile.principalNip}
                    </p>
                  </div>

                  <div>
                    <p>
                      {printSettings.customCity || (schoolProfile.regency ? schoolProfile.regency.replace(/^(kota|kabupaten|kab\.|kota adm\.)\s*/i, '') : 'Jakarta')}, {signatureFormattedDate}
                    </p>
                    <p className="font-bold">Guru Wali Kelas {activeClass ? activeClass.name : ''}</p>
                    <div className="h-14" />
                    <p className="font-extrabold underline">{activeClass ? activeClass.teacherName : 'Wali Kelas'}</p>
                    <p className="text-[10.5px] text-slate-500 font-mono">
                      NIP. {activeClass ? activeClass.teacherNip : '-'}
                    </p>
                  </div>
                </div>
              )}

              {/* Page Number & Document Footer Meta */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9.5px] text-slate-500 dark:text-slate-400">
                <div>
                  {printSettings.showPrintTimestamp && (
                    <span>
                      Dicetak otomatis melalui Aplikasi Absensi Siswa SD • {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                    </span>
                  )}
                </div>
                <div>
                  {printSettings.showPageNumbers && (
                    <span className="font-bold">
                      Halaman {pageIndex + 1} dari {totalPages} ({printSettings.paperSize} {printSettings.orientation})
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Page Setup Configuration Modal */}
      <PrintPageSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={printSettings}
        onChangeSettings={(newSettings) => setPrintSettings(newSettings)}
        onPrintNow={handlePrint}
        totalStudents={classStudents.length}
      />
    </div>
  );
};
