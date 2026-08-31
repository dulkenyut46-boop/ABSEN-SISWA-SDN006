import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { School, Sparkles, GraduationCap, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const { schoolProfile, darkMode } = useApp();
  const [progress, setProgress] = useState(0);

  const schoolName = schoolProfile?.name?.trim() || 'SD NEGERI 1 CONTOH';
  const schoolNpsn = schoolProfile?.npsn || '20109988';
  const schoolRegion = [schoolProfile?.district, schoolProfile?.regency]
    .filter(Boolean)
    .join(', ');

  // Auto-progress bar and auto-complete after 3.6s
  useEffect(() => {
    const startTime = Date.now();
    const duration = 3400; // 3.4 seconds total intro

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Split title "ABSENSI SISWA" for staggered letter animation
  const titleWords = ['ABSENSI', 'SISWA'];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0c2340] via-[#103463] to-[#08182b] text-white overflow-hidden select-none p-4">
      {/* Ambient background particles & glowing radial blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full mx-auto"
      >
        {/* Animated Badge Icon with Glow */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.15,
          }}
          className="relative mb-6"
        >
          {/* Glowing pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.5, 0.1, 0.5],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-3 rounded-3xl bg-sky-400/30 blur-lg"
          />

          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-0.5 shadow-2xl shadow-sky-500/40 relative flex items-center justify-center">
            <div className="w-full h-full bg-[#0d274c] rounded-[22px] flex items-center justify-center relative overflow-hidden border border-sky-400/40 p-2.5">
              <div className="absolute inset-0 bg-gradient-to-t from-sky-600/30 to-transparent pointer-events-none" />
              {schoolProfile?.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolName}
                  className="w-full h-full object-contain drop-shadow-md relative z-10"
                />
              ) : (
                <School className="w-10 h-10 sm:w-12 sm:h-12 text-sky-200 drop-shadow-md relative z-10" />
              )}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute top-1.5 right-1.5 z-20"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Category Pill Tag */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wide uppercase mb-3 shadow-inner"
        >
          <GraduationCap className="w-3.5 h-3.5 text-sky-300" />
          <span>Sistem Informasi Presensi & Rekapitulasi</span>
        </motion.div>

        {/* PRIMARY ANIMATED TITLE: "ABSENSI SISWA" */}
        <div className="overflow-hidden mb-3">
          <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            {titleWords.map((word, wordIndex) => (
              <div key={wordIndex} className="flex">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={{ opacity: 0, y: 40, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.4 + wordIndex * 0.2 + charIndex * 0.04,
                      ease: [0.215, 0.61, 0.355, 1],
                    }}
                    className="text-3xl sm:text-5xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-100 to-sky-300 inline-block drop-shadow-sm font-sans"
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* DYNAMIC SCHOOL NAME ACCORDING TO SCHOOL PROFILE SETTINGS */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
          className="relative px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl my-2 max-w-xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="text-lg sm:text-2xl font-black tracking-wide text-amber-300 drop-shadow-md uppercase"
          >
            {schoolName}
          </motion.h2>

          {/* Subtitle details: NPSN, Akreditasi, Region */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-sky-200/90 mt-1 font-medium flex-wrap"
          >
            {schoolNpsn && <span>NPSN: {schoolNpsn}</span>}
            {schoolProfile?.akreditasi && (
              <>
                <span className="text-sky-400/50">•</span>
                <span className="text-emerald-300 font-semibold">
                  Akreditasi {schoolProfile.akreditasi}
                </span>
              </>
            )}
            {schoolRegion && (
              <>
                <span className="text-sky-400/50">•</span>
                <span className="text-slate-300">{schoolRegion}</span>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Slogan / Motto if configured */}
        {schoolProfile?.motto && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="text-xs text-sky-300/80 italic mt-1 max-w-md"
          >
            "{schoolProfile.motto}"
          </motion.p>
        )}

        {/* Progress Bar & Skip Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="mt-8 w-full max-w-xs flex flex-col items-center gap-3"
        >
          {/* Animated slim progress bar */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <motion.div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 rounded-full transition-all duration-75 shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between w-full text-[11px] text-sky-300/70 font-mono">
            <span>Memuat Sistem...</span>
            <span>{progress}%</span>
          </div>

          {/* Quick Skip button */}
          <button
            id="splash-skip-to-login-btn"
            onClick={onComplete}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600/60 hover:bg-sky-500 text-white text-xs font-bold border border-sky-400/30 transition-all hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
          >
            <span>Masuk ke Halaman Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </motion.div>

      {/* Footer copyright / system tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-4 text-center text-[11px] text-sky-400/50"
      >
        <span>Aplikasi Presensi Digital Sekolah Dasar</span>
      </motion.div>
    </div>
  );
};
