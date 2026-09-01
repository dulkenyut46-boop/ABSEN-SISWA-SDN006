import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Student,
  ClassRoom,
  AttendanceRecord,
  LeaveRequest,
  SchoolProfile,
  UserSession,
  NavigationTab,
  ToastMessage,
  AttendanceStatus,
  NotificationItem,
  RoleType,
  RolePermissionConfig,
  RolePermissionsMatrix,
  DatabaseBackupData,
  DatabaseRestorePoint,
  NationalHoliday,
} from '../types';
import {
  initialSchoolProfile,
  initialClasses,
  initialStudents,
  generateInitialAttendance,
  initialLeaveRequests,
  demoUsers,
  initialRolePermissionsMatrix,
  getTodayDateString,
  initialNationalHolidays,
} from '../data/initialData';

interface AppContextType {
  // Navigation & Theme
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Splash Screen Intro Animation
  showSplash: boolean;
  setShowSplash: (val: boolean) => void;
  replayIntro: () => void;

  // Authentication & Session
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  login: (identifier: string, password?: string) => { success: boolean; message: string; user?: UserSession };
  logout: () => void;
  loginAs: (userId: string) => void;

  // Current User Session & Users Management
  currentUser: UserSession;
  setCurrentUser: (user: UserSession) => void;
  availableUsers: UserSession[];
  allUsers: UserSession[];
  addUser: (userData: Omit<UserSession, 'id'>) => UserSession;
  updateUser: (id: string, updatedData: Partial<UserSession>) => void;
  deleteUser: (id: string) => boolean;
  deleteAllTeachers: (options?: { clearClassTeachers?: boolean }) => { deletedCount: number };
  toggleUserStatus: (id: string) => void;

  // Role Permissions Matrix (Hak Akses)
  rolePermissions: RolePermissionsMatrix;
  updateRolePermissions: (role: RoleType, updatedPermissions: Partial<RolePermissionConfig>) => void;
  updateRoleAllowedTabs: (role: RoleType, allowedTabs: NavigationTab[]) => void;
  resetRolePermissionsToDefault: () => void;
  hasPermission: (permissionKey: keyof RolePermissionConfig) => boolean;
  hasTabAccess: (tab: NavigationTab) => boolean;

  // School Profile
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;

