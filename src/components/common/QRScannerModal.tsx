import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { QrCode, Search, CheckCircle2, AlertCircle, Sparkles, UserCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { students, scanStudentQR } = useApp();
  const [inputCode, setInputCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    student?: any;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setScanResult(null);
      setIsScanning(true);
    }
  }, [isOpen]);

  const handleScanSubmit = (codeToScan: string) => {
    if (!codeToScan.trim()) return;

    const result = scanStudentQR(codeToScan);
    setScanResult(result);

    if (result.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}
    }
  };

  const handleQuickStudentSelect = (nisn: string) => {
    setInputCode(nisn);
    handleScanSubmit(nisn);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pindai QR / Barcode Kartu Siswa"
      subtitle="Presensi Cepat Digital Berbasis ID & NISN Siswa"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Visual Scanner Area */}
        <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
          {/* Laser Scanner animation */}
          {isScanning && !scanResult && (
            <div className="absolute inset-x-8 top-1/4 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-bounce duration-1000 z-10" />
          )}

          {/* Scanner Viewfinder Box */}
          <div className="relative w-44 h-44 border-2 border-dashed border-rose-500/60 rounded-2xl flex flex-col items-center justify-center p-4 bg-slate-950/40">
            <QrCode className="w-20 h-20 text-rose-400 animate-pulse" />
            <span className="text-[11px] font-medium text-rose-300/80 mt-2 text-center">
              Arahkan QR Code ke Kamera
            </span>
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">
              Sensor Kamera Aktif • Mendukung Barcode 1D / QR Code Siswa
            </p>
          </div>
        </div>

        {/* Scan Result Feedback Alert */}
        {scanResult && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              scanResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-sm">
                <p className="font-semibold">{scanResult.message}</p>
                {scanResult.student && (
                  <div className="mt-2 text-xs grid grid-cols-2 gap-1 bg-white/70 dark:bg-slate-900/60 p-2 rounded-lg border border-emerald-200/50">
                    <div>
                      <span className="text-slate-500">Nama:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-white">
                        {scanResult.student.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Kelas:</span>{' '}
                      <span className="font-bold text-slate-800 dark:text-white">
                        {scanResult.student.className}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">NISN:</span>{' '}
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {scanResult.student.nisn}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Status:</span>{' '}
                      <span className="font-bold text-emerald-600">HADIR</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Search & Fast Simulation */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
            Ketik NISN atau Nama Siswa Secara Manual:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="qr-manual-input"
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScanSubmit(inputCode);
                }}
                placeholder="Contoh: 0165849201 atau Rizky"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-[#4a0404] text-stone-900 dark:text-white placeholder:text-stone-400"
              />
            </div>
            <button
              id="qr-manual-submit-button"
              onClick={() => handleScanSubmit(inputCode)}
              className="px-4 py-2.5 bg-[#4a0404] hover:bg-[#380303] text-white font-medium text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Catat
            </button>
          </div>
        </div>

        {/* Quick Simulation Clickers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Uji Cepat (Klik Contoh Kartu Siswa):
            </span>
            <span className="text-[11px] text-[#4a0404] dark:text-rose-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" /> Simulasi
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
            {students.slice(0, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => handleQuickStudentSelect(s.nisn)}
                className="text-left p-2 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-[#4a0404]/50 dark:hover:border-rose-700 hover:bg-rose-50/30 dark:hover:bg-rose-950/30 transition-all text-xs group"
              >
                <div className="font-semibold text-stone-800 dark:text-stone-200 truncate group-hover:text-[#4a0404] dark:group-hover:text-rose-300">
                  {s.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                  <span>{s.className}</span>
                  <span className="font-mono text-stone-400">{s.nisn.slice(-4)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-2">
          {scanResult && (
            <button
              onClick={() => {
                setScanResult(null);
                setInputCode('');
              }}
              className="px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Pindai Siswa Lain
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </Modal>
  );
};
