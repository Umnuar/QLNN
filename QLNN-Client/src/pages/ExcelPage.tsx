import React from 'react';
import { FileSpreadsheet, UploadCloud, DownloadCloud, AlertCircle } from 'lucide-react';
import { useApp } from '../AppContext';

export const ExcelPage: React.FC = () => {
  const { selectedVillageName } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          Nhập / Xuất Dữ Liệu Excel (Biểu Mẫu 21 Cột)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hỗ trợ Smart Upsert chống trùng lặp, chống hộ ma khi nhập lại file nhiều lần
        </p>
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
                <p className="text-xs text-slate-500">Áp dụng cho {selectedVillageName}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Chọn file Excel (.xls, .xlsx) theo biểu mẫu chuẩn Đăk Hà. Hệ thống sẽ tự động bỏ qua 9 dòng đầu, parse các dòng có tên thật và áp dụng Smart Upsert.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Chỉ những dòng có điền họ tên thật mới được nhập vào hệ thống. Các dòng trống bên dưới sẽ tự động bị loại trừ.</span>
            </div>
          </div>
          <button className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs">
            <UploadCloud className="w-4 h-4" />
            Chọn File Excel Từ Máy Tính
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
          </div>
          <button className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs">
            <DownloadCloud className="w-4 h-4" />
            Tải Xuống File Excel
          </button>
        </div>
      </div>
    </div>
  );
};
