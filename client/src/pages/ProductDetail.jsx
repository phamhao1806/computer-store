import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchReviews, createReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? '#6366f1' : 'none'}
          stroke={i < rating ? '#6366f1' : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const wishlisted = product ? isInWishlist(product.id) : false;
  const { addProduct: addRecentlyViewed, items: recentlyViewed } = useRecentlyViewed();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setActiveImg(0);
    fetchProductById(id)
      .then((p) => {
        setProduct(p);
        addRecentlyViewed(p);
      })
      .catch((err) => {
        console.error('Failed to fetch product:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
    fetchReviews(id).then(setReviews).catch(() => {});
  }, [id]);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { setReviewError('Vui lòng đăng nhập để đánh giá.'); return; }
    if (reviewRating === 0) { setReviewError('Vui lòng chọn số sao.'); return; }
    if (reviewComment.trim().length < 5) { setReviewError('Nhận xét phải có ít nhất 5 ký tự.'); return; }

    setReviewError('');
    try {
      const newReview = await createReview(id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      }, token);
      setReviews(prev => [...prev, newReview]);
      setReviewRating(0);
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      const updated = await fetchProductById(id);
      setProduct(updated);
    } catch (err) {
      setReviewError(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <p style={{ color: '#f87171', fontSize: '1rem' }}>Lỗi: {error}</p>
        <Link to="/products" style={{ color: '#6366f1' }} className="text-sm mt-4 inline-block">Quay lại</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 text-center">
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Không tìm thấy sản phẩm.</p>
        <Link to="/products" style={{ color: '#6366f1' }} className="text-sm mt-4 inline-block">Quay lại</Link>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const gallery = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [product.image];

  const categoryLabels = {
    laptop: 'Laptop',
    desktop: 'Desktop',
    monitor: 'Màn hình',
    accessory: 'Phụ kiện',
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-white/30 mb-10">
          <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-white transition-colors">Sản phẩm</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-white transition-colors">
            {categoryLabels[product.category] || product.category}
          </Link>
          <span>/</span>
          <span className="text-white/60 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <div>
            <div className="p-2 rounded-[2rem] bg-white/[0.02] ring-1 ring-white/[0.06] mb-4">
              <div className="rounded-[1.5rem] overflow-hidden bg-surface-50">
                <img
                  src={gallery[activeImg]}
                  alt={product.name}
                  className="w-full aspect-square object-cover transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                />
              </div>
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-1 p-1 rounded-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      activeImg === i
                        ? 'ring-2 ring-accent bg-accent/10'
                        : 'ring-1 ring-white/[0.06] bg-white/[0.02] hover:ring-white/20'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="sticky top-32">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/[0.05] text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">
                  {product.brand}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/[0.05] text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium">
                  {categoryLabels[product.category] || product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full bg-accent/15 text-[11px] uppercase tracking-[0.15em] text-accent-light font-semibold">
                    {product.badge}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6 text-sm text-white/30">
                <StarRating rating={Math.floor(product.rating)} />
                <span className="text-white/50 font-medium">{product.rating}</span>
                <span>({product.reviews} đánh giá)</span>
                <span className="mx-1">·</span>
                <span className={product.stock > 10 ? 'text-mint' : product.stock > 0 ? 'text-yellow-400' : 'text-coral'}>
                  {product.stock > 10 ? 'Còn hàng' : product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                </span>
              </div>

              <p className="text-white/40 leading-relaxed mb-8">{product.description}</p>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-3xl font-display font-bold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-white/25 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-coral/15 text-coral">
                      Giảm {discount}%
                    </span>
                  </>
                )}
              </div>

              <div className="mb-8">
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/30 font-semibold mb-4">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/25 mb-1.5">{key}</p>
                      <p className="text-xs text-white/70 font-medium leading-snug">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-9 h-9 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-white">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-9 h-9 rounded-full text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={product.stock === 0}
                  className={`group flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm font-semibold transition-all duration-500 active:scale-[0.97] ${
                    added
                      ? 'bg-mint text-white'
                      : product.stock === 0
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-accent text-white hover:bg-accent-light'
                  }`}
                >
                  {added ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      Thêm vào giỏ
                      <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleItem(product)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 active:scale-[0.95] ${
                    wishlisted ? 'bg-coral/15 border border-coral/30' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? '#f87171' : 'none'} stroke={wishlisted ? '#f87171' : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { icon: 'truck', label: 'Giao hàng miễn phí' },
                  { icon: 'shield', label: 'Bảo hành 24 tháng' },
                  { icon: 'refresh', label: 'Đổi trả 30 ngày' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" className="mx-auto mb-1.5">
                      {item.icon === 'truck' && <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>}
                      {item.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />}
                      {item.icon === 'refresh' && <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>}
                    </svg>
                    <span className="text-[10px] text-white/30 leading-tight block">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Đánh giá</span>
              <h2 className="text-3xl font-display font-bold text-white mt-2">Nhận xét khách hàng</h2>
            </div>
            <span className="text-sm text-white/30">{reviews.length} đánh giá</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {reviews.length === 0 ? (
                <div className="p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] text-center">
                  <p className="text-white/30">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] animate-fade-up"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
                          <span className="text-xs font-bold text-accent-light">
                            {review.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{review.userName}</p>
                          <p className="text-[10px] text-white/20">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06]">
                <h3 className="text-lg font-display font-bold text-white mb-5">Viết đánh giá</h3>

                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-white/30 mb-4">Đăng nhập để viết đánh giá</p>
                    <Link
                      to="/login"
                      className="inline-flex px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all"
                    >
                      Đăng nhập
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-2 block">Đánh giá của bạn</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="transition-transform duration-200 hover:scale-110 active:scale-[0.95]"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill={star <= reviewRating ? '#6366f1' : 'none'}
                              stroke={star <= reviewRating ? '#6366f1' : 'rgba(255,255,255,0.15)'}
                              strokeWidth="1.5"
                            >
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 mb-1.5 block">Nhận xét</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        placeholder="Chia sẻ kinh nghiệm của bạn..."
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-accent/50 resize-none"
                      />
                    </div>

                    {reviewError && (
                      <p className="text-xs text-coral">{reviewError}</p>
                    )}

                    {reviewSuccess && (
                      <p className="text-xs text-mint">Đánh giá đã được gửi thành công!</p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-light transition-all duration-500 active:scale-[0.97]"
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {recentlyViewed.filter(p => p.id !== product.id).length > 0 && (
          <section className="mt-24">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Lịch sử</span>
                <h2 className="text-3xl font-display font-bold text-white mt-2">Sản phẩm đã xem</h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {recentlyViewed
                .filter(p => p.id !== product.id)
                .map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.id}`}
                    className="flex-shrink-0 w-[180px] group"
                  >
                    <div className="p-1 rounded-[1.2rem] bg-white/[0.02] ring-1 ring-white/[0.06] hover:ring-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <div className="rounded-[0.9rem] bg-surface-50 overflow-hidden">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-white/30 mb-1">{item.brand}</p>
                          <h4 className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug mb-2">{item.name}</h4>
                          <p className="text-sm font-bold text-white font-display">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
