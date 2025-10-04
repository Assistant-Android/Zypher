import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.scrollY;
        const scale = Math.max(1 - scrolled * 0.0005, 0.8);
        const translateY = scrolled * 0.5;
        containerRef.current.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden bg-white">
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
        style={{ willChange: 'transform' }}
      >
        <img
          src="/image.png"
          alt="Earth from Moon"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90"></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 mb-4 tracking-tight">
          Discover the
        </h1>
        <h1 className="text-6xl md:text-7xl font-semibold text-gray-900 mb-8 tracking-tight">
          Unseen Universe
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-12 font-light">
          AI-powered exoplanet detection at your fingertips
        </p>
        <button
          onClick={() =>
            document.getElementById('detection')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="px-8 py-3.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          Get started
        </button>
      </div>

      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="text-gray-400" size={32} strokeWidth={1.5} />
      </div>
    </section>
  );
}
