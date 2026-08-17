import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { excelApi, ExcelPreviewResponse } from '../../api/excelApi';
import { useApp } from '../../AppContext';
import { useModal } from '../../hooks/useModal';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, villages } = useApp();
  const { showModal } = useModal();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [villageId, setVillageId] = useState<string>(
    user?.role === 'user' && user.village_id ? user.village_id : villages[0]?.id || ''
  );
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    if (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
      setError('Chỉ chấp nhận file Excel định dạng .xls hoặc .xlsx');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setPreviewData(null);
    setPreviewLoading(true);

    try {
      const targetVillage = user?.role === 'admin' ? villageId : undefined;
      const res = await excelApi.previewExcel(file, targetVillage);
      setPreviewData(res);
    } catch (err: any) {
      console.error('Preview error:', err);
      const msg =
        err.response?.data?.error ||
        'Không thể đọc cấu trúc file Excel. Vui lòng kiểm tra định dạng 21 cột.';
      setError(msg);
      setSelectedFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setError(null);

    try {
      const targetVillage = user?.role === 'admin' ? villageId : undefined;
      const res = await excelApi.importExcel(selectedFile, targetVillage);

      showModal({
        title: 'Nhập Dữ Liệu Thành Công!',
        message: `Đã xử lý thành công ${res.totalRowsParsed} hộ:\n• Tạo mới: ${res.createdCount} hộ\n• Cập nhật đè (Smart Upsert): ${res.updatedCount} hộ.`,
        type: 'info',
        confirmText: 'Hoàn Tất',
        onConfirm: () => {
          onSuccess();
          onClose();
        },
      });
    } catch (err: any) {
      console.error('Import error:', err);
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi nhập dữ liệu Excel vào hệ thống.';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-tight">
                Nhập Dữ Liệu Excel (Smart Upsert 21 Cột)
              </h3>
              <p className="text-xs text-amber-200 font-medium">
                Tự động đối chiếu chống trùng lặp và loại bỏ dòng rác (Chống hộ ma)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-amber-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Admin Village Selector */}
          {user?.role === 'admin' && (
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <div>
                <span className="font-bold text-slate-800">Thôn tiếp nhận dữ liệu:</span>
                <p className="text-[11px] text-slate-500">
                  Chọn thôn sẽ gán các hộ mới được import vào
                </p>
              </div>
              <select
                value={villageId}
                onChange={(e) => {
                  setVillageId(e.target.value);
                  if (selectedFile) handleFileSelected(selectedFile);
                }}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/70 scale-101'
                : 'border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="text-sm font-black text-slate-800 mb-1">
              {selectedFile ? selectedFile.name : 'Kéo thả file Excel vào đây hoặc bấm để chọn file'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Hỗ trợ định dạng .xls và .xlsx theo biểu mẫu thống kê cây trồng, vật nuôi, thủy sản xã Đăk Hà
            </p>
          </div>

          {/* Preview Loading */}
          {previewLoading && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <RefreshCw className="w-7 h-7 animate-spin text-amber-600 mx-auto mb-2" />
              <span className="font-bold">Đang phân tích cấu trúc file và đối chiếu Smart Upsert...</span>
            </div>
          )}

          {/* Preview Results */}
          {previewData && !previewLoading && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Tổng hộ hợp lệ đọc được
                  </div>
                  <div className="text-2xl font-black text-slate-800 font-mono">
                    {previewData.totalRowsParsed} hộ
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Sẽ tạo mới
                  </div>
                  <div className="text-2xl font-black text-emerald-800 font-mono">
                    {previewData.createCount} hộ
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    Sẽ cập nhật đè (Smart)
                  </div>
                  <div className="text-2xl font-black text-amber-800 font-mono">
                    {previewData.updateCount} hộ
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 flex items-center justify-between border-b border-slate-200">
                  <span>Danh sách xem trước ({previewData.previewList.length} hộ đầu tiên):</span>
                  <button
                    onClick={handleReset}
                    className="text-[11px] text-slate-500 hover:text-slate-800 font-bold hover:underline cursor-pointer"
                  >
                    Chọn file khác
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                        <th className="py-2.5 px-3">Họ và tên</th>
                        <th className="py-2.5 px-3 text-center">Hành động</th>
                        <th className="py-2.5 px-3 text-right">Tổng cây</th>
                        <th className="py-2.5 px-3 text-right">Vật nuôi</th>
                        <th className="py-2.5 px-3 text-right">Thủy sản</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {previewData.previewList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-slate-800">{item.full_name}</td>
                          <td className="py-2 px-3 text-center">
                            {item.action === 'create' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Tạo mới
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Cập nhật đè
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {item.cropCount} cây
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {item.livestockCount} nuôi
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600">
                            {item.aquaCount} thủy sản
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Dòng không có họ tên hoặc số liệu tổng cộng sẽ tự động bị bỏ qua.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={!previewData || importing || previewData.totalRowsParsed === 0}
              className="flex items-center gap-1.5 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50 active:scale-98 cursor-pointer"
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Nhập Dữ Liệu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
