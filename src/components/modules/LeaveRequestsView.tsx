import React, { useState } from 'react';
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
  ShieldAlert,
} from 'lucide-react';

export const LeaveRequestsView: React.FC = () => {
  const {
    leaveRequests,
    students,
    classes,
    addLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    currentUser,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Disetujui' | 'Ditolak'>('all');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form state
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

  const handleStudentSelect = (studentId: string) => {
    const st = students.find((s) => s.id === studentId);
    if (st) {
      setFormData((prev) => ({
        ...prev,
        studentId: st.id,
        studentName: st.name,
        className: st.className,
        parentName: st.parentName,
      }));
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

  const filteredRequests = leaveRequests.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white/90 dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MailCheck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Surat Izin & Sakit Siswa Online
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pengajuan keterangan tidak hadir dari wali murid dan verifikasi wali kelas
          </p>
        </div>

        <button
          id="submit-leave-request-btn"
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Surat Izin / Sakit</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {(
          [
            { id: 'all', label: 'Semua Surat' },
            { id: 'Pending', label: 'Menunggu Verifikasi' },
            { id: 'Disetujui', label: 'Disetujui' },
            { id: 'Ditolak', label: 'Ditolak' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setStatusFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === f.id
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-sky-200/80 dark:border-slate-800 hover:bg-sky-50 dark:hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-slate-800 text-slate-400">
            <MailCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Tidak ada pengajuan surat dalam kategori ini
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-sky-200/80 dark:border-sky-900/60 shadow-xs p-4 flex flex-col justify-between space-y-3.5"
            >
              <div className="space-y-3">
                {/* Header item */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 bg-sky-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-sky-200 dark:border-slate-700">
                      Surat {req.type}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                      {req.studentName}
                    </h3>
                    <p className="text-xs text-slate-500">{req.className}</p>
                  </div>

                  <StatusBadge status={req.status} size="sm" />
                </div>

                {/* Dates & Wali */}
                <div className="p-3 rounded-xl bg-sky-50/50 dark:bg-slate-800/50 space-y-1 text-xs text-slate-600 dark:text-slate-300 border border-sky-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Tanggal: <strong>{req.startDate}</strong> {req.startDate !== req.endDate ? `s/d ${req.endDate}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Pemohon: <strong>{req.parentName}</strong> (Wali Murid)
                    </span>
                  </div>
                </div>

                {/* Reason description */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Alasan / Keterangan:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-sky-50/40 dark:bg-slate-900/50 p-2.5 rounded-xl border border-sky-100 dark:border-slate-800 italic">
                    "{req.reason}"
                  </p>
                </div>
              </div>

              {/* Action Buttons for Teachers / Admins */}
              <div className="pt-3 border-t border-sky-100 dark:border-slate-800">
                {req.status === 'Pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      id={`approve-leave-${req.id}`}
                      onClick={() => approveLeaveRequest(req.id)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Setujui
                    </button>
                    <button
                      id={`reject-leave-${req.id}`}
                      onClick={() => rejectLeaveRequest(req.id)}
                      className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      Diverifikasi oleh: <strong>{req.reviewedBy || 'Guru'}</strong>
                    </span>
                    <span>{req.reviewedAt?.slice(0, 10)}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Leave Request Modal */}
      {isSubmitModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsSubmitModalOpen(false)}
          title="Ajukan Surat Izin / Sakit"
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
                className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500"
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
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-sky-500"
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
                  value={formData.parentName}
                  onChange={(e) =>
                    setFormData({ ...formData, parentName: e.target.value })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
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
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sampai Tanggal:
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
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
                placeholder="Jelaskan kondisi sakit / keperluan izin..."
                className="w-full p-2.5 bg-sky-50/50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-sky-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
