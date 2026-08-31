import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  Users,
  GraduationCap,
  ClipboardCheck,
  ArrowRight,
  Sparkles,
  Info,
  Layers,
  Search,
  Check,
  FileText,
  FileDown,
  Database,
  Building,
  UserCheck,
  Calendar,
} from 'lucide-react';
import {
  downloadStudentTemplate,
  downloadClassTemplate,
  downloadAttendanceTemplate,
  parseExcelFile,
  exportStudentsToExcel,
  exportClassesToExcel,
} from '../../utils/excelHelpers';
import { AttendanceStatus } from '../../types';

type ImportCategory = 'siswa' | 'kelas' | 'presensi';

interface ParsedStudentRow {
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  className: string;
  birthDate?: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  status?: 'aktif' | 'mutasi' | 'lulus';
  isValid: boolean;
  errors: string[];
  isExisting: boolean;
}

interface ParsedClassRow {
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

interface ParsedAttendanceRow {
  nisn: string;
  studentName: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  timeIn?: string;
  notes?: string;
  isValid: boolean;
  errors: string[];
}

export const ImportDataView: React.FC = () => {
  const {
    students,
    classes,
    schoolProfile,
    batchImportStudents,
    batchImportClasses,
    saveBatchAttendance,
    setActiveTab,
    addToast,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<ImportCategory>('siswa');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Data rows for different categories
  const [parsedStudentRows, setParsedStudentRows] = useState<ParsedStudentRow[]>([]);
  const [parsedClassRows, setParsedClassRows] = useState<ParsedClassRow[]>([]);
  const [parsedAttendanceRows, setParsedAttendanceRows] = useState<ParsedAttendanceRow[]>([]);
  
  // Settings
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [autoCreateClasses, setAutoCreateClasses] = useState(true);
  const [filterPreviewStatus, setFilterPreviewStatus] = useState<'all' | 'valid' | 'invalid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [importResult, setImportResult] = useState<{
    category: ImportCategory;
    success: boolean;
    added: number;
    updated: number;
    total: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing Maps for lookup
  const existingNisnMap = new Set(students.map((s) => s.nisn.trim()));
  const existingClassMap = new Map<string, string>();
  classes.forEach((c) => existingClassMap.set(c.name.toLowerCase().trim(), c.id));

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

  // Reset parsed data on tab switch
  const handleSwitchCategory = (category: ImportCategory) => {
    setActiveCategory(category);
    setSelectedFile(null);
    setParsedStudentRows([]);
    setParsedClassRows([]);
    setParsedAttendanceRows([]);
    setImportResult(null);
    setSearchQuery('');
    setFilterPreviewStatus('all');
  };

  // Handle file selection and parsing
  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setIsParsing(true);
    setImportResult(null);

    try {
      const parsed = await parseExcelFile(file);
      if (!parsed.data || parsed.data.length === 0) {
        addToast({
          type: 'warning',
          title: 'File Kosong',
          message: 'Tidak ada baris data yang terdeteksi di dalam file Excel.',
        });
        setParsedStudentRows([]);
        setParsedClassRows([]);
        setParsedAttendanceRows([]);
        setIsParsing(false);
        return;
      }

      // 1. Parse Student rows
      if (activeCategory === 'siswa') {
        const validatedRows: ParsedStudentRow[] = parsed.data.map((row: any, idx: number) => {
          const nisn = getVal(row, 'nisn', 'nomorinduknasional', 'no_nisn') || '';
          const nis = getVal(row, 'nis', 'nomorinduk', 'no_nis') || `250${idx + 1}`;
          const name = getVal(row, 'nama', 'namalengkap', 'namasiswa', 'student_name') || '';
          const rawGender = getVal(row, 'jeniskelamin', 'gender', 'jk', 'kelamin') || 'L';
          const gender: 'L' | 'P' = rawGender.toUpperCase().startsWith('P') || rawGender.toUpperCase().startsWith('W') ? 'P' : 'L';
          const className = getVal(row, 'kelas', 'rombel', 'class', 'namakelas') || 'Kelas 1A';
          const birthDate = getVal(row, 'tanggallahir', 'tgllahir', 'birthdate', 'tgl_lahir') || '2018-01-01';
          const parentName = getVal(row, 'namaorangtua', 'orangtua', 'wali', 'ayah', 'ibu', 'parent') || '-';
          const parentPhone = getVal(row, 'nohp', 'nomorhp', 'whatsapp', 'wa', 'telepon', 'phone') || '-';
          const address = getVal(row, 'alamat', 'domisili', 'address') || '-';
          const rawStatus = getVal(row, 'status', 'statussiswa') || 'aktif';
          const status: 'aktif' | 'mutasi' | 'lulus' =
            rawStatus.toLowerCase().includes('mutasi')
              ? 'mutasi'
              : rawStatus.toLowerCase().includes('lulus')
              ? 'lulus'
              : 'aktif';

          const errors: string[] = [];
          if (!nisn) errors.push('NISN wajib diisi');
          if (!name) errors.push('Nama Lengkap wajib diisi');
          if (!className) errors.push('Kelas wajib diisi');

          const isExisting = existingNisnMap.has(nisn);

          return {
            nisn,
            nis,
            name,
            gender,
            className,
            birthDate,
            parentName,
            parentPhone,
            address,
            status,
            isValid: errors.length === 0,
            errors,
            isExisting,
          };
        });

        setParsedStudentRows(validatedRows);
        addToast({
          type: 'info',
          title: 'File Siswa Berhasil Dibaca',
          message: `Terdeteksi ${validatedRows.length} baris data siswa siap divalidasi.`,
        });
      }
      
      // 2. Parse Class & Wali rows
      else if (activeCategory === 'kelas') {
        const validatedRows: ParsedClassRow[] = parsed.data.map((row: any, idx: number) => {
          const rawName = getVal(row, 'namakelas', 'kelas', 'rombel', 'nama rombel', 'class') || `Kelas ${idx + 1}A`;
          const name = rawName.startsWith('Kelas ') ? rawName : `Kelas ${rawName}`;
          
          // Determine grade: from column or inferred from class name (e.g. 'Kelas 3B' -> 3)
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
          if (grade < 1 || grade > 6) errors.push('Tingkat kelas harus antara 1 sampai 6');

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

        setParsedClassRows(validatedRows);
        addToast({
          type: 'info',
          title: 'File Rombel Kelas & Wali Terbaca',
          message: `Terdeteksi ${validatedRows.length} baris data rombel kelas siap divalidasi.`,
        });
      }

      // 3. Parse Attendance Log rows
      else if (activeCategory === 'presensi') {
        const validatedRows: ParsedAttendanceRow[] = parsed.data.map((row: any) => {
          const nisn = getVal(row, 'nisnsiswa', 'nisn', 'no_nisn') || '';
          const studentName = getVal(row, 'namasiswa', 'nama', 'student') || '';
          const className = getVal(row, 'kelas', 'rombel') || '';
          const date = getVal(row, 'tanggal', 'date', 'tgl') || new Date().toISOString().split('T')[0];
          
          const rawStatus = getVal(row, 'statuskehadiran', 'status', 'kehadiran', 'presensi') || 'H';
          let status: AttendanceStatus = 'H';
          const upper = String(rawStatus).toUpperCase().trim();
          if (upper === 'LN' || upper.includes('LIBUR') || upper.startsWith('LN')) {
            status = 'LN';
          } else if (upper.startsWith('S') && !upper.startsWith('SEKOLAH')) {
            status = 'S';
          } else if (upper.startsWith('I')) {
            status = 'I';
          } else if (upper.startsWith('A')) {
            status = 'A';
          } else if (upper.startsWith('T') || upper.includes('LAMBAT')) {
            status = 'T';
          } else {
            status = 'H';
          }

          const timeIn = getVal(row, 'jammasuk', 'jam', 'waktu', 'time') || (status === 'H' || status === 'T' ? '06:55' : undefined);
          const notes = getVal(row, 'catatan', 'keterangan', 'notes') || '';

          const errors: string[] = [];
          if (!nisn && !studentName) errors.push('NISN atau Nama Siswa wajib ada');
          if (!date) errors.push('Tanggal absensi wajib diisi');

          return {
            nisn,
            studentName,
            className,
            date,
            status,
            timeIn,
            notes,
            isValid: errors.length === 0,
            errors,
          };
        });

        setParsedAttendanceRows(validatedRows);
        addToast({
          type: 'info',
          title: 'File Presensi Terbaca',
          message: `Terdeteksi ${validatedRows.length} log presensi siap divalidasi.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membaca File',
        message: err.message || 'Format file Excel tidak sesuai atau rusak.',
      });
      setParsedStudentRows([]);
      setParsedClassRows([]);
      setParsedAttendanceRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  // Load sample demo data according to category
  const handleLoadSampleDemo = () => {
    setImportResult(null);

    if (activeCategory === 'siswa') {
      const demoList: ParsedStudentRow[] = [
        {
          nisn: '0165849291',
          nis: '250109',
          name: 'Rafi Aditya Pratama',
          gender: 'L',
          className: 'Kelas 1A',
          birthDate: '2018-03-14',
          parentName: 'Hendra Pratama',
          parentPhone: '081234567801',
          address: 'Jl. Melati No. 44, RT 02/05',
          status: 'aktif',
          isValid: true,
          errors: [],
          isExisting: existingNisnMap.has('0165849291'),
        },
        {
          nisn: '0165849292',
          nis: '250110',
          name: 'Zahra Aulia Putri',
          gender: 'P',
          className: 'Kelas 1A',
          birthDate: '2018-05-22',
          parentName: 'Ahmad Faisal',
          parentPhone: '081398765402',
          address: 'Jl. Mawar No. 12, Gandaria',
          status: 'aktif',
          isValid: true,
          errors: [],
          isExisting: existingNisnMap.has('0165849292'),
        },
        {
          nisn: '0165849293',
          nis: '250111',
          name: 'Dimas Bagus Anggoro',
          gender: 'L',
          className: 'Kelas 1B',
          birthDate: '2018-07-09',
          parentName: 'Bagus S.',
          parentPhone: '081567890103',
          address: 'Jl. Kenanga Indah No. 8',
          status: 'aktif',
          isValid: true,
          errors: [],
          isExisting: existingNisnMap.has('0165849293'),
        },
        {
          nisn: '0165849294',
          nis: '250112',
          name: 'Nayla Salsabila',
          gender: 'P',
          className: 'Kelas 2A',
          birthDate: '2017-09-18',
          parentName: 'Rudi Hartono',
          parentPhone: '081298765404',
          address: 'Jl. Cempaka Putih No. 3',
          status: 'aktif',
          isValid: true,
          errors: [],
          isExisting: existingNisnMap.has('0165849294'),
        },
        {
          nisn: '0165849295',
          nis: '250113',
          name: 'Fatih Al-Ghifari',
          gender: 'L',
          className: 'Kelas 3A',
          birthDate: '2016-11-04',
          parentName: 'Imam Syafii',
          parentPhone: '081876543205',
          address: 'Jl. Teratai No. 19',
          status: 'aktif',
          isValid: true,
          errors: [],
          isExisting: existingNisnMap.has('0165849295'),
        },
      ];

      setParsedStudentRows(demoList);
      setSelectedFile(new File([''], 'Data_Siswa_Contoh_Demo.xlsx'));
      addToast({
        type: 'info',
        title: 'Data Contoh Dimuat',
        message: '5 data siswa contoh telah dimuat dan siap diimpor ke sistem.',
      });
    } else if (activeCategory === 'kelas') {
      const demoClasses: ParsedClassRow[] = [
        {
          name: 'Kelas 1A',
          grade: 1,
          teacherName: 'Ibu Ratna Dewi, S.Pd.',
          teacherNip: '19850412 201001 2 015',
          roomNumber: 'R. 101',
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
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
          academicYear: '2025/2026',
          isValid: true,
          errors: [],
          isExisting: existingClassMap.has('kelas 6a'),
        },
      ];

      setParsedClassRows(demoClasses);
      setSelectedFile(new File([''], 'Data_Rombel_Kelas_Wali_Demo.xlsx'));
      addToast({
        type: 'info',
        title: 'Data Rombel & Wali Dimuat',
        message: '8 rombel kelas SD beserta guru wali kelas siap diimpor ke sistem.',
      });
    } else if (activeCategory === 'presensi') {
      const today = new Date().toISOString().split('T')[0];
      const demoAtt: ParsedAttendanceRow[] = [
        {
          nisn: '0165849201',
          studentName: 'Muhammad Rizky Pratama',
          className: 'Kelas 1A',
          date: today,
          status: 'H',
          timeIn: '06:50',
          notes: 'Hadir tepat waktu',
          isValid: true,
          errors: [],
        },
        {
          nisn: '0165849202',
          studentName: 'Anisa Rahmawati',
          className: 'Kelas 1A',
          date: today,
          status: 'S',
          timeIn: undefined,
          notes: 'Demam flu',
          isValid: true,
          errors: [],
        },
        {
          nisn: '0165849203',
          studentName: 'Bagas Dwi Saputra',
          className: 'Kelas 1A',
          date: today,
          status: 'T',
          timeIn: '07:22',
          notes: 'Terlambat 7 menit',
          isValid: true,
          errors: [],
        },
      ];

      setParsedAttendanceRows(demoAtt);
      setSelectedFile(new File([''], 'Data_Log_Presensi_Demo.xlsx'));
      addToast({
        type: 'info',
        title: 'Data Presensi Dimuat',
        message: '3 data catatan presensi contoh siap diimpor.',
      });
    }
  };

  // Submit and commit data according to active category
  const handleExecuteImport = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // 1. Commit Students
      if (activeCategory === 'siswa') {
        const validRows = parsedStudentRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
          addToast({
            type: 'error',
            title: 'Tidak Ada Data Valid',
            message: 'Silakan periksa kembali data Anda. Tidak ada baris yang valid untuk diimpor.',
          });
          setIsProcessing(false);
          return;
        }

        // Auto-create non-existent classes if option enabled
        if (autoCreateClasses) {
          const uniqueClasses: string[] = Array.from(new Set<string>(validRows.map((r) => r.className.trim())));
          const existingClassNames = new Set(classes.map((c) => c.name.toLowerCase().trim()));

          const newClassesToCreate = uniqueClasses.filter(
            (clsName: string) => !existingClassNames.has(clsName.toLowerCase())
          );

          if (newClassesToCreate.length > 0) {
            batchImportClasses(
              newClassesToCreate.map((cls: string) => {
                const match = cls.match(/\d+/);
                const grade = match ? Number(match[0]) : 1;
                return {
                  name: cls,
                  grade: Math.min(6, Math.max(1, grade)),
                  teacherName: 'Wali Kelas Belum Ditugaskan',
                  academicYear: schoolProfile.academicYear || '2025/2026',
                };
              })
            );
          }
        }

        const result = batchImportStudents(
          validRows.map((r) => ({
            nisn: r.nisn,
            nis: r.nis,
            name: r.name,
            gender: r.gender,
            className: r.className,
            birthDate: r.birthDate,
            parentName: r.parentName,
            parentPhone: r.parentPhone,
            address: r.address,
            status: r.status,
          })),
          { overwriteExisting }
        );

        setImportResult({
          category: 'siswa',
          success: true,
          added: result.addedCount,
          updated: result.updatedCount,
          total: validRows.length,
        });
      }
      
      // 2. Commit Classes & Wali
      else if (activeCategory === 'kelas') {
        const validRows = parsedClassRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
          addToast({
            type: 'error',
            title: 'Tidak Ada Data Valid',
            message: 'Tidak ada baris rombel kelas yang valid untuk diimpor.',
          });
          setIsProcessing(false);
          return;
        }

        const result = batchImportClasses(
          validRows.map((r) => ({
            name: r.name,
            grade: r.grade,
            teacherName: r.teacherName,
            teacherNip: r.teacherNip,
            roomNumber: r.roomNumber,
            academicYear: r.academicYear,
          })),
          { overwriteExisting }
        );

        setImportResult({
          category: 'kelas',
          success: true,
          added: result.addedCount,
          updated: result.updatedCount,
          total: validRows.length,
        });
      }

      // 3. Commit Attendance logs
      else if (activeCategory === 'presensi') {
        const validRows = parsedAttendanceRows.filter((r) => r.isValid);
        if (validRows.length === 0) {
          addToast({
            type: 'error',
            title: 'Tidak Ada Data Valid',
            message: 'Tidak ada baris presensi yang valid untuk diimpor.',
          });
          setIsProcessing(false);
          return;
        }

        const newRecords = validRows.map((row, idx) => {
          const matchedStudent = students.find(
            (s) => s.nisn === row.nisn || s.name.toLowerCase() === row.studentName.toLowerCase()
          );

          return {
            id: `att-imp-${Date.now()}-${idx}`,
            studentId: matchedStudent?.id || `temp-${row.nisn || idx}`,
            studentName: row.studentName || matchedStudent?.name || 'Siswa',
            studentNisn: row.nisn || matchedStudent?.nisn || '-',
            classId: matchedStudent?.classId || 'c1',
            className: row.className || matchedStudent?.className || 'Kelas 1A',
            date: row.date,
            status: row.status,
            timeIn: row.timeIn,
            notes: row.notes || 'Import via Excel',
            recordedBy: 'Import Excel',
            verifiedAt: `${row.date} 07:00`,
          };
        });

        saveBatchAttendance(newRecords);

        setImportResult({
          category: 'presensi',
          success: true,
          added: newRecords.length,
          updated: 0,
          total: validRows.length,
        });
      }

      setIsProcessing(false);
    }, 600);
  };

  // Helper counts for UI
  const currentRowsCount =
    activeCategory === 'siswa'
      ? parsedStudentRows.length
      : activeCategory === 'kelas'
      ? parsedClassRows.length
      : parsedAttendanceRows.length;

  const validCount =
    activeCategory === 'siswa'
      ? parsedStudentRows.filter((r) => r.isValid).length
      : activeCategory === 'kelas'
      ? parsedClassRows.filter((r) => r.isValid).length
      : parsedAttendanceRows.filter((r) => r.isValid).length;

  const invalidCount = currentRowsCount - validCount;

  const existingCount =
    activeCategory === 'siswa'
      ? parsedStudentRows.filter((r) => r.isExisting).length
      : activeCategory === 'kelas'
      ? parsedClassRows.filter((r) => r.isExisting).length
      : 0;

  // Filtered preview data
  const filteredStudents = parsedStudentRows.filter((row) => {
    const matchStatus =
      filterPreviewStatus === 'all'
        ? true
        : filterPreviewStatus === 'valid'
        ? row.isValid
        : !row.isValid;
    const matchQuery =
      searchQuery === '' ||
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.nisn.includes(searchQuery) ||
      row.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const filteredClasses = parsedClassRows.filter((row) => {
    const matchStatus =
      filterPreviewStatus === 'all'
        ? true
        : filterPreviewStatus === 'valid'
        ? row.isValid
        : !row.isValid;
    const matchQuery =
      searchQuery === '' ||
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.teacherNip.includes(searchQuery) ||
      row.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const filteredAttendance = parsedAttendanceRows.filter((row) => {
    const matchStatus =
      filterPreviewStatus === 'all'
        ? true
        : filterPreviewStatus === 'valid'
        ? row.isValid
        : !row.isValid;
    const matchQuery =
      searchQuery === '' ||
      row.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.nisn.includes(searchQuery) ||
      row.className.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/90 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/70 text-[#4a0404] dark:text-rose-400">
              Batch Import Center
            </span>
            <span className="text-xs text-stone-400 font-medium">Excel & Spreadsheet Support</span>
          </div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Import Data Siswa, Rombel Kelas & Wali
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Unggah berkas Excel (.xlsx / .csv) untuk mendaftarkan ratusan siswa, rombel kelas, atau riwayat absensi secara instan.
          </p>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-export-students-quick"
            onClick={() => exportStudentsToExcel(students, classes)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Master Siswa Saat Ini"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Siswa</span>
          </button>

          <button
            id="btn-export-classes-quick"
            onClick={() => exportClassesToExcel(classes, students)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Master Kelas & Wali"
          >
            <FileDown className="w-4 h-4 text-sky-600" />
            <span>Ekspor Kelas & Wali</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-200/60 dark:bg-stone-800/80 rounded-2xl border border-stone-300/50 dark:border-stone-700">
        <button
          id="tab-import-siswa"
          onClick={() => handleSwitchCategory('siswa')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeCategory === 'siswa'
              ? 'bg-[#4a0404] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Import Data Siswa Lengkap</span>
        </button>

        <button
          id="tab-import-kelas"
          onClick={() => handleSwitchCategory('kelas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeCategory === 'kelas'
              ? 'bg-[#4a0404] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>2. Import Data Rombel Kelas & Wali</span>
        </button>

        <button
          id="tab-import-presensi"
          onClick={() => handleSwitchCategory('presensi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeCategory === 'presensi'
              ? 'bg-[#4a0404] text-white shadow-xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>3. Import Log Presensi</span>
        </button>

        <button
          id="tab-import-backup-db"
          onClick={() => setActiveTab('backup-restore')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 hover:bg-sky-200 border border-sky-300 dark:border-sky-700 ml-auto transition-all cursor-pointer"
        >
          <Database className="w-4 h-4" />
          <span>Simpan & Pulihkan Database (.JSON)</span>
        </button>
      </div>

      {/* Main Grid: Upload & Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Upload Dropzone & Setup (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-[#4a0404] dark:text-rose-400" />
                <span>
                  Upload File Excel (
                  {activeCategory === 'siswa'
                    ? 'Data Siswa'
                    : activeCategory === 'kelas'
                    ? 'Data Rombel Kelas & Wali'
                    : 'Log Presensi'}
                  )
                </span>
              </h2>
              <button
                id="btn-load-sample-demo"
                onClick={handleLoadSampleDemo}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gunakan Data Contoh Demo</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />

            {/* Dropzone Box */}
            <div
              id="excel-dropzone-box"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileChange(file);
              }}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#4a0404] dark:hover:border-rose-500 rounded-2xl p-8 text-center cursor-pointer transition-all bg-stone-50/50 dark:bg-stone-800/30 hover:bg-rose-50/30 dark:hover:bg-rose-950/20 group"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-[#4a0404] dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                {activeCategory === 'siswa' ? (
                  <Users className="w-7 h-7" />
                ) : activeCategory === 'kelas' ? (
                  <GraduationCap className="w-7 h-7" />
                ) : (
                  <ClipboardCheck className="w-7 h-7" />
                )}
              </div>
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200 mb-1">
                {selectedFile ? selectedFile.name : `Klik atau seret file Excel (${activeCategory === 'siswa' ? 'Data Siswa' : activeCategory === 'kelas' ? 'Data Rombel & Wali' : 'Presensi'}) ke sini`}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Mendukung format <span className="font-semibold text-stone-700 dark:text-stone-300">.xlsx, .xls, atau .csv</span> (Maksimal 10 MB)
              </p>

              {selectedFile && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>File Siap: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </div>

            {/* Import Options & Preferences */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 space-y-2.5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="rounded text-[#4a0404] focus:ring-[#4a0404] w-4 h-4"
                />
                <span>
                  <strong>Perbarui otomatis</strong> data jika {activeCategory === 'siswa' ? 'NISN siswa' : activeCategory === 'kelas' ? 'nama kelas rombel' : 'catatan'} sudah terdaftar di sistem
                </span>
              </label>

              {activeCategory === 'siswa' && (
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={autoCreateClasses}
                    onChange={(e) => setAutoCreateClasses(e.target.checked)}
                    className="rounded text-[#4a0404] focus:ring-[#4a0404] w-4 h-4"
                  />
                  <span>
                    <strong>Buat kelas baru secara otomatis</strong> jika nama kelas di file Excel belum ada di sistem
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Step-by-Step Guide & Template Selector (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Panduan Import {activeCategory === 'siswa' ? 'Data Siswa' : activeCategory === 'kelas' ? 'Rombel & Wali' : 'Presensi'}</span>
            </h3>

            <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-[#4a0404] dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">Unduh Format Template</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {activeCategory === 'kelas'
                      ? 'Download template kelas & wali dengan kolom Nama Kelas, Tingkat, Guru Wali, NIP, Ruangan, & Tahun Ajaran.'
                      : activeCategory === 'siswa'
                      ? 'Gunakan template siswa agar susunan kolom NISN, Nama, JK, Kelas, dan Kontak Ortu terpetakan akurat.'
                      : 'Download template log presensi dengan format kode status H, S, I, A, T.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-[#4a0404] dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">
                    {activeCategory === 'kelas' ? 'Isi Rombel & Nama Wali' : 'Isi Data Lengkap'}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    {activeCategory === 'kelas' ? (
                      <>Pastikan kolom <code className="text-rose-600 dark:text-rose-400 font-bold">Nama Kelas</code>, <code className="text-rose-600 dark:text-rose-400 font-bold">Tingkat (1-6)</code>, dan <code className="text-rose-600 dark:text-rose-400 font-bold">Nama Wali Kelas</code> terisi.</>
                    ) : (
                      <>Pastikan kolom wajib seperti <code className="text-rose-600 dark:text-rose-400 font-bold">NISN</code>, <code className="text-rose-600 dark:text-rose-400 font-bold">Nama</code>, dan <code className="text-rose-600 dark:text-rose-400 font-bold">Kelas</code> tidak kosong.</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-[#4a0404] dark:text-rose-400 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold text-stone-800 dark:text-stone-200">Upload & Validasi</p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Sistem akan memvalidasi data dan memberi Anda pratinjau sebelum disimpan ke database.
                  </p>
                </div>
              </div>
            </div>

            {/* Template Download Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                  Pilih Template untuk Diunduh:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                  Excel (.xlsx)
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  id="btn-dl-tpl-siswa"
                  onClick={downloadStudentTemplate}
                  className={`w-full py-2 px-3 rounded-xl border text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-between transition-all ${
                    activeCategory === 'siswa'
                      ? 'bg-amber-100 dark:bg-amber-900/70 border-amber-400 dark:border-amber-700 shadow-xs'
                      : 'bg-white dark:bg-stone-800 border-amber-300 dark:border-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#4a0404] dark:text-rose-400" />
                    <span>Template Data Siswa Lengkap</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                </button>

                <button
                  id="btn-dl-tpl-kelas"
                  onClick={downloadClassTemplate}
                  className={`w-full py-2 px-3 rounded-xl border text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-between transition-all ${
                    activeCategory === 'kelas'
                      ? 'bg-amber-100 dark:bg-amber-900/70 border-amber-400 dark:border-amber-700 shadow-xs'
                      : 'bg-white dark:bg-stone-800 border-amber-300 dark:border-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#4a0404] dark:text-rose-400" />
                    <span>Template Data Rombel Kelas & Wali</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                </button>

                <button
                  id="btn-dl-tpl-presensi"
                  onClick={downloadAttendanceTemplate}
                  className={`w-full py-2 px-3 rounded-xl border text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-between transition-all ${
                    activeCategory === 'presensi'
                      ? 'bg-amber-100 dark:bg-amber-900/70 border-amber-400 dark:border-amber-700 shadow-xs'
                      : 'bg-white dark:bg-stone-800 border-amber-300 dark:border-amber-800 hover:bg-amber-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardCheck className="w-3.5 h-3.5 text-[#4a0404] dark:text-rose-400" />
                    <span>Template Log Presensi Harian</span>
                  </span>
                  <Download className="w-3.5 h-3.5 text-amber-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner when Import is Completed */}
      {importResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-md animate-in zoom-in-95 duration-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                  Import {importResult.category === 'siswa' ? 'Data Siswa' : importResult.category === 'kelas' ? 'Rombel Kelas & Wali' : 'Log Presensi'} Berhasil Diproses!
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {importResult.category === 'siswa' ? (
                    <>Sebanyak <strong>{importResult.added} siswa baru</strong> berhasil ditambahkan dan <strong>{importResult.updated} siswa</strong> berhasil diperbarui di sistem.</>
                  ) : importResult.category === 'kelas' ? (
                    <>Sebanyak <strong>{importResult.added} rombel kelas baru</strong> berhasil ditambahkan dan <strong>{importResult.updated} kelas/wali</strong> berhasil diperbarui di sistem.</>
                  ) : (
                    <>Sebanyak <strong>{importResult.added} catatan absensi</strong> berhasil disimpan ke dalam riwayat presensi harian.</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {importResult.category === 'kelas' ? (
                <button
                  id="btn-goto-classes-after-import"
                  onClick={() => setActiveTab('data-kelas')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Lihat Rombel Kelas & Wali</span>
                </button>
              ) : (
                <button
                  id="btn-goto-students-after-import"
                  onClick={() => setActiveTab('data-siswa')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Lihat Data Siswa</span>
                </button>
              )}

              <button
                id="btn-goto-attendance-after-import"
                onClick={() => setActiveTab('presensi-harian')}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Mulai Presensi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Validation Table Section */}
      {currentRowsCount > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
          {/* Table Header & Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <span>
                  Pratinjau & Hasil Validasi ({activeCategory === 'siswa' ? 'Data Siswa' : activeCategory === 'kelas' ? 'Rombel Kelas & Wali' : 'Log Presensi'} - {currentRowsCount} Baris)
                </span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tinjau kembali data hasil pembacaan sebelum disimpan secara permanen ke dalam database.
              </p>
            </div>

            {/* Metric Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                Total: {currentRowsCount}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Valid: {validCount}
              </span>
              {invalidCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                  Error: {invalidCount}
                </span>
              )}
              {existingCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Terdaftar: {existingCount}
                </span>
              )}
            </div>
          </div>

          {/* Table Filters & Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={
                    activeCategory === 'siswa'
                      ? 'Cari nama, NISN, atau kelas...'
                      : activeCategory === 'kelas'
                      ? 'Cari nama kelas, wali, NIP, ruangan...'
                      : 'Cari nama siswa, tanggal...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-[#4a0404]"
                />
              </div>

              <select
                value={filterPreviewStatus}
                onChange={(e) => setFilterPreviewStatus(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 text-xs font-medium text-stone-700 dark:text-stone-300"
              >
                <option value="all">Semua Status</option>
                <option value="valid">Hanya Valid ({validCount})</option>
                <option value="invalid">Hanya Error ({invalidCount})</option>
              </select>
            </div>

            {/* Execute Import Action Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => {
                  setParsedStudentRows([]);
                  setParsedClassRows([]);
                  setParsedAttendanceRows([]);
                  setSelectedFile(null);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer"
              >
                Batal / Bersihkan
              </button>
              <button
                id="execute-import-commit-button"
                disabled={isProcessing || validCount === 0}
                onClick={handleExecuteImport}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      Simpan {validCount}{' '}
                      {activeCategory === 'siswa'
                        ? 'Siswa'
                        : activeCategory === 'kelas'
                        ? 'Kelas & Wali'
                        : 'Log Presensi'}{' '}
                      ke Sistem
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Table Container 1: Data Siswa */}
          {activeCategory === 'siswa' && (
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold uppercase border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">No</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">NISN</th>
                    <th className="px-3 py-3">NIS</th>
                    <th className="px-3 py-3">Nama Siswa</th>
                    <th className="px-3 py-3">L/P</th>
                    <th className="px-3 py-3">Kelas</th>
                    <th className="px-3 py-3">Tanggal Lahir</th>
                    <th className="px-3 py-3">Orang Tua / Wali</th>
                    <th className="px-3 py-3">No WhatsApp</th>
                    <th className="px-3 py-3">Alamat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        Tidak ada baris data siswa yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors ${
                          !row.isValid ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center text-stone-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {row.isValid ? (
                            row.isExisting ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                <RefreshCw className="w-3 h-3" />
                                <span>Update</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Baru</span>
                              </span>
                            )
                          ) : (
                            <span
                              title={row.errors.join(', ')}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 cursor-help"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{row.errors[0] || 'Error'}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-stone-900 dark:text-stone-100">
                          {row.nisn || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400">
                          {row.nis}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-stone-900 dark:text-stone-100">
                          {row.name || <span className="text-rose-500 italic">Kosong</span>}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                              row.gender === 'L'
                                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                                : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {row.gender}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-stone-800 dark:text-stone-200">
                          {row.className}
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400">
                          {row.birthDate}
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400">
                          {row.parentName}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400">
                          {row.parentPhone}
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                          {row.address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Container 2: Data Rombel Kelas & Wali */}
          {activeCategory === 'kelas' && (
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold uppercase border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">No</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Nama Rombel Kelas</th>
                    <th className="px-3 py-3 text-center">Tingkat</th>
                    <th className="px-3 py-3">Nama Guru Wali Kelas</th>
                    <th className="px-3 py-3">NIP Wali Kelas</th>
                    <th className="px-3 py-3">Ruang Kelas</th>
                    <th className="px-3 py-3">Tahun Ajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        Tidak ada data rombel kelas yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors ${
                          !row.isValid ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center text-stone-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {row.isValid ? (
                            row.isExisting ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                                <RefreshCw className="w-3 h-3" />
                                <span>Update Kelas</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Kelas Baru</span>
                              </span>
                            )
                          ) : (
                            <span
                              title={row.errors.join(', ')}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 cursor-help"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>{row.errors[0] || 'Error'}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 flex items-center justify-center font-black text-[11px] shrink-0">
                            {row.name.replace('Kelas ', '')}
                          </div>
                          <span>{row.name}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-bold">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                            Tingkat {row.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-bold text-stone-900 dark:text-stone-100">
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>{row.teacherName || <span className="text-rose-500 italic">Belum Diisi</span>}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400">
                          {row.teacherNip || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-stone-700 dark:text-stone-300">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-stone-400" />
                            {row.roomNumber || '-'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 font-mono">
                          {row.academicYear}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Container 3: Log Presensi */}
          {activeCategory === 'presensi' && (
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-bold uppercase border-b border-stone-200 dark:border-stone-700">
                  <tr>
                    <th className="px-3 py-3 w-12 text-center">No</th>
                    <th className="px-3 py-3">Status Data</th>
                    <th className="px-3 py-3">NISN Siswa</th>
                    <th className="px-3 py-3">Nama Siswa</th>
                    <th className="px-3 py-3">Kelas</th>
                    <th className="px-3 py-3">Tanggal</th>
                    <th className="px-3 py-3 text-center">Status Kehadiran</th>
                    <th className="px-3 py-3">Jam Masuk</th>
                    <th className="px-3 py-3">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-medium">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        Tidak ada log presensi yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors ${
                          !row.isValid ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="px-3 py-2.5 text-center text-stone-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Valid</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                              <XCircle className="w-3 h-3" />
                              <span>Error</span>
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 font-mono font-bold text-stone-900 dark:text-stone-100">
                          {row.nisn || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-stone-900 dark:text-stone-100">
                          {row.studentName}
                        </td>
                        <td className="px-3 py-2.5 text-stone-700 dark:text-stone-300 font-semibold">
                          {row.className || '-'}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400">
                          {row.date}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                              row.status === 'H'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : row.status === 'T'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : row.status === 'S'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                : row.status === 'I'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300'
                                : row.status === 'LN'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {row.status === 'H'
                              ? 'Hadir'
                              : row.status === 'T'
                              ? 'Terlambat'
                              : row.status === 'S'
                              ? 'Sakit'
                              : row.status === 'I'
                              ? 'Izin'
                              : row.status === 'LN'
                              ? 'Libur Nas (LN)'
                              : 'Alpa'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-stone-600 dark:text-stone-400">
                          {row.timeIn || '-'}
                        </td>
                        <td className="px-3 py-2.5 text-stone-600 dark:text-stone-400 truncate max-w-[150px]">
                          {row.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
