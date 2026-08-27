import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Download, Users } from 'lucide-react';
import { HouseholdFlat } from '../types';
import { householdApi } from '../api/householdApi';
import { excelApi } from '../api/excelApi';
import { useApp } from '../AppContext';
import { getCache, setCache } from '../db/indexedDB';
import { useModal } from '../hooks/useModal';
import { HouseholdTable } from '../components/households/HouseholdTable';
import { HouseholdModal } from '../components/households/HouseholdModal';
import { HouseholdFilterBar } from '../components/households/HouseholdFilterBar';


export const HouseholdsPage: React.FC = () => {
  const { user, selectedVillageId, selectedVillageName, setActiveTab, isOnline, isBackendHealthy } = useApp();
  const isDisconnected = !isOnline || !isBackendHealthy;
  const { showModal } = useModal();

  const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<HouseholdFlat | null>(null);
  
  const [exporting, setExporting] = useState(false);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

    const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
    const cacheKey = `households_${targetVillage}_${page}_${limit}_${search.trim()}`;
    try {
      const res = await householdApi.getPage({
        villageId: targetVillage,
        search: search.trim() || undefined,
        page,
        limit,
      });
      setHouseholds(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
      setIsUsingCachedData(false);
      await setCache(cacheKey, res);
    } catch (err: any) {
      if (err.message === 'Network Error' || (err.response && err.response.status >= 500)) {
         const cached = await getCache<any>(cacheKey);
         if (cached) {
           setHouseholds(cached.data);
           setTotal(cached.pagination.total);
           setTotalPages(cached.pagination.totalPages);
           setIsUsingCachedData(true);
         }
      }
      console.error('Fetch households error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedVillageId, search, page, limit, user?.role]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  // Lắng nghe sự kiện kết nối lại máy chủ để tự động đồng bộ lại danh sách
  useEffect(() => {
    const handleReconnected = () => {
      fetchHouseholds();
    };
    window.addEventListener('server:reconnected', handleReconnected);
    return () => window.removeEventListener('server:reconnected', handleReconnected);
  }, [fetchHouseholds]);

  const handleAdd = () => {
    setEditingHousehold(null);
    setModalOpen(true);
  };

  const handleEdit = (hh: HouseholdFlat) => {
    setEditingHousehold(hh);
    setModalOpen(true);
  };

  const handleDelete = (hh: HouseholdFlat) => {
    showModal({
      title: 'Xóa Hộ Nông Nghiệp',
      message: `Bạn có chắc chắn muốn xóa dữ liệu của hộ "${hh.full_name}" thuộc ${hh.village_name || 'thôn'} không?\nHành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: 'Xác Nhận Xóa',
      cancelText: 'Hủy Bỏ',
      onConfirm: async () => {
        try {
          if (hh.id) {
            await householdApi.delete(hh.id);
            fetchHouseholds();
          }
        } catch (err) {
          console.error('Delete error:', err);
          showModal({
            title: 'Lỗi',
            message: 'Không thể xóa hộ dân. Vui lòng thử lại sau.',
            type: 'danger',
          });
        }
      },
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const blob = await excelApi.exportExcel(targetVillage);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Thong_ke_nong_nghiep_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      showModal({
        title: 'Lỗi Xuất File',
        message: err.response?.data?.error || 'Không thể xuất file Excel.',
        type: 'danger',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-150">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  {isUsingCachedData && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200">⚡ Ngoại tuyến</span>}
                <span>Danh Sách Hộ Nông Nghiệp</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                  {total} hộ
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Phạm vi: <strong className="text-slate-700 dark:text-slate-200">{selectedVillageName || 'Toàn xã'}</strong> • Quản lý 18 chỉ số kê khai
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin Village Selector */}
          

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            disabled={isDisconnected}
            className={`h-10 flex items-center gap-1.5 px-4 border rounded-2xl text-xs font-bold transition-all active:scale-[0.99] shadow-xs ${isDisconnected ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800 cursor-pointer"}`}
          >
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Nhập Excel</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isDisconnected}
            className={`h-10 flex items-center gap-1.5 px-5 text-white rounded-2xl text-xs font-bold shadow-xs transition-all ${isDisconnected ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] cursor-pointer"}`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hộ Dân</span>
          </button>
        </div>
      </div>

      <HouseholdFilterBar
        search={search}
        setSearch={setSearch}
        loading={loading}
        onRefresh={fetchHouseholds}
      />

      {/* Main Table */}
      <HouseholdTable
        households={households}
        loading={loading}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal Thêm / Sửa */}
      <HouseholdModal
        isOpen={modalOpen}
        household={editingHousehold}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchHouseholds}
      />

      {/* Modal Import Excel */}
      
    </div>
  );
};
