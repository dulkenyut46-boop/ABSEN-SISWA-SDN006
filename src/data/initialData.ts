import { Student, ClassRoom, AttendanceRecord, LeaveRequest, SchoolProfile, UserSession, RolePermissionsMatrix, NationalHoliday } from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: 'SD NEGERI 01 HARAPAN BANGSA',
  npsn: '20108922',
  nss: '101016001001',
  bentukPendidikan: 'Sekolah Dasar (SD)',
  statusSekolah: 'Negeri',
  akreditasi: 'A (Unggul)',
  skAkreditasi: '1347/BAN-SM/SK/2023',
  kurikulum: 'Kurikulum Merdeka',

  // Wilayah Administratif & Alamat Lengkap
  street: 'Jl. Merdeka Raya No. 45, RT. 004 / RW. 002',
  village: 'Kelurahan Selong',
  district: 'Kecamatan Kebayoran Baru',
  regency: 'Kota Administrasi Jakarta Selatan',
  province: 'DKI Jakarta',
  postalCode: '12110',
  address: 'Jl. Merdeka Raya No. 45, RT. 004 / RW. 002, Kel. Selong, Kec. Kebayoran Baru, Kota Jakarta Selatan, DKI Jakarta 12110',
  coordinates: '-6.2382, 106.8045',

  // Instansi Pembina & Kontak Resmi
  dinasPendidikan: 'Suku Dinas Pendidikan Wilayah I Jakarta Selatan',
  provinsiDinas: 'Dinas Pendidikan Provinsi DKI Jakarta',
  phone: '(021) 7890-1234',
  fax: '(021) 7890-1235',
  email: 'sdn01harapanbangsa@kemdikbud.go.id',
  website: 'https://sdn01harapanbangsa.sch.id',

  // Pimpinan & Pengelola
  principalName: 'Dra. Hj. Siti Rahmawati, M.Pd.',
  principalNip: '19680512 199303 2 004',
  principalPhone: '0811-9876-5432',
  operatorName: 'Ferry Ramadhani, S.Kom.',
  operatorNip: '19920815 201802 1 003',
  operatorPhone: '0812-3456-7890',

  // Akademik & Operasional
  academicYear: '2025/2026',
  semester: 'Genap',
  schoolStartTime: '07:00',
  lateThresholdTime: '07:15',
  schoolEndTime: '13:30',

  // Visi, Misi, & Nilai
  motto: 'Cerdas, Berkarakter, Berakhlak Mulia, dan Berwawasan Lingkungan',
  vision: 'Terwujudnya peserta didik yang beriman, bertakwa, berakhlak mulia, cerdas, terampil, mandiri, dan berbudaya lingkungan menuju Generasi Emas Indonesia.',
  mission: [
    'Menanamkan keimanan dan ketakwaan melalui pengamalan ajaran agama dalam kehidupan sehari-hari.',
    'Menyelenggarakan pembelajaran yang aktif, inovatif, kreatif, efektif, dan menyenangkan (PAIKEM) berbasis Profil Pelajar Pancasila.',
    'Mengembangkan potensi bakat, minat, literasi, numerasi, dan kreativitas siswa di bidang akademik maupun non-akademik.',
    'Membentuk karakter santun, disiplin, jujur, dan berdaya saing global.',
    'Menciptakan lingkungan sekolah yang bersih, hijau, sehat, asri, aman, dan ramah anak.'
  ],
};

