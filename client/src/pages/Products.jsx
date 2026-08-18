import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

const PER_PAGE = 9;

const categories = [
  { value: '', label: 'Tất cả' },
  { value: 'laptop', label: 'Laptop' },
  { value: 'desktop', label: 'Desktop' },
  { value: 'monitor', label: 'Màn hình' },
  { value: 'accessory', label: 'Phụ kiện' },
];

const sorts = [
  { value: '', label: 'Mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá' },
];

const priceRanges = [
  { value: '', label: 'Tất cả mức giá', min: null, max: null },
  { value: 'under-5m', label: 'Dưới 5 triệu', min: null, max: 5000000 },
  { value: '5m-10m', label: '5 – 10 triệu', min: 5000000, max: 10000000 },
  { value: '10m-20m', label: '10 – 20 triệu', min: 10000000, max: 20000000 },
  { value: '20m-50m', label: '20 – 50 triệu', min: 20000000, max: 50000000 },
  { value: 'over-50m', label: 'Trên 50 triệu', min: 50000000, max: null },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PER_PAGE, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const brand = searchParams.get('brand') || '';
  const priceRange = searchParams.get('priceRange') || '';

  const brands = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.brand))].sort();
    return unique;
  }, [products]);

  const activePriceRange = priceRanges.find((r) => r.value === priceRange) || priceRanges[0];

  useEffect(() => {
    setLoading(true);
    const params = { page: String(page), limit: String(PER_PAGE) };
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (search) params.search = search;
    if (brand) params.brand = brand;
    if (activePriceRange.min !== null) params.minPrice = String(activePriceRange.min);
    if (activePriceRange.max !== null) params.maxPrice = String(activePriceRange.max);

    fetchProducts(params)
      .then((res) => {
        setProducts(res.data);
        setPagination(res.pagination);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category, sort, search, brand, priceRange, page]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (key !== 'page') next.set('page', '1');
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearFilter = (key) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFilterPills = [];
  if (category) {
    const cat = categories.find((c) => c.value === category);
    if (cat) activeFilterPills.push({ key: 'category', label: cat.label });
  }
  if (brand) {
    activeFilterPills.push({ key: 'brand', label: brand });
  }
  if (priceRange) {
    activeFilterPills.push({ key: 'priceRange', label: activePriceRange.label });
  }

  const totalPages = pagination.totalPages;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">Bộ sưu tập</span>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mt-2">Sản phẩm</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-10 p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setFilter('category', e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 appearance-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value} className="bg-surface-100 text-white">
                  {c.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent/50 appearance-none cursor-pointer"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value} className="bg-surface-100 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => setFilter('category', c.value)}
                className={`shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  category === c.value
                    ? 'bg-white text-black'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium">Giá</span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {priceRanges.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setFilter('priceRange', r.value)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      priceRange === r.value
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-6 bg-white/[0.06] hidden sm:block" />

            {brands.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium">Thương hiệu</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setFilter('brand', '')}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      !brand
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    Tất cả
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setFilter('brand', b)}
                      className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        brand === b
                          ? 'bg-white text-black'
                          : 'bg-white/[0.04] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {activeFilterPills.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-white/20">Bộ lọc:</span>
              {activeFilterPills.map((pill) => (
                <button
                  key={pill.key}
                  onClick={() => clearFilter(pill.key)}
                  className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-white/50 text-[11px] font-medium hover:bg-white/[0.1] transition-all duration-300"
                >
                  {pill.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-white/30 group-hover:text-white/60 transition-colors"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ))}
              <button
                onClick={() => {
                  const next = new URLSearchParams();
                  if (search) next.set('search', search);
                  setSearchParams(next);
                }}
                className="text-[11px] text-white/20 hover:text-white/40 transition-colors ml-1"
              >
                Xoá tất cả
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-[1.5rem] bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="aspect-[4/3] bg-white/[0.03]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-white/[0.05] rounded w-16" />
                  <div className="h-4 bg-white/[0.05] rounded w-3/4" />
                  <div className="h-5 bg-white/[0.05] rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-500 ${
                      p === page
                        ? 'bg-white text-black'
                        : 'bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            )}

            <p className="text-center text-xs text-white/20 mt-4">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} trong {pagination.total} sản phẩm
            </p>
          </>
        )}
      </div>
    </div>
  );
}
