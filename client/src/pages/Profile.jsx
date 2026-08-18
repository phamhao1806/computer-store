import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders } from '../services/api';
import { formatPrice } from '../utils/format';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../constants';

export default function Profile() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    if (!token) return;
    fetchMyOrders(token)
      .then((allOrders) => {
        setOrders(allOrders);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <p className="text-white/40 text-lg mb-4">Vui lòng đăng nhập để xem trang cá nhân.</p>
          <Link
            to="/login"
            className="inline-flex px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Tài khoản</span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mt-3 tracking-tight">
            Trang cá nhân
          </h1>
        </div>

        <div className="flex gap-2 mb-8">
          {[
            { key: 'info', label: 'Thông tin' },
            { key: 'orders', label: 'Đơn hàng' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-500 ${
                tab === t.key ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:text-white/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="animate-fade-up">
            <div className="p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-accent-light">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-white">{user.name}</h2>
                  <p className="text-sm text-white/40">{user.email}</p>
                </div>
                <span className="ml-auto px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold bg-accent/10 text-accent-light">
                  {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Họ tên', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Vai trò', value: user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng' },
                  { label: 'Ngày tham gia', value: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mb-1.5">{item.label}</p>
                    <p className="text-sm text-white/70 font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="animate-fade-up">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] text-center">
                <p className="text-white/30 mb-4">Bạn chưa có đơn hàng nào.</p>
                <Link
                  to="/products"
                  className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-white">{order.id}</p>
                        <p className="text-xs text-white/25 mt-0.5">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.1em] font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-white/40">{item.name} x{item.quantity}</span>
                          <span className="text-white/50">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-white/[0.05]">
                      <div className="text-xs text-white/25">
                        <span>{order.customer.name}</span>
                        <span className="mx-1">·</span>
                        <span>{order.customer.phone}</span>
                      </div>
                      <span className="text-sm font-bold text-white font-display">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
