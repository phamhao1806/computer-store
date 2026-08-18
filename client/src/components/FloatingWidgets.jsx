import { useState, useEffect } from 'react';

export default function FloatingWidgets() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex flex-col gap-3">
        <a
          href="tel:0901234567"
          className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </a>

        <a
          href="https://zalo.me/0901234567"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.04 2 10.92c0 2.76 1.46 5.22 3.74 6.84l-.94 3.52 4.06-2.24c.96.24 1.98.36 3.14.36 5.52 0 10-4.04 10-8.92S17.52 2 12 2zm-1.78 12.28l-2.2-2.4a.5.5 0 01-.02-.68l.02-.02a.47.47 0 01.68 0l1.52 1.64 4.44-4.8a.47.47 0 01.68 0l.02.02a.5.5 0 01-.02.68l-5.12 5.56z"/>
          </svg>
        </a>

        <a
          href="https://m.me/nextech"
          target="_blank"
          rel="noopener noreferrer"
          className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.907 1.408 5.493 3.6 7.17V22l3.39-1.862c.904.25 1.864.384 2.862.384h.148C17.523 20.522 22 16.378 22 11.243 22 6.145 17.523 2 12 2zm1.112 12.616l-2.34-2.488-4.565 2.488 5.016-5.328 2.398 2.488 4.507-2.488-5.016 5.328z"/>
          </svg>
        </a>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 ${showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </>
  );
}
