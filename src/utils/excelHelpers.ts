import * as XLSX from 'xlsx';
import { Student, ClassRoom, AttendanceRecord } from '../types';

/**
 * Downloads a pre-formatted Excel template for importing student data.
 * Contains both sample student rows and a comprehensive guide sheet.
 */
export function downloadStudentTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Template Data Siswa
  const studentRows = [
    {
      'NISN*': '0165849201',
      'NIS*': '250101',
      'Nama Lengkap*': 'Muhammad Rizky Pratama',
      'Jenis Kelamin (L/P)*': 'L',
      'Kelas*': 'Kelas 1A',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-04-12',
      'Nama Orang Tua / Wali': 'Agus Pratama',
      'No HP / WA Ortu': '081298765432',
      'Alamat Lengkap': 'Jl. Melati No. 12, Kebayoran Baru',
      'Status Siswa': 'aktif',
    },
    {
      'NISN*': '0165849202',
      'NIS*': '250102',
      'Nama Lengkap*': 'Anisa Rahmawati',
      'Jenis Kelamin (L/P)*': 'P',
      'Kelas*': 'Kelas 1A',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-06-25',
      'Nama Orang Tua / Wali': 'Bambang Irawan',
      'No HP / WA Ortu': '081387654321',
      'Alamat Lengkap': 'Jl. Mawar No. 8, Gandaria',
      'Status Siswa': 'aktif',
    },
    {
      'NISN*': '0165849203',
      'NIS*': '250103',
      'Nama Lengkap*': 'Bagas Dwi Saputra',
      'Jenis Kelamin (L/P)*': 'L',
      'Kelas*': 'Kelas 1A',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-02-18',
      'Nama Orang Tua / Wali': 'Dwi Haryanto',
      'No HP / WA Ortu': '081234567890',
      'Alamat Lengkap': 'Jl. Anggrek No. 15, Cipete',
      'Status Siswa': 'aktif',
    },
    {
      'NISN*': '0165849204',
      'NIS*': '250104',
      'Nama Lengkap*': 'Cantika Putri Maharani',
      'Jenis Kelamin (L/P)*': 'P',
      'Kelas*': 'Kelas 1B',
      'Tanggal Lahir (YYYY-MM-DD)': '2018-09-03',
      'Nama Orang Tua / Wali': 'Maharani Dewi',
      'No HP / WA Ortu': '081598761234',
      'Alamat Lengkap': 'Jl. Cempaka No. 20, Tebet',
      'Status Siswa': 'aktif',
    },
    {
      'NISN*': '0154839101',
      'NIS*': '240201',
      'Nama Lengkap*': 'Fajar Nugroho',
      'Jenis Kelamin (L/P)*': 'L',
      'Kelas*': 'Kelas 2A',
      'Tanggal Lahir (YYYY-MM-DD)': '2017-08-11',
      'Nama Orang Tua / Wali': 'Budi Nugroho',
      'No HP / WA Ortu': '081765432109',
      'Alamat Lengkap': 'Jl. Kenanga No. 5, Pancoran',
      'Status Siswa': 'aktif',
    },
  ];

  const wsStudents = XLSX.utils.json_to_sheet(studentRows);

  // Set column widths for clarity
  wsStudents['!cols'] = [
    { wch: 16 }, // NISN
    { wch: 12 }, // NIS
    { wch: 28 }, // Nama
    { wch: 20 }, // JK
    { wch: 14 }, // Kelas
    { wch: 26 }, // Tgl Lahir
    { wch: 24 }, // Ortu
    { wch: 18 }, // No HP
    { wch: 36 }, // Alamat
    { wch: 14 }, // Status
  ];

  XLSX.utils.book_append_sheet(wb, wsStudents, 'Data_Siswa');

  // Sheet 2: Petunjuk Pengisian
  const guideRows = [
    {
      'Nama Kolom': 'NISN*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan / Format': 'Nomor Induk Siswa Nasional (10 digit angka). Wajib unik.',
      'Contoh Nilai': '0165849201',
    },
    {
      'Nama Kolom': 'NIS*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan / Format': 'Nomor Induk Siswa lokal sekolah (4-8 digit).',
      'Contoh Nilai': '250101',
    },
    {
      'Nama Kolom': 'Nama Lengkap*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan / Format': 'Nama lengkap siswa sesuai akta lahir / ijazah.',
      'Contoh Nilai': 'Muhammad Rizky Pratama',
    },
    {
      'Nama Kolom': 'Jenis Kelamin (L/P)*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan / Format': 'Isi dengan huruf "L" (Laki-laki) atau "P" (Perempuan).',
      'Contoh Nilai': 'L atau P',
    },
    {
      'Nama Kolom': 'Kelas*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan / Format': 'Nama rombongan belajar (Contoh: "Kelas 1A", "Kelas 2B", "1A"). Jika belum ada di sistem, akan otomatis dibuatkan kelas baru.',
      'Contoh Nilai': 'Kelas 1A',
    },
    {
      'Nama Kolom': 'Tanggal Lahir (YYYY-MM-DD)',
      'Wajib/Opsional': 'Opsional',
      'Keterangan / Format': 'Format baku Tahun-Bulan-Tanggal (YYYY-MM-DD).',
      'Contoh Nilai': '2018-04-12',
    },
    {
      'Nama Kolom': 'Nama Orang Tua / Wali',
      'Wajib/Opsional': 'Opsional',
      'Keterangan / Format': 'Nama Ayah, Ibu, atau Wali yang dapat dihubungi.',
      'Contoh Nilai': 'Agus Pratama',
    },
    {
      'Nama Kolom': 'No HP / WA Ortu',
      'Wajib/Opsional': 'Opsional',
      'Keterangan / Format': 'Nomor telepon/WhatsApp aktif orang tua untuk notifikasi absensi.',
      'Contoh Nilai': '081298765432',
    },
    {
      'Nama Kolom': 'Alamat Lengkap',
      'Wajib/Opsional': 'Opsional',
      'Keterangan / Format': 'Alamat domisili tempat tinggal siswa.',
      'Contoh Nilai': 'Jl. Melati No. 12, Kebayoran Baru',
    },
    {
      'Nama Kolom': 'Status Siswa',
      'Wajib/Opsional': 'Opsional',
      'Keterangan / Format': 'Pilihan: "aktif", "mutasi", atau "lulus". Default jika kosong: "aktif".',
      'Contoh Nilai': 'aktif',
    },
  ];

  const wsGuide = XLSX.utils.json_to_sheet(guideRows);
  wsGuide['!cols'] = [
    { wch: 26 },
    { wch: 16 },
    { wch: 55 },
    { wch: 25 },
  ];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk_Pengisian');

  // Trigger download
  XLSX.writeFile(wb, 'Template_Import_Data_Siswa_SD.xlsx');
}

