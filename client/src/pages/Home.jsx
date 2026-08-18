import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { formatPrice } from '../utils/format';

const brands = [
  'ASUS', 'MSI', 'Lenovo', 'Apple', 'Dell', 'HP', 'Acer', 'Razer',
  'ASUS', 'MSI', 'Lenovo', 'Apple', 'Dell', 'HP', 'Acer', 'Razer',
];

const categories = [
  {
    name: 'Laptop',
    slug: 'laptop',
    desc: 'Hiệu năng đỉnh cao cho mọi nhu cầu',
    gradient: 'from-accent/20 to-accent-dark/10',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M2 17h20" />
        <path d="M8 21h8" />
      </svg>
    ),
  },
  {
    name: 'Desktop',
    slug: 'desktop',
    desc: 'Workstation & Gaming mạnh mẽ',
    gradient: 'from-coral/20 to-coral/5',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: 'Màn hình',
    slug: 'monitor',
    desc: 'Hiển thị sắc nét, màu sắc chuẩn',
    gradient: 'from-mint/20 to-mint/5',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    name: 'Phụ kiện',
    slug: 'accessory',
    desc: 'Bàn phím, chuột, tai nghe & hơn',
    gradient: 'from-white/10 to-white/[0.02]',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16M6 16V8a2 2 0 012-2h8a2 2 0 012 2v8" />
        <path d="M9 16v-4M12 16v-2M15 16v-6" />
      </svg>
    ),
  },
];

const features = [
  {
    title: 'Chính hãng 100%',
    desc: 'Phân phối chính hãng từ hãng sản xuất, có tem bảo hành toàn quốc.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Giao hàng nhanh',
    desc: 'Giao nội thành trong 2h, toàn quốc 1-3 ngày. Miễn phí với đơn từ 500K.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Bảo hành chính sách',
    desc: 'Đổi trả 30 ngày, bảo hành 12-36 tháng. Hỗ trợ kỹ thuật 24/7.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    title: 'Trả góp 0%',
    desc: 'Trả góp 0% lãi suất qua thẻ tín dụng và dịch vụ tài chính.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
];

function useInView(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15, ...options });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