  // Students (CRUD)
  students: Student[];
  addStudent: (studentData: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (id: string, updatedData: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteAllStudents: (filterClassId?: string) => { deletedCount: number };
  getStudentById: (id: string) => Student | undefined;
  batchImportStudents: (
    importedList: Array<{
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
    }>,
    options?: { overwriteExisting?: boolean }
  ) => { addedCount: number; updatedCount: number };

  // Classes (CRUD)
  classes: ClassRoom[];
  addClass: (classData: Omit<ClassRoom, 'id'>) => ClassRoom;
  updateClass: (id: string, updatedData: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;
  deleteAllClasses: () => { deletedCount: number };
  clearAllClassTeachers: () => void;
  getClassById: (id: string) => ClassRoom | undefined;
  batchImportClasses: (
    importedList: Array<{
      name: string;
      grade: number;
      teacherName: string;
      teacherNip?: string;
      roomNumber?: string;
      academicYear?: string;
    }>,
    options?: { overwriteExisting?: boolean }
  ) => { addedCount: number; updatedCount: number };

  // Attendance Operations
  attendanceRecords: AttendanceRecord[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedClassId: string;
  setSelectedClassId: (classId: string) => void;
  markAttendance: (
    studentId: string,
    status: AttendanceStatus,
    date?: string,
    notes?: string,
    timeIn?: string
  ) => void;
  markAllPresentForClass: (classId: string, date?: string) => void;
  markAllHolidayForClass: (classId: string, date?: string, holidayName?: string) => void;
  markAllHolidayForAllClasses: (date?: string, holidayName?: string) => void;
  saveBatchAttendance: (records: AttendanceRecord[]) => void;
  getAttendanceForStudent: (studentId: string) => AttendanceRecord[];
  getAttendanceForClassAndDate: (classId: string, date: string) => AttendanceRecord[];

  // National & School Holidays (Hari Libur Nasional & Sekolah)
  holidays: NationalHoliday[];
  addHoliday: (holiday: Omit<NationalHoliday, 'id'>) => NationalHoliday;
  updateHoliday: (id: string, updatedData: Partial<NationalHoliday>) => void;
  deleteHoliday: (id: string) => void;
  isHoliday: (date: string) => NationalHoliday | undefined;
  resetHolidaysToDefault: () => void;

  // Leave Requests (Surat Izin)
  leaveRequests: LeaveRequest[];
  addLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  approveLeaveRequest: (id: string) => void;
  rejectLeaveRequest: (id: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // QR Scanning Simulation Helper
  scanStudentQR: (qrCodeOrNisn: string) => { success: boolean; message: string; student?: Student };

  // Dashboard Size / Layout Controls (Perkecil / Perlebar Dasbor Kanan)
  dashboardSize: 'full' | 'compact' | 'narrow';
  setDashboardSize: (size: 'full' | 'compact' | 'narrow') => void;
  toggleDashboardSize: () => void;
  dashboardWidthPercent: number;
  setDashboardWidthPercent: (width: number | ((prev: number) => number)) => void;

  // Sidebar Controls (Perkecil / Lipat Menu Sebelah Kiri)
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebarCollapsed: () => void;
  sidebarWidth: number;
  setSidebarWidth: (width: number | ((prev: number) => number)) => void;

  // Database Backup, Restore & Snapshots (Simpan & Kembalikan Database)
  exportDatabaseBackup: () => DatabaseBackupData;
  downloadDatabaseBackupFile: (customFilename?: string) => void;
  restoreDatabaseFromBackup: (
    backupData: DatabaseBackupData,
    mode?: 'replace' | 'merge'
  ) => {
    success: boolean;
    message: string;
    details?: {
      studentsRestored: number;
      classesRestored: number;
      attendanceRestored: number;
      leaveRequestsRestored: number;
      usersRestored: number;
    };
  };
  restorePoints: DatabaseRestorePoint[];
  createLocalRestorePoint: (name: string, description?: string, isAutomatic?: boolean) => DatabaseRestorePoint;
  restoreFromLocalPoint: (pointId: string) => boolean;
  deleteLocalRestorePoint: (pointId: string) => void;

  // Reset to default
  resetDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'absensi_sd_profile_v1',
  CLASSES: 'absensi_sd_classes_v1',
  STUDENTS: 'absensi_sd_students_v1',
  ATTENDANCE: 'absensi_sd_attendance_v1',
  LEAVE_REQUESTS: 'absensi_sd_leave_requests_v1',
  THEME: 'absensi_sd_theme_v1',
  USER: 'absensi_sd_user_v1',
  USERS_LIST: 'absensi_sd_users_list_v1',
  ROLE_PERMISSIONS: 'absensi_sd_role_permissions_v1',
  IS_AUTHENTICATED: 'absensi_sd_auth_status_v1',
  DASHBOARD_SIZE: 'absensi_sd_dashboard_size_v1',
  DASHBOARD_WIDTH: 'absensi_sd_dashboard_width_v1',
  SIDEBAR_COLLAPSED: 'absensi_sd_sidebar_collapsed_v1',
  SIDEBAR_WIDTH: 'absensi_sd_sidebar_width_v1',
  RESTORE_POINTS: 'absensi_sd_restore_points_v1',
  HOLIDAYS: 'absensi_sd_holidays_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Splash Screen Opening Animation State (plays on initial app load)
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const replayIntro = () => {
    setShowSplash(true);
  };

  // Authentication State
  const [isAuthenticated, setIsAuthenticatedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false; // Default: show login screen after intro
  });

  const setIsAuthenticated = (val: boolean) => {
    setIsAuthenticatedState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(val));
    } catch {}
  };

  // All Users Database
  const [allUsers, setAllUsers] = useState<UserSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (saved) return JSON.parse(saved);
    } catch {}
    return demoUsers;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(allUsers));
    } catch {}
  }, [allUsers]);

  // Current User Session
  const [currentUser, setCurrentUserState] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return demoUsers[0]; // Default: Ibu Ratna Dewi (Wali Kelas 1A)
  });

  const setCurrentUser = (user: UserSession) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch {}
  };

  // Role Permissions Matrix (Hak Akses)
  const [rolePermissions, setRolePermissions] = useState<RolePermissionsMatrix>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialRolePermissionsMatrix;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(rolePermissions));
    } catch {}
  }, [rolePermissions]);

  const updateRolePermissions = (role: RoleType, updatedPermissions: Partial<RolePermissionConfig>) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        permissions: {
          ...prev[role].permissions,
          ...updatedPermissions,
        },
      },
    }));
    addToast({
      type: 'success',
      title: 'Hak Akses Diperbarui',
      message: `Konfigurasi hak akses untuk peran "${role.toUpperCase()}" berhasil disimpan.`,
    });
  };

  const updateRoleAllowedTabs = (role: RoleType, allowedTabs: NavigationTab[]) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        allowedTabs,
      },
    }));
    addToast({
      type: 'success',
      title: 'Menu Akses Diperbarui',
      message: `Daftar modul yang diizinkan untuk peran "${role.toUpperCase()}" telah disesuaikan.`,
    });
  };

  const resetRolePermissionsToDefault = () => {
    setRolePermissions(initialRolePermissionsMatrix);
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(initialRolePermissionsMatrix));
    } catch {}
    addToast({
      type: 'info',
      title: 'Hak Akses Direset',
      message: 'Matriks izin peran telah dikembalikan ke standar awal.',
    });
  };

  // Permission Checks
  const hasPermission = (permissionKey: keyof RolePermissionConfig): boolean => {
    const currentRole = currentUser?.role || 'guru';
    const roleDef = rolePermissions[currentRole];
    if (!roleDef) return false;
    return Boolean(roleDef.permissions[permissionKey]);
  };

  const hasTabAccess = (tab: NavigationTab): boolean => {
    const currentRole = currentUser?.role || 'guru';
    const roleDef = rolePermissions[currentRole];
    if (!roleDef) return false;
    return roleDef.allowedTabs.includes(tab);
  };

  // User Management Handlers (CRUD)
  const addUser = (userData: Omit<UserSession, 'id'>): UserSession => {
    const newUser: UserSession = {
      ...userData,
      id: `u-${Date.now()}`,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      lastLogin: '-',
    };
    setAllUsers((prev) => [...prev, newUser]);
    addToast({
      type: 'success',
      title: 'Pengguna Ditambahkan',
      message: `Akun "${newUser.name}" (${newUser.roleTitle}) berhasil didaftarkan.`,
    });
    return newUser;
  };

  const updateUser = (id: string, updatedData: Partial<UserSession>) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser({ ...currentUser, ...updatedData });
    }
    addToast({
      type: 'success',
      title: 'Pengguna Diperbarui',
      message: 'Data akun pengguna berhasil disimpan.',
    });
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser.id === id) {
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Tidak dapat menghapus akun yang sedang aktif digunakan.',
      });
      return false;
    }
    setAllUsers((prev) => prev.filter((u) => u.id !== id));
    addToast({
      type: 'info',
      title: 'Pengguna Dihapus',
      message: 'Akun pengguna telah dihapus dari sistem.',
    });
    return true;
  };

  const deleteAllTeachers = (options?: { clearClassTeachers?: boolean }): { deletedCount: number } => {
    // Filter out users with role 'guru'
    // If current logged-in user is a guru, preserve current user or switch to admin to prevent locked out state
    const teachersToDelete = allUsers.filter((u) => u.role === 'guru');
    const deletedCount = teachersToDelete.length;

    if (deletedCount === 0) {
      addToast({
        type: 'info',
        title: 'Data Guru Kosong',
        message: 'Tidak ada data akun guru untuk dihapus.',
      });
      return { deletedCount: 0 };
    }

    setAllUsers((prev) => {
      return prev.filter((u) => u.role !== 'guru' || u.id === currentUser.id);
    });

    if (options?.clearClassTeachers) {
      setClasses((prev) =>
        prev.map((c) => ({
          ...c,
          teacherName: '-',
          teacherNip: '-',
        }))
      );
    }

    addToast({
      type: 'warning',
      title: 'Semua Data Guru Dihapus',
      message: `Berhasil menghapus ${deletedCount} data akun guru dari sistem.`,
    });

    return { deletedCount };
  };

  const toggleUserStatus = (id: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = !u.isActive;
          addToast({
            type: newStatus ? 'success' : 'warning',
            title: newStatus ? 'Akun Diaktifkan' : 'Akun Dinonaktifkan',
            message: `Status akun ${u.name} diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`,
          });
          return { ...u, isActive: newStatus };
        }
        return u;
      })
    );
  };

  // Auth Operations
  const login = (
    identifier: string,
    password?: string
  ): { success: boolean; message: string; user?: UserSession } => {
    const cleanId = identifier.trim().toLowerCase();
    const user = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId) ||
        (u.nip && u.nip.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) ||
        u.id.toLowerCase() === cleanId
    );

    if (!user) {
      return {
        success: false,
        message: 'Akun dengan NIP / Email / Nama Pengguna tersebut tidak ditemukan.',
      };
    }

    if (user.isActive === false) {
      return {
        success: false,
        message: 'Akun Anda saat ini sedang dinonaktifkan oleh Administrator. Hubungi pihak sekolah.',
      };
    }

    if (password && user.password && user.password !== password) {
      return {
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali.',
      };
    }

    // Update last login
    const nowStr = `${getTodayDateString()} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const updatedUser = { ...user, lastLogin: nowStr };
    setAllUsers((prev) => prev.map((u) => (u.id === user.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);

    // Auto-adjust active tab if user lacks permission for current tab
    const roleDef = rolePermissions[user.role];
    if (roleDef && !roleDef.allowedTabs.includes(activeTab)) {
      setActiveTab(roleDef.allowedTabs[0] || 'dashboard');
    }

    addToast({
      type: 'success',
      title: 'Selamat Datang!',
      message: `Login berhasil sebagai ${user.name} (${user.roleTitle}).`,
    });

    return {
      success: true,
      message: 'Login berhasil.',
      user: updatedUser,
    };
  };

  const loginAs = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId);
    if (!target) return;
    const nowStr = `${getTodayDateString()} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    const updatedUser = { ...target, lastLogin: nowStr };
    setAllUsers((prev) => prev.map((u) => (u.id === target.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);

    // Auto-adjust active tab if user lacks permission for current tab
    const roleDef = rolePermissions[target.role];
    if (roleDef && !roleDef.allowedTabs.includes(activeTab)) {
      setActiveTab(roleDef.allowedTabs[0] || 'dashboard');
    }

    addToast({
      type: 'success',
      title: 'Beralih Akun',
      message: `Saat ini masuk sebagai ${target.name} (${target.roleTitle}).`,
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    addToast({
      type: 'info',
      title: 'Sesi Berakhir',
      message: 'Anda telah berhasil keluar dari sistem presensi.',
    });
  };

  // Sidebar Collapsed / Width State (Menu Kiri)
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return false;
  });

  const [sidebarWidth, setSidebarWidthState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH);
      if (saved) {
        const num = Number(saved);
        if (num >= 64 && num <= 360) return num;
      }
    } catch {}
    return 260;
  });

  const setIsSidebarCollapsed = (collapsed: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsedState((prev) => {
      const next = typeof collapsed === 'function' ? collapsed(prev) : collapsed;
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const setSidebarWidth = (width: number | ((prev: number) => number)) => {
    setSidebarWidthState((prev) => {
      const next = typeof width === 'function' ? width(prev) : width;
      const clamped = Math.min(360, Math.max(64, next));
      try {
        localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, clamped.toString());
      } catch {}
      return clamped;
    });
  };

  // Dashboard Size / Layout State ('full' = 100%, 'compact' = 75%, 'narrow' = 55%)
  const [dashboardSize, setDashboardSizeState] = useState<'full' | 'compact' | 'narrow'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SIZE);
      if (saved === 'compact' || saved === 'narrow' || saved === 'full') return saved;
    } catch {}
    return 'full';
  });

  const [dashboardWidthPercent, setDashboardWidthPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DASHBOARD_WIDTH);
      if (saved) {
        const num = Number(saved);
        if (num >= 45 && num <= 100) return num;
      }
    } catch {}
    return 100;
  });

  const setDashboardSize = (size: 'full' | 'compact' | 'narrow') => {
    setDashboardSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEYS.DASHBOARD_SIZE, size);
      if (size === 'full') {
        setDashboardWidthPercent(100);
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDTH, '100');
      } else if (size === 'compact') {
        setDashboardWidthPercent(75);
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDTH, '75');
      } else if (size === 'narrow') {
        setDashboardWidthPercent(55);
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_WIDTH, '55');
      }
    } catch {}
  };

  const toggleDashboardSize = () => {
    if (dashboardSize === 'full') {
      setDashboardSize('compact');
    } else if (dashboardSize === 'compact') {
      setDashboardSize('narrow');
    } else {
      setDashboardSize('full');
    }
  };

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(darkMode));
    } catch (e) {
      console.error(e);
    }
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // School Profile
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) return { ...initialSchoolProfile, ...JSON.parse(saved) };
    } catch (e) {}
    return initialSchoolProfile;
  });

  const updateSchoolProfile = (profileUpdate: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => {
      const updated = { ...prev, ...profileUpdate };
      try {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Profil Diperbarui',
      message: 'Informasi sekolah berhasil disimpan.',
    });
  };

  // Classes
  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialClasses;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {}
  }, [classes]);

  // Students
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialStudents;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {}
  }, [students]);

  // Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return generateInitialAttendance();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceRecords));
    } catch (e) {}
  }, [attendanceRecords]);

  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEAVE_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialLeaveRequests;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(leaveRequests));
    } catch (e) {}
  }, [leaveRequests]);

  // National & School Holidays State
  const [holidays, setHolidays] = useState<NationalHoliday[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialNationalHolidays;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
    } catch (e) {}
  }, [holidays]);

  // Holiday Management Handlers
  const addHoliday = (holidayData: Omit<NationalHoliday, 'id'>): NationalHoliday => {
    const newHoliday: NationalHoliday = {
      ...holidayData,
      id: `hol-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };
    setHolidays((prev) => {
      const exists = prev.some((h) => h.date === newHoliday.date && h.name.toLowerCase() === newHoliday.name.toLowerCase());
      if (exists) return prev;
      return [...prev, newHoliday].sort((a, b) => a.date.localeCompare(b.date));
    });
    addToast({
      type: 'success',
      title: 'Hari Libur Ditambahkan',
      message: `"${newHoliday.name}" (${newHoliday.date}) berhasil didaftarkan ke kalender libur.`,
    });
    return newHoliday;
  };

  const updateHoliday = (id: string, updatedData: Partial<NationalHoliday>) => {
    setHolidays((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updatedData } : h)).sort((a, b) => a.date.localeCompare(b.date))
    );
    addToast({
      type: 'success',
      title: 'Hari Libur Diperbarui',
      message: 'Perubahan hari libur berhasil disimpan.',
    });
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
    addToast({
      type: 'info',
      title: 'Hari Libur Dihapus',
      message: 'Agenda libur telah dihapus dari daftar.',
    });
  };

  const isHoliday = (dateStr: string): NationalHoliday | undefined => {
    return holidays.find((h) => h.date === dateStr);
  };

  const resetHolidaysToDefault = () => {
    setHolidays(initialNationalHolidays);
    try {
      localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(initialNationalHolidays));
    } catch {}
    addToast({
      type: 'info',
      title: 'Kalender Libur Direset',
      message: 'Daftar hari libur nasional dikembalikan ke konfigurasi resmi standar.',
    });
  };

  // Selected date and class for daily attendance
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    return currentUser.assignedClass || 'c1';
  });

  // Keep selected class synced when user switches if they have an assigned class
  useEffect(() => {
    if (currentUser.assignedClass) {
      setSelectedClassId(currentUser.assignedClass);
    }
  }, [currentUser]);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Pengajuan Izin Baru',
      message: 'Wali murid Anisa Rahmawati (Kelas 1A) mengajukan surat izin sakit hari ini.',
      type: 'warning',
      timestamp: 'Baru saja',
      read: false,
      linkTab: 'pengajuan-izin',
    },
    {
      id: 'n2',
      title: 'Rekap Presensi Harian',
      message: 'Presensi Kelas 5A telah diselesaikan oleh Bpk. Hendra Gunawan.',
      type: 'success',
      timestamp: '15 menit lalu',
      read: false,
      linkTab: 'rekap-laporan',
    },
    {
      id: 'n3',
      title: 'Pengingat Batas Jam Masuk',
      message: 'Batas toleransi masuk pukul 07:15. Pastikan semua siswa telah diabsen.',
      type: 'info',
      timestamp: '07:00 WIB',
      read: true,
      linkTab: 'presensi-harian',
    },
  ]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      createdAt: getTodayDateString(),
    };
    setStudents((prev) => [newStudent, ...prev]);
    addToast({
      type: 'success',
      title: 'Siswa Ditambahkan',
      message: `${newStudent.name} (${newStudent.className}) berhasil didaftarkan.`,
    });
    return newStudent;
  };

  const updateStudent = (id: string, updatedData: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updatedData };
          // If class was updated, ensure className is consistent
          if (updatedData.classId && updatedData.classId !== s.classId) {
            const cls = classes.find((c) => c.id === updatedData.classId);
            if (cls) updated.className = cls.name;
          }
          return updated;
        }
        return s;
      })
    );
    addToast({
      type: 'success',
      title: 'Data Disimpan',
      message: 'Perubahan data siswa berhasil diperbarui.',
    });
  };

  const deleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    // Also cleanup attendance
    setAttendanceRecords((prev) => prev.filter((a) => a.studentId !== id));
    addToast({
      type: 'warning',
      title: 'Siswa Dihapus',
      message: target ? `${target.name} telah dihapus dari data siswa.` : 'Data siswa telah dihapus.',
    });
  };

  const deleteAllStudents = (filterClassId?: string): { deletedCount: number } => {
    let deletedCount = 0;
    if (filterClassId && filterClassId !== 'all') {
      const remainingStudents = students.filter((s) => s.classId !== filterClassId);
      const deletedStudents = students.filter((s) => s.classId === filterClassId);
      deletedCount = deletedStudents.length;

      if (deletedCount === 0) {
        addToast({
          type: 'info',
          title: 'Tidak Ada Siswa',
          message: 'Tidak ada data siswa yang ditemukan pada kelas yang dipilih.',
        });
        return { deletedCount: 0 };
      }

      const deletedIds = new Set(deletedStudents.map((s) => s.id));
      setStudents(remainingStudents);
      setAttendanceRecords((prev) => prev.filter((a) => !deletedIds.has(a.studentId)));

      const targetClassName = classes.find((c) => c.id === filterClassId)?.name || 'Kelas Terpilih';
      addToast({
        type: 'warning',
        title: 'Data Siswa Dihapus',
        message: `Berhasil menghapus ${deletedCount} data siswa dari ${targetClassName}.`,
      });
    } else {
      deletedCount = students.length;
      if (deletedCount === 0) {
        addToast({
          type: 'info',
          title: 'Data Siswa Kosong',
          message: 'Tidak ada data siswa untuk dihapus.',
        });
        return { deletedCount: 0 };
      }

      setStudents([]);
      setAttendanceRecords([]);
      addToast({
        type: 'warning',
        title: 'Semua Data Siswa Dihapus',
        message: `Berhasil mengosongkan seluruh data siswa (${deletedCount} siswa) dan rekam presensi terkait.`,
      });
    }
    return { deletedCount };
  };

  const getStudentById = (id: string) => {
    return students.find((s) => s.id === id);
  };

  // Class CRUD
  const addClass = (classData: Omit<ClassRoom, 'id'>): ClassRoom => {
    const newClass: ClassRoom = {
      ...classData,
      id: `c-${Date.now()}`,
    };
    setClasses((prev) => [...prev, newClass]);
    addToast({
      type: 'success',
      title: 'Kelas Ditambahkan',
      message: `${newClass.name} berhasil dibuat.`,
    });
    return newClass;
  };

  const updateClass = (id: string, updatedData: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updatedData } : c))
    );
    // Update student className if name changed
    if (updatedData.name) {
      setStudents((prev) =>
        prev.map((s) => (s.classId === id ? { ...s, className: updatedData.name! } : s))
      );
    }
    addToast({
      type: 'success',
      title: 'Kelas Diperbarui',
      message: 'Data kelas berhasil disimpan.',
    });
  };

  const deleteClass = (id: string) => {
    const target = classes.find((c) => c.id === id);
    setClasses((prev) => prev.filter((c) => c.id !== id));
    addToast({
      type: 'warning',
      title: 'Kelas Dihapus',
      message: target ? `${target.name} telah dihapus.` : 'Kelas telah dihapus.',
    });
  };

  const deleteAllClasses = (): { deletedCount: number } => {
    const deletedCount = classes.length;
    if (deletedCount === 0) {
      addToast({
        type: 'info',
        title: 'Data Kelas Kosong',
        message: 'Tidak ada data kelas untuk dihapus.',
      });
      return { deletedCount: 0 };
    }
    setClasses([]);
    addToast({
      type: 'warning',
      title: 'Semua Kelas Dihapus',
      message: `Berhasil menghapus seluruh data rombel kelas (${deletedCount} kelas).`,
    });
    return { deletedCount };
  };

  const clearAllClassTeachers = () => {
    setClasses((prev) =>
      prev.map((c) => ({
        ...c,
        teacherName: '-',
        teacherNip: '-',
      }))
    );
    addToast({
      type: 'warning',
      title: 'Data Wali Kelas Dikosongkan',
      message: 'Semua nama dan NIP wali kelas pada seluruh rombel telah dikosongkan.',
    });
  };

  const getClassById = (id: string) => {
    return classes.find((c) => c.id === id);
  };

  // Batch Import Students
  const batchImportStudents = (
    importedList: Array<{
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
    }>,
    options?: { overwriteExisting?: boolean }
  ) => {
    let addedCount = 0;
    let updatedCount = 0;
    const overwrite = options?.overwriteExisting ?? true;

    setStudents((prev) => {
      const studentMap = new Map<string, Student>();
      prev.forEach((s) => studentMap.set(s.nisn.trim(), s));

      const classesMap = new Map<string, string>();
      classes.forEach((c) => {
        classesMap.set(c.name.toLowerCase().trim(), c.id);
      });

      importedList.forEach((row, idx) => {
        const cleanNisn = row.nisn?.toString().trim() || `nisn-${Date.now()}-${idx}`;
        const cleanName = row.name?.toString().trim() || 'Siswa Baru';
        const cleanGender = (row.gender?.toString().toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P';
        const rawClassName = row.className?.toString().trim() || 'Kelas 1A';

        // Find or map classId
        let assignedClassId = classesMap.get(rawClassName.toLowerCase()) || classes[0]?.id || 'c1';

        const existing = studentMap.get(cleanNisn);

        if (existing) {
          if (overwrite) {
            studentMap.set(cleanNisn, {
              ...existing,
              nis: row.nis?.toString().trim() || existing.nis,
              name: cleanName,
              gender: cleanGender,
              classId: assignedClassId,
              className: rawClassName,
              birthDate: row.birthDate?.toString().trim() || existing.birthDate,
              parentName: row.parentName?.toString().trim() || existing.parentName,
              parentPhone: row.parentPhone?.toString().trim() || existing.parentPhone,
              address: row.address?.toString().trim() || existing.address,
              status: (row.status?.toString().toLowerCase() === 'mutasi'
                ? 'mutasi'
                : row.status?.toString().toLowerCase() === 'lulus'
                ? 'lulus'
                : 'aktif') as 'aktif' | 'mutasi' | 'lulus',
            });
            updatedCount++;
          }
        } else {
          const newStudent: Student = {
            id: `s-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            nisn: cleanNisn,
            nis: row.nis?.toString().trim() || `250${idx + 10}`,
            name: cleanName,
            gender: cleanGender,
            classId: assignedClassId,
            className: rawClassName,
            birthDate: row.birthDate?.toString().trim() || '2018-01-01',
            parentName: row.parentName?.toString().trim() || '-',
            parentPhone: row.parentPhone?.toString().trim() || '-',
            address: row.address?.toString().trim() || '-',
            status: (row.status?.toString().toLowerCase() === 'mutasi'
              ? 'mutasi'
              : row.status?.toString().toLowerCase() === 'lulus'
              ? 'lulus'
              : 'aktif') as 'aktif' | 'mutasi' | 'lulus',
            createdAt: getTodayDateString(),
          };
          studentMap.set(cleanNisn, newStudent);
          addedCount++;
        }
      });

      return Array.from(studentMap.values());
    });

    addToast({
      type: 'success',
      title: 'Import Siswa Berhasil',
      message: `${addedCount} siswa baru ditambahkan, ${updatedCount} siswa diperbarui.`,
    });

    return { addedCount, updatedCount };
  };

  // Batch Import Classes
  const batchImportClasses = (
    importedList: Array<{
      name: string;
      grade: number;
      teacherName: string;
      teacherNip?: string;
      roomNumber?: string;
      academicYear?: string;
    }>,
    options?: { overwriteExisting?: boolean }
  ) => {
    let addedCount = 0;
    let updatedCount = 0;
    const overwrite = options?.overwriteExisting ?? true;

    setClasses((prev) => {
      const classMap = new Map<string, ClassRoom>();
      prev.forEach((c) => classMap.set(c.name.toLowerCase().trim(), c));

      importedList.forEach((row, idx) => {
        const cleanName = row.name?.toString().trim() || `Kelas ${idx + 1}`;
        const key = cleanName.toLowerCase();
        const existing = classMap.get(key);

        if (existing) {
          if (overwrite) {
            classMap.set(key, {
              ...existing,
              name: cleanName,
              grade: Number(row.grade) || existing.grade,
              teacherName: row.teacherName?.toString().trim() || existing.teacherName,
              teacherNip: row.teacherNip?.toString().trim() || existing.teacherNip,
              roomNumber: row.roomNumber?.toString().trim() || existing.roomNumber,
              academicYear: row.academicYear?.toString().trim() || existing.academicYear,
            });
            updatedCount++;
          }
        } else {
          const newClass: ClassRoom = {
            id: `c-${Date.now()}-${idx}`,
            name: cleanName,
            grade: Number(row.grade) || 1,
            teacherName: row.teacherName?.toString().trim() || 'Guru Belum Ditugaskan',
            teacherNip: row.teacherNip?.toString().trim() || '-',
            roomNumber: row.roomNumber?.toString().trim() || 'R. 101',
            academicYear: row.academicYear?.toString().trim() || schoolProfile.academicYear,
          };
          classMap.set(key, newClass);
          addedCount++;
        }
      });

      return Array.from(classMap.values());
    });

    addToast({
      type: 'success',
      title: 'Import Kelas Berhasil',
      message: `${addedCount} kelas baru ditambahkan, ${updatedCount} kelas diperbarui.`,
    });

    return { addedCount, updatedCount };
  };

  // Attendance Handlers
  const markAttendance = (
    studentId: string,
    status: AttendanceStatus,
    date = selectedDate,
    notes = '',
    timeIn?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const defaultTime = status === 'H' || status === 'T' ? (timeIn || '07:05') : undefined;

    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.studentId === studentId && r.date === date
      );

      const recordItem: AttendanceRecord = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `att-${studentId}-${date}-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        studentNisn: student.nisn,
        classId: student.classId,
        className: student.className,
        date: date,
        status: status,
        timeIn: defaultTime,
        notes: notes || (status === 'T' ? 'Masuk terlambat' : ''),
        recordedBy: currentUser.name,
        verifiedAt: `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = recordItem;
        return next;
      } else {
        return [...prev, recordItem];
      }
    });
  };

  const markAllPresentForClass = (classId: string, date = selectedDate) => {
    const classStudents = students.filter((s) => s.classId === classId && s.status === 'aktif');
    if (classStudents.length === 0) return;

    setAttendanceRecords((prev) => {
      // Remove any existing records for this class on this date, then insert all as Present
      const filtered = prev.filter((r) => !(r.classId === classId && r.date === date));
      const nowStr = `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      const newRecords: AttendanceRecord[] = classStudents.map((s, idx) => {
        const min = 45 + (idx % 15);
        return {
          id: `att-${s.id}-${date}-${Date.now()}-${idx}`,
          studentId: s.id,
          studentName: s.name,
          studentNisn: s.nisn,
          classId: s.classId,
          className: s.className,
          date: date,
          status: 'H',
          timeIn: `06:${min.toString().padStart(2, '0')}`,
          notes: 'Hadir Tepat Waktu',
          recordedBy: currentUser.name,
          verifiedAt: nowStr,
        };
      });

      return [...filtered, ...newRecords];
    });

    const targetClass = classes.find((c) => c.id === classId);
    addToast({
      type: 'success',
      title: 'Presensi Diperbarui',
      message: `Semua siswa ${targetClass?.name || 'kelas'} (${classStudents.length} siswa) berhasil ditandai HADIR.`,
    });
  };

  // Mark All Students in a Class as 'LN' (Libur Nasional)
  const markAllHolidayForClass = (
    classId: string,
    date = selectedDate,
    holidayName?: string
  ) => {
    const classStudents = students.filter((s) => s.classId === classId && s.status === 'aktif');
    if (classStudents.length === 0) return;

    const detectedHol = isHoliday(date);
    const holidayTitle = holidayName || detectedHol?.name || 'Libur Nasional';

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((r) => !(r.classId === classId && r.date === date));
      const nowStr = `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      const newRecords: AttendanceRecord[] = classStudents.map((s, idx) => ({
        id: `att-${s.id}-${date}-LN-${Date.now()}-${idx}`,
        studentId: s.id,
        studentName: s.name,
        studentNisn: s.nisn,
        classId: s.classId,
        className: s.className,
        date: date,
        status: 'LN',
        timeIn: undefined,
        notes: `Libur Nasional: ${holidayTitle}`,
        recordedBy: currentUser.name,
        verifiedAt: nowStr,
      }));

      return [...filtered, ...newRecords];
    });

    const targetClass = classes.find((c) => c.id === classId);
    addToast({
      type: 'info',
      title: 'Status Libur Nasional (LN) Diterapkan',
      message: `Semua siswa ${targetClass?.name || 'kelas'} (${classStudents.length} siswa) telah ditandai Libur Nasional (${holidayTitle}).`,
    });
  };

  // Mark All Students across ALL classes as 'LN' (Libur Nasional) for the given date
  const markAllHolidayForAllClasses = (
    date = selectedDate,
    holidayName?: string
  ) => {
    const activeStudents = students.filter((s) => s.status === 'aktif');
    if (activeStudents.length === 0) return;

    const detectedHol = isHoliday(date);
    const holidayTitle = holidayName || detectedHol?.name || 'Libur Nasional';

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((r) => r.date !== date);
      const nowStr = `${date} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;

      const newRecords: AttendanceRecord[] = activeStudents.map((s, idx) => ({
        id: `att-${s.id}-${date}-LN-${Date.now()}-${idx}`,
        studentId: s.id,
        studentName: s.name,
        studentNisn: s.nisn,
        classId: s.classId,
        className: s.className,
        date: date,
        status: 'LN',
        timeIn: undefined,
        notes: `Libur Nasional: ${holidayTitle}`,
        recordedBy: currentUser.name,
        verifiedAt: nowStr,
      }));

      return [...filtered, ...newRecords];
    });

    addToast({
      type: 'success',
      title: 'Libur Nasional Diterapkan ke Seluruh Sekolah',
      message: `Total ${activeStudents.length} siswa dari seluruh kelas berhasil ditandai Libur Nasional (${holidayTitle}) untuk tanggal ${date}.`,
    });
  };

  const saveBatchAttendance = (records: AttendanceRecord[]) => {
    if (records.length === 0) return;
    setAttendanceRecords((prev) => {
      const keys = new Set(records.map((r) => `${r.studentId}-${r.date}`));
      const remaining = prev.filter((r) => !keys.has(`${r.studentId}-${r.date}`));
      return [...remaining, ...records];
    });
    addToast({
      type: 'success',
      title: 'Presensi Tersimpan',
      message: `${records.length} data presensi berhasil diperbarui dan tersimpan akurat.`,
    });
  };

  const getAttendanceForStudent = (studentId: string) => {
    return attendanceRecords.filter((r) => r.studentId === studentId);
  };

  const getAttendanceForClassAndDate = (classId: string, date: string) => {
    return attendanceRecords.filter((r) => r.classId === classId && r.date === date);
  };

  // Leave Requests Handlers
  const addLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => {
    const student = students.find((s) => s.id === request.studentId);
    const newReq: LeaveRequest = {
      ...request,
      id: `lr-${Date.now()}`,
      className: student?.className || request.className,
      studentName: student?.name || request.studentName,
      status: 'Pending',
      submittedAt: `${getTodayDateString()} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
    };

    setLeaveRequests((prev) => [newReq, ...prev]);

    // Push notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `Surat ${newReq.type} Baru`,
        message: `${newReq.studentName} (${newReq.className}): "${newReq.reason.substring(0, 45)}..."`,
        type: 'warning',
        timestamp: 'Baru saja',
        read: false,
        linkTab: 'pengajuan-izin',
      },
      ...prev,
    ]);

    addToast({
      type: 'success',
      title: 'Surat Izin Terkirim',
      message: `Surat ${request.type} untuk ${newReq.studentName} berhasil diajukan dan menunggu verifikasi guru.`,
    });
  };

  const approveLeaveRequest = (id: string) => {
    const target = leaveRequests.find((r) => r.id === id);
    if (!target) return;

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Disetujui',
              reviewedBy: currentUser.name,
              reviewedAt: `${getTodayDateString()} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            }
          : r
      )
    );

    // Automatically update attendance record for target student
    const statusType: AttendanceStatus = target.type === 'Sakit' ? 'S' : 'I';
    markAttendance(
      target.studentId,
      statusType,
      target.startDate,
      `Izin disetujui: ${target.reason}`
    );

    addToast({
      type: 'success',
      title: 'Surat Disetujui',
      message: `Izin untuk ${target.studentName} disetujui. Status presensi diperbarui menjadi ${target.type}.`,
    });
  };

  const rejectLeaveRequest = (id: string) => {
    const target = leaveRequests.find((r) => r.id === id);
    if (!target) return;

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Ditolak',
              reviewedBy: currentUser.name,
              reviewedAt: `${getTodayDateString()} ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
            }
          : r
      )
    );

    addToast({
      type: 'warning',
      title: 'Pengajuan Ditolak',
      message: `Surat izin untuk ${target.studentName} telah ditolak.`,
    });
  };

  // QR Barcode Scanning logic
  const scanStudentQR = (query: string) => {
    const cleanQuery = query.trim().toLowerCase();
    const student = students.find(
      (s) =>
        s.nisn.toLowerCase() === cleanQuery ||
        s.nis.toLowerCase() === cleanQuery ||
        s.id.toLowerCase() === cleanQuery ||
        s.name.toLowerCase().includes(cleanQuery)
    );

    if (!student) {
      return {
        success: false,
        message: `Siswa dengan kode / NISN "${query}" tidak ditemukan.`,
      };
    }

    // Mark present for today
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const isLate = timeStr > schoolProfile.lateThresholdTime;
    const status: AttendanceStatus = isLate ? 'T' : 'H';
    const notes = isLate ? `Presensi QR - Terlambat (${timeStr})` : `Presensi QR Sukses (${timeStr})`;

    markAttendance(student.id, status, getTodayDateString(), notes, timeStr);

    return {
      success: true,
      message: `Presensi ${student.name} (${student.className}) BERHASIL: Status ${status === 'H' ? 'HADIR' : 'TERLAMBAT'}.`,
      student,
    };
  };

  // Local Restore Points (Snapshot Lokal)
  const [restorePoints, setRestorePoints] = useState<DatabaseRestorePoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESTORE_POINTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Export full database
  const exportDatabaseBackup = (): DatabaseBackupData => {
    return {
      version: '1.2.0',
      appName: 'Sistem Presensi SD Terpadu',
      exportedAt: new Date().toISOString(),
      exportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.roleTitle,
      },
      checksum: `DB-${Date.now().toString(36).toUpperCase()}`,
      metadata: {
        totalStudents: students.length,
        totalClasses: classes.length,
        totalAttendance: attendanceRecords.length,
        totalLeaveRequests: leaveRequests.length,
        totalUsers: allUsers.length,
        schoolName: schoolProfile.name,
        npsn: schoolProfile.npsn,
      },
      schoolProfile,
      classes,
      students,
      attendanceRecords,
      leaveRequests,
      holidays,
      users: allUsers,
      rolePermissions,
    };
  };

  // Download backup as .JSON file
  const downloadDatabaseBackupFile = (customFilename?: string) => {
    const backup = exportDatabaseBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanSchool = (schoolProfile.name || 'SEKOLAH')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = new Date().toTimeString().slice(0, 5).replace(':', '');
    a.href = url;
    a.download = customFilename || `BACKUP_DATABASE_${cleanSchool}_${dateStr}_${timeStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Berkas Database Berhasil Diunduh',
      message: `Cadangan data (${backup.metadata.totalStudents} siswa, ${backup.metadata.totalClasses} kelas, ${backup.metadata.totalAttendance} presensi) tersimpan rapi.`,
    });
  };

  // Create Local Snapshot / Restore Point
  const createLocalRestorePoint = (
    name: string,
    description?: string,
    isAutomatic: boolean = false
  ): DatabaseRestorePoint => {
    const backup = exportDatabaseBackup();
    const newPoint: DatabaseRestorePoint = {
      id: `rp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name || `Titik Pemulihan ${new Date().toLocaleString('id-ID')}`,
      description:
        description ||
        (isAutomatic
          ? 'Snapshot pengaman otomatis dibuat sebelum pemulihan database.'
          : 'Dibuat secara manual oleh pengguna.'),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      totalRecordsCount:
        backup.metadata.totalStudents +
        backup.metadata.totalClasses +
        backup.metadata.totalAttendance,
      data: backup,
      isAutomatic,
    };

    setRestorePoints((prev) => {
      const updated = [newPoint, ...prev.slice(0, 9)];
      try {
        localStorage.setItem(STORAGE_KEYS.RESTORE_POINTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (!isAutomatic) {
      addToast({
        type: 'success',
        title: 'Snapshot Tersimpan',
        message: `Titik pemulihan "${newPoint.name}" berhasil dibuat.`,
      });
    }

    return newPoint;
  };

  // Restore Database from full JSON backup data
  const restoreDatabaseFromBackup = (
    backupData: DatabaseBackupData,
    mode: 'replace' | 'merge' = 'replace'
  ) => {
    if (!backupData || typeof backupData !== 'object') {
      return { success: false, message: 'Format data backup tidak valid.' };
    }

    // Auto-create backup snapshot before applying restore
    createLocalRestorePoint(
      `Auto-Backup Sebelum Restore (${new Date().toLocaleTimeString('id-ID')})`,
      'Snapshot pengaman otomatis sebelum menimpa/menggabungkan database.',
      true
    );

    if (mode === 'replace') {
      if (Array.isArray(backupData.students)) {
        setStudents(backupData.students);
        try {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(backupData.students));
        } catch {}
      }
      if (Array.isArray(backupData.classes)) {
        setClasses(backupData.classes);
        try {
          localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(backupData.classes));
        } catch {}
      }
      if (Array.isArray(backupData.attendanceRecords)) {
        setAttendanceRecords(backupData.attendanceRecords);
        try {
          localStorage.setItem(
            STORAGE_KEYS.ATTENDANCE,
            JSON.stringify(backupData.attendanceRecords)
          );
        } catch {}
      }
      if (Array.isArray(backupData.leaveRequests)) {
        setLeaveRequests(backupData.leaveRequests);
        try {
          localStorage.setItem(
            STORAGE_KEYS.LEAVE_REQUESTS,
            JSON.stringify(backupData.leaveRequests)
          );
        } catch {}
      }
      if (Array.isArray(backupData.holidays)) {
        setHolidays(backupData.holidays);
        try {
          localStorage.setItem(
            STORAGE_KEYS.HOLIDAYS,
            JSON.stringify(backupData.holidays)
          );
        } catch {}
      }
      if (backupData.schoolProfile && typeof backupData.schoolProfile === 'object') {
        setSchoolProfile(backupData.schoolProfile);
        try {
          localStorage.setItem(
            STORAGE_KEYS.PROFILE,
            JSON.stringify(backupData.schoolProfile)
          );
        } catch {}
      }
      if (Array.isArray(backupData.users) && backupData.users.length > 0) {
        setAllUsers(backupData.users);
        try {
          localStorage.setItem(
            STORAGE_KEYS.USERS_LIST,
            JSON.stringify(backupData.users)
          );
        } catch {}
      }
      if (backupData.rolePermissions && typeof backupData.rolePermissions === 'object') {
        setRolePermissions(backupData.rolePermissions);
        try {
          localStorage.setItem(
            STORAGE_KEYS.ROLE_PERMISSIONS,
            JSON.stringify(backupData.rolePermissions)
          );
        } catch {}
      }

      addToast({
        type: 'success',
        title: 'Database Berhasil Dipulihkan',
        message: `Seluruh data berhasil dipulihkan secara penuh (${backupData.students?.length || 0} siswa, ${backupData.classes?.length || 0} kelas, ${backupData.attendanceRecords?.length || 0} presensi).`,
      });

      return {
        success: true,
        message: 'Database berhasil dipulihkan secara penuh.',
        details: {
          studentsRestored: backupData.students?.length || 0,
          classesRestored: backupData.classes?.length || 0,
          attendanceRestored: backupData.attendanceRecords?.length || 0,
          leaveRequestsRestored: backupData.leaveRequests?.length || 0,
          usersRestored: backupData.users?.length || 0,
        },
      };
    } else {
      // MERGE MODE
      let addedStudents = 0;
      let addedClasses = 0;
      let addedAttendance = 0;
      let addedLeaves = 0;

      if (Array.isArray(backupData.students)) {
        setStudents((prev) => {
          const nisnSet = new Set(prev.map((s) => s.nisn.trim().toLowerCase()));
          const newItems = backupData.students.filter(
            (s) => !nisnSet.has(s.nisn.trim().toLowerCase())
          );
          addedStudents = newItems.length;
          const merged = [...prev, ...newItems];
          try {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      if (Array.isArray(backupData.classes)) {
        setClasses((prev) => {
          const nameSet = new Set(prev.map((c) => c.name.trim().toLowerCase()));
          const newItems = backupData.classes.filter(
            (c) => !nameSet.has(c.name.trim().toLowerCase())
          );
          addedClasses = newItems.length;
          const merged = [...prev, ...newItems];
          try {
            localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      if (Array.isArray(backupData.attendanceRecords)) {
        setAttendanceRecords((prev) => {
          const keySet = new Set(prev.map((r) => `${r.studentId}_${r.date}`));
          const newItems = backupData.attendanceRecords.filter(
            (r) => !keySet.has(`${r.studentId}_${r.date}`)
          );
          addedAttendance = newItems.length;
          const merged = [...prev, ...newItems];
          try {
            localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      if (Array.isArray(backupData.leaveRequests)) {
        setLeaveRequests((prev) => {
          const idSet = new Set(prev.map((l) => l.id));
          const newItems = backupData.leaveRequests.filter((l) => !idSet.has(l.id));
          addedLeaves = newItems.length;
          const merged = [...prev, ...newItems];
          try {
            localStorage.setItem(STORAGE_KEYS.LEAVE_REQUESTS, JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }

      addToast({
        type: 'success',
        title: 'Penggabungan Database Selesai',
        message: `Ditambahkan: ${addedStudents} siswa baru, ${addedClasses} kelas baru, ${addedAttendance} data presensi baru.`,
      });

      return {
        success: true,
        message: 'Penggabungan database berhasil.',
        details: {
          studentsRestored: addedStudents,
          classesRestored: addedClasses,
          attendanceRestored: addedAttendance,
          leaveRequestsRestored: addedLeaves,
          usersRestored: 0,
        },
      };
    }
  };

  // Restore from local restore point
  const restoreFromLocalPoint = (pointId: string) => {
    const point = restorePoints.find((p) => p.id === pointId);
    if (!point) {
      addToast({
        type: 'error',
        title: 'Gagal Memulihkan',
        message: 'Titik pemulihan tidak ditemukan.',
      });
      return false;
    }
    restoreDatabaseFromBackup(point.data, 'replace');
    return true;
  };

  // Delete local restore point
  const deleteLocalRestorePoint = (pointId: string) => {
    setRestorePoints((prev) => {
      const updated = prev.filter((p) => p.id !== pointId);
      try {
        localStorage.setItem(STORAGE_KEYS.RESTORE_POINTS, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Snapshot Dihapus',
      message: 'Titik pemulihan berhasil dihapus dari memori lokal.',
    });
  };

  // Reset all data to factory demo
  const resetDataToDefault = () => {
    localStorage.clear();
    setSchoolProfile(initialSchoolProfile);
    setClasses(initialClasses);
    setStudents(initialStudents);
    setAttendanceRecords(generateInitialAttendance());
    setLeaveRequests(initialLeaveRequests);
    setHolidays(initialNationalHolidays);
    setCurrentUser(demoUsers[0]);
    setSelectedDate(getTodayDateString());
    setSelectedClassId('c1');
    addToast({
      type: 'info',
      title: 'Data Direset',
      message: 'Semua data kembali ke konfigurasi awal bawaan.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        showSplash,
        setShowSplash,
        replayIntro,
        isAuthenticated,
        setIsAuthenticated,
        login,
        logout,
        loginAs,
        currentUser,
        setCurrentUser,
        availableUsers: allUsers,
        allUsers,
        addUser,
        updateUser,
        deleteUser,
        deleteAllTeachers,
        toggleUserStatus,
        rolePermissions,
        updateRolePermissions,
        updateRoleAllowedTabs,
        resetRolePermissionsToDefault,
        hasPermission,
        hasTabAccess,
        schoolProfile,
        updateSchoolProfile,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        deleteAllStudents,
        getStudentById,
        batchImportStudents,
        classes,
        addClass,
        updateClass,
        deleteClass,
        deleteAllClasses,
        clearAllClassTeachers,
        getClassById,
        batchImportClasses,
        attendanceRecords,
        selectedDate,
        setSelectedDate,
        selectedClassId,
        setSelectedClassId,
        markAttendance,
        markAllPresentForClass,
        markAllHolidayForClass,
        markAllHolidayForAllClasses,
        saveBatchAttendance,
        getAttendanceForStudent,
        getAttendanceForClassAndDate,
        holidays,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        isHoliday,
        resetHolidaysToDefault,
        leaveRequests,
        addLeaveRequest,
        approveLeaveRequest,
        rejectLeaveRequest,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        toasts,
        addToast,
        removeToast,
        scanStudentQR,
        dashboardSize,
        setDashboardSize,
        toggleDashboardSize,
        dashboardWidthPercent,
        setDashboardWidthPercent,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapsed,
        sidebarWidth,
        setSidebarWidth,
        exportDatabaseBackup,
        downloadDatabaseBackupFile,
        restoreDatabaseFromBackup,
        restorePoints,
        createLocalRestorePoint,
        restoreFromLocalPoint,
        deleteLocalRestorePoint,
        resetDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