export const initialClasses: ClassRoom[] = [
  { id: 'c1', name: 'Kelas 1A', grade: 1, teacherName: 'Ibu Ratna Dewi, S.Pd.', teacherNip: '19850412 201001 2 015', roomNumber: 'R. 101', academicYear: '2025/2026' },
  { id: 'c2', name: 'Kelas 1B', grade: 1, teacherName: 'Bapak Ahmad Fauzi, S.Pd.', teacherNip: '19870823 201201 1 009', roomNumber: 'R. 102', academicYear: '2025/2026' },
  { id: 'c3', name: 'Kelas 2A', grade: 2, teacherName: 'Ibu Sri Wahyuni, S.Pd.', teacherNip: '19820115 200801 2 011', roomNumber: 'R. 103', academicYear: '2025/2026' },
  { id: 'c4', name: 'Kelas 3A', grade: 3, teacherName: 'Bapak Joko Prasetyo, S.Pd.', teacherNip: '19890310 201402 1 003', roomNumber: 'R. 201', academicYear: '2025/2026' },
  { id: 'c5', name: 'Kelas 4A', grade: 4, teacherName: 'Ibu Nurul Hidayah, M.Pd.', teacherNip: '19841109 200902 2 018', roomNumber: 'R. 202', academicYear: '2025/2026' },
  { id: 'c6', name: 'Kelas 5A', grade: 5, teacherName: 'Bapak Hendra Gunawan, S.Pd.', teacherNip: '19860618 201101 1 007', roomNumber: 'R. 301', academicYear: '2025/2026' },
  { id: 'c7', name: 'Kelas 5B', grade: 5, teacherName: 'Ibu Dewi Sartika, S.Pd.', teacherNip: '19900214 201503 2 006', roomNumber: 'R. 302', academicYear: '2025/2026' },
  { id: 'c8', name: 'Kelas 6A', grade: 6, teacherName: 'Bapak Drs. Bambang Sutrisno', teacherNip: '19751020 199903 1 002', roomNumber: 'R. 303', academicYear: '2025/2026' },
];

