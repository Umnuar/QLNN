import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Clock,
  User as UserIcon,
  FileSpreadsheet,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  MapPin,
  AlertCircle,
  RotateCcw,
  Filter,
  ArrowDownCircle,
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

function formatVal(val: any): string {
  if (val === null || val === undefined || val === '') return 'Trống';
  if (typeof val === 'boolean') return val ? 'Có' : 'Không';
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.join(', ');
    return JSON.stringify(val);
  }
  return String(val);
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  villageId: initialVillageId,
  householdId,
  showFilters = true,
  className = '',
}) => {
  const { villages, user, selectedVillageId, setSelectedVillageId } = useApp();
  const isAdmin = user?.role === 'admin';

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [villageFilter, setVillageFilter] = useState<string>(initialVillageId || selectedVillageId || '');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const limit = 30;

  // Đồng bộ bộ lọc Thôn khi chọn trên header/sidebar
  useEffect(() => {
    if (selectedVillageId !== undefined) {
      setVillageFilter(selectedVillageId);
    }
  }, [selectedVillageId]);

  const fetchLogs = useCallback(async (currentOffset: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const targetVillage = villageFilter && villageFilter !== 'ALL' && villageFilter !== '' ? villageFilter : undefined;
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
  }, [villageFilter]);

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

  const getActionConfig = (action: string) => {
    const act = action?.toUpperCase();
    switch (act) {
      case 'CREATE':
        return {
          label: 'Thêm Mới',
          colorBadge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dotBg: 'bg-emerald-500 ring-emerald-100 dark:ring-emerald-950',
          icon: Plus,
        };
      case 'UPDATE':
        return {
          label: 'Cập Nhật',
          colorBadge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dotBg: 'bg-blue-500 ring-blue-100 dark:ring-blue-950',
          icon: RefreshCw,
        };
      case 'DELETE':
      case 'HARD_DELETE':
        return {
          label: act === 'HARD_DELETE' ? 'Xóa Vĩnh Viễn' : 'Xóa Dữ Liệu',
          colorBadge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dotBg: 'bg-rose-500 ring-rose-100 dark:ring-rose-950',
          icon: Trash2,
        };
      case 'RESTORE':
        return {
          label: 'Khôi Phục',
          colorBadge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dotBg: 'bg-purple-500 ring-purple-100 dark:ring-purple-950',
          icon: RotateCcw,
        };
      case 'IMPORT':
        return {
          label: 'Nhập Excel',
          colorBadge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dotBg: 'bg-amber-500 ring-amber-100 dark:ring-amber-950',
          icon: FileSpreadsheet,
        };
      default:
        return {
          label: action,
          colorBadge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dotBg: 'bg-slate-500 ring-slate-100 dark:ring-slate-900',
          icon: History,
        };
    }
  };

  const renderFriendlyDiff = (log: AuditLog) => {
    if (!log.details) {
      return <span className="text-slate-400 dark:text-slate-500 italic text-xs">Không có chi tiết</span>;
    }

    const action = log.action?.toUpperCase();

    if (action === 'CREATE') {
      const name = log.details.name || log.details.full_name || 'Hộ nông nghiệp mới';
      return (
        <div className="mt-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
          <div>
            Khởi tạo hộ nông nghiệp: <strong className="text-slate-900 dark:text-white font-bold">{name}</strong>
          </div>
          {log.details.village_name && (
            <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
              Thôn: <strong>{log.details.village_name}</strong>
            </div>
          )}
        </div>
      );
    }

    if (action === 'DELETE' || action === 'HARD_DELETE') {
      return (
        <div className="mt-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-800 dark:text-rose-200 space-y-1">
          <div className="font-bold">
            {action === 'HARD_DELETE' ? 'Đã xóa vĩnh viễn khỏi hệ thống:' : 'Đã chuyển vào Thùng rác:'}
          </div>
          {log.details.message && <p>{log.details.message}</p>}
          {log.details.names && Array.isArray(log.details.names) && (
            <p>Danh sách hộ: <strong>{log.details.names.join(', ')}</strong></p>
          )}
          {log.details.name && (
            <p>Hộ nông nghiệp: <strong>{log.details.name}</strong></p>
          )}
          {log.details.reason && (
            <div className="text-[11px] text-rose-600 dark:text-rose-400 italic">
              Lý do: {log.details.reason}
            </div>
          )}
        </div>
      );
    }

    if (action === 'RESTORE') {
      return (
        <div className="mt-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-800 dark:text-purple-200 space-y-1">
          {log.details.message ? (
            <strong className="text-slate-900 dark:text-white font-bold">{log.details.message}</strong>
          ) : (
            <span>
              Khôi phục hộ: <strong>{log.details.name || log.entity_id}</strong>
            </span>
          )}
          {log.details.names && Array.isArray(log.details.names) && (
            <p className="text-purple-700 dark:text-purple-300">
              Các hộ: {log.details.names.join(', ')}
            </p>
          )}
        </div>
      );
    }

    if (action === 'IMPORT') {
      return (
        <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1 text-slate-800 dark:text-slate-200">
          <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Tệp Excel: {log.details.file_name || 'NongNghiep.xlsx'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            <div>Thêm mới: <strong className="text-slate-900 dark:text-white">{log.details.inserted ?? log.details.createdCount ?? 0}</strong> hộ</div>
            <div>Cập nhật: <strong className="text-slate-900 dark:text-white">{log.details.updated ?? log.details.updatedCount ?? 0}</strong> hộ</div>
          </div>
        </div>
      );
    }

    if (action === 'UPDATE') {
      const keys = Object.keys(log.details);
      if (keys.length === 0) {
        return <div className="text-xs text-slate-500 italic">Dữ liệu đã được đồng bộ lại.</div>;
      }

      const changes: { label: string; oldVal: any; newVal: any }[] = [];
      keys.forEach(k => {
        const val = log.details[k];
        if (val && typeof val === 'object' && ('old' in val || 'new' in val)) {
          changes.push({ label: k, oldVal: val.old, newVal: val.new });
        }
      });

      if (changes.length > 0) {
        return (
          <div className="space-y-1.5 mt-2">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thay đổi thông tin:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {changes.map(c => (
                <div
                  key={c.label}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs flex flex-col justify-between"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-300">{c.label}:</span>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="line-through text-rose-500/90 dark:text-rose-400 font-medium">
                      {formatVal(c.oldVal)}
                    </span>
                    <span className="text-slate-400 font-bold font-mono">→</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400">
                      {formatVal(c.newVal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <pre className="text-[10px] mt-2 p-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-x-auto text-slate-600 dark:text-slate-400 font-mono">
          {JSON.stringify(log.details, null, 2)}
        </pre>
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
    if (actionFilter !== 'ALL' && log.action?.toUpperCase() !== actionFilter) {
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
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-150">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
              Hệ Thống Kiểm Soát
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              <span>Nhật Ký Hoạt Động &amp; Biến Động Dữ Liệu</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Ghi vết tự động toàn bộ biến động nông nghiệp, nhập xuất dữ liệu và thao tác nghiệp vụ tại Xã Đăk Hà
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="h-10 flex items-center gap-1.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw strokeWidth={1.5} className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thanh lọc sự kiện nhanh (Pills) */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span>Sự kiện:</span>
        </span>

        {[
          { id: 'ALL', label: 'Tất Cả', color: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' },
          { id: 'CREATE', label: 'Thêm Mới', color: 'bg-emerald-600 text-white' },
          { id: 'UPDATE', label: 'Cập Nhật', color: 'bg-blue-600 text-white' },
          { id: 'DELETE', label: 'Xóa', color: 'bg-rose-600 text-white' },
          { id: 'RESTORE', label: 'Khôi Phục', color: 'bg-purple-600 text-white' },
          { id: 'IMPORT', label: 'Nhập Excel', color: 'bg-amber-600 text-white' },
        ].map((item) => {
          const isActive = actionFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActionFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? `${item.color} shadow-xs`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 3. Thanh tìm kiếm & lọc thôn */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Input tìm kiếm rộng */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo nội dung, cán bộ, tên hộ, chỉ số..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-800/80 dark:border-slate-700/60 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-800 rounded-2xl text-xs font-medium focus:outline-hidden"
            />
          </div>

          {/* Lọc theo Thôn */}
          {selectedVillageId ? (
            <div className="flex items-center justify-between px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-200 truncate">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.5} />
                <span className="truncate">
                  Đang xem biến động dữ liệu: <strong>{villages.find((v) => v.id === selectedVillageId)?.name || 'Thôn đã chọn'}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedVillageId('');
                  setVillageFilter('');
                }}
                className="ml-2 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition-all shrink-0"
                title="Chuyển về xem toàn xã"
              >
                Xem Toàn Xã
              </button>
            </div>
          ) : isAdmin ? (
            <CustomSelect
              value={villageFilter}
              onChange={(val) => setVillageFilter(String(val))}
              options={[
                { value: '', label: 'Toàn xã (Tất cả thôn)' },
                ...villages.map((v) => ({ value: v.id, label: v.name })),
              ]}
              placeholder="Toàn xã (Tất cả thôn)"
              size="sm"
              className="rounded-2xl text-xs font-bold"
            />
          ) : (
            <div className="flex items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span>Đơn vị: {villages.find((v) => v.id === user?.village_id)?.name || 'Thôn phụ trách'}</span>
            </div>
          )}
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

      {/* 4. Dòng Thời Gian Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span>Dòng thời gian biến động ({total} sự kiện)</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Hiển thị {filteredLogs.length} / {total} sự kiện</span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" strokeWidth={1.5} />
            <span>Đang tải nhật ký kiểm soát...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Không tìm thấy sự kiện biến động nào phù hợp với bộ lọc.
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6 pb-2">
            {filteredLogs.map((item) => {
              const cfg = getActionConfig(item.action);
              const ActionIcon = cfg.icon;
              const dateObj = new Date(item.created_at);
              const timeStr = !isNaN(dateObj.getTime())
                ? `${dateObj.toLocaleTimeString('vi-VN')} • ${dateObj.toLocaleDateString('vi-VN')}`
                : item.created_at;

              const villageName = villages.find((v) => v.id === item.village_id)?.name;

              return (
                <div key={item.id} className="relative pl-6 group">
                  {/* Node chấm tròn Timeline */}
                  <div
                    className={`absolute -left-2.25 top-1.5 w-4.5 h-4.5 rounded-full ${cfg.dotBg} ring-4 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-110`}
                  >
                    <ActionIcon className="w-2.5 h-2.5 stroke-[3]" />
                  </div>

                  {/* Thẻ Nội Dung Sự Kiện */}
                  <div className="bg-slate-50/60 dark:bg-slate-950/60 p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/40 transition-all space-y-2">
                    {/* Header Thẻ: Loại thao tác & Thời gian */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider border ${cfg.colorBadge}`}
                        >
                          {cfg.label}
                        </span>

                        <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                          {cfg.label} đối tượng {item.entity_type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                        <span>{timeStr}</span>
                      </div>
                    </div>

                    {/* Dịch JSON Diff Thân Thiện */}
                    {renderFriendlyDiff(item)}

                    {/* Footer Thẻ: Người thực hiện, Đơn vị */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <UserIcon className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                          <span>{item.username || 'Hệ thống'}</span>
                        </span>

                        {villageName && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
                            <span>{villageName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Nút Tải thêm dữ liệu */}
        {logs.length < total && (
          <div className="pt-6 flex justify-center border-t border-slate-100 dark:border-slate-800 mt-4">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowDownCircle className="w-4 h-4" strokeWidth={1.5} />
              <span>{loading ? 'Đang tải thêm...' : 'Tải Thêm Dữ Liệu'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

