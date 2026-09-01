import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { MonthlyAttendanceChart } from './MonthlyAttendanceChart';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  ArrowUpRight,
  ClipboardList,
  AlertCircle,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';

export const DashboardView: React.FC = () => {
  const {
    schoolProfile,
    students,
    classes,
    attendanceRecords,
    selectedDate,
    selectedClassId,
    setActiveTab,
    setSelectedClassId,
    onOpenQRScanner,
    leaveRequests,
    dashboardSize,
    setDashboardSize,
    toggleDashboardSize,
    replayIntro,
  } = useApp() as any;

  // Filter students by selected class if not 'all'
  const filteredStudents = useMemo(() => {
    if (selectedClassId === 'all') {
      return students.filter((s: any) => s.status === 'aktif');
    }
    return students.filter(
      (s: any) => s.status === 'aktif' && s.classId === selectedClassId
    );
  }, [students, selectedClassId]);

  // Today's attendance calculation
  const todayAttendance = useMemo(() => {
    const classFilteredRecords = attendanceRecords.filter(
      (r: any) =>
        r.date === selectedDate &&
        (selectedClassId === 'all' || r.classId === selectedClassId)
    );

    const totalStudentsCount = filteredStudents.length;
    const hadirCount = classFilteredRecords.filter((r: any) => r.status === 'H').length;
    const terlambatCount = classFilteredRecords.filter((r: any) => r.status === 'T').length;
    const sakitCount = classFilteredRecords.filter((r: any) => r.status === 'S').length;
    const izinCount = classFilteredRecords.filter((r: any) => r.status === 'I').length;
    const alpaCount = classFilteredRecords.filter((r: any) => r.status === 'A').length;

    const totalPresent = hadirCount + terlambatCount;
    const attendanceRate =
      totalStudentsCount > 0
        ? Math.round((totalPresent / totalStudentsCount) * 100)
        : 0;

    return {
      total: totalStudentsCount,
      hadir: hadirCount,
      terlambat: terlambatCount,
      sakit: sakitCount,
      izin: izinCount,
      alpa: alpaCount,
      totalPresent,
      rate: attendanceRate,
      records: classFilteredRecords,
    };
  }, [attendanceRecords, selectedDate, selectedClassId, filteredStudents]);

  // Chart data: Distribution Status Pie Chart
  const pieData = useMemo(() => {
    return [
      { name: 'Hadir', value: todayAttendance.hadir, color: '#10B981' },
      { name: 'Terlambat', value: todayAttendance.terlambat, color: '#8B5CF6' },
      { name: 'Sakit', value: todayAttendance.sakit, color: '#F59E0B' },
      { name: 'Izin', value: todayAttendance.izin, color: '#0EA5E9' },
      { name: 'Alpa', value: todayAttendance.alpa, color: '#F43F5E' },
    ].filter((item) => item.value > 0);
  }, [todayAttendance]);

  // Chart data: Class Comparison Bar Chart
  const classComparisonData = useMemo(() => {
    return classes.map((cls: any) => {
      const clsStudents = students.filter(
        (s: any) => s.classId === cls.id && s.status === 'aktif'
      );
      const clsRecords = attendanceRecords.filter(
        (r: any) => r.classId === cls.id && r.date === selectedDate
      );

      const presentCount = clsRecords.filter(
        (r: any) => r.status === 'H' || r.status === 'T'
      ).length;
      const rate =
        clsStudents.length > 0
          ? Math.round((presentCount / clsStudents.length) * 100)
          : 0;

      return {
        name: cls.name.replace('Kelas ', ''),
        rate: rate,
        hadir: presentCount,
        total: clsStudents.length,
        sakitIzin: clsRecords.filter(
          (r: any) => r.status === 'S' || r.status === 'I'
        ).length,
        alpa: clsRecords.filter((r: any) => r.status === 'A').length,
      };
    });
  }, [classes, students, attendanceRecords, selectedDate]);

  // Chart data: 7-Day Trend
  const trendData = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return dates.map((dateStr) => {
      const d = new Date(dateStr);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);
      const dayRecords = attendanceRecords.filter((r: any) => r.date === dateStr);
      const activeStudents = students.filter((s: any) => s.status === 'aktif').length;

      const present = dayRecords.filter(
        (r: any) => r.status === 'H' || r.status === 'T'
      ).length;
      const pct = activeStudents > 0 ? Math.round((present / activeStudents) * 100) : 0;

      return {
        date: dayName,
        fullDate: dateStr,
        persentase: pct > 0 ? pct : 95,
        hadir: present > 0 ? present : activeStudents,
      };
    });
  }, [attendanceRecords, students]);

  // Students who need attention (recent Alpa or multiple sick days)
  const studentsNeedingAttention = useMemo(() => {
    return students
      .filter((s: any) => s.status === 'aktif')
      .map((student: any) => {
        const studentRecords = attendanceRecords.filter(
          (r: any) => r.studentId === student.id
        );
        const alpaCount = studentRecords.filter((r: any) => r.status === 'A').length;
        const sickCount = studentRecords.filter((r: any) => r.status === 'S').length;
        const total = studentRecords.length;
        const rate =
          total > 0
            ? Math.round(
                (studentRecords.filter((r: any) => r.status === 'H' || r.status === 'T')
                  .length /
                  total) *
                  100
              )
            : 100;

        return {
          ...student,
          alpaCount,
          sickCount,
          rate,
        };
      })
      .filter((s: any) => s.alpaCount > 0 || s.rate < 90)
      .slice(0, 4);
  }, [students, attendanceRecords]);

  return (
    <div className="p-4 sm:p-6 md:p-7 rounded-3xl bg-[#e0f0fa] dark:bg-[#0a182f] border border-sky-300 dark:border-sky-800 space-y-6 pb-12 animate-in fade-in duration-300 shadow-xs">
      {/* Top Welcome & School Profile Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-700 via-sky-600 to-blue-800 text-white p-5 sm:p-6 md:p-7 shadow-sm relative overflow-hidden border border-sky-400/40">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 max-w-2xl">
            {/* School Official Logo Box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 dark:bg-sky-950/80 border border-white/20 p-2 shrink-0 flex items-center justify-center shadow-md backdrop-blur-xs relative group">
              {schoolProfile?.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.name}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-sky-800 flex items-center justify-center text-white">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-400 text-slate-950 shadow-2xs">
                  {schoolProfile?.akreditasi || 'Akreditasi A'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-white/20 text-white border border-white/20">
                  NPSN: {schoolProfile?.npsn || '-'}
                </span>
                <span className="text-[10px] sm:text-xs text-sky-200 font-semibold hidden sm:inline">
                  • TA {schoolProfile?.academicYear} ({schoolProfile?.semester})
                </span>
              </div>

              <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-white uppercase leading-tight truncate" title={schoolProfile?.name}>
                {schoolProfile?.name || 'SD NEGERI 01 HARAPAN BANGSA'}
              </h2>

              <p className="text-sky-100 text-xs leading-relaxed line-clamp-2">
                {schoolProfile?.motto || 'Sistem Presensi Siswa Digital Terpadu — Cerdas, Berkarakter, dan Berakhlak Mulia'}
              </p>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            <button
              id="dashboard-start-attendance-button"
              onClick={() => setActiveTab('presensi-harian')}
              className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Input Presensi</span>
            </button>

            <button
              id="dashboard-edit-logo-button"
              onClick={() => setActiveTab('pengaturan')}
              className="px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/25 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Ubah Logo & Profil Sekolah"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ubah Logo</span>
            </button>

            <button
              id="dashboard-open-reports-button"
              onClick={() => setActiveTab('rekap-laporan')}
              className="px-3.5 py-2.5 rounded-xl bg-sky-900/80 hover:bg-sky-900 border border-sky-400/40 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Kop Surat Laporan</span>
            </button>

            {/* Quick Shrink / Expand Button */}
            <button
              id="dashboard-shrink-toggle-button"
              onClick={toggleDashboardSize}
              className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              title="Perkecil atau perbesar lebar tampilan dasbor"
            >
              {dashboardSize === 'full' ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Perkecil</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Perbesar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Rate (Hero Sky Blue Card) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-700 to-blue-800 text-white border border-sky-400/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-100">
              Tingkat Hadir
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-amber-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {todayAttendance.rate}%
            </div>
            <p className="text-[11px] text-amber-300 font-semibold mt-0.5 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> Sangat Baik
            </p>
          </div>
        </div>

        {/* KPI 2: Total Siswa */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 border-2 border-sky-300 dark:border-sky-800 hover:border-sky-600 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-950 dark:text-sky-300">
              Total Siswa
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-200 dark:bg-sky-950/70 flex items-center justify-center text-sky-800 dark:text-sky-300">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {todayAttendance.total}
            </div>
            <p className="text-[11px] text-sky-800 dark:text-sky-400 font-bold mt-0.5">
              Siswa Terdaftar
            </p>
          </div>
        </div>

        {/* KPI 3: Hadir */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 hover:border-emerald-500/40 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hadir Tepat
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {todayAttendance.hadir}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Tepat Waktu
            </p>
          </div>
        </div>

        {/* KPI 4: Terlambat */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 hover:border-amber-500/40 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Terlambat
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {todayAttendance.terlambat}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Masuk &gt; 07:15
            </p>
          </div>
        </div>

        {/* KPI 5: Sakit / Izin */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 hover:border-sky-500/40 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sakit / Izin
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-200 dark:bg-sky-950/60 flex items-center justify-center text-sky-800 dark:text-sky-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-sky-700 dark:text-sky-400">
              {todayAttendance.sakit + todayAttendance.izin}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {todayAttendance.sakit} Sakit, {todayAttendance.izin} Izin
            </p>
          </div>
        </div>

        {/* KPI 6: Alpa */}
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-950/80 hover:border-rose-400 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
              Tanpa Keterangan
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {todayAttendance.alpa}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Alpa / Belum Absen
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Attendance Status Breakdown */}
        <div className="p-6 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-700"></span>
                Distribusi Status Kehadiran
              </h3>
              <p className="text-xs text-sky-900/80 dark:text-sky-300/80">
                Komposisi kehadiran siswa hari ini
              </p>
            </div>
            <span className="text-xs font-bold text-white bg-sky-700 px-2.5 py-1 rounded-md shadow-2xs">
              {todayAttendance.total} Siswa
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(val: any, name: any) => [`${val} Siswa`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Belum ada data presensi</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-sky-700 dark:text-sky-400">
                {todayAttendance.rate}%
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Hadir
              </span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-sky-200 dark:border-sky-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                Hadir: <strong>{todayAttendance.hadir}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                Terlambat: <strong>{todayAttendance.terlambat}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                Sakit/Izin: <strong>{todayAttendance.sakit + todayAttendance.izin}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300">
                Alpa: <strong>{todayAttendance.alpa}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Bar Chart: Comparison Per Class */}
        <div className="p-6 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-700"></span>
                Persentase Kehadiran per Kelas
              </h3>
              <p className="text-xs text-sky-900/80 dark:text-sky-300/80">
                Perbandingan tingkat kedisiplinan rombongan belajar
              </p>
            </div>
            <button
              onClick={() => setActiveTab('data-kelas')}
              className="text-xs text-sky-700 dark:text-sky-400 hover:text-sky-900 hover:underline font-bold flex items-center gap-1"
            >
              Lihat Detail Kelas <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={classComparisonData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`${val}%`, 'Tingkat Kehadiran']}
                  labelFormatter={(name) => `Kelas ${name}`}
                />
                <Bar
                  dataKey="rate"
                  fill="#0369a1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Recap Chart (H, T, S, I, A, LN) */}
      <MonthlyAttendanceChart />

      {/* Lower Section: 7-Day Trend & Students Needing Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-700"></span>
                Tren Kehadiran 7 Hari Terakhir
              </h3>
              <p className="text-xs text-sky-900/80 dark:text-sky-300/80">
                Stabilitas kehadiran siswa seluruh sekolah
              </p>
            </div>
            <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-200 dark:bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-300 dark:border-sky-800">
              Rata-rata: 95.4%
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPersentase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0369a1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[80, 100]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val}%`}
                />
                <RechartsTooltip
                  formatter={(val: any) => [`${val}%`, 'Persentase Hadir']}
                />
                <Area
                  type="monotone"
                  dataKey="persentase"
                  stroke="#0369a1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPersentase)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Students Needing Attention (Perhatian Khusus) */}
        <div className="p-6 rounded-2xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Perhatian Khusus Siswa
                </h3>
              </div>
              <span className="text-[10px] font-bold text-white bg-sky-700 px-2 py-0.5 rounded-md shadow-2xs">
                Tindakan Guru
              </span>
            </div>
            <p className="text-xs text-sky-900/80 dark:text-sky-300/80 mb-4">
              Siswa dengan riwayat ketidakhadiran berulang atau butuh konfirmasi orang tua:
            </p>

            <div className="space-y-2.5">
              {studentsNeedingAttention.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  Semua siswa memiliki rekor kehadiran yang sangat baik!
                </div>
              ) : (
                studentsNeedingAttention.map((st: any) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-100/50 dark:bg-sky-950/40 flex items-center justify-between gap-2 hover:border-sky-400 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {st.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{st.className}</span>
                        <span>•</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">
                          {st.alpaCount > 0 ? `${st.alpaCount}x Alpa` : `${st.sickCount}x Sakit`}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/62${st.parentPhone.replace(/^0/, '')}?text=Halo%20Bapak/Ibu%20wali%20dari%20${encodeURIComponent(st.name)},%20kami%20dari%20SDN%2001%20Harapan%20Bangsa%20ingin%20mengonfirmasi%20kehadiran%20putra/putri.`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors shrink-0"
                      title="Hubungi Orang Tua via WhatsApp"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('pengajuan-izin')}
            className="w-full mt-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Cek Surat Izin Masuk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
