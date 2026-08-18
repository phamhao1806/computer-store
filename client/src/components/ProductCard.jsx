import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useQuickView } from '../context/QuickViewContext';
import { formatPrice } from '../utils/format';

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const { open } = useQuickView();
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div
      className="group animate-fade-up opacity-0"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.06] hover:ring-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="rounded-[1.2rem] bg-surface-50 overflow-hidden">
          <Link to={`/products/${product.id}`} className="block relative overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold bg-accent/90 text-white backdrop-blur-sm">
                {product.badge}
              </span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-black/60"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? '#f87171' : 'none'} stroke={wishlisted ? '#f87171' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); open(product); }}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-black/70"
            >
              Xem nhanh
            </button>
          </Link>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium mb-1">
                  {product.brand}
                </p>
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {product.name}
                  </h3>
                </Link>
              </div>
              {discount > 0 && (
                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-coral/15 text-coral">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/[0.05]">
              <div>
                <p className="text-lg font-bold text-white font-display">
                  {formatPrice(product.price)}
                </p>
                {product.originalPrice && (
                  <p className="text-xs text-white/30 line-through mt-0.5">
                    {formatPrice(product.originalPrice)}
                  </p>
                )}
              </div>
              <button
                onClick={() => addItem(product)}
                className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-full bg-accent text-white text-xs font-semibold hover:bg-accent-light transition-all duration-500 active:scale-[0.96]"
              >
                <span>Thêm</span>
                <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover/btn:translate-x-0.5 transition-transform duration-300">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