export const initialStudents: Student[] = [
  // Kelas 1A
  {
    id: 's101',
    nisn: '0165849201',
    nis: '250101',
    name: 'Muhammad Rizky Pratama',
    gender: 'L',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-04-12',
    parentName: 'Agus Pratama',
    parentPhone: '081298765432',
    address: 'Jl. Melati No. 12, Kebayoran Baru',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's102',
    nisn: '0165849202',
    nis: '250102',
    name: 'Anisa Rahmawati',
    gender: 'P',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-06-25',
    parentName: 'Bambang Irawan',
    parentPhone: '081387654321',
    address: 'Jl. Mawar No. 8, Gandaria',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's103',
    nisn: '0165849203',
    nis: '250103',
    name: 'Dimas Arya Ramadhan',
    gender: 'L',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-05-18',
    parentName: 'Surya Ramadhan',
    parentPhone: '081912345678',
    address: 'Jl. Cempaka Putih No. 14',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's104',
    nisn: '0165849204',
    nis: '250104',
    name: 'Zahra Putri Kirana',
    gender: 'P',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-09-02',
    parentName: 'Dedi Kurniawan',
    parentPhone: '085712348765',
    address: 'Jl. Anggrek No. 20, Blok M',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's105',
    nisn: '0165849205',
    nis: '250105',
    name: 'Fadhil Ihsan Maulana',
    gender: 'L',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-02-14',
    parentName: 'H. Maulana Malik',
    parentPhone: '081299887766',
    address: 'Jl. Bintaro Raya No. 5',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's106',
    nisn: '0165849206',
    nis: '250106',
    name: 'Chelsea Kayla Aurelia',
    gender: 'P',
    classId: 'c1',
    className: 'Kelas 1A',
    birthDate: '2018-11-30',
    parentName: 'Rudy Hartono',
    parentPhone: '081344556677',
    address: 'Jl. Senopati No. 102',
    status: 'aktif',
    createdAt: '2025-07-10',
  },

  // Kelas 1B
  {
    id: 's201',
    nisn: '0165849301',
    nis: '250201',
    name: 'Aldo Bagus Wicaksono',
    gender: 'L',
    classId: 'c2',
    className: 'Kelas 1B',
    birthDate: '2018-03-08',
    parentName: 'Wicaksono Seno',
    parentPhone: '081233445566',
    address: 'Jl. Radio Dalam No. 45',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's202',
    nisn: '0165849302',
    nis: '250202',
    name: 'Nayla Salsabila',
    gender: 'P',
    classId: 'c2',
    className: 'Kelas 1B',
    birthDate: '2018-08-19',
    parentName: 'Iskandar Zulkarnain',
    parentPhone: '085677889900',
    address: 'Jl. Fatmawati No. 88',
    status: 'aktif',
    createdAt: '2025-07-10',
  },
  {
    id: 's203',
    nisn: '0165849303',
    nis: '250203',
    name: 'Rafi Ahmad Fauzi',
    gender: 'L',
    classId: 'c2',
    className: 'Kelas 1B',
    birthDate: '2018-07-04',
    parentName: 'Fauzi Ridwan',
    parentPhone: '081822334455',
    address: 'Jl. Antasari No. 19',
    status: 'aktif',
    createdAt: '2025-07-10',
  },

  // Kelas 2A
  {
    id: 's301',
    nisn: '0154848201',
    nis: '240101',
    name: 'Bima Sakti Yudhistira',
    gender: 'L',
    classId: 'c3',
    className: 'Kelas 2A',
    birthDate: '2017-05-10',
    parentName: 'Yudhistira K',
    parentPhone: '081299001122',
    address: 'Jl. Kemang Raya No. 34',
    status: 'aktif',
    createdAt: '2024-07-12',
  },
  {
    id: 's302',
    nisn: '0154848202',
    nis: '240102',
    name: 'Citra Kirana Dewi',
    gender: 'P',
    classId: 'c3',
    className: 'Kelas 2A',
    birthDate: '2017-09-15',
    parentName: 'Dewi Sartika',
    parentPhone: '087811223344',
    address: 'Jl. Cipete Utara No. 22',
    status: 'aktif',
    createdAt: '2024-07-12',
  },
  {
    id: 's303',
    nisn: '0154848203',
    nis: '240103',
    name: 'Danuarta Wisnu Wardhana',
    gender: 'L',
    classId: 'c3',
    className: 'Kelas 2A',
    birthDate: '2017-01-20',
    parentName: 'Wardhana Tri',
    parentPhone: '085233441199',
    address: 'Jl. Bangka IX No. 11',
    status: 'aktif',
    createdAt: '2024-07-12',
  },

  // Kelas 3A
  {
    id: 's401',
    nisn: '0143847201',
    nis: '230101',
    name: 'Eka Pratama Saputra',
    gender: 'L',
    classId: 'c4',
    className: 'Kelas 3A',
    birthDate: '2016-08-11',
    parentName: 'Saputra Jaya',
    parentPhone: '081277665544',
    address: 'Jl. Panglima Polim No. 70',
    status: 'aktif',
    createdAt: '2023-07-10',
  },
  {
    id: 's402',
    nisn: '0143847202',
    nis: '230102',
    name: 'Farah Diba Azzahra',
    gender: 'P',
    classId: 'c4',
    className: 'Kelas 3A',
    birthDate: '2016-12-04',
    parentName: 'Azzahra Syarif',
    parentPhone: '081399881122',
    address: 'Jl. Gandaria Tengah No. 5',
    status: 'aktif',
    createdAt: '2023-07-10',
  },

  // Kelas 4A
  {
    id: 's501',
    nisn: '0132846201',
    nis: '220101',
    name: 'Gilang Ramadhan',
    gender: 'L',
    classId: 'c5',
    className: 'Kelas 4A',
    birthDate: '2015-06-17',
    parentName: 'Ramadhan Ali',
    parentPhone: '081900112233',
    address: 'Jl. Kyai Maja No. 3',
    status: 'aktif',
    createdAt: '2022-07-11',
  },
  {
    id: 's502',
    nisn: '0132846202',
    nis: '220102',
    name: 'Hana Alisyahbana',
    gender: 'P',
    classId: 'c5',
    className: 'Kelas 4A',
    birthDate: '2015-10-23',
    parentName: 'Sutan Alisyahbana',
    parentPhone: '085711229988',
    address: 'Jl. Barito No. 29',
    status: 'aktif',
    createdAt: '2022-07-11',
  },

  // Kelas 5A
  {
    id: 's601',
    nisn: '0121845201',
    nis: '210101',
    name: 'Ilham Bintang Wicaksana',
    gender: 'L',
    classId: 'c6',
    className: 'Kelas 5A',
    birthDate: '2014-03-01',
    parentName: 'Wicaksana Eko',
    parentPhone: '081288776655',
    address: 'Jl. Melawai Raya No. 18',
    status: 'aktif',
    createdAt: '2021-07-12',
  },
  {
    id: 's602',
    nisn: '0121845202',
    nis: '210102',
    name: 'Jessica Intan Maharani',
    gender: 'P',
    classId: 'c6',
    className: 'Kelas 5A',
    birthDate: '2014-07-28',
    parentName: 'Maharani Teguh',
    parentPhone: '081322114433',
    address: 'Jl. Dharmawangsa No. 6',
    status: 'aktif',
    createdAt: '2021-07-12',
  },
  {
    id: 's603',
    nisn: '0121845203',
    nis: '210103',
    name: 'Kevin Jonathan Siregar',
    gender: 'L',
    classId: 'c6',
    className: 'Kelas 5A',
    birthDate: '2014-09-12',
    parentName: 'Siregar Tumpal',
    parentPhone: '087788990011',
    address: 'Jl. RS Fatmawati No. 10',
    status: 'aktif',
    createdAt: '2021-07-12',
  },
  {
    id: 's604',
    nisn: '0121845204',
    nis: '210104',
    name: 'Larasati Prameswari',
    gender: 'P',
    classId: 'c6',
    className: 'Kelas 5A',
    birthDate: '2014-04-19',
    parentName: 'Prameswari Joko',
    parentPhone: '081911228833',
    address: 'Jl. Senayan Timur No. 15',
    status: 'aktif',
    createdAt: '2021-07-12',
  },

  // Kelas 6A
  {
    id: 's701',
    nisn: '0110844201',
    nis: '200101',
    name: 'Muhammad Akbar Syahputra',
    gender: 'L',
    classId: 'c8',
    className: 'Kelas 6A',
    birthDate: '2013-02-17',
    parentName: 'Syahputra Hendri',
    parentPhone: '081299884422',
    address: 'Jl. Wijaya I No. 40',
    status: 'aktif',
    createdAt: '2020-07-13',
  },
  {
    id: 's702',
    nisn: '0110844202',
    nis: '200102',
    name: 'Nabila Nur Aini',
    gender: 'P',
    classId: 'c8',
    className: 'Kelas 6A',
    birthDate: '2013-08-05',
    parentName: 'Aini Mustofa',
    parentPhone: '085611223344',
    address: 'Jl. Iskandarsyah No. 12',
    status: 'aktif',
    createdAt: '2020-07-13',
  },
];

