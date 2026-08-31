import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  PhoneCall,
  Eye,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Award,
  FileUp,
  Download,
} from 'lucide-react';
import { downloadStudentTemplate, exportStudentsToExcel } from '../../utils/excelHelpers';

export const StudentsMasterView: React.FC = () => {
  const {
    students,
    classes,
    addStudent,
    updateStudent,
    deleteStudent,
    attendanceRecords,
    setActiveTab,
  } = useApp();

  // Search, Filter, Sort, Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'nisn' | 'className'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    nisn: '',
    nis: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    classId: classes[0]?.id || 'c1',
    className: classes[0]?.name || 'Kelas 1A',
    birthDate: '2018-01-01',
    parentName: '',
    parentPhone: '',
    address: '',
    status: 'aktif' as 'aktif' | 'mutasi' | 'lulus',
  });

  const resetForm = () => {
    setFormData({
      nisn: '',
      nis: '',
      name: '',
      gender: 'L',
      classId: classes[0]?.id || 'c1',
      className: classes[0]?.name || 'Kelas 1A',
      birthDate: '2018-01-01',
      parentName: '',
      parentPhone: '',
      address: '',
      status: 'aktif',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    // Auto-generate random realistic NISN & NIS
    const randomNisn = `01${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomNis = `250${Math.floor(100 + Math.random() * 900)}`;
    setFormData((prev) => ({ ...prev, nisn: randomNisn, nis: randomNis }));
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nisn: student.nisn,
      nis: student.nis,
      name: student.name,
      gender: student.gender,
      classId: student.classId,
      className: student.className,
      birthDate: student.birthDate,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      address: student.address,
      status: student.status,
    });
  };

  const handleClassChangeInForm = (cId: string) => {
    const cls = classes.find((c) => c.id === cId);
    setFormData((prev) => ({
      ...prev,
      classId: cId,
      className: cls ? cls.name : prev.className,
    }));
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nisn.trim()) return;

    addStudent(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !formData.name.trim()) return;

    updateStudent(editingStudent.id, formData);
    setEditingStudent(null);
    resetForm();
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
  };

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchesSearch =
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.nisn.includes(searchQuery) ||
          s.nis.includes(searchQuery);
        const matchesClass = selectedClass === 'all' || s.classId === selectedClass;
        const matchesStatus =
          selectedStatus === 'all' || s.status === selectedStatus;
        return matchesSearch && matchesClass && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortBy] || '';
        let valB = b[sortBy] || '';
        if (sortOrder === 'asc') {
          return valA.localeCompare(valB);
        } else {
          return valB.localeCompare(valA);
        }
      });
  }, [students, searchQuery, selectedClass, selectedStatus, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'NIS',
      'Nama Siswa',
      'Jenis Kelamin',
      'Kelas',
      'Nama Orang Tua/Wali',
      'No Telepon/WA',
      'Alamat',
      'Status',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `'${s.nisn}`,
      `'${s.nis}`,
      `"${s.name}"`,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      `"${s.className}"`,
      `"${s.parentName}"`,
      `'${s.parentPhone}`,
      `"${s.address}"`,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_SD_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Student Attendance statistics for Detail Drawer
  const getStudentStats = (studentId: string) => {
    const records = attendanceRecords.filter((r) => r.studentId === studentId);
    const hadir = records.filter((r) => r.status === 'H' || r.status === 'T').length;
    const sakit = records.filter((r) => r.status === 'S').length;
    const izin = records.filter((r) => r.status === 'I').length;
    const alpa = records.filter((r) => r.status === 'A').length;
    const total = records.length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 100;

    return { records, hadir, sakit, izin, alpa, total, rate };
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Master Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Master Data Siswa Sekolah Dasar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total {students.length} siswa terdaftar di {classes.length} rombongan belajar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            id="download-student-template-btn"
            onClick={downloadStudentTemplate}
            className="flex-1 sm:flex-none px-3 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Unduh Template Excel untuk import data siswa"
          >
            <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Template Excel</span>
          </button>

          <button
            id="open-import-excel-students-button"
            onClick={() => setActiveTab('import-data')}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            title="Buka Menu Import Excel Data Siswa"
          >
            <FileUp className="w-4 h-4 text-emerald-100" />
            <span>Import Excel</span>
          </button>

          <button
            id="export-students-excel-button"
            onClick={() => exportStudentsToExcel(students, classes)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Download Master Data Siswa format .xlsx"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          <button
            id="add-student-button"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" />
          <input
            id="students-master-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, NISN, atau NIS..."
            className="w-full pl-9 pr-4 py-2 bg-sky-50/50 dark:bg-slate-800/80 border border-sky-200 dark:border-slate-700 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-sky-50/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-slate-700 text-xs">
            <Layers className="w-3.5 h-3.5 text-sky-500" />
            <select
              id="students-filter-class"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="dark:bg-slate-900">
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-sky-50/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-slate-700 text-xs">
            <select
              id="students-filter-status"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Semua Status</option>
              <option value="aktif" className="dark:bg-slate-900">Aktif</option>
              <option value="mutasi" className="dark:bg-slate-900">Mutasi</option>
              <option value="lulus" className="dark:bg-slate-900">Lulus</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-sky-50/50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-slate-700 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
            <select
              id="students-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="name" className="dark:bg-slate-900">Urut Nama</option>
              <option value="nisn" className="dark:bg-slate-900">Urut NISN</option>
              <option value="className" className="dark:bg-slate-900">Urut Kelas</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-1 font-bold text-sky-600 hover:text-sky-800 dark:text-sky-400 cursor-pointer"
              title="Ganti Urutan (Asc/Desc)"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Students Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200/80 dark:border-sky-900/60 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sky-100 dark:border-slate-800 bg-sky-50/70 dark:bg-slate-800/60 text-[11px] font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">NISN / NIS</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Orang Tua / Wali</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100 dark:divide-slate-800 text-xs">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-sm">Tidak ditemukan siswa</p>
                    <p className="text-xs mt-1">Coba sesuaikan filter atau kata kunci.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-sky-50/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Student Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-slate-800 text-sky-800 dark:text-sky-300 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-200/80 dark:border-slate-700">
                          {student.gender === 'L' ? '👦' : '👧'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {student.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • TTL:{' '}
                            {student.birthDate}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NISN / NIS */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {student.nisn}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        NIS: {student.nis}
                      </div>
                    </td>

                    {/* Class */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-100 dark:bg-slate-800 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-slate-700">
                        {student.className}
                      </span>
                    </td>

                    {/* Parent Info */}
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {student.parentName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <PhoneCall className="w-3 h-3 text-emerald-500" />
                        <span>{student.parentPhone}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={student.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-student-${student.id}`}
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Detail & Rekam Presensi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          id={`edit-student-${student.id}`}
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`delete-student-${student.id}`}
                          onClick={() => setDeletingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-sky-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <strong className="text-slate-800 dark:text-white">
              {filteredStudents.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </strong>{' '}
            -{' '}
            <strong className="text-slate-800 dark:text-white">
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
            </strong>{' '}
            dari{' '}
            <strong className="text-slate-800 dark:text-white">
              {filteredStudents.length}
            </strong>{' '}
            siswa
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-sky-200 dark:border-slate-700 disabled:opacity-30 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-bold text-slate-800 dark:text-white">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-sky-200 dark:border-slate-700 disabled:opacity-30 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          title={isAddModalOpen ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
          subtitle="Formulir data induk siswa sekolah dasar"
          maxWidth="xl"
        >
          <form
            onSubmit={isAddModalOpen ? handleSubmitAdd : handleSubmitEdit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* NISN */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NISN (10 Digit): *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="0165849201"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* NIS */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIS Lokal: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="250101"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Siswa: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Kelamin:
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              {/* Kelas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rombongan Belajar (Kelas): *
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => handleClassChangeInForm(e.target.value)}
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tanggal Lahir:
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Siswa:
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'aktif' | 'mutasi' | 'lulus',
                    })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                >
                  <option value="aktif">Aktif</option>
                  <option value="mutasi">Mutasi</option>
                  <option value="lulus">Lulus</option>
                </select>
              </div>

              {/* Nama Orang Tua */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Orang Tua / Wali: *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                  placeholder="Contoh: Agus Pratama"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* No HP / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WhatsApp Orang Tua: *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.parentPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, parentPhone: e.target.value })
                  }
                  placeholder="081298765432"
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Alamat */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Tempat Tinggal:
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Jl. Melati No. 12..."
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-sky-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                id="submit-student-form-button"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isAddModalOpen ? 'Simpan Siswa Baru' : 'Perbarui Data Siswa'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Student Detail Modal */}
      {viewingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setViewingStudent(null)}
          title={`Profil Siswa: ${viewingStudent.name}`}
          subtitle={`NISN: ${viewingStudent.nisn} • ${viewingStudent.className}`}
          maxWidth="lg"
        >
          {(() => {
            const stats = getStudentStats(viewingStudent.id);
            return (
              <div className="space-y-6">
                {/* Header card with attendance badge & rate */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 text-white flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white/20 flex items-center justify-center text-xl">
                      {viewingStudent.gender === 'L' ? '👦' : '👧'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{viewingStudent.name}</h4>
                      <p className="text-xs text-sky-100">
                        {viewingStudent.className} • NIS: {viewingStudent.nis}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-amber-300">
                      {stats.rate}%
                    </div>
                    <span className="text-[10px] uppercase font-bold text-sky-100">
                      Tingkat Kehadiran
                    </span>
                  </div>
                </div>

                {/* KPI Breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center border border-emerald-200/80 dark:border-emerald-800">
                    <span className="text-[10px] font-bold text-emerald-600 block">
                      Hadir
                    </span>
                    <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
                      {stats.hadir}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-center border border-blue-200/80 dark:border-blue-800">
                    <span className="text-[10px] font-bold text-blue-600 block">
                      Sakit
                    </span>
                    <span className="text-base font-black text-blue-700 dark:text-blue-300">
                      {stats.sakit}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-center border border-sky-200/80 dark:border-sky-800">
                    <span className="text-[10px] font-bold text-sky-600 block">
                      Izin
                    </span>
                    <span className="text-base font-black text-sky-700 dark:text-sky-300">
                      {stats.izin}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-center border border-rose-200/80 dark:border-rose-800">
                    <span className="text-[10px] font-bold text-rose-600 block">
                      Alpa
                    </span>
                    <span className="text-base font-black text-rose-700 dark:text-rose-300">
                      {stats.alpa}
                    </span>
                  </div>
                </div>

                {/* Personal & Parent details */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-sky-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-sky-200/80 dark:border-slate-700/80">
                  <div>
                    <span className="text-slate-400">Orang Tua / Wali:</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">
                      {viewingStudent.parentName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">WhatsApp Wali:</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-500" />
                      {viewingStudent.parentPhone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Alamat Rumah:</span>
                    <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {viewingStudent.address || 'Belum diisi'}
                    </p>
                  </div>
                </div>

                {/* Recent Attendance Timeline */}
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">
                    Riwayat Presensi Terakhir:
                  </h5>
                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {stats.records.length === 0 ? (
                      <p className="text-xs text-slate-400">Belum ada riwayat.</p>
                    ) : (
                      stats.records.slice(0, 5).map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-sky-100 dark:border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-sky-500" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {r.date}
                            </span>
                            {r.notes && (
                              <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                ({r.notes})
                              </span>
                            )}
                          </div>
                          <StatusBadge status={r.status} size="sm" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-sky-100 dark:border-slate-800">
                  <a
                    href={`https://wa.me/62${viewingStudent.parentPhone.replace(/^0/, '')}?text=Assalamu'alaikum%20Bapak/Ibu%20wali%20dari%20${encodeURIComponent(viewingStudent.name)},%20tingkat%20kehadiran%20saat%20ini%20mencapai%20${stats.rate}%.`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Hubungi Orang Tua (WhatsApp)
                  </a>
                  <button
                    onClick={() => setViewingStudent(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingStudent(null)}
          title="Konfirmasi Hapus Siswa"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa{' '}
              <strong className="text-slate-900 dark:text-white">
                {deletingStudent.name}
              </strong>{' '}
              (NISN: {deletingStudent.nisn})? Data presensi terkait juga akan dihapus.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                id="confirm-delete-student-btn"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
