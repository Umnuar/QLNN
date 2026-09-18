import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, 
  Clock, 
  User as UserIcon, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  RefreshCw, 
  Search, 
  MapPin,
  AlertCircle,
  Layers,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { auditApi, AuditLog } from '../../api/auditApi';
import { useApp } from '../../AppContext';
import { CustomSelect } from '../common/CustomSelect';

export interface AuditLogViewProps {
  villageId?: string;
  householdId?: string;
  showFilters?: boolean;
  className?: string;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  villageId: initialVillageId,
  householdId,
  showFilters = true,
  className = '',
}) => {
  const { villages, user } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedVillage, setSelectedVillage] = useState<string>(initialVillageId || '');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const limit = 30;

  const fetchLogs = useCallback(async (currentOffset: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const targetVillage = selectedVillage && selectedVillage !== 'ALL' ? selectedVillage : undefined;
      const res = await auditApi.getLogs(targetVillage, limit, currentOffset);
      
      if (res && Array.isArray(res.data)) {
        if (append) {
          setLogs(prev => [...prev, ...res.data]);
        } else {
          setLogs(res.data);
        }
        setTotal(res.pagination?.total ?? res.data.length);
      } else {
        if (!append) setLogs([]);
        setTotal(0);
      }
    } catch (err: any) {
      console.error('Failed to load audit logs', err);
      setError(err.response?.data?.error || err.message || 'Không thể tải dữ liệu nhật ký');
      if (!append) setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [selectedVillage]);

  // Refetch when village filter changes
  useEffect(() => {
    setOffset(0);
    fetchLogs(0, false);
  }, [fetchLogs]);

  const handleLoadMore = () => {
    const nextOffset = offset + limit;
    setOffset(nextOffset);
    fetchLogs(nextOffset, true);
  };

  const handleRefresh = () => {
    setOffset(0);
    fetchLogs(0, false);
  };

  const renderActionIcon = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'UPDATE':
        return <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'DELETE':
        return <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'HARD_DELETE':
        return <Trash2 className="w-4 h-4 text-red-700 dark:text-red-500" />;
      case 'RESTORE':
        return <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'IMPORT':
        return <FileSpreadsheet className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
            THÊM MỚI
          </span>
        );
      case 'UPDATE':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
            CHỈNH SỬA
          </span>
        );
      case 'DELETE':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
            XÓA BỎ
          </span>
        );
      case 'HARD_DELETE':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60">
            XÓA VĨNH VIỄN
          </span>
        );
      case 'RESTORE':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60">
            KHÔI PHỤC
          </span>
        );
      case 'IMPORT':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
            NHẬP EXCEL
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {action}
          </span>
        );
    }
  };

  const renderDetails = (log: AuditLog) => {
    if (!log.details) {
      return <span className="text-slate-400 dark:text-slate-500 italic text-xs">Không có chi tiết</span>;
    }

    const action = log.action?.toUpperCase();

    if (action === 'RESTORE' || action === 'HARD_DELETE') {
      return (
        <div className="text-xs mt-2 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-slate-700 dark:text-slate-300 mb-1">
            <strong className="text-slate-900 dark:text-white font-bold">{log.details.message || 'Không rõ nội dung'}</strong>
          </p>
          {log.details.names && Array.isArray(log.details.names) && (
            <p className="text-slate-600 dark:text-slate-400">
              Hộ dân: {log.details.names.join(', ')}
            </p>
          )}
        </div>
      );
    }

    if (action === 'IMPORT') {
      return (
        <div className="text-xs space-y-1 mt-2 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-slate-700 dark:text-slate-300">
            File Excel tải lên: Thêm mới{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{log.details.inserted || 0}</strong> hộ, 
            Cập nhật <strong className="text-amber-600 dark:text-amber-400 font-bold">{log.details.updated || 0}</strong> hộ.
          </p>
        </div>
      );
    }

    if (action === 'CREATE' || action === 'DELETE') {
      return (
        <div className="text-xs mt-2 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <p className="text-slate-700 dark:text-slate-300">
            Hộ nông nghiệp: <strong className="text-slate-900 dark:text-white font-bold">{log.details.name || log.details.full_name || 'Không rõ'}</strong>
          </p>
        </div>
      );
    }

    if (action === 'UPDATE') {
      const keys = Object.keys(log.details);
      if (keys.length === 0) return null;
      return (
        <div className="text-xs space-y-1.5 mt-2 p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/80">
          {keys.map((key) => {
            const val = log.details[key];
            if (val && typeof val === 'object' && ('old' in val || 'new' in val)) {
              return (
                <div key={key} className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">{key}:</span>
                  <span className="line-through text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                    {String(val.old ?? 'Trống')}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 inline shrink-0" strokeWidth={1.5} />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                    {String(val.new ?? 'Trống')}
                  </span>
                </div>
              );
            }
            return (
              <div key={key} className="text-[11px] text-slate-600 dark:text-slate-400">
                <span className="font-semibold">{key}:</span> {JSON.stringify(val)}
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <pre className="text-[10px] mt-2 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto text-slate-600 dark:text-slate-400 font-mono">
        {JSON.stringify(log.details, null, 2)}
      </pre>
    );
  };

  // Client-side filtering by householdId, action, and search term
  const filteredLogs = logs.filter((log) => {
    if (householdId) {
      const matchEntity = log.entity_id === householdId;
      const matchDetails = log.details?.id === householdId || log.details?.household_id === householdId;
      if (!matchEntity && !matchDetails) return false;
    }
    if (selectedAction !== 'ALL' && log.action?.toUpperCase() !== selectedAction) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const usernameMatch = log.username?.toLowerCase().includes(term);
      const detailsMatch = JSON.stringify(log.details || {}).toLowerCase().includes(term);
      return usernameMatch || detailsMatch;
    }
    return true;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters Toolbar */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Nhật Ký Thay Đổi & Hoạt Động</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {total > 0 ? `Hiển thị ${filteredLogs.length} / ${total} sự kiện được ghi nhận` : 'Theo dõi biến động số liệu hệ thống'}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Tải lại nhật ký"
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Filter by Village */}
            {user?.role === 'admin' && !initialVillageId && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Đơn vị thôn
                </label>
                <CustomSelect
                  value={selectedVillage}
                  onChange={(val) => setSelectedVillage(String(val))}
                  size="sm"
                  placeholder="-- Toàn xã --"
                  options={[
                    { value: '', label: '-- Toàn xã --' },
                    ...villages.map((v) => ({ value: v.id, label: v.name }))
                  ]}
                />
              </div>
            )}

            {/* Filter by Action */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Loại thao tác
              </label>
              <CustomSelect
                value={selectedAction}
                onChange={(val) => setSelectedAction(String(val))}
                size="sm"
                options={[
                  { value: 'ALL', label: 'Tất cả thao tác' },
                  { value: 'CREATE', label: 'Thêm mới (CREATE)' },
                  { value: 'UPDATE', label: 'Chỉnh sửa (UPDATE)' },
                  { value: 'DELETE', label: 'Xóa bỏ (DELETE)' },
                  { value: 'RESTORE', label: 'Khôi phục (RESTORE)' },
                  { value: 'HARD_DELETE', label: 'Xóa vĩnh viễn (HARD_DELETE)' },
                  { value: 'IMPORT', label: 'Nhập Excel (IMPORT)' },
                ]}
              />
            </div>

            {/* Search Input */}
            <div className={user?.role === 'admin' && !initialVillageId ? '' : 'sm:col-span-2'}>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Tìm kiếm nội dung
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo cán bộ, tên hộ, chỉ số..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl flex items-center gap-3 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => fetchLogs(0, false)}
            className="font-bold underline hover:no-underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Timeline Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {filteredLogs.length === 0 && !loading ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Không có bản ghi nhật ký phù hợp</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Chưa có dữ liệu nhật ký nào hoặc không tìm thấy kết quả phù hợp với bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent ml-2">
            {filteredLogs.map((log) => {
              const villageName = villages.find((v) => v.id === log.village_id)?.name;
              return (
                <div
                  key={log.id}
                  className="relative flex items-start gap-5 group"
                >
                  {/* Icon Marker */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 shadow-xs z-10 shrink-0">
                    {renderActionIcon(log.action)}
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 w-full p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 shadow-xs transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {villageName && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {villageName}
                          </span>
                        )}
                        {getActionBadge(log.action)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{log.username || 'Hệ thống'}</span>
                    </div>

                    {renderDetails(log)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {logs.length < total && (
          <div className="mt-8 flex justify-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tải thêm sự kiện</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
