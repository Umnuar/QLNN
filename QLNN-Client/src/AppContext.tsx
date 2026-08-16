import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Village } from './types';
import { authApi } from './api/authApi';
import { villageApi } from './api/villageApi';
import { secureStorage } from './utils/secureStorage';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';

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
  isInitializing: boolean;
  logout: () => Promise<void>;
  refreshVillages: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('households');
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');
  const [villages, setVillages] = useState<Village[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
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

  const refreshVillages = async () => {
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
  };

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
      } catch (err) {
        console.warn('Phiên đăng nhập hết hạn hoặc chưa đăng nhập');
        await secureStorage.clear();
        setUser(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleAuthExpired = () => logout();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    if (user) {
      refreshVillages();
    }
  }, [user]);

  const selectedVillage = villages.find((v) => v.id === selectedVillageId);
  const selectedVillageName = selectedVillage ? selectedVillage.name : (user?.role === 'admin' ? 'Toàn xã Đăk Hà' : '');

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
        isInitializing,
        logout,
        refreshVillages,
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