function StaggeredSection({ children, className = '' }) {
  const [ref, isVisible] = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    fetchProducts({ featured: 'true' })
      .then((res) => setFeatured(res.data || res))
      .catch(console.error)
      .finally(() => setFeaturedLoading(false));
    const t = setTimeout(() => setHeroVisible(true), 150);
    return () => clearTimeout(t);
  }, []);

  const displayProducts = featured.slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-40" />

        <div className="absolute inset-0">
          <div className="absolute top-[15%] left-[10%] w-[700px] h-[700px] rounded-full bg-accent/[0.06] blur-[150px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] rounded-full bg-mint/[0.04] blur-[120px]" />
          <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-coral/[0.03] blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-32 sm:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            <div
              className={`lg:col-span-7 transition-all duration-1200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] uppercase tracking-[0.2em] text-white/50 font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
                Mùa sale lớn
              </span>

              <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-display font-bold text-white leading-[0.92] tracking-tight mb-8">
                Thiết bị
                <br />
                công nghệ
                <br />
                <span className="text-gradient">cao cấp</span>
              </h1>

              <p className="text-base sm:text-lg text-white/40 max-w-lg leading-relaxed mb-10">
                Laptop, Desktop, Màn hình & Phụ kiện — chính hãng, bảo hành toàn quốc, giao hàng nhanh.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/products"
                  className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-500 active:scale-[0.97]"
                >
                  Khám phá ngay
                  <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-[1px] transition-all duration-300">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/products?category=laptop"
                  className="px-8 py-4 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-500"
                >
                  Xem laptop
                </Link>
              </div>
            </div>

            <div
              className={`lg:col-span-5 transition-all duration-1200 ease-[cubic-bezier(0.32,0.72,0,1)] delay-300 ${
                heroVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-accent/10 via-transparent to-mint/5 rounded-[2rem] blur-2xl" />
                <div className="relative p-1.5 rounded-[2rem] bg-white/[0.04] ring-1 ring-white/[0.08]">
                  <div className="rounded-[1.6rem] bg-surface-50 overflow-hidden">
                    {displayProducts[0] && (
                      <Link to={`/products/${displayProducts[0].id}`} className="block">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={displayProducts[0].image}
                            alt={displayProducts[0].name}
                            className="w-full h-full object-cover transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-surface-50 via-transparent to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <p className="text-[11px] uppercase tracking-[0.15em] text-white/40 font-medium mb-1">
                              {displayProducts[0].brand}
                            </p>
                            <h3 className="text-xl font-display font-bold text-white mb-2">
                              {displayProducts[0].name}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-white font-display">
                                {formatPrice(displayProducts[0].price)}
                              </span>
                              {displayProducts[0].originalPrice && (
                                <span className="text-sm text-white/30 line-through">
                                  {formatPrice(displayProducts[0].originalPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    <div className="p-4">
                      <div className="flex gap-3">
                        {displayProducts.slice(1, 4).map((p) => (
                          <Link
                            key={p.id}
                            to={`/products/${p.id}`}
                            className="flex-1 group/thumb"
                          >
                            <div className="aspect-square rounded-xl overflow-hidden mb-2 ring-1 ring-white/[0.06]">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110"
                              />
                            </div>
                            <p className="text-[10px] text-white/40 truncate">{p.name}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 animate-float">
                  <div className="px-4 py-2.5 rounded-full glass-strong text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-black/20">
                    <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
                    Giao hàng 2h
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-4 animate-float" style={{ animationDelay: '2s' }}>
                  <div className="px-4 py-2.5 rounded-full glass-strong text-xs font-semibold text-white flex items-center gap-2 shadow-lg shadow-black/20">
                    <span className="text-mint font-bold">15%</span>
                    Giảm đơn đầu
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1.5">
            <div className="w-0.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-white/[0.04] overflow-hidden">
        <div className="mask-fade-x">
          <div className="flex animate-marquee">
            {brands.map((brand, i) => (
              <span
                key={i}
                className="flex-shrink-0 px-12 text-2xl font-display font-bold text-white/[0.07] uppercase tracking-[0.15em] select-none"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggeredSection>
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-16">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">
                  Nổi bật
                </span>
                <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mt-3 tracking-tight">
                  Sản phẩm hot
                </h2>
              </div>
              <Link
                to="/products"
                className="group flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors duration-300"
              >
                Xem tất cả
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="group-hover:translate-x-1 transition-transform duration-300"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </StaggeredSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-fade-up opacity-0" style={{ animationDelay: `${300 + i * 120}ms` }}>
                    <div className="p-1.5 rounded-[1.5rem] bg-white/[0.02] ring-1 ring-white/[0.06]">
                      <div className="rounded-[1.2rem] bg-surface-50 overflow-hidden">
                        <div className="aspect-[4/3] bg-white/[0.03] animate-pulse" />
                        <div className="p-5 space-y-3">
                          <div className="h-3 w-12 rounded-full bg-white/[0.03] animate-pulse" />
                          <div className="h-4 w-3/4 rounded bg-white/[0.03] animate-pulse" />
                          <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/[0.05]">
                            <div className="space-y-2">
                              <div className="h-5 w-20 rounded bg-white/[0.03] animate-pulse" />
                              <div className="h-3 w-16 rounded bg-white/[0.03] animate-pulse" />
                            </div>
                            <div className="h-9 w-16 rounded-full bg-white/[0.03] animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : displayProducts.map((p, i) => (
                  <div
                    key={p.id}
                    className="animate-fade-up opacity-0"
                    style={{ animationDelay: `${300 + i * 120}ms` }}
                  >
                    <ProductCard product={p} index={0} />
                  </div>
                ))
            }
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggeredSection>
            <div className="mb-16">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">
                Danh mục
              </span>
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mt-3 tracking-tight">
                Khám phá theo nhu cầu
              </h2>
            </div>
          </StaggeredSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <StaggeredSection key={cat.slug}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="group block relative p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center text-white/60 mb-6 group-hover:text-white/80 transition-colors duration-500">
                      {cat.icon}
                    </div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed mb-6">
                      {cat.desc}
                    </p>
                    <span className="inline-flex items-center gap-2 text-xs text-white/30 group-hover:text-white/60 font-medium transition-colors duration-300">
                      Xem thêm
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="group-hover:translate-x-1 transition-transform duration-300"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </StaggeredSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggeredSection>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sản phẩm', value: '500+', desc: 'Đang bán', accent: 'text-white' },
                { label: 'Thương hiệu', value: '50+', desc: 'Chính hãng', accent: 'text-accent-light' },
                { label: 'Khách hàng', value: '10K+', desc: 'Tin tưởng', accent: 'text-mint' },
                { label: 'Bảo hành', value: '24/7', desc: 'Hỗ trợ', accent: 'text-coral' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="group relative p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden"
                >
                  <div className="absolute inset-0 animate-shimmer" />
                  <div className="relative z-10">
                    <p className={`text-4xl sm:text-5xl font-display font-bold ${stat.accent} mb-2 tracking-tight`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/50 font-medium">{stat.label}</p>
                    <p className="text-[11px] text-white/20 mt-1">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </StaggeredSection>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggeredSection>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {features.map((feat, i) => (
                <div key={feat.title} className="lg:col-span-3 group">
                  <div className="p-6 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] h-full">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent-light mb-5 group-hover:bg-accent/20 transition-colors duration-500">
                      {feat.icon}
                    </div>
                    <h3 className="text-base font-display font-bold text-white mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-white/35 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </StaggeredSection>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <StaggeredSection>
            <div className="relative rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-surface-100 to-surface-50" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/[0.08] blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-mint/[0.04] blur-[100px]" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 p-10 sm:p-16">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-accent-light font-medium">
                    Ưu đãi
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-display font-bold text-white mt-4 mb-5 tracking-tight leading-tight">
                    Giảm đến 15%
                    <br />
                    đơn hàng đầu tiên
                  </h2>
                  <p className="text-white/40 leading-relaxed max-w-md">
                    Đăng ký thành viên ngay hôm nay để nhận ưu đãi độc quyền và cập nhật sản phẩm mới nhất.
                  </p>
                </div>

                <div className="flex flex-col justify-center items-start lg:items-end">
                  <div className="flex flex-col gap-4 w-full max-w-xs">
                    <Link
                      to="/register"
                      className="group flex items-center justify-center gap-3 w-full px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-500 active:scale-[0.97]"
                    >
                      Đăng ký ngay
                      <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                      </span>
                    </Link>
                    <Link
                      to="/products"
                      className="flex items-center justify-center gap-2 w-full px-8 py-4 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-500"
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </StaggeredSection>
        </div>
      </section>
    </div>
  );
}
