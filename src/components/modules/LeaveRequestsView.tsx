import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest } from '../../types';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  MailCheck,
  Plus,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  User,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Pencil,
  Trash2,
  Search,
  Filter,
  Printer,
  Eye,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const LeaveRequestsView: React.FC = () => {
  const {
    leaveRequests,
    students,
    classes,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    currentUser,
    schoolProfile,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Disetujui' | 'Ditolak'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Sakit' | 'Izin' | 'Lainnya'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<LeaveRequest | null>(null);
  const [previewingRequest, setPreviewingRequest] = useState<LeaveRequest | null>(null);

  // New Request Form State
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    studentName: students[0]?.name || '',
    className: students[0]?.className || '',
    parentName: students[0]?.parentName || '',
    type: 'Sakit' as 'Sakit' | 'Izin' | 'Lainnya',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Edit Request Form State
  const [editFormData, setEditFormData] = useState({
    studentId: '',
    studentName: '',
    className: '',
    parentName: '',
    type: 'Sakit' as 'Sakit' | 'Izin' | 'Lainnya',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Pending' as 'Pending' | 'Disetujui' | 'Ditolak',
  });

  const handleStudentSelect = (studentId: string, isEdit = false) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      if (isEdit) {
        setEditFormData((prev) => ({
          ...prev,
          studentId: st.id,
          studentName: st.name,
          className: st.className,
          parentName: prev.parentName || st.parentName,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          studentId: st.id,
          studentName: st.name,
          className: st.className,
          parentName: st.parentName,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) return;

    addLeaveRequest(formData);
    setIsSubmitModalOpen(false);
    setFormData({
      studentId: students[0]?.id || '',
      studentName: students[0]?.name || '',
      className: students[0]?.className || '',
      parentName: students[0]?.parentName || '',
      type: 'Sakit',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
  };

  const handleOpenEdit = (req: LeaveRequest) => {
    setEditingRequest(req);
    setEditFormData({
      studentId: req.studentId,
      studentName: req.studentName,
      className: req.className,
      parentName: req.parentName,
      type: req.type,
      startDate: req.startDate,
      endDate: req.endDate,
      reason: req.reason,
      status: req.status,
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest || !editFormData.reason.trim()) return;

    updateLeaveRequest(editingRequest.id, {
      studentId: editFormData.studentId,
      studentName: editFormData.studentName,
      className: editFormData.className,
      parentName: editFormData.parentName,
      type: editFormData.type,
      startDate: editFormData.startDate,
      endDate: editFormData.endDate,
      reason: editFormData.reason,
      status: editFormData.status,
    });

    setEditingRequest(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingRequest) return;
    deleteLeaveRequest(deletingRequest.id);
    setDeletingRequest(null);
  };

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (classFilter !== 'all' && r.className !== classFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.studentName.toLowerCase().includes(q);
        const matchClass = r.className.toLowerCase().includes(q);
        const matchParent = r.parentName.toLowerCase().includes(q);
        const matchReason = r.reason.toLowerCase().includes(q);
        if (!matchName && !matchClass && !matchParent && !matchReason) return false;
      }

      return true;
    });
  }, [leaveRequests, statusFilter, typeFilter, classFilter, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter((r) => r.status === 'Pending').length;
    const approved = leaveRequests.filter((r) => r.status === 'Disetujui').length;
    const rejected = leaveRequests.filter((r) => r.status === 'Ditolak').length;
    const sakit = leaveRequests.filter((r) => r.type === 'Sakit').length;
    const izin = leaveRequests.filter((r) => r.type === 'Izin').length;
    return { total, pending, approved, rejected, sakit, izin };
  }, [leaveRequests]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/95 dark:bg-slate-900 border border-sky-300/80 dark:border-sky-800 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
              <MailCheck className="w-4 h-4" />
            </div>
            Surat Izin & Sakit Siswa Online
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengajuan keterangan tidak hadir dari wali murid, verifikasi kehadiran, serta fasilitas edit dan hapus surat izin
          </p>
        </div>

        <button
          id="submit-leave-request-btn"
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Surat Baru</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Surat</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 shadow-2xs">
          <span className="text-[10.5px] font-bold text-amber-800 dark:text-amber-300 uppercase">Menunggu</span>
          <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</div>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs">
          <span className="text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Disetujui</span>
          <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{stats.approved}</div>
        </div>

        <div className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 shadow-2xs">
          <span className="text-[10.5px] font-bold text-rose-800 dark:text-rose-300 uppercase">Ditolak</span>
          <div className="text-xl font-black text-rose-700 dark:text-rose-400 mt-1">{stats.rejected}</div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 shadow-2xs">
          <span className="text-[10.5px] font-bold text-amber-700 dark:text-amber-400 uppercase">Jenis Sakit</span>
          <div className="text-xl font-black text-amber-800 dark:text-amber-300 mt-1">{stats.sakit}</div>
        </div>

        <div className="p-3 rounded-2xl bg-sky-50/50 dark:bg-slate-900 border border-sky-100 dark:border-slate-800 shadow-2xs">
          <span className="text-[10.5px] font-bold text-sky-700 dark:text-sky-400 uppercase">Jenis Izin</span>
          <div className="text-xl font-black text-sky-800 dark:text-sky-300 mt-1">{stats.izin}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, kelas, nama wali, atau alasan..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500 font-medium"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.name} className="dark:bg-slate-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-900">Semua Jenis</option>
              <option value="Sakit" className="dark:bg-slate-900">Sakit</option>
              <option value="Izin" className="dark:bg-slate-900">Izin</option>
              <option value="Lainnya" className="dark:bg-slate-900">Lainnya</option>
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'Pending', label: 'Menunggu' },
                { id: 'Disetujui', label: 'Disetujui' },
                { id: 'Ditolak', label: 'Ditolak' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-sky-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <MailCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Tidak ada pengajuan surat yang sesuai kriteria pencarian / filter
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan tombol "Ajukan Surat Baru" untuk memasukkan permohonan izin atau sakit.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header item with Status & Quick Edit/Delete Actions */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          req.type === 'Sakit'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                            : req.type === 'Izin'
                            ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        }`}
                      >
                        Surat {req.type}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        {req.className}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1.5 line-clamp-1">
                      {req.studentName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <StatusBadge status={req.status} size="sm" />
                    
                    {/* Top Action Icons: Preview, Edit, Hapus */}
                    <div className="flex items-center ml-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setPreviewingRequest(req)}
                        title="Lihat / Cetak Surat"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(req)}
                        title="Edit Surat Izin/Sakit"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingRequest(req)}
                        title="Hapus Surat Izin/Sakit"
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dates & Wali Murid Box */}
                <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-slate-800/60 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 border border-sky-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>
                      Tanggal: <strong className="text-slate-900 dark:text-white">{req.startDate}</strong> {req.startDate !== req.endDate ? ` s/d ${req.endDate}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                    <span>
                      Wali: <strong className="text-slate-900 dark:text-white">{req.parentName}</strong>
                    </span>
                  </div>
                </div>

                {/* Reason description */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Alasan / Keterangan:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 italic">
                    "{req.reason}"
                  </p>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                {req.status === 'Pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`approve-leave-${req.id}`}
                      onClick={() => approveLeaveRequest(req.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Setujui
                    </button>
                    <button
                      id={`reject-leave-${req.id}`}
                      onClick={() => rejectLeaveRequest(req.id)}
                      className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                    <button
                      onClick={() => handleOpenEdit(req)}
                      title="Edit Surat"
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingRequest(req)}
                      title="Hapus Surat"
                      className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>
                        Diverifikasi: <strong className="text-slate-700 dark:text-slate-300">{req.reviewedBy || 'Guru'}</strong>
                      </span>
                      <span>{req.reviewedAt?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEdit(req)}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 hover:text-sky-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit Surat
                      </button>
                      <button
                        onClick={() => setDeletingRequest(req)}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Ajukan Surat Izin / Sakit Baru */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Ajukan Surat Izin / Sakit Baru"
          subtitle="Formulir permohonan dispensasi kehadiran siswa"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Siswa: *
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className}) - Wali: {st.parentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Surat:
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'Sakit' | 'Izin' | 'Lainnya',
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Orang Tua / Pemohon:
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mulai Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alasan / Penjelasan Detail: *
              </label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Jelaskan kondisi sakit / permohonan izin secara lengkap..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Edit Surat Izin / Sakit */}
      {editingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRequest(null)}
          title="Edit Surat Izin / Sakit"
          subtitle={`Perbarui data surat dispensasi siswa: ${editingRequest.studentName}`}
          maxWidth="md"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Siswa / Pemohon:
              </label>
              <select
                value={editFormData.studentId}
                onChange={(e) => handleStudentSelect(e.target.value, true)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.className}) - Wali: {st.parentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Surat:
                </label>
                <select
                  value={editFormData.type}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      type: e.target.value as 'Sakit' | 'Izin' | 'Lainnya',
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Verifikasi:
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      status: e.target.value as 'Pending' | 'Disetujui' | 'Ditolak',
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="Pending">Menunggu Verifikasi (Pending)</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Orang Tua / Wali Pemohon:
              </label>
              <input
                type="text"
                required
                value={editFormData.parentName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, parentName: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mulai Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, startDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  required
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, endDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alasan / Penjelasan Detail: *
              </label>
              <textarea
                required
                rows={3}
                value={editFormData.reason}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, reason: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingRequest(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 3: Konfirmasi Hapus Surat Izin */}
      {deletingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingRequest(null)}
          title="Konfirmasi Hapus Surat Izin / Sakit"
          subtitle="Tindakan ini akan menghapus data pengajuan surat secara permanen"
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Apakah Anda yakin ingin menghapus surat ini?</p>
                <p className="text-rose-700/80 dark:text-rose-300/80">
                  Data pengajuan surat yang telah dihapus tidak dapat dipulihkan kembali.
                </p>
              </div>
            </div>

            {/* Request Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 dark:text-slate-400">Siswa:</span>
                <span className="font-black text-slate-900 dark:text-white">
                  {deletingRequest.studentName} ({deletingRequest.className})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 dark:text-slate-400">Jenis:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Surat {deletingRequest.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 dark:text-slate-400">Periode:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {deletingRequest.startDate} {deletingRequest.startDate !== deletingRequest.endDate ? `s/d ${deletingRequest.endDate}` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 dark:text-slate-400">Status Saat Ini:</span>
                <StatusBadge status={deletingRequest.status} size="sm" />
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-500 dark:text-slate-400">Keterangan:</span>
                <p className="italic text-slate-700 dark:text-slate-300 mt-0.5">"{deletingRequest.reason}"</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRequest(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Surat
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal 4: Preview & Cetak Surat Izin Resmi Sekolah */}
      {previewingRequest && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingRequest(null)}
          title="Pratinjau Surat Izin / Sakit Resmi"
          subtitle="Format cetak surat permohonan dispensasi siswa SD"
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Letter Document Preview Sheet */}
            <div
              id="printable-leave-letter"
              className="p-6 bg-white text-slate-900 rounded-2xl border border-slate-300 shadow-inner space-y-4 font-serif text-xs leading-relaxed print:p-0 print:border-none print:shadow-none"
            >
              {/* Kop Surat Sekolah */}
              <div className="border-b-2 border-slate-900 pb-3 flex items-center gap-4 text-center">
                {schoolProfile.logoUrl && (
                  <img
                    src={schoolProfile.logoUrl}
                    alt="Logo Sekolah"
                    className="w-14 h-14 object-contain shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-600">
                    {schoolProfile.dinasPendidikan || 'PEMERINTAH KABUPATEN / KOTA DINAS PENDIDIKAN'}
                  </h4>
                  <h3 className="font-sans font-black text-sm uppercase text-slate-950 tracking-tight">
                    {schoolProfile.name}
                  </h3>
                  <p className="font-sans text-[10px] text-slate-600">
                    {schoolProfile.street}, {schoolProfile.village}, {schoolProfile.district}, {schoolProfile.regency} - Telp: {schoolProfile.phone}
                  </p>
                </div>
              </div>

              {/* Title of Letter */}
              <div className="text-center pt-2">
                <h4 className="font-bold text-xs uppercase underline tracking-wider">
                  SURAT KETERANGAN {previewingRequest.type.toUpperCase()} SISWA
                </h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Nomor: 421.2/IZIN/{previewingRequest.id.substring(3)}/2026
                </p>
              </div>

              {/* Letter Body */}
              <div className="space-y-2 pt-2 text-justify">
                <p>Kepada Yth.</p>
                <p>Bapak/Ibu Wali Kelas <strong>{previewingRequest.className}</strong></p>
                <p>{schoolProfile.name}</p>
                <p>Di Tempat</p>

                <p className="pt-2">Dengan hormat,</p>
                <p>
                  Saya yang bertanda tangan di bawah ini orang tua / wali murid dari siswa:
                </p>

                <table className="w-full ml-4 my-2 text-xs">
                  <tbody>
                    <tr>
                      <td className="w-28 py-0.5 font-bold">Nama Siswa</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{previewingRequest.studentName}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold">Kelas</td>
                      <td>:</td>
                      <td>{previewingRequest.className}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold">Nama Wali Murid</td>
                      <td>:</td>
                      <td>{previewingRequest.parentName}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold">Jenis Izin</td>
                      <td>:</td>
                      <td>Surat {previewingRequest.type}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold">Periode Dispensasi</td>
                      <td>:</td>
                      <td>
                        {previewingRequest.startDate} {previewingRequest.startDate !== previewingRequest.endDate ? `sampai dengan ${previewingRequest.endDate}` : ''}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-0.5 font-bold align-top">Keterangan / Alasan</td>
                      <td className="align-top">:</td>
                      <td className="italic align-top">"{previewingRequest.reason}"</td>
                    </tr>
                  </tbody>
                </table>

                <p>
                  Dengan ini memohon izin agar siswa yang bersangkutan dapat diberikan dispensasi untuk tidak mengikuti kegiatan belajar mengajar sebagaimana tanggal tertera di atas.
                </p>

                <p className="pt-1">
                  Demikian surat permohonan ini kami sampaikan dengan sebenarnya. Atas perhatian dan kebijaksanaan Bapak/Ibu Guru, kami ucapkan terima kasih.
                </p>
              </div>

              {/* Signature Section */}
              <div className="grid grid-cols-2 gap-6 pt-6 text-center text-xs">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-bold">Wali Kelas {previewingRequest.className}</p>
                  <div className="h-14 flex items-center justify-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-sans font-bold">
                      {previewingRequest.status === 'Disetujui' ? '✓ Disetujui Sekolah' : previewingRequest.status}
                    </span>
                  </div>
                  <p className="font-bold underline">{previewingRequest.reviewedBy || 'Wali Kelas'}</p>
                  <p className="text-[10px] text-slate-500">NIP. -</p>
                </div>

                <div>
                  <p>{schoolProfile.district || 'Setempat'}, {previewingRequest.submittedAt.slice(0, 10)}</p>
                  <p className="font-bold">Hormat Kami (Orang Tua / Wali),</p>
                  <div className="h-14"></div>
                  <p className="font-bold underline">{previewingRequest.parentName}</p>
                  <p className="text-[10px] text-slate-500">Orang Tua / Wali Murid</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewingRequest(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printContents = document.getElementById('printable-leave-letter')?.innerHTML;
                    if (!printContents) return;
                    const win = window.open('', '', 'width=800,height=900');
                    if (win) {
                      win.document.write(`
                        <html>
                          <head>
                            <title>Surat Izin ${previewingRequest.studentName}</title>
                            <style>
                              body { font-family: 'Times New Roman', serif; margin: 30px; font-size: 12pt; line-height: 1.6; }
                              .header { text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px; }
                              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                              td { padding: 4px 6px; }
                              .sig { display: flex; justify-content: space-between; margin-top: 40px; text-align: center; }
                            </style>
                          </head>
                          <body>${printContents}</body>
                        </html>
                      `);
                      win.document.close();
                      win.focus();
                      win.print();
                      win.close();
                    }
                  }}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Dokumen
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
