import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-40 border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-display font-bold text-lg text-white">NexTech</span>
            </Link>
            <p className="text-sm text-white/30 leading-relaxed">
              Premium computer store. Cung cấp thiết bị công nghệ cao cấp với giá tốt nhất.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-5">Sản phẩm</h4>
            <div className="flex flex-col gap-3">
              {['Laptop', 'Desktop', 'Màn hình', 'Phụ kiện'].map((item) => (
                <Link key={item} to="/products" className="text-sm text-white/30 hover:text-white transition-colors duration-300">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-5">Hỗ trợ</h4>
            <div className="flex flex-col gap-3">
              {['Liên hệ', 'Bảo hành', 'Vận chuyển', 'FAQ'].map((item) => (
                <span key={item} className="text-sm text-white/30 hover:text-white transition-colors duration-300 cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold mb-5">Kết nối</h4>
            <div className="flex flex-col gap-3">
              {['Facebook', 'Instagram', 'YouTube', 'Zalo'].map((item) => (
                <span key={item} className="text-sm text-white/30 hover:text-white transition-colors duration-300 cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/20">&copy; 2024 NexTech. All rights reserved.</p>
          <p className="text-xs text-white/20">Designed with precision.</p>
        </div>
      </div>
    </footer>
  );
}
