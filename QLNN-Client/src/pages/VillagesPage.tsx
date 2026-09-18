import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Edit3, Trash2, Check, X, Search, Plus, ArrowRight, Users, Trees, PawPrint } from 'lucide-react';
import { useApp } from '../AppContext';
import { useModal } from '../hooks/useModal';
import { User, OverviewAnalytics, VillageAnalytics } from '../types';
import { analyticsApi } from '../api/analyticsApi';
import { villageApi } from '../api/villageApi';
import { authApi } from '../api/authApi';
import { getCache, setCache } from '../db/indexedDB';
import { cryptoHelper } from '../utils/cryptoHelper';

let cachedStatsTime = 0;
let cachedUsersTime = 0;

export const VillagesPage: React.FC = () => {
  const { villages, setSelectedVillageId, setActiveTab, user, refreshVillages } = useApp();
  const { showModal } = useModal();
  const isAdmin = user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);

  // Thống kê động thời gian thực từ CSDL Backend kèm Offline Cache
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null);
  const [villageStats, setVillageStats] = useState<Record<string, VillageAnalytics>>({});

  const isFetchingStatsRef = useRef(false);
  const isFetchingUsersRef = useRef(false);
  const overviewRef = useRef<OverviewAnalytics | null>(null);
  const userListRef = useRef<User[]>([]);

  overviewRef.current = overview;
  userListRef.current = userList;

  const fetchVillageStats = useCallback(async (force = false) => {
    if (isFetchingStatsRef.current) {
      return;
    }
    if (!force && Date.now() - cachedStatsTime < 30000 && overviewRef.current) {
      return;
    }
    isFetchingStatsRef.current = true;
    try {
      const [overviewRes, byVillageRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getByVillage(),
      ]);

      if (overviewRes?.data) {
        overviewRef.current = overviewRes.data;
        setOverview(overviewRes.data);
        await setCache('villages_overview', overviewRes.data);
      }

      if (Array.isArray(byVillageRes?.data)) {
        const statsMap: Record<string, VillageAnalytics> = {};
        byVillageRes.data.forEach((row) => {
          if (row.village_id) statsMap[row.village_id] = row;
          if (row.village_name) {
            statsMap[row.village_name] = row;
            statsMap[row.village_name.toLowerCase().trim()] = row;
          }
        });
        setVillageStats(statsMap);
        await setCache('villages_breakdown', byVillageRes.data);
      }
    } catch (err) {
      console.warn('[VillagesPage] Lỗi tải số liệu thống kê thời gian thực, nạp từ Offline Cache:', err);
      try {
        const cachedOverview = await getCache<OverviewAnalytics>('villages_overview');
        const cachedBreakdown = await getCache<VillageAnalytics[]>('villages_breakdown');

        if (cachedOverview) {
          overviewRef.current = cachedOverview;
          setOverview(cachedOverview);
        }
        if (Array.isArray(cachedBreakdown)) {
          const statsMap: Record<string, VillageAnalytics> = {};
          cachedBreakdown.forEach((row) => {
            if (row.village_id) statsMap[row.village_id] = row;
            if (row.village_name) {
              statsMap[row.village_name] = row;
              statsMap[row.village_name.toLowerCase().trim()] = row;
            }
          });
          setVillageStats(statsMap);
        }
      } catch (cacheErr) {
        console.error('[VillagesPage] Lỗi đọc Offline Cache:', cacheErr);
      }
    } finally {
      cachedStatsTime = Date.now();
      isFetchingStatsRef.current = false;
    }
  }, []);

  const fetchUsers = useCallback(async (force = false) => {
    if (isFetchingUsersRef.current) {
      return;
    }
    if (!force && Date.now() - cachedUsersTime < 30000 && userListRef.current.length > 0) {
      return;
    }
    isFetchingUsersRef.current = true;
    try {
      const users = await authApi.getUsers();
      userListRef.current = users;
      setUserList(users);
    } catch (err) {
      console.warn('[VillagesPage] Lỗi tải danh sách cán bộ:', err);
    } finally {
      cachedUsersTime = Date.now();
      isFetchingUsersRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchVillageStats();
    fetchUsers();
  }, [fetchVillageStats, fetchUsers]);

  useEffect(() => {
    const handleReconnected = () => {
      fetchVillageStats(true);
      fetchUsers(true);
    };
    window.addEventListener('server:reconnected', handleReconnected);
    return () => window.removeEventListener('server:reconnected', handleReconnected);
  }, [fetchVillageStats, fetchUsers]);

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
      await fetchVillageStats(true);
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
      message: `Bạn có chắc muốn xóa "${name}" không?\nThao tác này chỉ thực hiện được khi không còn hộ nào thuộc thôn.`,
      type: 'danger',
      confirmText: 'Xóa Thôn',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          await villageApi.delete(id);
          await refreshVillages();
          await fetchVillageStats(true);
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
      cachedStatsTime = 0;
      await refreshVillages();
      await fetchVillageStats(true);
      setIsAdding(false);
      setNewName('');
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
      {/* Hero Banner Xanh Ngọc Đậm */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl border border-emerald-700/50 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/50 border border-emerald-500/30 text-xs font-bold text-emerald-200 uppercase tracking-wider">
            <span>UBND XÃ ĐĂK HÀ • Địa Bàn 7 Thôn & Làng Bản</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Tổng Quan Nông Nghiệp & Nông Thôn Mới Toàn Xã
          </h1>
          <p className="text-emerald-100/90 text-sm font-medium">
            Tổng số: {overview?.household_count ?? 0} hộ nông nghiệp • Cây trồng: {cryptoHelper.formatArea(overview?.crops?.total_crops_area ?? 0)} • Vật nuôi: {cryptoHelper.formatCount(overview?.livestock?.total_animals ?? 0, 'con')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleVillageClick('')}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-bold px-5 py-2.5 rounded-full shadow-md text-sm flex items-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95 group"
        >
          <span>Xem Thống Kê Toàn Xã</span>
          <ArrowRight className="w-4 h-4 text-emerald-900 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Card 1: Địa bàn quản lý */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/50">
            <MapPin className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              ĐỊA BÀN QUẢN LÝ
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {villages.length} Thôn
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate block mt-0.5">
              Toàn địa bàn Xã Đăk Hà
            </span>
          </div>
        </div>

        {/* Card 2: Hộ nông nghiệp */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-800/50">
            <Users className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              HỘ NÔNG NGHIỆP
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {overview?.household_count ?? 0} Hộ
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate block mt-0.5">
              Đã kê khai 18 chỉ số
            </span>
          </div>
        </div>

        {/* Card 3: Tổng diện tích cây trồng */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/50 dark:border-teal-800/50">
            <Trees className="w-6 h-6 text-teal-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              TỔNG DIỆN TÍCH CÂY TRỒNG
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {cryptoHelper.formatArea(overview?.crops?.total_crops_area ?? 0)}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate block mt-0.5">
              Cà phê, cao su, dược liệu...
            </span>
          </div>
        </div>

        {/* Card 4: Tổng đàn vật nuôi */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/50 dark:border-amber-800/50">
            <PawPrint className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              TỔNG ĐÀN VẬT NUÔI
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 truncate">
              {cryptoHelper.formatCount(overview?.livestock?.total_animals ?? 0, 'con')}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate block mt-0.5">
              Trâu, bò, heo, gia cầm...
            </span>
          </div>
        </div>
      </div>

      {/* Thanh Danh Sách Thôn */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
            <span>Danh Sách Thôn Xã Đăk Hà</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Bấm vào thẻ thôn để chuyển nhanh đến màn hình làm việc của thôn đó
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Tìm kiếm thôn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 px-2 py-1.5 bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mr-1 cursor-pointer"
                aria-label="Xóa tìm kiếm"
              >
                <X strokeWidth={1.5} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus strokeWidth={1.5} className="w-4 h-4" />
              <span>Thêm Thôn</span>
            </button>
          )}
        </div>
      </div>

      {/* Form thêm thôn mới nếu mở */}
      {isAdding && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thêm Thôn Mới Vào Xã Đăk Hà</h3>
            <button onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer" aria-label="Đóng form">
              <X strokeWidth={1.5} className="w-4 h-4" />
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">Tên Thôn *</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ví dụ: Thôn 8, Làng Mới..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              Lưu Thôn Mới
            </button>
          </div>
        </div>
      )}

      {/* Grid Danh Sách Thôn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVillages.map((village) => {
          const isEditing = editingId === village.id;
          const vStat = villageStats[village.id] || villageStats[village.name] || villageStats[village.name?.toLowerCase().trim()];
          const householdCount = vStat?.household_count ?? 0;
          const totalCropsArea = vStat?.crops?.total_crops_area ?? 0;
          const totalAnimals = vStat?.livestock?.total_animals ?? 0;

          const assignedOfficer =
            userList.find((u) => u.village_id === village.id && u.role === 'user') ||
            userList.find((u) => u.village_id === village.id);

          if (isEditing) {
            return (
              <div
                key={village.id}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Đổi tên thôn
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
                    <X strokeWidth={1.5} className="w-3.5 h-3.5" />
                    <span>Hủy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate(village.id)}
                    disabled={loading || !editName.trim()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check strokeWidth={1.5} className="w-3.5 h-3.5" />
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
                    <h4 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
                      {village.name}
                    </h4>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shrink-0">
                      <button
                        type="button"
                        title="Đổi tên thôn"
                        aria-label="Đổi tên thôn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(village.id);
                          setEditName(village.name);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit3 strokeWidth={1.5} className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Xóa thôn"
                        aria-label="Xóa thôn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(village.id, village.name);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 strokeWidth={1.5} className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Cán bộ phụ trách / Trưởng thôn */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="text-slate-400">•</span>
                  <span>Trưởng thôn:</span>
                  <span className={assignedOfficer ? "font-bold text-slate-700 dark:text-slate-200 truncate" : "italic text-slate-400"}>
                    {assignedOfficer?.full_name || assignedOfficer?.username || 'Chưa phân công'}
                  </span>
                </div>
              </div>

              {/* Thống kê nhanh trong thẻ */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                  <span>{householdCount} Hộ</span>
                </div>
                <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate">
                  {totalCropsArea > 0 ? `${cryptoHelper.formatArea(totalCropsArea)} cây` : `${totalAnimals} vật nuôi`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VillagesPage;