// Helper to get formatted date string
const getPastDate = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// Generate realistic dummy attendance data for last 7 days + today
export const generateInitialAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const todayStr = getTodayDateString();
  const dates = [
    getPastDate(6),
    getPastDate(5),
    getPastDate(4),
    getPastDate(3),
    getPastDate(2),
    getPastDate(1),
    todayStr,
  ];

  initialStudents.forEach((student, sIdx) => {
    dates.forEach((date, dIdx) => {
      // Deterministic realistic distribution
      let status: 'H' | 'S' | 'I' | 'A' | 'T' = 'H';
      let timeIn = '06:50';
      let notes = '';

      const seed = (sIdx * 7 + dIdx * 13) % 100;
      if (seed === 95 || seed === 12) {
        status = 'S';
        timeIn = undefined as any;
        notes = 'Demam dan flu (Istirahat)';
      } else if (seed === 88 || seed === 34) {
        status = 'I';
        timeIn = undefined as any;
        notes = 'Acara keluarga di luar kota';
      } else if (seed === 99) {
        status = 'A';
        timeIn = undefined as any;
        notes = 'Tanpa pemberitahuan';
      } else if (seed === 70 || seed === 25) {
        status = 'T';
        timeIn = '07:18';
        notes = 'Terlambat 8 menit (macet)';
      } else {
        // Hadir normal
        const minutes = 45 + ((sIdx + dIdx) % 15);
        timeIn = `06:${minutes.toString().padStart(2, '0')}`;
      }

      records.push({
        id: `att-${student.id}-${date}`,
        studentId: student.id,
        studentName: student.name,
        studentNisn: student.nisn,
        classId: student.classId,
        className: student.className,
        date: date,
        status: status,
        timeIn: timeIn,
        notes: notes,
        recordedBy: 'Sistem Absensi SD',
        verifiedAt: `${date} 07:30`,
      });
    });
  });

  return records;
};

