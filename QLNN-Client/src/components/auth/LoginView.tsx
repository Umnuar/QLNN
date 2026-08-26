import React, { useState } from 'react';
import { Sprout, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { secureStorage } from '../../utils/secureStorage';
import { useApp } from '../../AppContext';

export const LoginView: React.FC = () => {
  const { setUser, setActiveTab } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login({ username: username.trim(), password });
      if (!data?.accessToken || !data?.user) {
        throw new Error('Phản hồi đăng nhập không hợp lệ.');
      }
      await secureStorage.setItem('accessToken', data.accessToken);
      await secureStorage.setItem('refreshToken', data.refreshToken);
      await secureStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
        if (data.user.role === 'admin') {
          setActiveTab('villages');
        } else {
          setActiveTab('analytics');
        }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại tài khoản hoặc kết nối mạng.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans text-slate-900 dark:text-slate-100 select-none">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[11px] font-bold uppercase tracking-wider mb-2.5">
            <Building2 className="w-3.5 h-3.5" />
            <span>UBND XÃ ĐĂK HÀ • NÔNG THÔN MỚI</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            QUẢN LÝ NÔNG NGHIỆP
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Hệ thống Dữ liệu 25 Chỉ tiêu Nông thôn mới
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin hoặc thon1"
                required
                autoFocus
                className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pl-10 pr-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-11 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Đăng nhập an toàn nội bộ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
