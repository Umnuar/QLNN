import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Key, Building2, Users, History, Database } from 'lucide-react';
import { useApp } from '../AppContext';
import { apiClient } from '../api/apiClient';
import { useModal } from '../hooks/useModal';
import { CommuneProfileTab } from '../components/settings/CommuneProfileTab';

export const SettingsPage: React.FC = () => {
  const { villages, user } = useApp();
  const { showModal } = useModal();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'info' | 'audit' | 'backup'>('info');
  
  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [villageId, setVillageId] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsersList(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'users') fetchUsers();
  }, [activeSubTab]);

  // --- USERS LOGIC ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      await apiClient.post('/users', {
        username,
        password,
        role: 'user',
        village_id: villageId || null
      });
      setIsAddingUser(false);
      setUsername('');
      setPassword('');
      setVillageId('');
      fetchUsers();
      showModal({ title: 'Thành công', message: 'Tạo tài khoản thành công', type: 'success' });
    } catch (err: any) {
      showModal({ title: 'Lỗi', message: err.response?.data?.error || 'Không thể tạo', type: 'danger' });
    }
  };

  const handleDeleteUser = (id: string) => {
    if (id === user?.id) {
      showModal({ title: 'Lỗi', message: 'Không thể xóa chính mình', type: 'danger' });
      return;
    }
    showModal({
      title: 'Xóa tài khoản',
      message: 'Bạn có chắc muốn xóa tài khoản này không?',
      type: 'danger',
      confirmText: 'Xóa',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/users/${id}`);
          fetchUsers();
        } catch (err: any) {
          showModal({ title: 'Lỗi', message: 'Không thể xóa', type: 'danger' });
        }
      }
    });
  };

  const handleResetPassword = async (id: string) => {
    const newPass = window.prompt('Nhập mật khẩu mới cho tài khoản này:');
    if (!newPass) return;
    try {
      await apiClient.put(`/users/${id}/password`, { password: newPass });
      showModal({ title: 'Thành công', message: 'Đã đổi mật khẩu thành công!', type: 'success' });
    } catch (err: any) {
      showModal({ title: 'Lỗi', message: 'Không thể đổi mật khẩu', type: 'danger' });
    }
  };

  const navTabs = [
    { id: 'info', label: 'Thông tin Đơn vị', icon: Building2, desc: 'Cấu hình thông tin báo cáo xã' },
    { id: 'users', label: 'Quản lý Tài khoản', icon: Users, desc: 'Tài khoản cán bộ xã và thôn' },
    { id: 'audit', label: 'Nhật ký Hoạt động', icon: History, desc: 'Theo dõi lịch sử thay đổi dữ liệu' },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Database, desc: 'Xuất & nhập cơ sở dữ liệu' },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Cài Đặt Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Quản lý tài khoản cán bộ, thông tin đơn vị, nhật ký và bảo trì dữ liệu.
          </p>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Navigation & Right Content Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Subtab Navigation */}
        <div className="w-full md:w-64 bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0 h-fit shadow-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <div className="min-w-0">
                  <div className="leading-snug">{tab.label}</div>
                  <div className={`text-[10px] font-normal truncate mt-0.5 ${isActive ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {activeSubTab === 'info' && <CommuneProfileTab />}

          {activeSubTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Danh sách Tài khoản</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý quyền truy cập và tài khoản cán bộ</p>
                </div>
                <button
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> {isAddingUser ? 'Đóng form' : 'Thêm Tài Khoản'}
                </button>
              </div>

              {isAddingUser && (
                <form onSubmit={handleCreateUser} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Tên đăng nhập</label>
                    <input required value={username} onChange={e => setUsername(e.target.value)} placeholder="Nhập tên đăng nhập..." className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Mật khẩu</label>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu..." className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Quản lý Thôn (Tùy chọn)</label>
                    <select value={villageId} onChange={e => setVillageId(e.target.value)} className="w-full px-3 py-2 text-xs border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden">
                      <option value="">-- Toàn xã --</option>
                      {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 rounded-xl font-bold text-xs cursor-pointer transition-all">Lưu Tài Khoản</button>
                  </div>
                </form>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Tên đăng nhập</th>
                      <th className="px-6 py-3.5">Quyền hạn</th>
                      <th className="px-6 py-3.5">Thôn quản lý</th>
                      <th className="px-6 py-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {usersList.map((u) => {
                      const villageName = villages.find(v => v.id === u.village_id)?.name || 'Không có';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">{u.username}</td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-medium">{u.role === 'admin' ? 'Toàn xã' : villageName}</td>
                          <td className="px-6 py-3.5 flex items-center justify-end gap-1.5">
                            {u.role !== 'admin' && (
                              <>
                                <button onClick={() => handleResetPassword(u.id)} title="Đổi mật khẩu" className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg cursor-pointer transition-colors">
                                  <Key className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteUser(u.id)} title="Xóa tài khoản" className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {usersList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                          Chưa có tài khoản nào được tạo
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'audit' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Nhật ký Hoạt động</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Ghi nhận và tra cứu toàn bộ lịch sử chỉnh sửa, cập nhật và xóa số liệu nông nghiệp trong hệ thống.
              </p>
            </div>
          )}

          {activeSubTab === 'backup' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Sao lưu & Khôi phục</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
                Xuất file sao lưu cơ sở dữ liệu hoặc khôi phục dữ liệu hệ thống từ các bản sao lưu an toàn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
