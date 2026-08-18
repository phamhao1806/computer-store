import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4">
      <div className="text-center animate-fade-up">
        <div className="relative inline-block mb-8">
          <span className="text-[8rem] sm:text-[12rem] font-display font-bold text-white/[0.03] leading-none select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl sm:text-8xl font-display font-bold text-gradient">404</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-3">
          Trang không tìm thấy
        </h1>
        <p className="text-white/40 mb-10 max-w-md mx-auto leading-relaxed">
          Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="group flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-all duration-500 active:scale-[0.97]"
          >
            Về trang chủ
            <span className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </span>
          </Link>
          <Link
            to="/products"
            className="px-8 py-4 rounded-full border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 hover:text-white transition-all duration-500"
          >
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
