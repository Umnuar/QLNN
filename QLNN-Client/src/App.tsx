import React from 'react';
import { useApp } from './AppContext';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginView } from './components/auth/LoginView';
import { HouseholdsPage } from './pages/HouseholdsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ExcelPage } from './pages/ExcelPage';
import { VillagesPage } from './pages/VillagesPage';
import { SettingsPage } from './pages/SettingsPage';
import { RecycleBinPage } from './pages/RecycleBinPage';
import { AuditLogView } from './components/audit/AuditLogView';

export const App: React.FC = () => {
  const { user, isInitializing, activeTab } = useApp();

  if (isInitializing) {
    return (
      <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-900 dark:text-white">
        <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Đang khởi tạo phiên làm việc Quản lý Nông nghiệp...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <AppLayout>
      {activeTab === 'villages' && <VillagesPage />}
      {activeTab === 'households' && <HouseholdsPage />}
      {activeTab === 'analytics' && <AnalyticsPage />}
      {activeTab === 'excel' && <ExcelPage />}
      {activeTab === 'recycle-bin' && <RecycleBinPage />}
      {activeTab === 'audit' && <AuditLogView />}
      {activeTab === 'settings' && <SettingsPage />}
    </AppLayout>
  );
};

export default App;
