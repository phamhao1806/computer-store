import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Wishlist() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">Danh sách yêu thích trống</h2>
          <p className="text-white/30 mb-6 text-sm">Lưu những sản phẩm bạn quan tâm!</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Yêu thích</span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mt-3 tracking-tight">
              {items.length} sản phẩm
            </h1>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors duration-300"
          >
            Tiếp tục mua sắm
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="group animate-fade-up opacity-0"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.06] hover:ring-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <div className="rounded-[1.2rem] bg-surface-50 overflow-hidden">
                  <Link to={`/products/${item.id}`} className="block relative overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium mb-1">
                      {item.brand}
                    </p>
                    <Link to={`/products/${item.id}`}>
                      <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/[0.05]">
                      <p className="text-lg font-bold text-white font-display">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { addItem(item); }}
                          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-light transition-all duration-300 active:scale-[0.95]"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-9 h-9 rounded-full bg-white/[0.04] text-white/40 flex items-center justify-center hover:bg-coral/10 hover:text-coral transition-all duration-300"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
