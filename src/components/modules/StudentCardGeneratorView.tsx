import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Printer,
  Layers,
  School,
  Sparkles,
  CheckCircle,
  Search,
  Scissors,
  HelpCircle,
  SlidersHorizontal,
  FileText,
  User,
  ShieldCheck,
  Palette,
  Eye,
  X,
  BookOpen,
} from 'lucide-react';
import { Student } from '../../types';

type CardTheme = 'maroon' | 'blue' | 'green' | 'navy';
type PrintSideMode = 'front_only' | 'back_only' | 'front_back_pair';

export const StudentCardGeneratorView: React.FC = () => {
  const { students, classes, schoolProfile, selectedClassId, setSelectedClassId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [cardTheme, setCardTheme] = useState<CardTheme>('maroon');
  const [printSideMode, setPrintSideMode] = useState<PrintSideMode>('front_back_pair');
  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const [showPrintGuideModal, setShowPrintGuideModal] = useState<boolean>(false);

  // Single card print modal / focused print target
  const [singlePrintStudent, setSinglePrintStudent] = useState<Student | null>(null);

  // Filter students based on class, specific student, and search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
      const matchStudent = selectedStudentId === 'all' || s.id === selectedStudentId;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery);
      return matchClass && matchStudent && matchSearch && s.status === 'aktif';
    });
  }, [students, selectedClassId, selectedStudentId, searchQuery]);

  // Theme color maps for authentic school branding
  const themeStyles = useMemo(() => {
    switch (cardTheme) {
      case 'blue':
        return {
          primaryBg: 'bg-blue-900',
          primaryBorder: 'border-blue-950',
          accentBg: 'bg-blue-800',
          accentText: 'text-blue-700',
          badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
          headerGradient: 'from-blue-900 via-blue-800 to-blue-950',
          stampColor: 'text-blue-700 border-blue-700',
          tagBg: 'bg-sky-500 text-white',
        };
      case 'green':
        return {
          primaryBg: 'bg-emerald-900',
          primaryBorder: 'border-emerald-950',
          accentBg: 'bg-emerald-800',
          accentText: 'text-emerald-700',
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          headerGradient: 'from-emerald-900 via-emerald-800 to-emerald-950',
          stampColor: 'text-emerald-700 border-emerald-700',
          tagBg: 'bg-emerald-600 text-white',
        };
      case 'navy':
        return {
          primaryBg: 'bg-slate-900',
          primaryBorder: 'border-slate-950',
          accentBg: 'bg-slate-800',
          accentText: 'text-slate-800',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-300',
          headerGradient: 'from-slate-900 via-slate-800 to-slate-950',
          stampColor: 'text-slate-700 border-slate-700',
          tagBg: 'bg-indigo-600 text-white',
        };
      case 'maroon':
      default:
        return {
          primaryBg: 'bg-[#4a0404]',
          primaryBorder: 'border-[#380303]',
          accentBg: 'bg-[#5c0606]',
          accentText: 'text-[#4a0404]',
          badgeBg: 'bg-rose-50 text-[#4a0404] border-rose-200',
          headerGradient: 'from-[#4a0404] via-[#5c0606] to-[#380303]',
          stampColor: 'text-[#4a0404] border-[#4a0404]',
          tagBg: 'bg-amber-400 text-stone-950',
        };
    }
  }, [cardTheme]);

  // Execute system print dialog
  const handlePrintAll = () => {
    setSinglePrintStudent(null);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Print specific single student card
  const handlePrintSingle = (student: Student) => {
    setSinglePrintStudent(student);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Students to render in print layout (either all filtered, or single targeted student)
  const studentsToRender = useMemo(() => {
    if (singlePrintStudent) {
      return [singlePrintStudent];
    }
    return filteredStudents;
  }, [singlePrintStudent, filteredStudents]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Filter & Toolbar (Hidden during browser print) */}
      <div className="no-print p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#4a0404] dark:text-rose-400 border border-rose-200/60 dark:border-rose-900">
                <QrCode className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Cetak Kartu Pelajar & Barcode Presensi Digital
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Format standar ID Card (85.6 × 54 mm) dengan QR Code presensi valid, biodata lengkap, dan sisi belakang resmi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              id="print-guide-button"
              type="button"
              onClick={() => setShowPrintGuideModal(true)}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-stone-500" />
              <span>Panduan Cetak A4</span>
            </button>

            <button
              id="print-student-cards-btn"
              type="button"
              onClick={handlePrintAll}
              disabled={filteredStudents.length === 0}
              className="px-4 py-2 bg-[#4a0404] hover:bg-[#380303] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {filteredStudents.length} Kartu (Print / PDF)</span>
            </button>
          </div>
        </div>

        {/* Configuration Controls Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
          {/* Class Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              Filter Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('all');
              }}
              className="p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Kelas ({students.length} Siswa)</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <User className="w-3 h-3" />
              Pilih Siswa Tertentu
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Semua Siswa Terpilih</option>
              {students
                .filter((s) => selectedClassId === 'all' || s.classId === selectedClassId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nisn}) - {s.className}
                  </option>
                ))}
            </select>
          </div>

          {/* Print Side Mode Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Format Sisi Kartu
            </label>
            <select
              value={printSideMode}
              onChange={(e) => setPrintSideMode(e.target.value as PrintSideMode)}
              className="p-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-hidden cursor-pointer"
            >
              <option value="front_back_pair">Depan & Belakang (Siap Lipat)</option>
              <option value="front_only">Hanya Sisi Depan</option>
              <option value="back_only">Hanya Sisi Belakang</option>
            </select>
          </div>

          {/* Card Theme Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              Warna Tema Kartu
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 h-[38px]">
              <button
                type="button"
                onClick={() => setCardTheme('maroon')}
                className={`flex-1 h-full rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cardTheme === 'maroon'
                    ? 'bg-[#4a0404] text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Merah Maroon SD"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Maroon</span>
              </button>
              <button
                type="button"
                onClick={() => setCardTheme('blue')}
                className={`flex-1 h-full rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cardTheme === 'blue'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Biru Kemdikbud"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Biru</span>
              </button>
              <button
                type="button"
                onClick={() => setCardTheme('green')}
                className={`flex-1 h-full rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cardTheme === 'green'
                    ? 'bg-emerald-900 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Hijau MI / Madrasah"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Hijau</span>
              </button>
              <button
                type="button"
                onClick={() => setCardTheme('navy')}
                className={`flex-1 h-full rounded-lg text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  cardTheme === 'navy'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Navy Elegan"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                <span>Navy</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Toggle options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800 text-xs">
          <div className="relative w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NISN, atau NIS..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-600 dark:text-stone-400 select-none">
              <input
                type="checkbox"
                checked={showCropMarks}
                onChange={(e) => setShowCropMarks(e.target.checked)}
                className="rounded border-stone-300 text-[#4a0404] focus:ring-[#4a0404] cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5 text-stone-500" />
                Garis Panduan Potong (Crop Marks)
              </span>
            </label>

            <span className="text-stone-400">•</span>

            <div className="text-stone-600 dark:text-stone-400 font-semibold">
              Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} siswa aktif
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div
        id="printable-student-cards-sheet"
        className="print-container bg-stone-100/60 dark:bg-stone-950 p-4 md:p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800"
      >
        {/* On-screen Title Notice (Hidden in print) */}
        <div className="no-print mb-4 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>
              Preview Lembar Cetak ID Card — Rasio & dimensi (85.6 × 54 mm) disesuaikan persis untuk ukuran kertas A4.
            </span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">
            Skala 100%
          </span>
        </div>

        {/* Cards Print Grid */}
        <div
          className={`student-cards-print-grid ${
            printSideMode === 'front_back_pair' ? 'foldable-mode' : 'single-card-mode'
          } grid grid-cols-1 md:grid-cols-2 gap-6`}
        >
          {studentsToRender.map((student) => {
            return (
              <React.Fragment key={student.id}>
                {/* 1. FRONT SIDE (Sisi Depan) */}
                {(printSideMode === 'front_only' || printSideMode === 'front_back_pair') && (
                  <div
                    className={`student-card-item relative bg-white text-stone-900 rounded-[10px] border border-stone-300 shadow-sm flex flex-col justify-between overflow-hidden ${
                      showCropMarks ? 'crop-guide-print' : ''
                    }`}
                    style={{
                      width: '100%',
                      maxWidth: '340px',
                      height: '214px',
                      margin: '0 auto',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {/* Background Subtle Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
                      <School className="w-40 h-40 text-stone-900" />
                    </div>

                    {/* Official Card Header */}
                    <div
                      className={`relative z-10 ${themeStyles.headerGradient} bg-gradient-to-r text-white px-3 py-1.5 flex items-center justify-between border-b border-black/10`}
                    >
                      <div className="flex items-center gap-2">
                        {/* School Icon Emblem */}
                        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-amber-300 font-black shrink-0 shadow-xs">
                          <School className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[7px] tracking-wider uppercase font-semibold text-white/80 leading-none">
                            {schoolProfile.regency ? schoolProfile.regency.toUpperCase() : 'DINAS PENDIDIKAN'}
                          </div>
                          <h4 className="font-extrabold text-[10px] uppercase tracking-tight truncate leading-tight text-white mt-0.5">
                            {schoolProfile.name}
                          </h4>
                          <div className="text-[6.5px] text-white/90 font-mono flex items-center gap-1.5">
                            <span>NPSN: {schoolProfile.npsn}</span>
                            <span>•</span>
                            <span>Akreditasi: {schoolProfile.akreditasi || 'A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 pl-1">
                        <span className={`text-[7.5px] font-black uppercase px-1.5 py-0.5 rounded-sm ${themeStyles.tagBg} shadow-2xs`}>
                          KARTU PELAJAR
                        </span>
                        <span className="text-[6.5px] font-bold text-white/80 font-mono mt-0.5">
                          TA {schoolProfile.academicYear}
                        </span>
                      </div>
                    </div>

                    {/* Card Body: Photo, Bio, & Scannable QR */}
                    <div className="relative z-10 px-3 py-2 flex items-center justify-between gap-2.5 flex-1">
                      {/* Student Photo 3x4 */}
                      <div className="flex flex-col items-center shrink-0">
                        <div
                          className={`w-[66px] h-[82px] rounded-lg border-2 ${
                            student.gender === 'L' ? 'bg-blue-600/90 border-blue-700' : 'bg-rose-600/90 border-rose-700'
                          } flex flex-col items-center justify-center text-white relative shadow-xs overflow-hidden`}
                        >
                          <div className="text-3xl filter drop-shadow">
                            {student.gender === 'L' ? '👦' : '👧'}
                          </div>
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[6.5px] font-bold text-center py-0.5 text-white uppercase tracking-wider">
                            {student.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                          </div>
                        </div>
                        <span className="text-[6.5px] font-mono font-bold text-stone-500 mt-1">
                          PASFOTO 3X4
                        </span>
                      </div>

                      {/* Student Bio Details */}
                      <div className="flex-1 min-w-0 space-y-1 text-[9.5px]">
                        <div>
                          <span className="text-[7px] text-stone-400 block font-bold uppercase tracking-wider">
                            Nama Lengkap
                          </span>
                          <p className="font-extrabold text-stone-900 text-[11px] leading-tight truncate">
                            {student.name}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <span className="text-[7px] text-stone-400 block font-semibold uppercase">
                              NISN
                            </span>
                            <p className="font-mono font-bold text-stone-900 text-[9px] bg-stone-100 px-1 py-0.5 rounded inline-block">
                              {student.nisn}
                            </p>
                          </div>
                          <div>
                            <span className="text-[7px] text-stone-400 block font-semibold uppercase">
                              NIS
                            </span>
                            <p className="font-mono font-bold text-stone-800 text-[9px]">
                              {student.nis}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-1">
                          <div>
                            <span className="text-[7px] text-stone-400 block font-semibold uppercase">
                              Kelas
                            </span>
                            <p className={`font-black text-[9.5px] ${themeStyles.accentText}`}>
                              {student.className}
                            </p>
                          </div>
                          <div>
                            <span className="text-[7px] text-stone-400 block font-semibold uppercase">
                              Tgl Lahir
                            </span>
                            <p className="font-medium text-stone-700 text-[8.5px] truncate">
                              {student.birthDate}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Scannable QR Code */}
                      <div className="flex flex-col items-center justify-center shrink-0 bg-white p-1 rounded-lg border border-stone-300 shadow-2xs">
                        <QRCodeSVG
                          value={student.nisn || student.id}
                          size={54}
                          level="M"
                          includeMargin={false}
                          className="w-[54px] h-[54px]"
                        />
                        <span className="text-[6.5px] font-mono font-extrabold text-stone-800 mt-0.5 tracking-tighter">
                          QR PRESENSI
                        </span>
                      </div>
                    </div>

                    {/* Card Footer with 1D Barcode Pattern */}
                    <div className="relative z-10 bg-stone-50 px-3 py-1 border-t border-stone-200 flex items-center justify-between text-[7.5px] text-stone-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black tracking-widest text-[8px] text-stone-800 select-none">
                          ||| | | || ||| || ||| | |||
                        </span>
                        <span className="font-mono font-semibold text-stone-600">
                          {student.nisn}
                        </span>
                      </div>
                      <span className="font-bold text-stone-700">
                        Berlaku: Siswa Aktif
                      </span>
                    </div>

                    {/* Single Print Button (On Screen Only) */}
                    <div className="no-print absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handlePrintSingle(student)}
                        title="Cetak Kartu Siswa Ini"
                        className="p-1 rounded-md bg-white shadow-md text-stone-700 hover:text-stone-900 border border-stone-300 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. BACK SIDE (Sisi Belakang dengan Tata Tertib & Pengesahan) */}
                {(printSideMode === 'back_only' || printSideMode === 'front_back_pair') && (
                  <div
                    className={`student-card-item relative bg-white text-stone-900 rounded-[10px] border border-stone-300 shadow-sm flex flex-col justify-between overflow-hidden ${
                      showCropMarks ? 'crop-guide-print' : ''
                    }`}
                    style={{
                      width: '100%',
                      maxWidth: '340px',
                      height: '214px',
                      margin: '0 auto',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    {/* Header Back Side */}
                    <div
                      className={`relative z-10 ${themeStyles.accentBg} text-white px-3 py-1 text-center font-extrabold text-[8.5px] uppercase tracking-wider border-b border-black/10`}
                    >
                      KETENTUAN & TATA TERTIB KARTU PELAJAR
                    </div>

                    {/* Body Back Side: Rules & Official Endorsement */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between text-[7.5px] space-y-1.5">
                      {/* Rules List */}
                      <ol className="list-decimal pl-3 space-y-0.5 text-stone-700 leading-tight text-[7.2px]">
                        <li>Kartu ini adalah identitas resmi siswa <strong>{schoolProfile.name}</strong>.</li>
                        <li>Wajib dibawa setiap hari masuk sekolah untuk pencatatan presensi digital.</li>
                        <li>Dilarang merusak, mencoret, atau memindahtangankan kartu kepada pihak lain.</li>
                        <li>Kehilangan atau kerusakan kartu harap segera melapor ke pihak sekolah/wali kelas.</li>
                        <li>Bila menemukan kartu ini, mohon dikembalikan ke alamat sekolah tertera.</li>
                      </ol>

                      {/* Official Signature & Seal Box */}
                      <div className="pt-1 border-t border-stone-200 grid grid-cols-2 gap-2 items-end">
                        {/* School Info / Contact */}
                        <div className="text-[6.8px] text-stone-500 leading-tight space-y-0.5">
                          <p className="font-bold text-stone-800">{schoolProfile.name}</p>
                          <p className="truncate">{schoolProfile.address}</p>
                          <p>Telp: {schoolProfile.phone} • {schoolProfile.email}</p>
                        </div>

                        {/* Signature & Digital Stamp */}
                        <div className="text-center relative flex flex-col items-center">
                          <p className="text-[7px] text-stone-600 font-medium">
                            {schoolProfile.regency ? schoolProfile.regency.replace(/^(kota|kabupaten|kab\.|kota adm\.)\s*/i, '') : 'Jakarta'}, 15 Juli 2026
                          </p>
                          <p className="text-[7.5px] font-bold text-stone-800">
                            Kepala Sekolah,
                          </p>

                          {/* Digital Round School Stamp Simulation */}
                          <div className="relative w-full h-8 flex items-center justify-center my-0.5">
                            <div
                              className={`absolute -left-1 -top-1 w-10 h-10 rounded-full border-2 border-dashed ${themeStyles.stampColor} opacity-75 flex items-center justify-center text-[5px] font-black uppercase text-center rotate-[-12deg] pointer-events-none`}
                            >
                              <div className="leading-none scale-75">
                                ★ DINAS ★
                                <br />
                                {schoolProfile.name.slice(0, 10)}
                              </div>
                            </div>

                            {/* Stylized Digital Signature Graphic */}
                            <svg className="w-16 h-7 text-blue-900 opacity-90" viewBox="0 0 100 40">
                              <path
                                d="M10 25 Q 25 5, 40 20 T 60 15 T 80 25 T 95 10"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <p className="text-[7.5px] font-extrabold text-stone-900 underline leading-none">
                            {schoolProfile.principalName}
                          </p>
                          <p className="text-[6.5px] text-stone-500 font-mono mt-0.5">
                            NIP. {schoolProfile.principalNip}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="bg-stone-100 px-3 py-0.5 border-t border-stone-200 text-center text-[6.5px] text-stone-500 font-medium">
                      Sistem Presensi & Kartu Siswa Digital • {schoolProfile.website || 'sdn.sch.id'}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Print Setup Guide Modal */}
      {showPrintGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-white text-sm">
                    Panduan & Tips Cetak Kartu Pelajar
                  </h3>
                  <p className="text-xs text-stone-500">
                    Petunjuk agar hasil cetakan kartu presisi, tajam, dan siap pakai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintGuideModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 space-y-1.5">
                <div className="font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  1. Pengaturan Dialog Cetak (Browser / PDF):
                </div>
                <ul className="list-disc pl-5 space-y-1 text-stone-600 dark:text-stone-400">
                  <li><strong>Ukuran Kertas:</strong> Pilih <strong>A4</strong> atau <strong>Letter</strong>.</li>
                  <li><strong>Skala (Scale):</strong> Pilih <strong>100%</strong> / <strong>Default</strong> (jangan pilih "Fit to page" agar ukuran kartu tetap presisi 85.6 × 54 mm).</li>
                  <li><strong>Margin:</strong> Pilih <strong>Default</strong> atau <strong>Minimum</strong>.</li>
                  <li><strong>Opsi Grafis Latar Belakang:</strong> <em>Centang (Wajib)</em> pilihan <strong>"Background Graphics" / "Grafik Latar Belakang"</strong> agar warna kartu dan stempel tercetak utuh.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-1.5">
                <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  2. Rekomendasi Kertas & Finishing:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-300">
                  <li><strong>Metode Lipat & Laminasi:</strong> Cetak pada kertas Art Paper 210/230 gsm atau kertas foto glossy, lalu lipat sisi depan-belakang dan masukkan ke plastik laminating ID Card.</li>
                  <li><strong>Metode Kertas PVC Instan:</strong> Cetak langsung pada lembar PVC ID Card untuk hasil tebal seperti kartu ATM.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPrintGuideModal(false);
                  handlePrintAll();
                }}
                className="px-4 py-2 bg-[#4a0404] hover:bg-[#380303] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Mulai Cetak Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

