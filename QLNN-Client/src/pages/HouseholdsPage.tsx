import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Upload, Download, RefreshCw, Users, X } from 'lucide-react';
import { HouseholdFlat } from '../types';
import { householdApi } from '../api/householdApi';
import { excelApi } from '../api/excelApi';
import { useApp } from '../AppContext';
import { useModal } from '../hooks/useModal';
import { useDebounce } from '../hooks/useDebounce';
import { HouseholdTable } from '../components/households/HouseholdTable';
import { HouseholdModal } from '../components/households/HouseholdModal';
import { ExcelImportModal } from '../components/excel/ExcelImportModal';

export const HouseholdsPage: React.FC = () => {
  const { user, selectedVillageId, setSelectedVillageId, villages, selectedVillageName } = useApp();
  const { showModal } = useModal();

  const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const debouncedSearch = useDebounce(search, 300);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [editingHousehold, setEditingHousehold] = useState<HouseholdFlat | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await householdApi.getPage({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        villageId: user?.role === 'admin' ? selectedVillageId || undefined : undefined,
      });
      setHouseholds(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Fetch households error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedVillageId, user?.role]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  // Lắng nghe sự kiện kết nối lại để refetch tự động
  useEffect(() => {
    const handleReconnected = () => {
      fetchHouseholds();
    };
    window.addEventListener('server:reconnected', handleReconnected);
    return () => window.removeEventListener('server:reconnected', handleReconnected);
  }, [fetchHouseholds]);

  // Reset về page 1 khi đổi search hoặc đổi thôn
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedVillageId]);

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
      title: 'Xác Nhận Xóa Hộ Nông Nghiệp',
      message: `Bạn có chắc chắn muốn xóa hộ "${hh.full_name}" khỏi danh sách? Toàn bộ số liệu cây trồng, vật nuôi của hộ này sẽ bị xóa khỏi cơ sở dữ liệu.`,
      type: 'danger',
      confirmText: 'Xóa Hộ Này',
      cancelText: 'Hủy bỏ',
      onConfirm: async () => {
        if (!hh.id) return;
        try {
          await householdApi.delete(hh.id);
          fetchHouseholds();
        } catch (err: any) {
          console.error('Delete household error:', err);
          showModal({
            title: 'Lỗi Xóa Hộ',
            message: err.response?.data?.error || 'Không thể xóa hộ dân. Vui lòng thử lại sau.',
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
      a.download = `Thong_ke_nong_nghiep_Dak_Ha_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Export error:', err);
      showModal({
        title: 'Lỗi Xuất File Excel',
        message: err.response?.data?.error || 'Không thể xuất file Excel. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Danh Sách Hộ Nông Nghiệp
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                  {total} hộ
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Phạm vi: <strong className="text-slate-700 dark:text-slate-200">{selectedVillageName || 'Toàn xã Đăk Hà'}</strong> • Quản lý 18 chỉ số kê khai
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin Village Selector */}
          {user?.role === 'admin' && (
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="">-- Toàn bộ các thôn --</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-98 cursor-pointer border border-transparent dark:border-slate-700"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 rounded-2xl text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-xs"
          >
            <Upload className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Nhập Excel (Smart)</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hộ Dân</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên chủ hộ (gõ có dấu hoặc không dấu)..."
            className="w-full pl-10 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchHouseholds()}
            title="Làm mới danh sách"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

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
        onClose={() => setModalOpen(false)}
        household={editingHousehold}
        onSuccess={() => {
          fetchHouseholds();
        }}
      />

      {/* Modal Nhập Excel (Preview & Smart Upsert) */}
      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          fetchHouseholds();
        }}
      />
    </div>
  );
};
