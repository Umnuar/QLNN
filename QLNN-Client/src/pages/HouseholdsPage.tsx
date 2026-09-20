import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileSpreadsheet, Download, Users, WifiOff, Plus } from 'lucide-react';
import { HouseholdFlat } from '../types';
import { householdApi } from '../api/householdApi';
import * as XLSX from 'xlsx';
import { excelApi } from '../api/excelApi';
import { ImportPreviewModal } from '../components/excel/ImportPreviewModal';
import { ExportSettingsModal } from '../components/excel/ExportSettingsModal';
import { useApp } from '../AppContext';
import { getCache, setCache } from '../db/indexedDB';
import { useModal } from '../hooks/useModal';
import { HouseholdTable } from '../components/households/HouseholdTable';
import { HouseholdModal } from '../components/households/HouseholdModal';
import {
  HouseholdFilterBar,
  ScaleFilter,
  ProductionTypeFilter,
  SortOption,
} from '../components/households/HouseholdFilterBar';
import { useDebounce } from '../hooks/useDebounce';

const computeTotalCrops = (hh: HouseholdFlat): number => {
  return (
    (Number(hh.cafe_household) || 0) +
    (Number(hh.cafe_contracted) || 0) +
    (Number(hh.rubber_household) || 0) +
    (Number(hh.rubber_contracted) || 0) +
    (Number(hh.fruit_tree) || 0) +
    (Number(hh.macadamia) || 0) +
    (Number(hh.herb_dinh_lang) || 0) +
    (Number(hh.herb_gung) || 0) +
    (Number(hh.herb_nghe) || 0) +
    (Number(hh.herb_sa) || 0) +
    (Number(hh.wet_rice) || 0) +
    (Number(hh.other_annual_crops) || 0)
  );
};

const computeTotalLivestock = (hh: HouseholdFlat): number => {
  return (
    (Number(hh.buffalo) || 0) +
    (Number(hh.cow) || 0) +
    (Number(hh.pig) || 0) +
    (Number(hh.poultry) || 0)
  );
};