/**
 * Downloads a pre-formatted Excel template for importing classes and homeroom teachers.
 */
export function downloadClassTemplate() {
  const wb = XLSX.utils.book_new();

  const classRows = [
    {
      'Nama Kelas*': 'Kelas 1A',
      'Tingkat (1-6)*': 1,
      'Nama Wali Kelas*': 'Ibu Ratna Dewi, S.Pd.',
      'NIP Wali Kelas': '19850412 201001 2 015',
      'Nomor Ruangan': 'R. 101',
      'Tahun Ajaran*': '2025/2026',
    },
    {
      'Nama Kelas*': 'Kelas 1B',
      'Tingkat (1-6)*': 1,
      'Nama Wali Kelas*': 'Bapak Ahmad Fauzi, S.Pd.',
      'NIP Wali Kelas': '19870823 201201 1 009',
      'Nomor Ruangan': 'R. 102',
      'Tahun Ajaran*': '2025/2026',
    },
    {
      'Nama Kelas*': 'Kelas 2A',
      'Tingkat (1-6)*': 2,
      'Nama Wali Kelas*': 'Ibu Sri Wahyuni, S.Pd.',
      'NIP Wali Kelas': '19820115 200801 2 011',
      'Nomor Ruangan': 'R. 103',
      'Tahun Ajaran*': '2025/2026',
    },
  ];

  const wsClass = XLSX.utils.json_to_sheet(classRows);
  wsClass['!cols'] = [
    { wch: 16 },
    { wch: 16 },
    { wch: 30 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsClass, 'Data_Kelas');

  const guideRows = [
    {
      'Nama Kolom': 'Nama Kelas*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan': 'Nama rombongan belajar sekolah dasar.',
      'Contoh': 'Kelas 1A',
    },
    {
      'Nama Kolom': 'Tingkat (1-6)*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan': 'Angka 1 sampai 6 mewakili jenjang kelas SD.',
      'Contoh': '1',
    },
    {
      'Nama Kolom': 'Nama Wali Kelas*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan': 'Nama guru penanggung jawab kelas beserta gelar.',
      'Contoh': 'Ibu Ratna Dewi, S.Pd.',
    },
    {
      'Nama Kolom': 'NIP Wali Kelas',
      'Wajib/Opsional': 'Opsional',
      'Keterangan': 'Nomor Induk Pegawai guru (18 digit atau kosong jika honorer).',
      'Contoh': '19850412 201001 2 015',
    },
    {
      'Nama Kolom': 'Nomor Ruangan',
      'Wajib/Opsional': 'Opsional',
      'Keterangan': 'Kode atau nama gedung/ruangan kelas.',
      'Contoh': 'R. 101',
    },
    {
      'Nama Kolom': 'Tahun Ajaran*',
      'Wajib/Opsional': 'WAJIB',
      'Keterangan': 'Periode tahun ajaran aktif.',
      'Contoh': '2025/2026',
    },
  ];

  const wsGuide = XLSX.utils.json_to_sheet(guideRows);
  wsGuide['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 45 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk');

  XLSX.writeFile(wb, 'Template_Import_Data_Kelas_SD.xlsx');
}

/**
 * Downloads a pre-formatted Excel template for importing attendance logs.
 */
export function downloadAttendanceTemplate() {
  const wb = XLSX.utils.book_new();

  const attRows = [
    {
      'NISN Siswa*': '0165849201',
      'Nama Siswa': 'Muhammad Rizky Pratama',
      'Kelas': 'Kelas 1A',
      'Tanggal (YYYY-MM-DD)*': new Date().toISOString().split('T')[0],
      'Status Kehadiran (H/S/I/A/T)*': 'H',
      'Jam Masuk (HH:MM)': '06:55',
      'Catatan': 'Tepat waktu via scan QR',
    },
    {
      'NISN Siswa*': '0165849202',
      'Nama Siswa': 'Anisa Rahmawati',
      'Kelas': 'Kelas 1A',
      'Tanggal (YYYY-MM-DD)*': new Date().toISOString().split('T')[0],
      'Status Kehadiran (H/S/I/A/T)*': 'S',
      'Jam Masuk (HH:MM)': '',
      'Catatan': 'Surat dokter terlampir',
    },
    {
      'NISN Siswa*': '0165849203',
      'Nama Siswa': 'Bagas Dwi Saputra',
      'Kelas': 'Kelas 1A',
      'Tanggal (YYYY-MM-DD)*': new Date().toISOString().split('T')[0],
      'Status Kehadiran (H/S/I/A/T/LN)*': 'T',
      'Jam Masuk (HH:MM)': '07:20',
      'Catatan': 'Terlambat 5 menit macet',
    },
    {
      'NISN Siswa*': '0165849204',
      'Nama Siswa': 'Cantika Putri Maharani',
      'Kelas': 'Kelas 1B',
      'Tanggal (YYYY-MM-DD)*': '2025-08-17',
      'Status Kehadiran (H/S/I/A/T/LN)*': 'LN',
      'Jam Masuk (HH:MM)': '',
      'Catatan': 'Hari Proklamasi Kemerdekaan RI',
    },
  ];

  const wsAtt = XLSX.utils.json_to_sheet(attRows);
  wsAtt['!cols'] = [
    { wch: 16 },
    { wch: 26 },
    { wch: 14 },
    { wch: 22 },
    { wch: 32 },
    { wch: 18 },
    { wch: 32 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAtt, 'Data_Presensi');

  const guideRows = [
    { 'Kode': 'H', 'Arti': 'Hadir', 'Keterangan': 'Siswa hadir di sekolah tepat waktu' },
    { 'Kode': 'S', 'Arti': 'Sakit', 'Keterangan': 'Siswa tidak hadir karena sakit dengan surat izin' },
    { 'Kode': 'I', 'Arti': 'Izin', 'Keterangan': 'Siswa tidak hadir karena keperluan keluarga/tertentu' },
    { 'Kode': 'A', 'Arti': 'Alpa', 'Keterangan': 'Siswa tidak hadir tanpa ada pemberitahuan/keterangan' },
    { 'Kode': 'T', 'Arti': 'Terlambat', 'Keterangan': 'Siswa hadir melewati jam batas toleransi (07:15)' },
    { 'Kode': 'LN', 'Arti': 'Libur Nasional', 'Keterangan': 'Hari Libur Nasional resmi atau libur sekolah' },
  ];
  const wsGuide = XLSX.utils.json_to_sheet(guideRows);
  wsGuide['!cols'] = [{ wch: 10 }, { wch: 14 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Kode_Status');

  XLSX.writeFile(wb, 'Template_Import_Presensi_SD.xlsx');
}

/**
 * Parses an Excel / CSV file into raw JSON rows.
 */
export async function parseExcelFile(file: File): Promise<{
  sheetNames: string[];
  data: Record<string, any>[];
  headers: string[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          throw new Error('Gagal membaca file Excel');
        }

        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
          throw new Error('File Excel tidak memiliki lembar kerja (worksheet)');
        }

        // Pick first non-guide sheet or first sheet
        let targetSheetName = sheetNames[0];
        const dataSheet = sheetNames.find(
          (name) =>
            !name.toLowerCase().includes('petunjuk') &&
            !name.toLowerCase().includes('guide') &&
            !name.toLowerCase().includes('kode')
        );
        if (dataSheet) {
          targetSheetName = dataSheet;
        }

        const worksheet = workbook.Sheets[targetSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        // Get headers
        const headers: string[] = [];
        if (rawJson.length > 0) {
          Object.keys(rawJson[0]).forEach((k) => headers.push(k));
        }

        resolve({
          sheetNames,
          data: rawJson,
          headers,
        });
      } catch (err: any) {
        reject(new Error(err?.message || 'Gagal memproses file Excel'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Terjadi kesalahan saat membaca file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Exports current students list to Excel.
 */
export function exportStudentsToExcel(students: Student[], classes: ClassRoom[]) {
  const exportRows = students.map((s, idx) => ({
    'No': idx + 1,
    'NISN': s.nisn,
    'NIS': s.nis,
    'Nama Lengkap': s.name,
    'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
    'Kelas': s.className,
    'Tanggal Lahir': s.birthDate || '-',
    'Nama Orang Tua / Wali': s.parentName || '-',
    'No WhatsApp Ortu': s.parentPhone || '-',
    'Alamat': s.address || '-',
    'Status Siswa': s.status.toUpperCase(),
    'Tanggal Terdaftar': s.createdAt || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);

  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 18 },
    { wch: 14 },
    { wch: 16 },
    { wch: 24 },
    { wch: 18 },
    { wch: 34 },
    { wch: 14 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Master_Data_Siswa');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Data_Siswa_SD_${dateStr}.xlsx`);
}

/**
 * Exports classes list to Excel.
 */
export function exportClassesToExcel(classes: ClassRoom[], students: Student[]) {
  const exportRows = classes.map((c, idx) => {
    const totalCount = students.filter((s) => s.classId === c.id && s.status === 'aktif').length;
    return {
      'No': idx + 1,
      'Nama Kelas': c.name,
      'Tingkat': `Kelas ${c.grade}`,
      'Wali Kelas': c.teacherName,
      'NIP Guru': c.teacherNip || '-',
      'Ruang Kelas': c.roomNumber || '-',
      'Tahun Ajaran': c.academicYear,
      'Jumlah Siswa Aktif': totalCount,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 14 },
    { wch: 28 },
    { wch: 24 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Data_Kelas');
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Data_Kelas_SD_${dateStr}.xlsx`);
}

/**
 * Exports monthly or date-range attendance matrix table to Excel.
 */
export function exportAttendanceMatrixToExcel(
  schoolProfile: any,
  activeClass: any,
  reportDates: string[],
  studentMatrix: any[]
) {
  const wb = XLSX.utils.book_new();

  const isSunday = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.getDay() === 0;
  };

  const headers = [
    'No',
    'NISN',
    'NIS',
    'Nama Siswa',
    'L/P',
    'Kelas',
    ...reportDates.map((d) => {
      const dateObj = new Date(d + 'T00:00:00');
      const dayNum = dateObj.getDate();
      const isSun = isSunday(d);
      const dayName = isSun ? 'Min' : dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
      return `${dayNum} (${dayName})`;
    }),
    'Hadir (H)',
    'Terlambat (T)',
    'Sakit (S)',
    'Izin (I)',
    'Alpa (A)',
    'Libur Nas (LN)',
    '% Kehadiran',
  ];

  const rows = studentMatrix.map((m, idx) => {
    const rowObj: Record<string, any> = {
      'No': idx + 1,
      'NISN': m.student.nisn,
      'NIS': m.student.nis,
      'Nama Siswa': m.student.name,
      'L/P': m.student.gender,
      'Kelas': m.student.className,
    };

    m.dateStatuses.forEach((ds: any, dIdx: number) => {
      const colHeader = headers[6 + dIdx];
      rowObj[colHeader] = ds.status;
    });

    rowObj['Hadir (H)'] = m.hCount;
    rowObj['Terlambat (T)'] = m.tCount;
    rowObj['Sakit (S)'] = m.sCount;
    rowObj['Izin (I)'] = m.iCount;
    rowObj['Alpa (A)'] = m.aCount;
    rowObj['Libur Nas (LN)'] = m.lnCount || 0;
    rowObj['% Kehadiran'] = `${m.rate}%`;

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },
    { wch: 16 },
    { wch: 12 },
    { wch: 28 },
    { wch: 6 },
    { wch: 14 },
    ...reportDates.map(() => ({ wch: 9 })),
    { wch: 10 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Presensi_Bulanan');
  const className = activeClass ? activeClass.name.replace(/\s+/g, '_') : 'Semua_Kelas';
  XLSX.writeFile(
    wb,
    `Rekap_Presensi_${schoolProfile?.name ? schoolProfile.name.replace(/\s+/g, '_') : 'SD'}_${className}_${reportDates[0]}_sd_${reportDates[reportDates.length - 1]}.xlsx`
  );
}
