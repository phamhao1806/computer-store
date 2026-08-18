import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import { useState } from 'react';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function Cart() {
  const { items, removeItem, updateQuantity, total, count, clearCart } = useCart();
  const { user, token } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) return;
    setCheckingOut(true);
    try {
      await createOrder({
        customer: form,
        items: items.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
        total,
      }, token);
      clearCart();
      setOrdered(true);
    } catch {
      alert('Đặt hàng thất bại, vui lòng thử lại.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (ordered) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-mint/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">Đặt hàng thành công!</h2>
          <p className="text-white/40 mb-8">Chúng tôi sẽ liên hệ bạn sớm nhất.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">Giỏ hàng trống</h2>
          <p className="text-white/30 mb-6 text-sm">Hãy khám phá sản phẩm ngay!</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Giỏ hàng</span>
          <h1 className="text-4xl font-display font-bold text-white mt-2">{count} sản phẩm</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.06] animate-fade-up"
              >
                <div className="flex gap-4 p-4 rounded-[1.2rem] bg-surface-50">
                  <Link to={`/products/${item.id}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.id}`}>
                      <h3 className="text-sm font-semibold text-white/90 hover:text-white transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-white/30 mt-0.5">{item.brand}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 p-0.5 rounded-full bg-white/[0.04]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all text-xs"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-xs text-white font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all text-xs"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white font-display">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-7 h-7 rounded-full text-white/20 hover:text-coral hover:bg-coral/10 flex items-center justify-center transition-all"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-32 p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
              <div className="p-6 rounded-[1.2rem] bg-surface-50">
                <h3 className="text-lg font-display font-bold text-white mb-6">Thanh toán</h3>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Họ tên</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={user?.name || 'Nguyễn Văn A'}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Số điện thoại</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0901234567"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Địa chỉ</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/[0.05] space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Tạm tính</span>
                      <span className="text-white/60">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Phí ship</span>
                      <span className="text-mint text-xs">Miễn phí</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/[0.05]">
                      <span className="text-white font-medium">Tổng cộng</span>
                      <span className="text-xl font-display font-bold text-white">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={checkingOut}
                    className="w-full py-4 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all duration-500 active:scale-[0.97] disabled:opacity-50 mt-4"
                  >
                    {checkingOut ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
