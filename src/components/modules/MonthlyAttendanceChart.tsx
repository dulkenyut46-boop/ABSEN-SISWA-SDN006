import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  Layers,
  TrendingUp,
  Table as TableIcon,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Info,
  CalendarDays,
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

interface MonthlyStatsItem {
  monthKey: string; // e.g. "2026-01"
  monthNum: number; // 1 - 12
  year: number;
  monthName: string; // "Januari 2026"
  shortName: string; // "Jan"
  hCount: number; // Hadir
  tCount: number; // Terlambat
  sCount: number; // Sakit
  iCount: number; // Izin
  aCount: number; // Alpa
  lnCount: number; // Libur Nasional
  totalPresent: number; // H + T
  totalAbsent: number; // S + I + A
  totalSchoolDaysRecords: number; // H + T + S + I + A
  grandTotal: number; // H + T + S + I + A + LN
  attendanceRate: number; // %
}

export const MonthlyAttendanceChart: React.FC = () => {
  const {
    classes,
    students,
    attendanceRecords,
    setActiveTab,
    setSelectedClassId: setGlobalClassId,
  } = useApp();

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [chartMode, setChartMode] = useState<'stacked' | 'grouped' | 'trend' | 'table'>('stacked');
  const [selectedMonthDetail, setSelectedMonthDetail] = useState<string | null>(null);

  // Month names in Indonesian
  const monthNamesID = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const shortMonthNamesID = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  // Aggregate monthly attendance records
  const monthlyData = useMemo<MonthlyStatsItem[]>(() => {
    // Filter records by selected class if applicable
    const filteredRecords = selectedClassFilter === 'all'
      ? attendanceRecords
      : attendanceRecords.filter((r) => r.classId === selectedClassFilter);

    // Identify all unique months in records (or default standard months for 2026)
    const monthKeyMap = new Map<string, {
      hCount: number;
      tCount: number;
      sCount: number;
      iCount: number;
      aCount: number;
      lnCount: number;
    }>();

    // Default 12 months for 2026 to ensure full continuous year representation
    for (let m = 1; m <= 12; m++) {
      const mStr = m.toString().padStart(2, '0');
      const key = `2026-${mStr}`;
      monthKeyMap.set(key, { hCount: 0, tCount: 0, sCount: 0, iCount: 0, aCount: 0, lnCount: 0 });
    }

    // Populate counts from records
    filteredRecords.forEach((record) => {
      if (!record.date) return;
      const monthKey = record.date.substring(0, 7); // "YYYY-MM"
      if (!monthKeyMap.has(monthKey)) {
        monthKeyMap.set(monthKey, { hCount: 0, tCount: 0, sCount: 0, iCount: 0, aCount: 0, lnCount: 0 });
      }

      const item = monthKeyMap.get(monthKey)!;
      const st = record.status;
      if (st === 'H') item.hCount++;
      else if (st === 'T') item.tCount++;
      else if (st === 'S') item.sCount++;
      else if (st === 'I') item.iCount++;
      else if (st === 'A') item.aCount++;
      else if (st === 'LN') item.lnCount++;
    });

    // Convert map to sorted array
    const sortedKeys = Array.from(monthKeyMap.keys()).sort();

    return sortedKeys.map((key) => {
      const parts = key.split('-');
      const year = parseInt(parts[0], 10) || 2026;
      const monthNum = parseInt(parts[1], 10) || 1;
      const counts = monthKeyMap.get(key)!;

      const totalPresent = counts.hCount + counts.tCount;
      const totalAbsent = counts.sCount + counts.iCount + counts.aCount;
      const totalSchoolDaysRecords = totalPresent + totalAbsent;
      const grandTotal = totalSchoolDaysRecords + counts.lnCount;
      
      const attendanceRate = totalSchoolDaysRecords > 0
        ? Math.min(100, Math.round((totalPresent / totalSchoolDaysRecords) * 100))
        : 0;

      return {
        monthKey: key,
        monthNum,
        year,
        monthName: `${monthNamesID[monthNum - 1] || 'Bulan'} ${year}`,
        shortName: shortMonthNamesID[monthNum - 1] || `${monthNum}`,
        hCount: counts.hCount,
        tCount: counts.tCount,
        sCount: counts.sCount,
        iCount: counts.iCount,
        aCount: counts.aCount,
        lnCount: counts.lnCount,
        totalPresent,
        totalAbsent,
        totalSchoolDaysRecords,
        grandTotal,
        attendanceRate,
      };
    });
  }, [attendanceRecords, selectedClassFilter]);

  // Overall totals across all months
  const overallTotals = useMemo(() => {
    let totalH = 0;
    let totalT = 0;
    let totalS = 0;
    let totalI = 0;
    let totalA = 0;
    let totalLN = 0;

    monthlyData.forEach((m) => {
      totalH += m.hCount;
      totalT += m.tCount;
      totalS += m.sCount;
      totalI += m.iCount;
      totalA += m.aCount;
      totalLN += m.lnCount;
    });

    const totalPresent = totalH + totalT;
    const totalSchoolDays = totalPresent + totalS + totalI + totalA;
    const grandTotal = totalSchoolDays + totalLN;
    const avgRate = totalSchoolDays > 0
      ? Math.min(100, Math.round((totalPresent / totalSchoolDays) * 100))
      : 0;

    return {
      totalH,
      totalT,
      totalS,
      totalI,
      totalA,
      totalLN,
      totalPresent,
      totalSchoolDays,
      grandTotal,
      avgRate,
    };
  }, [monthlyData]);

  // Selected month detail object
  const activeMonthDetail = useMemo(() => {
    if (!selectedMonthDetail) return null;
    return monthlyData.find((m) => m.monthKey === selectedMonthDetail) || null;
  }, [monthlyData, selectedMonthDetail]);

  // Custom rich tooltip for monthly charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthlyStatsItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-sky-500/40 text-xs space-y-2 min-w-[210px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-black text-sky-300 text-sm">{data.monthName}</span>
            <span className="px-2 py-0.5 rounded-md font-extrabold text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {data.attendanceRate}% Hadir
            </span>
          </div>

          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Hadir Tepat (H):
              </span>
              <span className="font-mono font-bold">{data.hCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                Terlambat (T):
              </span>
              <span className="font-mono font-bold">{data.tCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                Sakit (S):
              </span>
              <span className="font-mono font-bold">{data.sCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sky-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-500 inline-block"></span>
                Izin (I):
              </span>
              <span className="font-mono font-bold">{data.iCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                Alpa (A):
              </span>
              <span className="font-mono font-bold">{data.aCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                Libur Nasional (LN):
              </span>
              <span className="font-mono font-bold">{data.lnCount}</span>
            </div>
          </div>

          <div className="border-t border-slate-700/80 pt-1.5 flex items-center justify-between text-[11px] text-slate-300">
            <span>Total Catatan:</span>
            <span className="font-black text-white font-mono">{data.grandTotal}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const selectedClassName = classes.find((c) => c.id === selectedClassFilter)?.name || 'Semua Kelas';

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-900/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Grafik Rekapitulasi Presensi Bulanan
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  H, T, S, I, A, LN
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Akumulasi total kehadiran siswa setiap bulannya pada tahun pelajaran berjalan ({selectedClassName})
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Display Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setChartMode('stacked')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'stacked'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Komposisi Bertumpuk (Stacked Bar)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bertumpuk</span>
            </button>

            <button
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'grouped'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Perbandingan Kolom (Grouped Bar)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Kolom</span>
            </button>

            <button
              onClick={() => setChartMode('trend')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'trend'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Grafik Tren Persentase"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tren %</span>
            </button>

            <button
              onClick={() => setChartMode('table')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                chartMode === 'table'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Tabel Rekapitulasi Data"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6-Card Overall Total Metrics for H, T, S, I, A, LN */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Total Hadir (H)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{overallTotals.totalH}</div>
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium">Tepat Waktu</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Terlambat (T)</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-purple-700 dark:text-purple-400">{overallTotals.totalT}</div>
            <p className="text-[10px] text-purple-600/80 dark:text-purple-400/80 font-medium">Masuk &gt; 07:15</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Sakit (S)</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-amber-700 dark:text-amber-400">{overallTotals.totalS}</div>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium">Surat Dokter</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">Izin (I)</span>
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-sky-700 dark:text-sky-400">{overallTotals.totalI}</div>
            <p className="text-[10px] text-sky-600/80 dark:text-sky-400/80 font-medium">Permohonan Izin</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">Alpa (A)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-rose-700 dark:text-rose-400">{overallTotals.totalA}</div>
            <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 font-medium">Tanpa Berita</p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">Libur (LN)</span>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-black text-indigo-700 dark:text-indigo-400">{overallTotals.totalLN}</div>
            <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium">Libur Nasional</p>
          </div>
        </div>

        {/* Overall Percentage */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-700 to-blue-800 text-white border border-sky-400/40 col-span-2 sm:col-span-3 lg:col-span-1 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-100">Rata-rata %</span>
            <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white">{overallTotals.avgRate}%</div>
            <p className="text-[10px] text-sky-200 font-medium">Tingkat Hadir</p>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="pt-2">
        {chartMode === 'stacked' && (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length) {
                    setSelectedMonthDetail(data.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Bar dataKey="hCount" name="Hadir (H)" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="tCount" name="Terlambat (T)" stackId="a" fill="#8B5CF6" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="sCount" name="Sakit (S)" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="iCount" name="Izin (I)" stackId="a" fill="#0EA5E9" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="aCount" name="Alpa (A)" stackId="a" fill="#F43F5E" radius={[0, 0, 0, 0]} maxBarSize={36} />
                <Bar dataKey="lnCount" name="Libur (LN)" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartMode === 'grouped' && (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload.length) {
                    setSelectedMonthDetail(data.activePayload[0].payload.monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                />
                <Bar dataKey="hCount" name="Hadir (H)" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="tCount" name="Terlambat (T)" fill="#8B5CF6" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="sCount" name="Sakit (S)" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="iCount" name="Izin (I)" fill="#0EA5E9" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="aCount" name="Alpa (A)" fill="#F43F5E" radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="lnCount" name="Libur (LN)" fill="#6366F1" radius={[3, 3, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartMode === 'trend' && (
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMonthlyRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="shortName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="attendanceRate"
                  name="% Kehadiran"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorMonthlyRate)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Bulan</th>
                  <th className="py-2.5 px-2 text-center text-emerald-700 dark:text-emerald-400">Hadir (H)</th>
                  <th className="py-2.5 px-2 text-center text-purple-700 dark:text-purple-400">Terlambat (T)</th>
                  <th className="py-2.5 px-2 text-center text-amber-700 dark:text-amber-400">Sakit (S)</th>
                  <th className="py-2.5 px-2 text-center text-sky-700 dark:text-sky-400">Izin (I)</th>
                  <th className="py-2.5 px-2 text-center text-rose-700 dark:text-rose-400">Alpa (A)</th>
                  <th className="py-2.5 px-2 text-center text-indigo-700 dark:text-indigo-400">Libur (LN)</th>
                  <th className="py-2.5 px-2 text-center">Total Catatan</th>
                  <th className="py-2.5 px-3 text-center bg-sky-100 dark:bg-slate-700">% Hadir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {monthlyData.map((m) => (
                  <tr
                    key={m.monthKey}
                    className="hover:bg-sky-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                      {m.monthName}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {m.hCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-400">
                      {m.tCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                      {m.sCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-sky-700 dark:text-sky-400">
                      {m.iCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-rose-700 dark:text-rose-400">
                      {m.aCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-indigo-700 dark:text-indigo-400">
                      {m.lnCount}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {m.grandTotal}
                    </td>
                    <td className="py-2 px-3 text-center font-black bg-sky-50/80 dark:bg-slate-800 text-sky-800 dark:text-sky-300">
                      {m.attendanceRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-sky-100/80 dark:bg-slate-800 font-black border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                <tr>
                  <td className="py-2.5 px-3 uppercase text-[11px]">Total Keseluruhan</td>
                  <td className="py-2.5 px-2 text-center font-mono text-emerald-800 dark:text-emerald-300">{overallTotals.totalH}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-purple-800 dark:text-purple-300">{overallTotals.totalT}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-amber-800 dark:text-amber-300">{overallTotals.totalS}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-sky-800 dark:text-sky-300">{overallTotals.totalI}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-rose-800 dark:text-rose-300">{overallTotals.totalA}</td>
                  <td className="py-2.5 px-2 text-center font-mono text-indigo-800 dark:text-indigo-300">{overallTotals.totalLN}</td>
                  <td className="py-2.5 px-2 text-center font-mono">{overallTotals.grandTotal}</td>
                  <td className="py-2.5 px-3 text-center bg-sky-200 dark:bg-slate-700 font-black">{overallTotals.avgRate}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Footer Navigation Link to Full Reports */}
      <div className="pt-3 border-t border-sky-100 dark:border-sky-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          <span>Klik salah satu batang grafik atau tombol di samping untuk mencetak rekap lengkap per bulan.</span>
        </div>

        <button
          onClick={() => {
            if (selectedClassFilter !== 'all') {
              setGlobalClassId(selectedClassFilter);
            }
            setActiveTab('rekap-laporan');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Buka Rekap & Laporan Lengkap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
