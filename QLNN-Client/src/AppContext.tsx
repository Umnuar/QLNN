import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Village } from './types';
import { authApi } from './api/authApi';
import { villageApi } from './api/villageApi';
import { secureStorage } from './utils/secureStorage';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import axios from 'axios';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedVillageId: string;
  setSelectedVillageId: (id: string) => void;
  selectedVillageName: string;
  villages: Village[];
  isOnline: boolean;
  isBackendHealthy: boolean;
  latency: number | null;
  isInitializing: boolean;
  logout: () => Promise<void>;
  refreshVillages: () => Promise<void>;
  checkServerHealth: () => Promise<boolean>;
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

  const refreshVillages = useCallback(async () => {
    try {
      const data = await villageApi.getAll();
      setVillages(data);
      if (data.length > 0 && !selectedVillageId) {
        if (user?.role === 'user' && user.village_id) {
          setSelectedVillageId(user.village_id);
        } else {
          setSelectedVillageId(data[0].id);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải danh mục thôn:', err);
    }
  }, [selectedVillageId, user]);

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    const t0 = performance.now();
    try {
      const res = await axios.get('http://localhost:5001/api/health', { timeout: 3000 });
      const lat = Math.round(performance.now() - t0);
      setLatency(lat);
      if (res.status === 200) {
        if (!isBackendHealthy) {
          // Server vừa sống lại
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
      return false;
    }
  }, [isBackendHealthy]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await secureStorage.getItem('accessToken');
        if (token) {
          const u = await authApi.getMe(token);
          setUser(u);
          if (u.village_id) {
            setSelectedVillageId(u.village_id);
          }
        }
      } catch {
        console.warn('Phiên đăng nhập hết hạn hoặc chưa đăng nhập');
        await secureStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
    checkServerHealth();

    const handleOnline = () => {
      setIsOnline(true);
      checkServerHealth();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsBackendHealthy(false);
    };
    const handleAuthExpired = () => logout();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth:expired', handleAuthExpired);

    // Heartbeat định kỳ kiểm tra sức khỏe backend
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
        isOnline,
        isBackendHealthy,
        latency,
        isInitializing,
        logout,
        refreshVillages,
        checkServerHealth,
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