export const initialLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr-1',
    studentId: 's102',
    studentName: 'Anisa Rahmawati',
    className: 'Kelas 1A',
    parentName: 'Bambang Irawan',
    type: 'Sakit',
    startDate: getTodayDateString(),
    endDate: getTodayDateString(),
    reason: 'Anak mengalami demam panas 38.5°C sejak semalam dan disarankan istirahat oleh dokter klinik.',
    status: 'Pending',
    submittedAt: `${getTodayDateString()} 06:15`,
  },
  {
    id: 'lr-2',
    studentId: 's603',
    studentName: 'Kevin Jonathan Siregar',
    className: 'Kelas 5A',
    parentName: 'Siregar Tumpal',
    type: 'Izin',
    startDate: getTodayDateString(),
    endDate: getPastDate(-1), // Besok
    reason: 'Menghadiri pernikahan paman di Medan bersama seluruh keluarga inti.',
    status: 'Disetujui',
    submittedAt: `${getPastDate(1)} 19:40`,
    reviewedBy: 'Bapak Hendra Gunawan, S.Pd.',
    reviewedAt: `${getPastDate(1)} 20:10`,
  },
  {
    id: 'lr-3',
    studentId: 's301',
    studentName: 'Bima Sakti Yudhistira',
    className: 'Kelas 2A',
    parentName: 'Yudhistira K',
    type: 'Sakit',
    startDate: getPastDate(2),
    endDate: getPastDate(2),
    reason: 'Sakit gigi dan periksa ke dokter gigi.',
    status: 'Disetujui',
    submittedAt: `${getPastDate(2)} 06:30`,
    reviewedBy: 'Ibu Sri Wahyuni, S.Pd.',
    reviewedAt: `${getPastDate(2)} 07:00`,
  },
];

export const initialRolePermissionsMatrix: RolePermissionsMatrix = {
  admin: {
    role: 'admin',
    label: 'Administrator / Kepala Sekolah & Operator',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Akses penuh ke semua modul, konfigurasi sekolah, manajemen siswa & rombel, serta pengaturan hak akses pengguna.',
    allowedTabs: [
      'dashboard',
      'presensi-harian',
      'data-siswa',
      'data-kelas',
      'import-data',
      'rekap-laporan',
      'pengajuan-izin',
      'kartu-pelajar',
      'backup-restore',
      'pengaturan',
    ],
    permissions: {
      canViewDashboard: true,
      canMarkAttendance: true,
      canEditAttendance: true,
      canManageStudents: true,
      canManageClasses: true,
      canImportExportData: true,
      canViewReports: true,
      canApproveLeave: true,
      canGenerateCards: true,
      canManageSettings: true,
      canManagePermissions: true,
      restrictedToAssignedClass: false,
    },
  },
  guru: {
    role: 'guru',
    label: 'Guru Kelas / Wali Kelas & Pendidik',
    badgeColor: 'bg-sky-700 text-white',
    description: 'Akses presensi harian, kelola siswa kelas binaan, persetujuan surat izin, rekap laporan kelas, dan cetak kartu siswa.',
    allowedTabs: [
      'dashboard',
      'presensi-harian',
      'data-siswa',
      'rekap-laporan',
      'pengajuan-izin',
      'kartu-pelajar',
    ],
    permissions: {
      canViewDashboard: true,
      canMarkAttendance: true,
      canEditAttendance: true,
      canManageStudents: false, // Guru hanya melihat data siswa kelasnya tanpa hapus/tambah global
      canManageClasses: false,
      canImportExportData: false,
      canViewReports: true,
      canApproveLeave: true,
      canGenerateCards: true,
      canManageSettings: false,
      canManagePermissions: false,
      restrictedToAssignedClass: true,
    },
  },
  wali_murid: {
    role: 'wali_murid',
    label: 'Orang Tua / Wali Siswa',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Akses melihat riwayat presensi anak, ringkasan kehadiran harian, dan pengajuan permohonan surat izin/sakit.',
    allowedTabs: ['dashboard', 'pengajuan-izin'],
    permissions: {
      canViewDashboard: true,
      canMarkAttendance: false,
      canEditAttendance: false,
      canManageStudents: false,
      canManageClasses: false,
      canImportExportData: false,
      canViewReports: false,
      canApproveLeave: false,
      canGenerateCards: false,
      canManageSettings: false,
      canManagePermissions: false,
      restrictedToAssignedClass: true,
    },
  },
};

