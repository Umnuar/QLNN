import type React from "react";
import { useApp } from "./AppContext";
import { AuditLogView } from "./components/audit/AuditLogView";
import { LoginView } from "./components/auth/LoginView";
import { AppLayout } from "./components/Layout/AppLayout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { HouseholdsPage } from "./pages/HouseholdsPage";
import { RecycleBinPage } from "./pages/RecycleBinPage";
import { SettingsPage } from "./pages/SettingsPage";
import { VillagesPage } from "./pages/VillagesPage";

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
			{activeTab === "villages" && <VillagesPage />}
			{activeTab === "households" && <HouseholdsPage />}
			{activeTab === "analytics" && <AnalyticsPage />}
			{activeTab === "recycle-bin" && <RecycleBinPage />}
			{activeTab === "audit" && <AuditLogView />}
			{activeTab === "settings" && <SettingsPage />}
		</AppLayout>
	);
};

export default App;
