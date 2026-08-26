import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight, Plus, Edit3, Trash2, Check, X, Search } from 'lucide-react';
import { useApp } from '../AppContext';
import { villageApi } from '../api/villageApi';
import { authApi } from '../api/authApi';
import { useModal } from '../hooks/useModal';

export const VillagesPage: React.FC = () => {
  const { villages, setSelectedVillageId, setActiveTab, user, refreshVillages } = useApp();
  const { showModal } = useModal();
  const isAdmin = user?.role === 'admin';

  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      authApi.getUsers().then(res => setUsersList(res.data)).catch(console.error);
    }
  }, [isAdmin]);

  const filteredVillages = villages.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVillageClick = (id: string) => {
    setSelectedVillageId(id);
    setActiveTab('analytics');
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || loading) return;
    setLoading(true);
    try {
      await villageApi.update(id, editName.trim());
      setEditingId(null);
      await refreshVillages();
      showModal({
        title: 'Thành công',
        message: 'Cập nhật tên thôn thành công',
        type: 'success',
      });
    } catch (err: any) {
      showModal({
        title: 'Lỗi',
        message: err.response?.data?.error || 'Không thể cập nhật tên thôn',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    showModal({
      title: 'Xác nhận xóa thôn',
      message: `Bạn có chắc muốn xóa "${name}" không?\nThao tác này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xóa',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        try {
          await villageApi.delete(id);
          await refreshVillages();
          showModal({
            title: 'Thành công',
            message: 'Đã xóa thôn thành công',
            type: 'success',
          });
        } catch (err: any) {
          showModal({
            title: 'Lỗi',
            message: err.response?.data?.error || 'Không thể xóa thôn',
            type: 'danger',
          });
        }
      },
    });
  };

  const handleCreate = async () => {
    if (!newName.trim() || loading) return;
    setLoading(true);
    try {
      await villageApi.create(newName.trim());
      setIsAdding(false);
      setNewName('');
      await refreshVillages();
      showModal({
        title: 'Thành công',
        message: 'Thêm thôn mới thành công',
        type: 'success',
      });
    } catch (err: any) {
      showModal({
        title: 'Lỗi',
        message: err.response?.data?.error || 'Không thể thêm thôn',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-500" />
            <span>Tất cả Thôn</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Chọn một thôn để quản lý số liệu Nông nghiệp
          </p>
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm thôn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid Danh Sách Thôn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVillages.map((village) => {
          const isEditing = editingId === village.id;
          const manager = usersList.find((u) => u.village_id === village.id);

          if (isEditing) {
            return (
              <div
                key={village.id}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Đổi tên thôn
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {village.id.substring(0, 8)}
                    </span>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(village.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    placeholder="Nhập tên thôn mới..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(village.id)}
                    disabled={loading || !editName.trim()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={village.id}
              onClick={() => handleVillageClick(village.id)}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[140px] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                      <button
                        type="button"
                        title="Đổi tên thôn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(village.id);
                          setEditName(village.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Xóa thôn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(village.id, village.name);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-500 transition-colors ml-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {village.name}
                </h3>
                <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ID: {village.id.substring(0, 8)}
                </p>
                {isAdmin && (
                  <p className="text-[11px] font-medium mt-1 text-slate-500 dark:text-slate-400">
                    👤 Quản lý: <span className="font-bold">{manager ? manager.username : '⚠️ Chưa phân công'}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Nút / Khung Thêm Thôn Mới dành cho Admin */}
        {isAdmin && (
          isAdding ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl p-5 border-2 border-dashed border-emerald-400 dark:border-emerald-600 shadow-sm flex flex-col justify-between min-h-[140px] animate-in fade-in"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    Thêm thôn mới
                  </span>
                </div>
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') {
                      setIsAdding(false);
                      setNewName('');
                    }
                  }}
                  placeholder="Nhập tên thôn mới..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setNewName('');
                  }}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hủy</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={loading || !newName.trim()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Tạo thôn</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setNewName('');
              }}
              className="min-h-[140px] rounded-3xl p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex flex-col items-center justify-center gap-2 transition-all group hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-200/60 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Thêm Thôn Mới</span>
            </button>
          )
        )}
      </div>

      {/* Empty State */}
      {filteredVillages.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Không tìm thấy thôn nào
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Không có kết quả phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
};