export const demoUsers: UserSession[] = [
  {
    id: 'u1',
    name: 'Ibu Ratna Dewi, S.Pd.',
    email: 'ratna.dewi@sdn01harapanbangsa.sch.id',
    username: 'ratnadewi',
    nip: '19850412 201001 2 015',
    password: 'guru123',
    phone: '0812-4567-8901',
    role: 'guru',
    roleTitle: 'Wali Kelas 1A',
    assignedClass: 'c1',
    isActive: true,
    lastLogin: '2026-08-29 07:15',
  },
  {
    id: 'u2',
    name: 'Dra. Hj. Siti Rahmawati, M.Pd.',
    email: 'kepsek@sdn01harapanbangsa.sch.id',
    username: 'admin',
    nip: '19680512 199303 2 004',
    password: 'admin123',
    phone: '0811-9876-5432',
    role: 'admin',
    roleTitle: 'Kepala Sekolah / Admin Utama',
    isActive: true,
    lastLogin: '2026-08-29 06:45',
  },
  {
    id: 'u3',
    name: 'Bapak Hendra Gunawan, S.Pd.',
    email: 'hendra.gunawan@sdn01harapanbangsa.sch.id',
    username: 'hendragunawan',
    nip: '19860618 201101 1 007',
    password: 'guru123',
    phone: '0813-9876-5412',
    role: 'guru',
    roleTitle: 'Wali Kelas 5A',
    assignedClass: 'c6',
    isActive: true,
    lastLogin: '2026-08-28 14:20',
  },
  {
    id: 'u4',
    name: 'Bapak Ahmad Fauzi, S.Pd.',
    email: 'ahmad.fauzi@sdn01harapanbangsa.sch.id',
    username: 'ahmadfauzi',
    nip: '19870823 201201 1 009',
    password: 'guru123',
    phone: '0812-8765-4321',
    role: 'guru',
    roleTitle: 'Wali Kelas 1B',
    assignedClass: 'c2',
    isActive: true,
    lastLogin: '2026-08-28 11:30',
  },
  {
    id: 'u5',
    name: 'Ferry Ramadhani, S.Kom.',
    email: 'operator@sdn01harapanbangsa.sch.id',
    username: 'operator',
    nip: '19920815 201802 1 003',
    password: 'admin123',
    phone: '0812-3456-7890',
    role: 'admin',
    roleTitle: 'Operator Dapodik & Presensi',
    isActive: true,
    lastLogin: '2026-08-29 08:00',
  },
  {
    id: 'u6',
    name: 'Bapak Agus Pratama (Wali Siswa)',
    email: 'agus.pratama@gmail.com',
    username: 'aguspratama',
    nip: '-',
    password: 'ortu123',
    phone: '0812-9876-5432',
    role: 'wali_murid',
    roleTitle: 'Orang Tua / Wali Siswa (M. Rizky - 1A)',
    assignedClass: 'c1',
    isActive: true,
    lastLogin: '2026-08-29 06:10',
  },
];

