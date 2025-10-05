import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const starsRef = useRef<HTMLDivElement | null>(null);
  const earthRef = useRef<HTMLDivElement | null>(null);
  const moonRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    // Entrance animation (one-time parallax)
    const layers = [
      { ref: starsRef, from: -80, to: 0, duration: 1500 },
      { ref: earthRef, from: 150, to: -330, duration: 1800 },
      { ref: moonRef, from: 200, to: 0, duration: 1300 },
      { ref: textRef, from: 1000, to: -50, duration: 2200 },
      { ref: titleRef, from: 1000, to: -100, duration: 3000 },
    ];

    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      let done = true;

      for (const { ref, from, to, duration } of layers) {
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const y = from + (to - from) * eased;

        if (ref.current) {
          ref.current.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        }

        if (progress < 1) done = false;
      }

      if (!done) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <section
      id="home"
      className="relative h-[100vh] w-full overflow-hidden bg-black perspective-[1200px]"
    >
      {/* Stars (background) */}
      <div
        ref={starsRef}
        className="absolute inset-0 z-0 pointer-events-none will-change-transform"
        style={{
          backgroundImage: "url(/stars_bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />

<div className="relative w-full h-screen">
  <p
    ref={titleRef}
    className="tracking-wide absolute inset-0 m-auto w-max h-max whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-[250px] text-white font-['Inter'] font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] leading-none text-center"
  >
    DISCOVER
  </p>
</div>



      {/* Earth (middle layer) */}
      <div className="pl-20 absolute inset-0 flex items-end justify-center z-10 pointer-events-none">
        <div
          ref={earthRef}
          className="w-3/4 max-w-4xl h-[40%] md:h-[35%] will-change-transform"
          style={{
            backgroundImage: "url(/earth.png)",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center bottom 0vh", // raises Earth slightly higher
          }}
          role="img"
          aria-label="Earth"
        />
      </div>

      {/* Moon (foreground) */}
      <div
        ref={moonRef}
        className="absolute bottom-0 left-0 right-0 z-20 h-[45vh] sm:h-[55vh] md:h-[60vh] overflow-hidden pointer-events-none will-change-transform"
        style={{
          backgroundImage: "url(/moon_surface.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
        }}
        aria-hidden
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

      {/* Hero Text */}
 <div
  ref={textRef}
  className="absolute inset-x-0 bottom-[8vh] z-30 text-center"
>
  <p className="whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-[120px] text-white font-['Inter'] font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] leading-none">
  THE UNIVERSE
  </p>
</div>

    </section>
  );
}