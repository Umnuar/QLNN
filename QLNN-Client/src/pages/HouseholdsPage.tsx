import React from 'react';
import { Plus, Search, Upload, Download, RefreshCw, Users } from 'lucide-react';
import { useApp } from '../AppContext';

export const HouseholdsPage: React.FC = () => {
  const { user, selectedVillageId, setSelectedVillageId, villages } = useApp();

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
            Quản lý diện tích cây trồng (ha), đàn vật nuôi (con) và nuôi trồng thủy sản
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
              {villages.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Xuất Excel
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            Nhập Excel
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm Hộ Dân
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên chủ hộ (gõ không dấu)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <button
          type="button"
          title="Tải lại danh sách"
          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Table Placeholder Frame */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Khung Bảng Dữ Liệu 21 Cột</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cấu trúc bảng bao gồm 21 cột (STT, Họ và tên, 12 cột Cây trồng, 4 cột Vật nuôi, 2 cột Thủy sản, Ghi chú) và phân trang 20 hộ/trang.
          </p>
        </div>
      </div>
    </div>
  );
};
