import React, { useState } from 'react';
import { Sprout, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Building2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import { secureStorage } from '../../utils/secureStorage';
import { useApp } from '../../AppContext';

export const LoginView: React.FC = () => {
  const { setUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickAccounts = [
    { label: 'Admin (Toàn xã)', user: 'admin', pass: 'admin123456', tag: 'Quản trị viên' },
    { label: 'Thôn 1', user: 'thon1', pass: 'qlcs2025', tag: 'Trưởng thôn' },
    { label: 'Kon Trang Long Loi', user: 'longloi', pass: 'qlcs2025', tag: 'Trưởng thôn' },
    { label: 'Kon Tu Dô 1', user: 'tudo1', pass: 'qlcs2025', tag: 'Trưởng thôn' },
  ];

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
        throw new Error('Phản hồi đăng nhập không hợp lệ từ máy chủ SSO.');
      }
      await secureStorage.setItem('accessToken', data.accessToken);
      await secureStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
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

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900 flex items-center justify-center p-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Decorative Highland Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/80 border border-slate-700/70 rounded-3xl shadow-2xl p-8 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="text-center mb-7">
          <div className="w-18 h-18 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-3xl mx-auto flex items-center justify-center text-white shadow-xl shadow-emerald-950/60 mb-4 ring-4 ring-emerald-500/20">
            <Sprout className="w-10 h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" /> UBND XÃ ĐĂK HÀ • NÔNG THÔN MỚI
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            QUẢN LÝ NÔNG NGHIỆP
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Hệ thống Dữ liệu Số hóa 25 Chỉ Tiêu NTM (Đồng bộ SSO)
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-rose-300 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tên tài khoản (SSO)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ví dụ: admin hoặc thon1"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:from-emerald-700 active:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
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

        {/* 1-Click Quick Accounts Pill selector */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2.5">
            <span className="flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Tài khoản mẫu (Bấm để điền nhanh)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickAccounts.map((acc) => (
              <button
                key={acc.user}
                type="button"
                onClick={() => handleQuickFill(acc.user, acc.pass)}
                className="p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-600/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 truncate">
                  {acc.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  user: <span className="text-slate-400">{acc.user}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Xác thực tập trung SSO Gateway • Mã hóa AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
};
