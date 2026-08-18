import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Mật khẩu không khớp');
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    setLoading(true);
    try {
      const { user, token } = await registerUser({ name: form.name, email: form.email, password: form.password });
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Đăng ký</h1>
          <p className="text-white/30 text-sm mt-2">Tạo tài khoản để nhận ưu đãi</p>
        </div>

        <div className="p-1.5 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
          <form onSubmit={handleSubmit} className="p-8 rounded-[1.5rem] bg-surface-50 space-y-5">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm animate-fade-in">
                {error}
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 block">Họ tên</label>
              <input
                type="text"
                value={form.name}
                onChange={update('name')}
                required
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
                placeholder="email@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 block">Mật khẩu</label>
              <input
                type="password"
                value={form.password}
                onChange={update('password')}
                required
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 block">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={form.confirm}
                onChange={update('confirm')}
                required
                placeholder="Nhập lại mật khẩu"
                className="w-full px-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-500 active:scale-[0.97] disabled:opacity-50"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-accent-light hover:text-white transition-colors">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