export const HouseholdsPage: React.FC = () => {
  const {
    user,
    selectedVillageId,
    selectedVillageName,
    isOnline,
    isBackendHealthy,
  } = useApp();
  const isDisconnected = !isOnline || !isBackendHealthy;
  const { showModal } = useModal();

  const [households, setHouseholds] = useState<HouseholdFlat[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [scaleFilter, setScaleFilter] = useState<ScaleFilter>('all');
  const [typeFilter, setTypeFilter] = useState<ProductionTypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isAllExpanded, setIsAllExpanded] = useState(false);

  const handleToggleExpandAll = () => {
    setIsAllExpanded((prev) => !prev);
  };

  const handleResetFilters = () => {
    setSearch('');
    setScaleFilter('all');
    setTypeFilter('all');
    setSortBy('default');
  };

  const [undoAction, setUndoAction] = useState<{ ids: string[] } | null>(null);

  useEffect(() => {
    if (undoAction) {
      const timer = setTimeout(() => {
        setUndoAction(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [undoAction]);

  // Excel logic
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<any[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleFileParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      showModal({ title: 'Lỗi', message: 'Chỉ chấp nhận file .xls hoặc .xlsx', type: 'danger' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json<any[][]>(ws, { header: 1 });
        const parsedRows = rawData.slice(9).filter(row => row[1] && typeof row[1] === 'string' && (row[1] as string).trim() !== '');
        
        setImportData(parsedRows);
        setImportFile(file);
        setIsImportModalOpen(true);
      } catch (err) {
        showModal({ title: 'Lỗi', message: 'Không thể đọc file.', type: 'danger' });
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportConfirm = async (file: File) => {
    setImporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const res = await excelApi.importExcel(file, targetVillage);
      showModal({
        title: 'Thành công',
        message: `Đã xử lý ${res.totalRowsParsed} hộ:\n• Thêm: ${res.createdCount}\n• Cập nhật: ${res.updatedCount}`,
        type: 'info',
        onConfirm: () => {
          setIsImportModalOpen(false);
          setImportFile(null);
          setImportData([]);
          fetchHouseholds();
        }
      });
    } catch (err: any) {
      showModal({ title: 'Lỗi', message: err.response?.data?.error || 'Lỗi nhập dữ liệu', type: 'danger' });
    } finally {
      setImporting(false);
    }
  };

  const handleExportConfirm = async (exportScope: 'all' | 'selected') => {
    setExporting(true);
    try {
      const targetVillage = user?.role === 'admin' ? selectedVillageId : undefined;
      const selectedIds = exportScope === 'selected' ? selectedHouseholdIds : undefined;
      const blob = await excelApi.exportExcel(targetVillage, selectedIds);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Thong_ke_nong_nghiep_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setIsExportModalOpen(false);
    } catch (err) {
      showModal({ title: 'Lỗi', message: 'Lỗi xuất dữ liệu', type: 'danger' });
    } finally {
      setExporting(false);
    }
  };

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState<HouseholdFlat | null>(null);
  
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

  const [selectedHouseholdIds, setSelectedHouseholdIds] = useState<string[]>([]);

  const filteredAndSortedHouseholds = useMemo(() => {
    const filtered = households.filter((hh) => {
      // 1. Lọc theo Quy mô (Scale Filter)
      if (scaleFilter !== 'all') {
        const totalCrops = computeTotalCrops(hh);
        const totalLivestock = computeTotalLivestock(hh);
        const isLarge = totalCrops >= 2.0 || totalLivestock >= 15;
        const isMedium = !isLarge && (totalCrops >= 0.5 || totalLivestock >= 5);

        if (scaleFilter === 'large' && !isLarge) return false;
        if (scaleFilter === 'medium' && !isMedium) return false;
        if (scaleFilter === 'small' && (isLarge || isMedium)) return false;
      }

      // 2. Lọc theo Loại hình đặc thù (Production Type Filter)
      if (typeFilter !== 'all') {
        if (typeFilter === 'contracted') {
          const hasContracted =
            (Number(hh.cafe_contracted) || 0) > 0 ||
            (Number(hh.rubber_contracted) || 0) > 0;
          if (!hasContracted) return false;
        } else if (typeFilter === 'herbs') {
          const hasHerbs =
            (Number(hh.herb_dinh_lang) || 0) > 0 ||
            (Number(hh.herb_gung) || 0) > 0 ||
            (Number(hh.herb_nghe) || 0) > 0 ||
            (Number(hh.herb_sa) || 0) > 0;
          if (!hasHerbs) return false;
        } else if (typeFilter === 'livestock') {
          const hasLivestock =
            (Number(hh.buffalo) || 0) > 0 ||
            (Number(hh.cow) || 0) > 0 ||
            (Number(hh.pig) || 0) > 0 ||
            (Number(hh.poultry) || 0) > 0;
          if (!hasLivestock) return false;
        } else if (typeFilter === 'aquaculture') {
          const hasAquaculture =
            (Number(hh.fish_pond) || 0) > 0 ||
            (Number(hh.fish_cage) || 0) > 0;
          if (!hasAquaculture) return false;
        }
      }

      return true;
    });

    // 3. Sắp xếp (Sort By)
    if (sortBy === 'default') {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === 'crops_desc') {
        return computeTotalCrops(b) - computeTotalCrops(a);
      }
      if (sortBy === 'livestock_desc') {
        return computeTotalLivestock(b) - computeTotalLivestock(a);
      }
      if (sortBy === 'name_asc') {
        return (a.full_name || '').localeCompare(b.full_name || '', 'vi');
      }
      if (sortBy === 'name_desc') {
        return (b.full_name || '').localeCompare(a.full_name || '', 'vi');
      }
      return 0;
    });
  }, [households, scaleFilter, typeFilter, sortBy]);

  const onToggleSelect = (id: string) => {
    setSelectedHouseholdIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const onToggleSelectAll = () => {
    if (filteredAndSortedHouseholds.length > 0 && selectedHouseholdIds.length === filteredAndSortedHouseholds.length) {
      setSelectedHouseholdIds([]);
    } else {
      setSelectedHouseholdIds(filteredAndSortedHouseholds.map(hh => hh.id as string));
    }
  };


  const fetchHouseholds = useCallback(async () => {
    setLoading(true);
    const targetVillage = user?.role === 'admin' ? (selectedVillageId || undefined) : undefined;
    const cacheKey = `households_${targetVillage || 'all'}_${page}_${limit}_${debouncedSearch.trim()}`;
    try {
      const res = await householdApi.getPage({
        villageId: targetVillage,
        search: debouncedSearch.trim() || undefined,
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
  }, [selectedVillageId, debouncedSearch, page, limit, user?.role]);

  useEffect(() => {
    fetchHouseholds();
  }, [fetchHouseholds]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedVillageId]);

  useEffect(() => {
    setSelectedHouseholdIds([]);
  }, [page, limit, debouncedSearch, selectedVillageId, scaleFilter, typeFilter, sortBy]);

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
      title: 'Chuyển vào Thùng Rác',
      message: `Bạn có chắc chắn muốn xóa hộ "${hh.full_name}" thuộc ${hh.village_name || 'thôn'} không?\nHộ sẽ được chuyển vào Thùng rác và có thể khôi phục lại bất kỳ lúc nào.`,
      type: 'danger',
      confirmText: 'Xác Nhận Xóa',
      cancelText: 'Hủy Bỏ',
      onConfirm: async () => {
        try {
          if (hh.id) {
            await householdApi.delete(hh.id);
            setUndoAction({ ids: [hh.id] });
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

  const handleBatchDelete = () => {
    if (selectedHouseholdIds.length === 0) return;
    showModal({
      title: 'Chuyển vào Thùng Rác hàng loạt',
      message: `Bạn có chắc chắn muốn xóa ${selectedHouseholdIds.length} hộ đã chọn?\nCác hộ sẽ được chuyển vào Thùng rác và có thể khôi phục lại.`,
      type: 'danger',
      confirmText: 'Xác Nhận Xóa',
      cancelText: 'Hủy',
      onConfirm: async () => {
        try {
          const deletedIds = [...selectedHouseholdIds];
          await householdApi.bulkDelete(selectedHouseholdIds);
          setSelectedHouseholdIds([]);
          setUndoAction({ ids: deletedIds });
          fetchHouseholds();
        } catch (err) {
          showModal({ title: 'Lỗi', message: 'Không thể xóa hàng loạt.', type: 'danger' });
        }
      },
    });
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
                {isUsingCachedData && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 font-medium">
                    <WifiOff className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Ngoại tuyến</span>
                  </span>
                )}
                <span>Danh Sách Hộ Nông Nghiệp</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                  {total} hộ
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span>Phạm vi:</span>
                <strong className="text-slate-700 dark:text-slate-200">{selectedVillageName || 'Toàn xã Đăk Hà'}</strong>
                <span>• Quản lý 18 chỉ số kê khai</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <input type="file" ref={fileInputRef} hidden accept=".xls,.xlsx" onChange={handleFileParse} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisconnected}
            className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            <span>Nhập Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            disabled={exporting}
            className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all disabled:opacity-50 active:scale-[0.99] cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />
            <span>{exporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>

          <button
            type="button"
            onClick={handleAdd}
            disabled={isDisconnected}
            className="h-10 flex items-center gap-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            <span>Thêm Hộ Dân</span>
          </button>
        </div>
      </div>

      <HouseholdFilterBar
        search={search}
        setSearch={setSearch}
        loading={loading}
        onRefresh={fetchHouseholds}
        scaleFilter={scaleFilter}
        setScaleFilter={setScaleFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={handleToggleExpandAll}
        onResetFilters={handleResetFilters}
        selectedCount={selectedHouseholdIds.length}
        onDeselectAll={() => setSelectedHouseholdIds([])}
        onExportSelected={() => handleExportConfirm('selected')}
        onDeleteSelected={handleBatchDelete}
      />

      {/* Main Table */}
      <HouseholdTable
        selectedIds={selectedHouseholdIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        households={filteredAndSortedHouseholds}
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
        isAllExpanded={isAllExpanded}
        onToggleExpandAll={handleToggleExpandAll}
      />

      {/* Modal Thêm / Sửa */}
      <HouseholdModal
        isOpen={modalOpen}
        household={editingHousehold}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchHouseholds}
      />

      <ImportPreviewModal
        isOpen={isImportModalOpen}
        onClose={() => { setIsImportModalOpen(false); setImportFile(null); setImportData([]); }}
        file={importFile}
        parsedData={importData}
        onConfirm={handleImportConfirm}
        importing={importing}
        onChangeFile={() => fileInputRef.current?.click()}
      />
      
      <ExportSettingsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportConfirm}
        selectedCount={selectedHouseholdIds.length}
        exporting={exporting}
        isAdmin={user?.role === 'admin'}
      />

      {undoAction && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">Đã xóa {undoAction.ids.length} hộ nông nghiệp.</span>
          <button
            onClick={async () => {
              try {
                await householdApi.restore(undoAction.ids);
                setUndoAction(null);
                fetchHouseholds();
              } catch (e) {
                showModal({ title: 'Lỗi', message: 'Lỗi hoàn tác dữ liệu', type: 'danger' });
              }
            }}
            className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors uppercase text-xs tracking-wider"
          >
            Hoàn tác
          </button>
        </div>
      )}
    </div>
  );
};
