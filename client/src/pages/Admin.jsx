import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchProducts, fetchOrders, deleteProduct, createProduct, updateProduct, updateOrderStatus } from '../services/api';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const emptyProduct = {
  name: '', brand: '', category: 'laptop', price: '', originalPrice: '',
  image: '', description: '', stock: '', featured: false, badge: '',
  specs: { cpu: '', ram: '', storage: '', display: '', gpu: '' },
};

export default function Admin() {
  const { isAdmin, token } = useAuth();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (!isAdmin) return;
    fetchProducts().then((res) => setProducts(res.data || res));
    fetchOrders(token).then(setOrders);
  }, [isAdmin, token]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <p className="text-white/40 text-lg mb-4">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await deleteProduct(id, token);
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleEdit = (product) => {
    setEditing(product.id);
    setForm({ ...product, price: product.price, originalPrice: product.originalPrice || '', stock: product.stock });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      stock: Number(form.stock),
      rating: form.rating || 0,
      reviews: form.reviews || 0,
    };
    if (editing) {
      const updated = await updateProduct(editing, data, token);
      setProducts(products.map((p) => (p.id === editing ? updated : p)));
    } else {
      const created = await createProduct(data, token);
      setProducts([...products, created]);
    }
    setEditing(null);
    setForm(emptyProduct);
  };

  const handleOrderStatus = async (id, status) => {
    const updated = await updateOrderStatus(id, status, token);
    setOrders(orders.map((o) => (o.id === id ? updated : o)));
  };

  const statusColors = {
    pending: 'bg-yellow-400/10 text-yellow-400',
    processing: 'bg-blue-400/10 text-blue-400',
    shipped: 'bg-purple-400/10 text-purple-400',
    delivered: 'bg-mint/10 text-mint',
    cancelled: 'bg-coral/10 text-coral',
  };

  const statusLabels = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Quản trị</span>
          <h1 className="text-4xl font-display font-bold text-white mt-2">Dashboard</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Sản phẩm', value: products.length, color: 'text-accent-light' },
            { label: 'Đơn hàng', value: orders.length, color: 'text-mint' },
            { label: 'Doanh thu', value: formatPrice(orders.reduce((s, o) => s + o.total, 0)), color: 'text-white' },
            { label: 'Chờ xử lý', value: orders.filter((o) => o.status === 'pending').length, color: 'text-yellow-400' },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mb-1">{s.label}</p>
              <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-8">
          {['products', 'orders'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all duration-500 ${
                tab === t ? 'bg-white text-black' : 'bg-white/[0.04] text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'products' ? 'Sản phẩm' : 'Đơn hàng'}
            </button>
          ))}
        </div>

        {tab === 'products' && (
          <div>
            <div className="p-1.5 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06] mb-8">
              <form onSubmit={handleSubmit} className="p-6 rounded-[1.5rem] bg-surface-50">
                <h3 className="text-lg font-display font-bold text-white mb-4">
                  {editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'name', label: 'Tên', placeholder: 'MacBook Pro 16"' },
                    { key: 'brand', label: 'Thương hiệu', placeholder: 'Apple' },
                    { key: 'price', label: 'Giá (VND)', placeholder: '69990000' },
                    { key: 'originalPrice', label: 'Giá gốc (VND)', placeholder: '74990000' },
                    { key: 'image', label: 'URL ảnh', placeholder: 'https://...' },
                    { key: 'stock', label: 'Tồn kho', placeholder: '15' },
                    { key: 'badge', label: 'Badge', placeholder: 'Hot / Sale' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">{f.label}</label>
                      <input
                        type={f.key === 'price' || f.key === 'originalPrice' || f.key === 'stock' ? 'number' : 'text'}
                        value={form[f.key]}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Danh mục</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 appearance-none"
                    >
                      <option value="laptop" className="bg-surface-100">Laptop</option>
                      <option value="desktop" className="bg-surface-100">Desktop</option>
                      <option value="monitor" className="bg-surface-100">Màn hình</option>
                      <option value="accessory" className="bg-surface-100">Phụ kiện</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="w-4 h-4 rounded accent-accent"
                      />
                      <span className="text-sm text-white/50">Nổi bật</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Mô tả</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all active:scale-[0.97]"
                  >
                    {editing ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={() => { setEditing(null); setForm(emptyProduct); }}
                      className="px-6 py-3 rounded-full bg-white/5 text-white/50 text-sm hover:bg-white/10 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{p.name}</h4>
                    <p className="text-xs text-white/30">{p.brand} · {p.category} · Tồn: {p.stock}</p>
                  </div>
                  <span className="text-sm font-bold text-white font-display">{formatPrice(p.price)}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(p)} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-all">Sửa</button>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-coral/10 text-coral text-xs hover:bg-coral/20 transition-all">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20 text-white/30">Chưa có đơn hàng nào.</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-white">{order.id}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {order.customer.name} · {order.customer.phone}
                      </p>
                      <p className="text-xs text-white/20">{order.customer.address}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.1em] font-semibold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <select
                        value={order.status}
                        onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-white/5 border border-white/[0.06] text-xs text-white/50 appearance-none cursor-pointer focus:outline-none"
                      >
                        {Object.entries(statusLabels).map(([k, v]) => (
                          <option key={k} value={k} className="bg-surface-100">{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-white/40">{item.name} x{item.quantity}</span>
                        <span className="text-white/50">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-3 border-t border-white/[0.05]">
                    <span className="text-xs text-white/30">{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                    <span className="text-sm font-bold text-white font-display">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
