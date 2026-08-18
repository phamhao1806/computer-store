import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const links = [
    { to: '/', label: 'Trang chủ' },
    { to: '/products', label: 'Sản phẩm' },
  ];

  if (isAdmin) {
    links.push({ to: '/admin', label: 'Quản trị' });
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrolled ? 'py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div
            className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              scrolled
                ? 'bg-black/70 backdrop-blur-2xl border border-white/[0.08] shadow-2xl'
                : 'bg-transparent'
            }`}
          >
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                NexTech
              </span>
            </Link>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = e.target.search.value.trim();
                if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
              }}
              className="hidden md:flex items-center"
            >
              <div className="relative">
                <svg
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  name="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-64 rounded-full bg-white/[0.04] border border-white/[0.06] text-white text-sm placeholder:text-white/25 pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all duration-300"
                />
              </div>
            </form>

            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                    location.pathname === link.to
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              <Link
                to="/wishlist"
                className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-coral text-[10px] font-bold text-white flex items-center justify-center animate-fade-in">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/70">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center animate-fade-in">
                    {count}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-accent-light">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="hidden lg:inline">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all duration-300"
                  >
                    Thoát
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-300 active:scale-[0.97]"
                >
                  Đăng nhập
                </Link>
              )}

              <button
                onClick={() => setOpen(!open)}
                className="md:hidden w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"
              >
                <div className="relative w-4 h-3.5 flex flex-col justify-between">
                  <span
                    className={`block h-[1.5px] bg-white rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                      open ? 'rotate-45 translate-y-[7.5px]' : ''
                    }`}
                  />
                  <span
                    className={`block h-[1.5px] bg-white rounded-full transition-all duration-300 ${
                      open ? 'opacity-0 scale-0' : ''
                    }`}
                  />
                  <span
                    className={`block h-[1.5px] bg-white rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] origin-center ${
                      open ? '-rotate-45 -translate-y-[7.5px]' : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-3xl animate-fade-in md:hidden"
          ref={menuRef}
        >
          <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-8">
            {links.map((link, i) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-3xl font-display font-bold text-white/80 hover:text-white transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { logout(); setOpen(false); }}
                className="mt-4 text-xl text-white/40 hover:text-white transition-all duration-500 animate-fade-up"
                style={{ animationDelay: `${links.length * 100}ms` }}
              >
                Thoát ({user.name})
              </button>
            ) : (
              <Link
                to="/login"
                className="mt-4 px-8 py-3 rounded-full bg-white text-black text-lg font-semibold animate-fade-up"
                style={{ animationDelay: `${links.length * 100}ms` }}
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
