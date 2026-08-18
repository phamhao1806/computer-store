import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useQuickView } from '../context/QuickViewContext';
import { formatPrice } from '../utils/format';

export default function QuickViewModal() {
  const { product, close } = useQuickView();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setQty(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    if (product) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, close]);

  if (!product) return null;

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-4xl rounded-[2rem] bg-surface-50 ring-1 ring-white/[0.08] overflow-hidden shadow-2xl">
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all duration-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto bg-black/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-bold bg-coral/90 text-white backdrop-blur-sm">
                -{discount}%
              </span>
            )}
            {product.badge && (
              <span className="absolute top-4 left-4 mt-8 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold bg-accent/90 text-white backdrop-blur-sm">
                {product.badge}
              </span>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium mb-1.5">
                {product.brand}
              </p>
              <h2 className="text-xl md:text-2xl font-bold text-white font-display leading-tight mb-3">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-white font-display">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-white/30 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-white/50 leading-relaxed mb-6 line-clamp-3">
                  {product.description}
                </p>
              )}

              {product.specs && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-3 py-1 rounded-full text-[11px] bg-white/[0.04] text-white/50 ring-1 ring-white/[0.06]"
                    >
                      {val}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-xs text-white/40">Số lượng:</span>
                <div className="flex items-center ring-1 ring-white/[0.08] rounded-full overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-white">{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => { addItem(product, qty); close(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all duration-500 active:scale-[0.97]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  Thêm vào giỏ
                </button>

                <Link
                  to={`/products/${product.id}`}
                  onClick={close}
                  className="px-5 py-3 rounded-full ring-1 ring-white/[0.1] text-white/60 text-sm font-medium hover:text-white hover:ring-white/[0.2] transition-all duration-300"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
