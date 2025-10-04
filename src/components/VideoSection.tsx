import { useEffect, useRef, useState } from 'react';

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lastScrollTime, setLastScrollTime] = useState(Date.now());
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const handleScroll = () => {
      setLastScrollTime(Date.now());

      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;

      if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
        const scrollProgress = Math.max(
          0,
          Math.min(1, (windowHeight - sectionTop) / (windowHeight + sectionHeight))
        );

        const videoDuration = video.duration;
        if (videoDuration && !isNaN(videoDuration)) {
          video.currentTime = scrollProgress * videoDuration;
        }
      }
    };

    const checkAutoplay = () => {
      const timeSinceLastScroll = Date.now() - lastScrollTime;
      if (timeSinceLastScroll > 5000 && video.paused) {
        video.play();
      }
    };

    video.addEventListener('loadedmetadata', handleScroll);
    window.addEventListener('scroll', handleScroll);

    autoplayTimerRef.current = setInterval(checkAutoplay, 1000);

    handleScroll();

    return () => {
      video.removeEventListener('loadedmetadata', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [lastScrollTime]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="min-h-screen bg-gray-50 py-24 px-6 flex items-center justify-center"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">About Our Mission</h2>
          <p className="text-lg text-gray-600 font-light">
            Scroll to explore or let it play automatically
          </p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-gray-200">
          <video
            ref={videoRef}
            className="w-full"
            muted
            playsInline
            preload="auto"
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
            <h3 className="text-2xl font-semibold text-white mb-2">
              Discovering New Worlds
            </h3>
            <p className="text-gray-200 font-light">
              Using AI to identify exoplanets and expand our understanding of the universe
            </p>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h4 className="text-3xl font-semibold text-gray-900 mb-2">5000+</h4>
            <p className="text-gray-600 font-medium">Exoplanets Discovered</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h4 className="text-3xl font-semibold text-gray-900 mb-2">96%</h4>
            <p className="text-gray-600 font-medium">Detection Accuracy</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h4 className="text-3xl font-semibold text-gray-900 mb-2">24/7</h4>
            <p className="text-gray-600 font-medium">Continuous Analysis</p>
          </div>
        </div>
      </div>
    </section>
  );
}
