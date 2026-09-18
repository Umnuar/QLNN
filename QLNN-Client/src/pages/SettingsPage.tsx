import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Users,
  Building2,
  Database,
  Eye,
  EyeOff,
  X,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { apiClient } from '../api/apiClient';
import { useModal } from '../hooks/useModal';
import { BackupRestoreTab } from '../components/settings/BackupRestoreTab';
import { CustomSelect } from '../components/common/CustomSelect';
import { User } from '../types';

export const SettingsPage: React.FC = () => {
  const { villages, user } = useApp();
  const { showModal } = useModal();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'users' | 'commune' | 'backup'>('users');
  
  // Users state
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserVillageId, setNewUserVillageId] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');

  // Modal chỉnh sửa cán bộ (phân công thôn & đổi mật khẩu đồng thời)
  const [editUserModal, setEditUserModal] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'user'>('user');
  const [editVillageId, setEditVillageId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Thông tin UBND xã
  const [communeName, setCommuneName] = useState('Ủy ban nhân dân Xã Đăk Hà');
  const [districtName, setDistrictName] = useState('Huyện Đăk Hà');
  const [provinceName, setProvinceName] = useState('Tỉnh Kon Tum');
  const [communeAddress, setCommuneAddress] = useState('Trung tâm Xã Đăk Hà, Huyện Đăk Hà, Tỉnh Kon Tum');
  const [communePhone, setCommunePhone] = useState('0260.3822.123');
  const [communeEmail, setCommuneEmail] = useState('ubnd.xadakha@kontum.gov.vn');
  const [savedCommune, setSavedCommune] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/users');
      setUsersList(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  // --- USERS LOGIC ---
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newUserPassword.trim()) return;
    try {
      await apiClient.post('/users', {
        username: newUsername.trim(),
        password: newUserPassword.trim(),
        role: newUserRole,
        village_id: newUserRole === 'user' ? (newUserVillageId || null) : null
      });
      setIsAddUserOpen(false);
      setNewUsername('');
      setNewUserPassword('');
      setNewUserVillageId('');
      fetchUsers();
      showModal({ title: 'Thành công', message: 'Tạo tài khoản thành công', type: 'info' });
    } catch (err: any) {
      showModal({ title: 'Lỗi', message: err.response?.data?.error || 'Không thể tạo', type: 'danger' });
    }
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === user?.id) {
      showModal({ title: 'Lỗi', message: 'Không thể xóa chính mình', type: 'danger' });
      return;
    }
    showModal({
      title: 'Xóa tài khoản',
      message: `Bạn có chắc muốn xóa tài khoản "${u.username}" không?`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await apiClient.delete(`/users/${u.id}`);
          fetchUsers();
        } catch (err: any) {
          showModal({ title: 'Lỗi', message: 'Không thể xóa', type: 'danger' });
        }
      }
    });
  };

  const handleOpenEditUserModal = (u: User) => {
    setEditUserModal(u);
    setEditRole(u.role);
    setEditVillageId(u.village_id || '');
    setEditPassword('');
    setShowEditPassword(false);
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    const trimmedPass = editPassword.trim();
    if (trimmedPass && trimmedPass.length < 6) {
      showModal({
        title: 'Mật khẩu không hợp lệ',
        message: 'Mật khẩu mới nếu đổi phải có ít nhất 6 ký tự.',
        type: 'warning',
      });
      return;
    }
    setEditLoading(true);
    try {
      await apiClient.put(`/users/${editUserModal.id}`, {
        role: editRole,
        village_id: editRole === 'user' ? (editVillageId || null) : null,
        password: trimmedPass || undefined,
      });
      const targetName = editUserModal.username;
      setEditUserModal(null);
      fetchUsers();
      showModal({
        title: 'Thành công',
        message: `Đã cập nhật thông tin cán bộ "${targetName}" thành công!`,
        type: 'info',
      });
    } catch (err: any) {
      showModal({
        title: 'Lỗi',
        message: err.response?.data?.error || 'Không thể cập nhật thông tin cán bộ',
        type: 'danger',
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveCommune = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedCommune(true);
    setTimeout(() => setSavedCommune(false), 3000);
    showModal({
      title: 'Đã lưu thông tin',
      message: 'Thông tin UBND Xã Đăk Hà đã được cập nhật thành công.',
      type: 'info',
    });
  };

  const navTabs = [
    { id: 'users', label: 'Quản lý Tài khoản', icon: Users, desc: 'Tài khoản cán bộ xã và thôn' },
    { id: 'commune', label: 'Đơn vị Hành chính', icon: Building2, desc: 'Thông tin UBND Xã Đăk Hà' },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: Database, desc: 'Xuất & nhập cơ sở dữ liệu' },
  ] as const;

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span>Cài Đặt Hệ Thống</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Quản lý tài khoản cán bộ, thông tin đơn vị và bảo trì an toàn cơ sở dữ liệu.
          </p>
        </div>
      </div>

      {/* Main Layout: Left Sidebar Navigation & Right Content Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Subtab Navigation */}
        <div className="w-full md:w-64 bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-1.5 shrink-0 h-fit shadow-xs">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3.5 py-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-200/60 dark:border-emerald-800/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} strokeWidth={1.5} />
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
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Danh sách Tài khoản</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Quản lý quyền truy cập và tài khoản cán bộ</p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                    <span>Thêm Tài Khoản</span>
                  </button>
                )}
              </div>

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
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="relative flex h-2.5 w-2.5" title={u.is_online ? 'Đang hoạt động' : 'Ngoại tuyến'}>
                                {u.is_online && (
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                )}
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${u.is_online ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white">{u.username}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg ${u.role === 'admin' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60' : 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-medium">{u.role === 'admin' ? 'Toàn xã' : villageName}</td>
                          <td className="px-6 py-3.5 text-right">
                            {isAdmin && (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUserModal(u)}
                                  title="Chỉnh sửa phân công thôn & mật khẩu"
                                  aria-label={`Sửa tài khoản ${u.username}`}
                                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-xl cursor-pointer transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                                </button>
                                {u.id !== user?.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    title="Xóa tài khoản"
                                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                  </button>
                                )}
                              </div>
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

          {/* TAB 2: COMMUNE INFO */}
          {activeTab === 'commune' && (
            <form onSubmit={handleSaveCommune} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">Thông Tin Đơn Vị Hành Chính</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Xuất hiện trên tiêu đề báo cáo, biểu mẫu Excel và thống kê chính thức</p>
                </div>
                {savedCommune && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    <span>Đã lưu thành công</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tên Đơn Vị Cấp Xã *</label>
                  <input
                    type="text"
                    required
                    value={communeName}
                    onChange={(e) => setCommuneName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Huyện Quản Lý *</label>
                  <input
                    type="text"
                    required
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành Phố *</label>
                  <input
                    type="text"
                    required
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Điện Thoại Trực Ban</label>
                  <input
                    type="text"
                    value={communePhone}
                    onChange={(e) => setCommunePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Trụ Sở Làm Việc</label>
                <input
                  type="text"
                  value={communeAddress}
                  onChange={(e) => setCommuneAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hòm Thư Điện Tử (Email)</label>
                <input
                  type="email"
                  value={communeEmail}
                  onChange={(e) => setCommuneEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {isAdmin && (
                <div className="pt-3 flex justify-end">
                  <button
                    type="submit"
                    className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <BackupRestoreTab />
          )}
        </div>
      </div>

      {/* Modal Thêm tài khoản mới */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleCreateUser}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md p-5 space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="font-bold text-sm">Thêm Tài Khoản Cán Bộ Mới</span>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Tên Đăng Nhập *</label>
              <input
                type="text"
                required
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Vd: canbo_thon1"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Mật Khẩu Khởi Tạo *</label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  value={newUserRole}
                  onChange={(val) => setNewUserRole(val as any)}
                  options={[
                    { value: 'user', label: 'Cán Bộ Thôn' },
                    { value: 'admin', label: 'Cán Bộ Xã (Admin)' },
                  ]}
                  label="Phân Quyền"
                />
              </div>

              {newUserRole === 'user' && (
                <div>
                  <CustomSelect
                    value={newUserVillageId}
                    onChange={(val) => setNewUserVillageId(String(val))}
                    options={villages.map((v) => ({ value: v.id, label: v.name }))}
                    label="Thôn Phụ Trách"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Tạo Tài Khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Chỉnh Sửa Thông Tin Cán Bộ (Phân công thôn & Đổi mật khẩu đồng thời) */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <form
            onSubmit={handleSaveUserEdit}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-md p-5 space-y-4 text-slate-900 dark:text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                <span className="font-bold text-sm">Chỉnh Sửa Thông Tin Cán Bộ</span>
              </div>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Tên Đăng Nhập</label>
              <input
                type="text"
                disabled
                readOnly
                value={editUserModal.username}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <CustomSelect
                  value={editRole}
                  onChange={(val) => setEditRole(val as any)}
                  options={[
                    { value: 'user', label: 'Cán Bộ Thôn' },
                    { value: 'admin', label: 'Cán Bộ Xã (Admin)' },
                  ]}
                  label="Phân Quyền"
                />
              </div>

              {editRole === 'user' ? (
                <div>
                  <CustomSelect
                    value={editVillageId}
                    onChange={(val) => setEditVillageId(String(val))}
                    options={villages.map((v) => ({ value: v.id, label: v.name }))}
                    label="Thôn Phụ Trách"
                  />
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 italic pb-2">Toàn xã (Quản trị)</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">
                Mật khẩu mới <span className="text-[11px] font-normal text-slate-400">(để trống nếu không đổi)</span>
              </label>
              <div className="relative">
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                  className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showEditPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                {editLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
