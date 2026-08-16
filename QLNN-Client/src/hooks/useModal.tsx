import React, { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

interface ModalOptions {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showModal = useCallback((options: ModalOptions) => {
    setModal(options);
    setIsOpen(true);
  }, []);

  const hideModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setModal(null), 200);
  }, []);

  const handleConfirm = async () => {
    if (modal?.onConfirm) {
      try {
        setIsLoading(true);
        await modal.onConfirm();
        hideModal();
      } catch (error) {
        console.error('Modal action error:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      hideModal();
    }
  };

  const handleCancel = () => {
    if (modal?.onCancel) modal.onCancel();
    hideModal();
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {isOpen && modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden scale-100 transition-all">
            <div className="p-5 flex items-start gap-4">
              <div
                className={`p-2.5 rounded-full shrink-0 ${
                  modal.type === 'danger'
                    ? 'bg-rose-100 text-rose-600'
                    : modal.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : modal.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                {modal.type === 'danger' || modal.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : modal.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-800">{modal.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {modal.message}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              {modal.cancelText !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {modal.cancelText || 'Hủy bỏ'}
                </button>
              )}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-xs disabled:opacity-50 flex items-center gap-2 ${
                  modal.type === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {modal.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
