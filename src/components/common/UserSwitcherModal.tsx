import React from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from './Modal';
import { UserCheck, ShieldCheck, GraduationCap, Users, Key } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, loginAs } = useApp();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-sky-700 dark:text-sky-400" />;
      case 'guru':
        return <GraduationCap className="w-5 h-5 text-sky-800 dark:text-sky-300" />;
      case 'wali_murid':
        return <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <UserCheck className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Peran / Akun Pengguna"
      subtitle="Pilih akun simulasi untuk menguji sistem absensi dengan berbagai hak akses"
      maxWidth="md"
    >
      <div className="space-y-3">
        {allUsers.map((user) => {
          const isSelected = user.id === currentUser.id;
          return (
            <button
              key={user.id}
              onClick={() => {
                loginAs(user.id);
                onClose();
              }}
              className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-sky-600 dark:border-sky-500 bg-sky-100/60 dark:bg-sky-950/70 ring-1 ring-sky-600 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center shrink-0 border border-sky-200 dark:border-sky-800">
                {getRoleIcon(user.role)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {user.name}
                  </span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-700 text-white">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 font-semibold mt-0.5">
                  {user.roleTitle}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono">{user.username ? `@${user.username}` : user.email}</span>
                  {user.password && (
                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-[9px]">
                      pw: {user.password}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-950/50 rounded-xl text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2 border border-sky-200/70 dark:border-sky-800/60">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Pengaturan matriks hak akses dan pembuatan akun baru dapat diatur melalui menu Pengaturan Sekolah &gt; Hak Akses.</span>
        </div>
      </div>
    </Modal>
  );
};
