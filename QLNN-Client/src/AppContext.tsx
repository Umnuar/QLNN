import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Village } from './types';
import { authApi } from './api/authApi';
import { villageApi } from './api/villageApi';
import { secureStorage } from './utils/secureStorage';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import axios from 'axios';
import { getCache, setCache } from './db/indexedDB';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVillageId: string;
  setSelectedVillageId: (id: string) => void;
  selectedVillageName: string;
  villages: Village[];
  setVillages: React.Dispatch<React.SetStateAction<Village[]>>;
  isOnline: boolean;
  isBackendHealthy: boolean;
  latency: number | null;
  isInitializing: boolean;
  logout: () => Promise<void>;
  refreshVillages: () => Promise<void>;
  checkServerHealth: () => Promise<boolean>;

  // 1. Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // 2. Theme state (Dark / Light mode)
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // 3. Zoom state
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('households');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [villages, setVillages] = useState<Village[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(true);
  const [latency, setLatency] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // 1. Sidebar Collapsed State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem('qlnn_sidebar_collapsed') === 'true' ||
        localStorage.getItem('qlhk_sidebar_collapsed') === 'true'
      );
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('qlnn_sidebar_collapsed', String(next));
        localStorage.setItem('qlhk_sidebar_collapsed', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    try {
      localStorage.setItem('qlnn_sidebar_collapsed', String(collapsed));
      localStorage.setItem('qlhk_sidebar_collapsed', String(collapsed));
    } catch {
      // Ignore
    }
  };

  // 2. Theme State (Dark / Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('qlnn_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('qlnn_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 3. Zoom State (80% to 140%, step 10%)
  const [zoomLevel, setZoomLevel] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('qlnn_zoom');
      const parsed = saved ? parseInt(saved, 10) : 100;
      return parsed >= 80 && parsed <= 140 ? parsed : 100;
    } catch {
      return 100;
    }
  });

  useEffect(() => {
    // Zoom qua IPC của Electron
    if (window.api?.app?.setZoom) {
      window.api.app.setZoom(zoomLevel);
    }
    localStorage.setItem('qlnn_zoom', String(zoomLevel));
  }, [zoomLevel]);

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(140, prev + 10));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(80, prev - 10));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  // Keyboard Shortcuts for Zoom (Ctrl +, Ctrl -, Ctrl 0)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          zoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          resetZoom();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const logout = async () => {
    try {
      const refreshToken = await secureStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore
    } finally {
      await secureStorage.clear();
      setUser(null);
    }
  };

  // 30 phút tự động đăng xuất nếu không có tương tác
  useInactivityTimeout(() => {
    logout();
  }, !!user);

  // Stable references for preventing re-render infinite loops
  const userRef = React.useRef<User | null>(user);
  userRef.current = user;

  const selectedVillageIdRef = React.useRef<string>(selectedVillageId);
  selectedVillageIdRef.current = selectedVillageId;

  const isBackendHealthyRef = React.useRef<boolean>(isBackendHealthy);
  isBackendHealthyRef.current = isBackendHealthy;

  const lastEmaLatencyRef = React.useRef<number | null>(null);

  const refreshVillages = useCallback(async () => {
    try {
      let data: any[] = [];
      try {
        data = await villageApi.getAll();
        await setCache('villages', data);
      } catch (apiErr: any) {
        if (apiErr.message === 'Network Error' || (apiErr.response && apiErr.response.status >= 500)) {
          console.warn('Offline mode: fetching villages from cache');
          const cached = await getCache<Village[]>('villages');
          if (cached) data = cached;
        } else {
          throw apiErr;
        }
      }
      setVillages(data);
      const currentUser = userRef.current;
      const currentSelected = selectedVillageIdRef.current;
      if (data.length > 0 && !currentSelected) {
        if (currentUser?.role === 'user' && currentUser.village_id) {
          setSelectedVillageId(currentUser.village_id);
        } else {
          setSelectedVillageId('');
        }
      }
    } catch (err) {
      console.warn('Loi tai danh muc thon:', err);
    }
  }, []);

  // Đo ping thời gian thực làm mượt bằng thuật toán EMA alpha = 0.3
  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    const t0 = performance.now();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      let res;
      try {
        res = await axios.get(`${apiUrl}/ping`, { timeout: 3000 });
      } catch (pingErr: any) {
        if (pingErr.response && pingErr.response.status === 404) {
          res = await axios.get(`${apiUrl}/health`, { timeout: 3000 });
        } else {
          throw pingErr;
        }
      }

      const rawLatency = Math.round(performance.now() - t0);
      const smoothed = lastEmaLatencyRef.current === null
        ? rawLatency
        : Math.round(0.3 * rawLatency + 0.7 * lastEmaLatencyRef.current);
      lastEmaLatencyRef.current = smoothed;
      setLatency(smoothed);

      if (res.status === 200 || res.status === 204) {
        if (!isBackendHealthyRef.current) {
          // Server vừa phục hồi
          window.dispatchEvent(new CustomEvent('server:reconnected'));
        }
        setIsBackendHealthy(true);
        return true;
      }
      setIsBackendHealthy(false);
      return false;
    } catch {
      setIsBackendHealthy(false);
      setLatency(null);
      lastEmaLatencyRef.current = null;
      return false;
    }
  }, []);

  // initAuth chạy độc lập duy nhất 1 lần khi app mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await secureStorage.getItem('accessToken');
        if (token) {
          try {
            const u = await authApi.getMe(token);
            setUser(u);
            await secureStorage.setItem('user', JSON.stringify(u));
            if (u.village_id) {
              setSelectedVillageId(u.village_id);
              setActiveTab('analytics');
            } else if (u.role === 'admin') {
              setActiveTab('villages');
            }
          } catch (err: any) {
            if (err.message === 'Network Error' || (err.response && err.response.status >= 500)) {
              console.warn('Lỗi mạng khi kiểm tra token, dùng User từ Cache.');
              const cachedUserStr = await secureStorage.getItem('user');
              if (cachedUserStr) {
                const u = JSON.parse(cachedUserStr);
                setUser(u);
                if (u.village_id) {
                  setSelectedVillageId(u.village_id);
                  setActiveTab('analytics');
                } else if (u.role === 'admin') {
                  setActiveTab('villages');
                }
              }
            } else {
              console.warn('Phiên đăng nhập hết hạn');
              await secureStorage.clear();
              setUser(null);
            }
          }
        }
      } catch (e) {
        await secureStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, []);

  // Heartbeat và listener mạng độc lập
  useEffect(() => {
    checkServerHealth();

    const handleOnline = () => {
      setIsOnline(true);
      window.dispatchEvent(new CustomEvent('server:reconnected'));
      checkServerHealth();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendHealthy(false);
      setLatency(null);
    };
    const handleAuthExpired = () => logout();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth:expired', handleAuthExpired);

    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkServerHealth();
      }
    }, 6000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth:expired', handleAuthExpired);
      clearInterval(interval);
    };
  }, [checkServerHealth]);

  useEffect(() => {
    if (user) {
      refreshVillages();
    }
  }, [user, refreshVillages]);

  const selectedVillage = villages.find((v) => v.id === selectedVillageId);
  const selectedVillageName = selectedVillage
    ? selectedVillage.name
    : user?.role === 'admin'
    ? 'Toàn xã Đăk Hà'
    : '';

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        selectedVillageId,
        setSelectedVillageId,
        selectedVillageName,
        villages,
        setVillages,
        isOnline,
        isBackendHealthy,
        latency,
        isInitializing,
        logout,
        refreshVillages,
        checkServerHealth,

        // 1. Sidebar
        isSidebarCollapsed,
        toggleSidebar,
        setSidebarCollapsed,

        // 2. Theme
        theme,
        toggleTheme,

        // 3. Zoom
        zoomLevel,
        zoomIn,
        zoomOut,
        resetZoom,
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
