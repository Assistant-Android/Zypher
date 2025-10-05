import { useEffect, useRef, useState } from "react";

export default function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const windowHeight = window.innerHeight;
      const sectionBottom = sectionTop + sectionHeight;

      // Keep video sticky while section is visible
      setIsSticky(sectionTop < 0 && sectionBottom > 0);

      if (sectionTop < windowHeight && sectionBottom > 0) {
        const scrollProgress = Math.max(
          0,
          Math.min(1, -sectionTop / (sectionHeight - windowHeight))
        );

        const videoDuration = video.duration;
        if (videoDuration && !isNaN(videoDuration)) {
          video.currentTime = scrollProgress * videoDuration;

          // Lock scroll if reached end
          if (scrollProgress >= 1 && !scrollLocked) {
            document.body.style.overflow = "hidden";
            setScrollLocked(true);
          } else if (scrollProgress < 1 && scrollLocked) {
            document.body.style.overflow = "";
            setScrollLocked(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    video.addEventListener("loadedmetadata", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      video.removeEventListener("loadedmetadata", handleScroll);
      document.body.style.overflow = "";
    };
  }, [scrollLocked]);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative min-h-[150vh] bg-gray-50 flex flex-col items-center justify-center"
    >
      {/* Fixed Video Container */}
      <div
        className={`${
          isSticky ? "sticky top-0 z-40" : ""
        } w-full h-screen flex items-center justify-center bg-transparent px-4`}
      >
        <div className="relative w-full max-w-6xl mx-auto h-[75vh] rounded-[2rem] overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            style={{
              borderRadius: "2rem",
              transform: isSticky ? "scale(0.98)" : "scale(1)",
              transition: "transform 0.3s ease-out"
            }}
          >
            <source src="assets/explain.mp4" type="video/mp4" />
          </video>

          {/* Overlay Text */}
        </div>
      </div>
    </section>
  );
}