export const initialNationalHolidays: NationalHoliday[] = [
  // 2025
  { id: 'hol-2025-01', date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', category: 'nasional' },
  { id: 'hol-2025-02', date: '2025-01-27', name: "Isra Mi'raj Nabi Muhammad SAW", category: 'keagamaan' },
  { id: 'hol-2025-03', date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', category: 'keagamaan' },
  { id: 'hol-2025-04', date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', category: 'keagamaan' },
  { id: 'hol-2025-05', date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H (Hari ke-1)', category: 'keagamaan' },
  { id: 'hol-2025-06', date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H (Hari ke-2)', category: 'keagamaan' },
  { id: 'hol-2025-07', date: '2025-04-18', name: 'Wafat Yesus Kristus (Jumat Agung)', category: 'keagamaan' },
  { id: 'hol-2025-08', date: '2025-04-20', name: 'Kebangkitan Yesus Kristus (Paskah)', category: 'keagamaan' },
  { id: 'hol-2025-09', date: '2025-05-01', name: 'Hari Buruh Internasional', category: 'nasional' },
  { id: 'hol-2025-10', date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', category: 'keagamaan' },
  { id: 'hol-2025-11', date: '2025-05-29', name: 'Kenaikan Yesus Kristus', category: 'keagamaan' },
  { id: 'hol-2025-12', date: '2025-06-01', name: 'Hari Lahir Pancasila', category: 'nasional' },
  { id: 'hol-2025-13', date: '2025-06-06', name: 'Hari Raya Idul Adha 1446 H', category: 'keagamaan' },
  { id: 'hol-2025-14', date: '2025-06-27', name: '1 Muharam / Tahun Baru Islam 1447 H', category: 'keagamaan' },
  { id: 'hol-2025-15', date: '2025-08-17', name: 'Hari Proklamasi Kemerdekaan RI ke-80', category: 'nasional' },
  { id: 'hol-2025-16', date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', category: 'keagamaan' },
  { id: 'hol-2025-17', date: '2025-12-25', name: 'Hari Raya Natal', category: 'keagamaan' },

  // 2026
  { id: 'hol-2026-01', date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', category: 'nasional' },
  { id: 'hol-2026-02', date: '2026-01-16', name: "Isra Mi'raj Nabi Muhammad SAW", category: 'keagamaan' },
  { id: 'hol-2026-03', date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', category: 'keagamaan' },
  { id: 'hol-2026-04', date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', category: 'keagamaan' },
  { id: 'hol-2026-05', date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H (Hari ke-1)', category: 'keagamaan' },
  { id: 'hol-2026-06', date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H (Hari ke-2)', category: 'keagamaan' },
  { id: 'hol-2026-07', date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)', category: 'keagamaan' },
  { id: 'hol-2026-08', date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)', category: 'keagamaan' },
  { id: 'hol-2026-09', date: '2026-05-01', name: 'Hari Buruh Internasional', category: 'nasional' },
  { id: 'hol-2026-10', date: '2026-05-14', name: 'Kenaikan Yesus Kristus', category: 'keagamaan' },
  { id: 'hol-2026-11', date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H', category: 'keagamaan' },
  { id: 'hol-2026-12', date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', category: 'keagamaan' },
  { id: 'hol-2026-13', date: '2026-06-01', name: 'Hari Lahir Pancasila', category: 'nasional' },
  { id: 'hol-2026-14', date: '2026-06-17', name: 'Tahun Baru Islam 1448 H', category: 'keagamaan' },
  { id: 'hol-2026-15', date: '2026-08-17', name: 'Hari Proklamasi Kemerdekaan RI ke-81', category: 'nasional' },
  { id: 'hol-2026-16', date: '2026-08-26', name: 'Maulid Nabi Muhammad SAW', category: 'keagamaan' },
  { id: 'hol-2026-17', date: '2026-12-25', name: 'Hari Raya Natal', category: 'keagamaan' },

  // 2027
  { id: 'hol-2027-01', date: '2027-01-01', name: 'Tahun Baru 2027 Masehi', category: 'nasional' },
  { id: 'hol-2027-02', date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili', category: 'keagamaan' },
  { id: 'hol-2027-03', date: '2027-03-09', name: 'Hari Raya Idul Fitri 1448 H', category: 'keagamaan' },
  { id: 'hol-2027-04', date: '2027-05-01', name: 'Hari Buruh Internasional', category: 'nasional' },
  { id: 'hol-2027-05', date: '2027-06-01', name: 'Hari Lahir Pancasila', category: 'nasional' },
  { id: 'hol-2027-06', date: '2027-08-17', name: 'Hari Proklamasi Kemerdekaan RI ke-82', category: 'nasional' },
  { id: 'hol-2027-07', date: '2027-12-25', name: 'Hari Raya Natal', category: 'keagamaan' },
];

