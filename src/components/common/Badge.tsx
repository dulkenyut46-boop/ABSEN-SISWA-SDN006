import React from 'react';
import { AttendanceStatus } from '../../types';

interface StatusBadgeProps {
  status: AttendanceStatus | 'aktif' | 'mutasi' | 'lulus' | 'Pending' | 'Disetujui' | 'Ditolak';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
    lg: 'px-3 py-1.5 text-sm font-bold rounded-xl',
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'H':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Hadir',
          dot: 'bg-emerald-500',
        };
      case 'S':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          label: 'Sakit',
          dot: 'bg-amber-500',
        };
      case 'I':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
          label: 'Izin',
          dot: 'bg-sky-500',
        };
      case 'A':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          label: 'Alpa',
          dot: 'bg-rose-500',
        };
      case 'T':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
          label: 'Terlambat',
          dot: 'bg-purple-500',
        };
      case 'LN':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
          label: 'Libur Nasional',
          dot: 'bg-indigo-500',
        };
      case 'aktif':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Aktif',
          dot: 'bg-emerald-500',
        };
      case 'mutasi':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          label: 'Mutasi',
          dot: 'bg-amber-500',
        };
      case 'lulus':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
          label: 'Lulus',
          dot: 'bg-blue-500',
        };
      case 'Pending':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          label: 'Menunggu',
          dot: 'bg-amber-500',
        };
      case 'Disetujui':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          label: 'Disetujui',
          dot: 'bg-emerald-500',
        };
      case 'Ditolak':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          label: 'Ditolak',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          label: String(status),
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-wide transition-colors ${sizeClasses[size]} ${config.bg}`}
    >
      <span className={`h-2 w-2 rounded-xs shrink-0 ${config.dot}`} />
      {showLabel ? config.label : status}
    </span>
  );
};

interface AttendanceStatusSquareProps {
  status: AttendanceStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
}

export const AttendanceStatusSquare: React.FC<AttendanceStatusSquareProps> = ({
  status,
  size = 'md',
  active = true,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-5 h-5 text-[9px] rounded-xs',
    sm: 'w-6 h-6 text-[10.5px] rounded-sm',
    md: 'w-7.5 h-7.5 sm:w-8 sm:h-8 text-xs rounded-lg',
    lg: 'w-9 h-9 text-sm rounded-xl',
  };

  const statusMap: Record<AttendanceStatus, { active: string; inactive: string; name: string }> = {
    H: {
      name: 'Hadir',
      active: 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold',
    },
    T: {
      name: 'Terlambat',
      active: 'bg-purple-600 text-white border-purple-700 shadow-xs ring-2 ring-purple-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800 font-bold',
    },
    S: {
      name: 'Sakit',
      active: 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 font-bold',
    },
    I: {
      name: 'Izin',
      active: 'bg-sky-600 text-white border-sky-700 shadow-xs ring-2 ring-sky-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-400 border border-sky-300 dark:border-sky-800 font-bold',
    },
    A: {
      name: 'Alpa',
      active: 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 font-bold',
    },
    LN: {
      name: 'Libur Nasional',
      active: 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-400/40 font-black',
      inactive: 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800 font-bold',
    },
  };

  const config = statusMap[status] || {
    name: String(status),
    active: 'bg-slate-700 text-white border-slate-800 font-bold',
    inactive: 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-mono border transition-all ${sizeMap[size]} ${
        active ? config.active : config.inactive
      } ${className}`}
      title={`${status}: ${config.name}`}
    >
      {status}
    </div>
  );
};
