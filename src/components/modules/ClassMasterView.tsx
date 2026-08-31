import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { ClassRoom } from '../../types';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Users,
  Building,
  UserCheck,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Download,
  FileUp,
  FileSpreadsheet,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Check,
  HelpCircle,
} from 'lucide-react';
import {
  downloadClassTemplate,
  exportClassesToExcel,
  parseExcelFile,
} from '../../utils/excelHelpers';

interface ParsedClassItem {
  name: string;
  grade: number;
  teacherName: string;
  teacherNip: string;
  roomNumber: string;
  academicYear: string;
  isValid: boolean;
  errors: string[];
  isExisting: boolean;
}

export const ClassMasterView: React.FC = () => {
  const {
    classes,
    students,
    attendanceRecords,
    schoolProfile,
    addClass,
    updateClass,
    deleteClass,
    batchImportClasses,
    setActiveTab,
    setSelectedClassId,
    addToast,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [deletingClass, setDeletingClass] = useState<ClassRoom | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Quick Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isParsingImport, setIsParsingImport] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [parsedClasses, setParsedClasses] = useState<ParsedClassItem[]>([]);
  const [overwriteOnImport, setOverwriteOnImport] = useState(true);

  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Existing classes set for matching
  const existingClassMap = new Map<string, string>();
  classes.forEach((c) => existingClassMap.set(c.name.toLowerCase().trim(), c.id));

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    teacherName: '',
    teacherNip: '',
    roomNumber: '',
    academicYear: '2025/2026',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      grade: 1,
      teacherName: '',
      teacherNip: '',
      roomNumber: '',
      academicYear: schoolProfile.academicYear || '2025/2026',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: cls.grade,
      teacherName: cls.teacherName,
      teacherNip: cls.teacherNip || '',
      roomNumber: cls.roomNumber || '',
      academicYear: cls.academicYear,
    });
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.teacherName.trim()) return;

    addClass(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !formData.name.trim()) return;

    updateClass(editingClass.id, formData);
    setEditingClass(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingClass) return;
    deleteClass(deletingClass.id);
    setDeletingClass(null);
  };

  // Helper to extract value from dynamic key variations
  const getVal = (row: any, ...keys: string[]) => {
    for (const key of keys) {
      const cleanTarget = key.toLowerCase().replace(/[\*\_\-\s\(\)\/]/g, '');
      const matchedKey = Object.keys(row).find((k) =>
        k.toLowerCase().replace(/[\*\_\-\s\(\)\/]/g, '').includes(cleanTarget)
      );
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  // Handle file reading for class import
  const handleImportFileSelect = async (file: File) => {
    setImportFile(file);
    setIsParsingImport(true);

    try {
      const parsed = await parseExcelFile(file);
      if (!parsed.data || parsed.data.length === 0) {
        addToast({
          type: 'warning',
          title: 'File Kosong',
          message: 'Tidak ada baris data yang ditemukan pada file Excel.',
        });
        setParsedClasses([]);
        setIsParsingImport(false);
        return;
      }

      const validated: ParsedClassItem[] = parsed.data.map((row: any, idx: number) => {
        const rawName = getVal(row, 'namakelas', 'kelas', 'rombel', 'nama rombel', 'class') || `Kelas ${idx + 1}A`;
        const name = rawName.startsWith('Kelas ') ? rawName : `Kelas ${rawName}`;

        const rawGrade = getVal(row, 'tingkat', 'jenjang', 'grade', 'tingkat16');
        let grade = 1;
        if (rawGrade) {
          const num = Number(rawGrade.replace(/\D/g, ''));
          if (!isNaN(num) && num >= 1 && num <= 6) grade = num;
        } else {
          const match = name.match(/\d+/);
          if (match) grade = Math.min(6, Math.max(1, Number(match[0])));
        }

        const teacherName = getVal(row, 'namawalikelas', 'walikelas', 'guru', 'namaguru', 'wali', 'homeroom') || 'Wali Kelas';
        const teacherNip = getVal(row, 'nipwalikelas', 'nipguru', 'nip', 'nipwali') || '-';
        const roomNumber = getVal(row, 'nomorruangan', 'ruangkelas', 'ruangan', 'ruang', 'room') || `R. 10${idx + 1}`;
        const academicYear = getVal(row, 'tahunajaran', 'tahunpelajaran', 'tapel', 'academic') || schoolProfile.academicYear || '2025/2026';

        const errors: string[] = [];
        if (!name || name === 'Kelas ') errors.push('Nama Kelas wajib diisi');
        if (!teacherName || teacherName.trim() === '') errors.push('Nama Wali Kelas wajib diisi');
        if (grade < 1 || grade > 6) errors.push('Tingkat harus antara 1 sampai 6');

        const isExisting = existingClassMap.has(name.toLowerCase().trim());

        return {
          name,
          grade,
          teacherName,
          teacherNip,
          roomNumber,
          academicYear,
          isValid: errors.length === 0,
          errors,
          isExisting,
        };
      });

      setParsedClasses(validated);
      addToast({
        type: 'info',
        title: 'File Terbaca',
        message: `${validated.length} rombel kelas siap divalidasi dan diimpor.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membaca File',
        message: err.message || 'File Excel tidak sesuai format.',
      });
      setParsedClasses([]);
    } finally {
      setIsParsingImport(false);
    }
  };

  // Load sample demo classes
  const handleLoadDemoClasses = () => {
    const demoClasses: ParsedClassItem[] = [
      {
        name: 'Kelas 1A',
        grade: 1,
        teacherName: 'Ibu Ratna Dewi, S.Pd.',
        teacherNip: '19850412 201001 2 015',
        roomNumber: 'R. 101',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 1a'),
      },
      {
        name: 'Kelas 1B',
        grade: 1,
        teacherName: 'Bapak Ahmad Fauzi, S.Pd.',
        teacherNip: '19870823 201201 1 009',
        roomNumber: 'R. 102',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 1b'),
      },
      {
        name: 'Kelas 2A',
        grade: 2,
        teacherName: 'Ibu Sri Wahyuni, S.Pd.',
        teacherNip: '19820115 200801 2 011',
        roomNumber: 'R. 103',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 2a'),
      },
      {
        name: 'Kelas 2B',
        grade: 2,
        teacherName: 'Bapak Bambang Sutrisno, M.Pd.',
        teacherNip: '19790310 200501 1 008',
        roomNumber: 'R. 104',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 2b'),
      },
      {
        name: 'Kelas 3A',
        grade: 3,
        teacherName: 'Ibu Tri Hastuti, S.Pd.',
        teacherNip: '19890614 201402 2 004',
        roomNumber: 'R. 201',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 3a'),
      },
      {
        name: 'Kelas 4A',
        grade: 4,
        teacherName: 'Bapak Hendra Gunawan, S.Pd.',
        teacherNip: '19841120 200903 1 012',
        roomNumber: 'R. 202',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 4a'),
      },
      {
        name: 'Kelas 5A',
        grade: 5,
        teacherName: 'Ibu Nur Hidayati, S.Pd.SD',
        teacherNip: '19810507 200604 2 019',
        roomNumber: 'R. 203',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 5a'),
      },
      {
        name: 'Kelas 6A',
        grade: 6,
        teacherName: 'Bapak Eko Prasetyo, M.Pd.',
        teacherNip: '19760815 200212 1 005',
        roomNumber: 'R. 204',
        academicYear: schoolProfile.academicYear || '2025/2026',
        isValid: true,
        errors: [],
        isExisting: existingClassMap.has('kelas 6a'),
      },
    ];

    setParsedClasses(demoClasses);
    setImportFile(new File([''], 'Data_Rombel_Kelas_Wali_Contoh.xlsx'));
    addToast({
      type: 'info',
      title: 'Data Contoh Dimuat',
      message: '8 rombel kelas SD beserta nama wali kelas siap diimpor.',
    });
  };

  // Commit batch import classes
  const handleExecuteImportClasses = () => {
    const valid = parsedClasses.filter((r) => r.isValid);
    if (valid.length === 0) return;

    setIsProcessingImport(true);
    setTimeout(() => {
      batchImportClasses(
        valid.map((r) => ({
          name: r.name,
          grade: r.grade,
          teacherName: r.teacherName,
          teacherNip: r.teacherNip,
          roomNumber: r.roomNumber,
          academicYear: r.academicYear,
        })),
        { overwriteExisting: overwriteOnImport }
      );

      setIsProcessingImport(false);
      setIsImportModalOpen(false);
      setParsedClasses([]);
      setImportFile(null);
    }, 500);
  };

  // Helper to calculate statistics for a class
  const getClassStats = (classId: string) => {
    const classStudents = students.filter(
      (s) => s.classId === classId && s.status === 'aktif'
    );
    const records = attendanceRecords.filter((r) => r.classId === classId);
    const hadirCount = records.filter((r) => r.status === 'H' || r.status === 'T').length;
    const rate =
      records.length > 0 ? Math.round((hadirCount / records.length) * 100) : 95;

    return {
      studentCount: classStudents.length,
      attendanceRate: rate,
    };
  };

  const validClassesCount = parsedClasses.filter((c) => c.isValid).length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300">
              Master Rombongan Belajar
            </span>
            <span className="text-xs text-slate-400 font-medium">Tahun Ajaran {schoolProfile.academicYear || '2025/2026'}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
            <GraduationCap className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            Data Rombongan Belajar (Kelas) & Wali Kelas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manajemen rombel tingkat 1 sampai 6, nomor ruangan, dan penugasan guru wali kelas SD.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            id="download-class-template-btn"
            onClick={downloadClassTemplate}
            className="flex-1 sm:flex-none px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Unduh format template Excel rombel kelas & wali"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Template Excel</span>
          </button>

          <button
            id="open-import-excel-classes-btn"
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            title="Import data kelas & wali dari file Excel"
          >
            <FileUp className="w-4 h-4 text-emerald-100" />
            <span>Import Kelas & Wali</span>
          </button>

          <button
            id="export-classes-excel-btn"
            onClick={() => exportClassesToExcel(classes, students)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Download Master Data Rombel Kelas format .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            id="add-class-button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((cls) => {
          const stats = getClassStats(cls.id);
          return (
            <div
              key={cls.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-sky-400 dark:hover:border-sky-600 transition-all hover:shadow-xs"
            >
              {/* Card Top */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 flex items-center justify-center font-black text-xs border border-sky-200/80 dark:border-slate-700">
                      {cls.name.replace('Kelas ', '')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Building className="w-3 h-3" /> {cls.roomNumber || 'Ruang Kelas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Kelas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Teacher Info */}
                <div className="p-3 bg-sky-50/50 dark:bg-slate-800/50 rounded-xl border border-sky-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Guru Wali Kelas:
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    {cls.teacherName}
                  </p>
                  {cls.teacherNip && cls.teacherNip !== '-' && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      NIP: {cls.teacherNip}
                    </p>
                  )}
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-sky-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Total Siswa</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-500" />
                      {stats.studentCount} Siswa
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Kehadiran</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {stats.attendanceRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Button */}
              <div className="p-2.5 bg-sky-50/30 dark:bg-slate-800/30 border-t border-sky-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setSelectedClassId(cls.id);
                    setActiveTab('data-siswa');
                  }}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Daftar Siswa Kelas</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Import Modal */}
      {isImportModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsImportModalOpen(false);
            setParsedClasses([]);
            setImportFile(null);
          }}
          title="Import Data Rombel Kelas & Guru Wali"
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Unggah file Excel atau gunakan template resmi untuk mendaftarkan rombel kelas beserta wali kelas secara otomatis.
              </p>
              <button
                onClick={handleLoadDemoClasses}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gunakan Data Contoh Demo</span>
              </button>
            </div>

            {/* Hidden Input */}
            <input
              type="file"
              ref={importFileInputRef}
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImportFileSelect(f);
              }}
            />

            {/* Dropzone Box */}
            <div
              onClick={() => importFileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const f = e.dataTransfer.files?.[0];
                if (f) handleImportFileSelect(f);
              }}
              className="border-2 border-dashed border-sky-300 dark:border-sky-800 hover:border-sky-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-sky-50/40 dark:bg-slate-800/40 hover:bg-sky-50 dark:hover:bg-slate-800"
            >
              <div className="w-12 h-12 mx-auto rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {importFile ? importFile.name : 'Klik atau seret berkas Excel Data Kelas (.xlsx / .csv) ke sini'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Kolom: <span className="font-semibold text-slate-600 dark:text-slate-300">Nama Kelas, Tingkat (1-6), Nama Wali Kelas, NIP, Ruangan, Tahun Ajaran</span>
              </p>
            </div>

            {/* Overwrite Option */}
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={overwriteOnImport}
                onChange={(e) => setOverwriteOnImport(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
              />
              <span>Perbarui data wali kelas & ruangan jika nama kelas sudah ada di database</span>
            </label>

            {/* Validation Table Preview */}
            {parsedClasses.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Pratinjau Data ({validClassesCount} valid dari {parsedClasses.length} baris):
                  </span>
                  <button
                    onClick={downloadClassTemplate}
                    className="text-[11px] font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Unduh Template
                  </button>
                </div>

                <div className="max-h-56 overflow-y-auto border border-sky-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-sky-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold sticky top-0">
                      <tr>
                        <th className="p-2 text-center w-8">No</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Nama Kelas</th>
                        <th className="p-2 text-center">Tingkat</th>
                        <th className="p-2">Wali Kelas</th>
                        <th className="p-2">NIP Guru</th>
                        <th className="p-2">Ruang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100 dark:divide-slate-800">
                      {parsedClasses.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-sky-50/50 dark:hover:bg-slate-800/50 ${
                            !item.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="p-2 text-center text-slate-400">{idx + 1}</td>
                          <td className="p-2 whitespace-nowrap">
                            {item.isValid ? (
                              item.isExisting ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                  Update
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                  Baru
                                </span>
                              )
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                                {item.errors[0] || 'Error'}
                              </span>
                            )}
                          </td>
                          <td className="p-2 font-bold text-slate-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="p-2 text-center font-bold text-slate-700 dark:text-slate-300">
                            Tingkat {item.grade}
                          </td>
                          <td className="p-2 font-semibold text-slate-800 dark:text-slate-200">
                            {item.teacherName}
                          </td>
                          <td className="p-2 font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                            {item.teacherNip || '-'}
                          </td>
                          <td className="p-2 text-slate-600 dark:text-slate-400">
                            {item.roomNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-sky-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setActiveTab('import-data');
                }}
                className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Batch Import Center Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setParsedClasses([]);
                    setImportFile(null);
                  }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isProcessingImport || validClassesCount === 0}
                  onClick={handleExecuteImportClasses}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isProcessingImport ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan {validClassesCount} Kelas & Wali</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Class Modal */}
      {(isAddModalOpen || editingClass) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingClass(null);
            resetForm();
          }}
          title={isAddModalOpen ? 'Tambah Rombongan Belajar' : 'Edit Data Kelas & Wali'}
          maxWidth="md"
        >
          <form
            onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Kelas: *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Kelas 1A, Kelas 2B"
                className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tingkat (1 - 6):
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) =>
                    setFormData({ ...formData, grade: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                >
                  {[1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      Tingkat {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Ruangan:
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, roomNumber: e.target.value })
                  }
                  placeholder="Contoh: R. 104"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Guru Wali Kelas: *
              </label>
              <input
                type="text"
                required
                value={formData.teacherName}
                onChange={(e) =>
                  setFormData({ ...formData, teacherName: e.target.value })
                }
                placeholder="Contoh: Ibu Siti Aminah, S.Pd."
                className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                NIP Wali Kelas:
              </label>
              <input
                type="text"
                value={formData.teacherNip}
                onChange={(e) =>
                  setFormData({ ...formData, teacherNip: e.target.value })
                }
                placeholder="19850412 201001 2 015"
                className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-sky-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingClass(null);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isAddModalOpen ? 'Simpan Kelas' : 'Perbarui Kelas'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Class Confirmation Modal */}
      {deletingClass && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingClass(null)}
          title="Konfirmasi Hapus Kelas"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus{' '}
              <strong className="text-slate-900 dark:text-white">
                {deletingClass.name}
              </strong>
              ? Pastikan siswa telah dimutasi ke rombel lain sebelum menghapus.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingClass(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
