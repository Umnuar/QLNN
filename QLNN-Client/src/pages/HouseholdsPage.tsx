import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Upload, Download, RefreshCw, Users } from 'lucide-react';
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
  const { user, selectedVillageId, setSelectedVillageId, villages } = useApp();
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
      message: `Bạn có chắc chắn muốn xóa hộ "${hh.full_name}" khỏi danh sách? Toàn bộ số liệu cây trồng, vật nuôi của hộ này sẽ bị chuyển vào thùng rác.`,
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
      a.download = `Thong_ke_nong_nghiep_${new Date().toISOString().slice(0, 10)}.xlsx`;
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
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            Danh Sách Hộ Nông Nghiệp
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý diện tích cây trồng (ha), đàn vật nuôi (con) và nuôi trồng thủy sản xã Đăk Hà
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Admin Village Selector */}
          {user?.role === 'admin' && (
            <select
              value={selectedVillageId}
              onChange={(e) => setSelectedVillageId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>

          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Nhập Excel</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Hộ Dân</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo họ tên chủ hộ (gõ có dấu hoặc không dấu)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <button
          type="button"
          onClick={() => fetchHouseholds()}
          title="Tải lại danh sách"
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
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
