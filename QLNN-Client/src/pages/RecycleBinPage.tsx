import React, { useState, useEffect } from 'react';
import { householdApi } from '../api/householdApi';
import { HouseholdFlat } from '../types';
import { useApp } from '../AppContext';
import { HouseholdTable } from '../components/households/HouseholdTable';
import { RefreshCw, Trash2, RotateCcw } from 'lucide-react';

export const RecycleBinPage: React.FC = () => {
  const { user } = useApp();
  const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  const fetchDeleted = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res = await householdApi.getDeleted({ page, limit });
      setHouseholds(res.data);
      setPagination(res.pagination);
    } catch (error) {
      console.error('Failed to fetch deleted households', error);
      alert('Lỗi tải danh sách đã xóa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (ids: string[]) => {
    try {
      await householdApi.restore(ids);
      setSelectedIds([]);
      fetchDeleted();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi khôi phục');
    }
  };

  const handleHardDelete = async (ids: string[]) => {
    if (!window.confirm('Cảnh báo: Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể khôi phục! Bạn có chắc chắn?')) return;
    try {
      await householdApi.hardDelete(ids);
      setSelectedIds([]);
      fetchDeleted();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi xóa vĩnh viễn');
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === households.length && households.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(households.map(h => h.id!));
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Trash2 className="w-7 h-7 text-rose-500" />
            Thùng Rác
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Danh sách các hộ nông nghiệp đã bị xóa
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDeleted()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => handleRestore(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Khôi phục ({selectedIds.length})
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={() => handleHardDelete(selectedIds)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa vĩnh viễn ({selectedIds.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <HouseholdTable
        readOnly={true}
        households={households}
        loading={loading}
        total={pagination.total}
        page={pagination.page}
        limit={pagination.limit}
        totalPages={pagination.totalPages}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onPageChange={(page) => fetchDeleted(page)}
        onLimitChange={(limit) => fetchDeleted(1, limit)}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};
export default RecycleBinPage;
