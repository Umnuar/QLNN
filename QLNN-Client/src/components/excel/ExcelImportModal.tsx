import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trees,
  Dog,
  Fish,
  Sparkles,
  ShieldCheck,
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
  const { user, selectedVillageId, selectedVillageName, villages } = useApp();
  const { showModal } = useModal();

  const [targetVillageId, setTargetVillageId] = useState<string>(
    selectedVillageId || (villages.length > 0 ? villages[0].id : '')
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [importLoading, setImportLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<ExcelPreviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelected = async (file: File) => {
    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      setErrorMessage('Định dạng file không hỗ trợ. Vui lòng chọn file Excel (.xls hoặc .xlsx).');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    setPreviewLoading(true);

    try {
      // Dynamic import test nếu cần xử lý client-side (tránh import top-level)
      // const XLSX = await import('xlsx');

      const villageToUse = user?.role === 'admin' ? targetVillageId : selectedVillageId;
      const res = await excelApi.previewExcel(file, villageToUse);
      setPreviewData(res);
    } catch (err: any) {
      console.error('Preview error:', err);
      const msg =
        err.response?.data?.error ||
        'Không thể đọc dữ liệu từ file Excel. Vui lòng kiểm tra lại cấu trúc file mẫu 21 cột.';
      setErrorMessage(msg);
      setPreviewData(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;

    setImportLoading(true);
    setErrorMessage(null);

    const villageToUse = user?.role === 'admin' ? targetVillageId : selectedVillageId;

    try {
      const res = await excelApi.importExcel(selectedFile, villageToUse);
      onSuccess();
      onClose();

      showModal({
        title: 'Nhập Dữ Liệu Thành Công',
        message: `Đã xử lý thành công ${res.totalRowsParsed} dòng dữ liệu hộ dân:\n• Tạo mới: ${res.createdCount} hộ\n• Cập nhật Smart Upsert: ${res.updatedCount} hộ`,
        type: 'success',
        confirmText: 'Hoàn tất',
      });
    } catch (err: any) {
      console.error('Import error:', err);
      const msg = err.response?.data?.error || 'Lỗi khi nhập dữ liệu vào CSDL. Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Nhập Dữ Liệu Excel (Biểu Mẫu 21 Cột)</h3>
              <p className="text-xs text-slate-400">
                Tự động kiểm tra trước dữ liệu (Preview) & Smart Upsert chống trùng lặp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-700 text-xs animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Village Selector (Admin only) */}
          {user?.role === 'admin' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-0.5">
                  Thôn đích tiếp nhận dữ liệu
                </label>
                <p className="text-[11px] text-slate-500">
                  Dữ liệu trong file sẽ được nạp và đối chiếu với danh sách hộ của thôn này
                </p>
              </div>
              <select
                value={targetVillageId}
                onChange={(e) => {
                  setTargetVillageId(e.target.value);
                  if (selectedFile) handleFileSelected(selectedFile);
                }}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/70 scale-101'
                : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20'
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800 mb-1">
              {selectedFile ? selectedFile.name : 'Kéo thả file Excel vào đây hoặc bấm để chọn file'}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Hỗ trợ định dạng .xls và .xlsx theo biểu mẫu thống kê cây trồng, vật nuôi, thủy sản xã Đăk Hà
            </p>
          </div>

          {/* Preview Loading */}
          {previewLoading && (
            <div className="py-8 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
              <span>Đang đọc cấu trúc file và đối chiếu Smart Upsert...</span>
            </div>
          )}

          {/* Preview Results */}
          {previewData && !previewLoading && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tổng hộ hợp lệ đọc được
                  </div>
                  <div className="text-xl font-black text-slate-800">
                    {previewData.totalRowsParsed} hộ
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Sẽ tạo mới
                  </div>
                  <div className="text-xl font-black text-emerald-800">
                    {previewData.createCount} hộ
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                    Smart Upsert (Cập nhật đè)
                  </div>
                  <div className="text-xl font-black text-amber-800">
                    {previewData.updateCount} hộ
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Danh sách hộ dân xem trước ({previewData.previewList.length} hộ)</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    Phạm vi: {previewData.villageName || selectedVillageName}
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                  {previewData.previewList.map((item, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-slate-400 w-6">
                          #{item.stt || idx + 1}
                        </span>
                        <span className="font-bold text-slate-800 truncate">{item.full_name}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        {/* Indicators summary */}
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                          {item.cropCount > 0 && (
                            <span className="flex items-center gap-1 text-emerald-700">
                              <Trees className="w-3 h-3" /> {item.cropCount} cây
                            </span>
                          )}
                          {item.livestockCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-700">
                              <Dog className="w-3 h-3" /> {item.livestockCount} nuôi
                            </span>
                          )}
                          {item.aquaCount > 0 && (
                            <span className="flex items-center gap-1 text-sky-700">
                              <Fish className="w-3 h-3" /> {item.aquaCount} thủy sản
                            </span>
                          )}
                        </div>

                        {/* Action Badge */}
                        {item.action === 'create' ? (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                            Tạo mới
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                            Cập nhật đè
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Safety Notice */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Cơ chế <b>Smart Upsert</b> bảo vệ an toàn: Các dòng trống tên được tự động loại bỏ (chống hộ ma). Nếu hộ dân đã có trong thôn, hệ thống cập nhật lại các chỉ số mà không làm nhân đôi số hộ.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={importLoading}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={!previewData || importLoading || previewLoading}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
          >
            {importLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Xác Nhận Import Vào CSDL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
