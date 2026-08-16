import React, { useState } from 'react';
import { FileSpreadsheet, UploadCloud, DownloadCloud, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../AppContext';
import { excelApi } from '../api/excelApi';
import { useModal } from '../hooks/useModal';
import { ExcelImportModal } from '../components/excel/ExcelImportModal';

export const ExcelPage: React.FC = () => {
  const { user, selectedVillageId, selectedVillageName, villages, setSelectedVillageId } = useApp();
  const { showModal } = useModal();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            Nhập / Xuất Dữ Liệu Excel (Biểu Mẫu 21 Cột)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hỗ trợ xem trước (Preview) & Smart Upsert chống trùng lặp, chống hộ ma khi nhập lại file nhiều lần
          </p>
        </div>

        {/* Admin Village Selector */}
        {user?.role === 'admin' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Phạm vi:</span>
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
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Nhập File Excel Thống Kê</h3>
                <p className="text-xs text-slate-500">Áp dụng cho {selectedVillageName || 'thôn đã chọn'}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Chọn file Excel (.xls, .xlsx) theo biểu mẫu chuẩn Đăk Hà. Hệ thống sẽ tự động bỏ qua 9 dòng đầu, parse các dòng có tên thật và mở hộp thoại xem trước (Preview).
            </p>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-start gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Chỉ những dòng có điền họ tên thật mới được nhập vào hệ thống. Các dòng trống bên dưới sẽ tự động bị loại trừ (chống hộ ma).</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setImportModalOpen(true)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <UploadCloud className="w-4 h-4" />
            Mở Cửa Sổ Nhập & Xem Trước File Excel
          </button>
        </div>

        {/* Export Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <DownloadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Xuất File Excel Chuẩn</h3>
                <p className="text-xs text-slate-500">Giữ nguyên định dạng 21 cột</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Xuất toàn bộ danh sách hộ dân và 18 chỉ số ra file Excel với đầy đủ 3 dòng tiêu đề, ô gộp, công thức hàm SUM và phần ký duyệt Ban quản lý thôn.
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-xs flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Dữ liệu xuất ra tương thích 100% với Microsoft Excel, LibreOffice và Google Sheets.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            {exporting ? 'Đang tạo file...' : 'Tải Xuống File Excel (21 Cột)'}
          </button>
        </div>
      </div>

      {/* Modal Import Excel */}
      <ExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => {
          // Success callback
        }}
      />
    </div>
  );
};
