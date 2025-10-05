// ...existing code...
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Planet = {
    name: string;
    image: string;
    description: string;
    shadowColor: string;
};

// Data for our solar system carousel
const solarSystemData: Planet[] = [
  
    {
        name: 'What are exoplanets?',
         image: '/Mercurry_pl.png',
        description: "Exoplanets are planets that orbit stars outside our Solar System. They can be rocky, gaseous, icy, or even ocean-covered. Scientists study them to understand how planets form and whether other worlds might be suitable for life. These discoveries show that our galaxy is full of diverse and fascinating planets.",
        shadowColor: 'shadow-gray-400/50',
    },
    {
        name: 'How are exoplanets discovered?',
        image: '/Venus_pl.png',
        description: "Most are found using the transit method, where a planet passing in front of its star slightly dims the star’s light. Others are detected by the radial velocity method, which spots tiny wobbles in a star’s motion. Powerful telescopes like JWST can even study their atmospheres from light patterns.",
        shadowColor: 'shadow-orange-300/50',
    },
    {
         name: 'What types of exoplanets exist?',
        image: '/Earth_pl.png',
        description: "There are many kinds — hot Jupiters (large, close to their stars), super-Earths (bigger than Earth but smaller than Neptune), and mini-Neptunes (small gas planets). Some exoplanets orbit twin stars, and a few are “rogue planets” floating freely in space without a star at all.",
        shadowColor: 'shadow-blue-400/50',
    },
    {
         name: 'What is the habitable zone?',
        image: '/Mars_pl.png',
        description: "The habitable zone is the region around a star where temperatures allow liquid water to exist on a planet’s surface. It’s often called the “Goldilocks zone” — not too hot, not too cold. Finding exoplanets in this zone helps scientists focus their search for possible life..",
        shadowColor: 'shadow-red-400/50',
    },
    {
         name: 'Why do scientists study exoplanets?',
        image: '/Jupiter_pl.png',
        description: "By studying exoplanets, scientists learn how planets form and evolve and whether life could exist elsewhere. Some planets may have atmospheres with oxygen, water vapor, or methane, which are signs of possible habitability. This research also helps us understand Earth’s uniqueness and origins.",
        shadowColor: 'shadow-orange-500/50',
    },
    {
         name: 'How many exoplanets have been discovered?',
        image: '/Saturn_pl.png',
        description: "As of 2025, more than 5,600 exoplanets have been confirmed, with thousands more candidates awaiting verification. Every new discovery helps refine our understanding of the galaxy and increases the chances of finding another Earth-like world.",
        shadowColor: 'shadow-yellow-200/50',
    },
    {
         name: 'Which space missions study exoplanets?',
        image: '/Uranus_pl.png',
        description: "NASA’s Kepler and TESS missions revolutionized exoplanet discovery, while JWST studies their atmospheres in detail. The upcoming Nancy Grace Roman Telescope will expand this search. ISRO and PRL discovered India’s first exoplanet K2-236b, and future missions like ExoSat aim to explore more.",
        shadowColor: 'shadow-cyan-300/50',
    },
    {
         name: 'Could exoplanets support life?',
        image: '/Neptune_pl.png',
        description: "Some exoplanets lie in habitable zones with Earth-like temperatures and possible water. Scientists search for biosignatures — gases like oxygen or methane — that might indicate life. While no confirmed signs of life exist yet, these worlds give hope that we’re not alone in the universe.",
        shadowColor: 'shadow-blue-600/50',
    },
];

// A simple star component
type StarProps = React.HTMLAttributes<HTMLDivElement> & {
    style?: React.CSSProperties;
};
const Star: React.FC<StarProps> = ({ style, className, ...rest }) => (
    <div
        className={`absolute bg-white rounded-full ${className ?? ''}`}
        style={style}
        {...rest}
    />
);

// Main App Component
export default function App(): JSX.Element {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [stars, setStars] = useState<React.CSSProperties[]>([]);
    const [paused, setPaused] = useState<boolean>(false);
    const [enteringIndex, setEnteringIndex] = useState<number | null>(null);
    const [isEntering, setIsEntering] = useState<boolean>(false);
    const enteringTimerRef = React.useRef<number | null>(null);

    // Generate stars on mount
    useEffect(() => {
        const newStars: React.CSSProperties[] = Array.from({ length: 150 }).map(() => {
            const size = Math.random() * 2 + 0.5;
            return {
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 5 + 5}s`,
            } as React.CSSProperties;
        });
        setStars(newStars);
    }, []);

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => {
            const len = solarSystemData.length;
            return (prevIndex - 1 + len) % len;
        });
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => {
            const len = solarSystemData.length;
            return (prevIndex + 1) % len;
        });
    };

    // Handle keyboard arrow navigation (stable handler without stale closure)
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                setCurrentIndex((i) => {
                    const len = solarSystemData.length;
                    return (i - 1 + len) % len;
                });
            } else if (event.key === 'ArrowRight') {
                setCurrentIndex((i) => {
                    const len = solarSystemData.length;
                    return (i + 1) % len;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Automatic sliding every 6 seconds. Resets when user manually navigates.
    useEffect(() => {
        if (solarSystemData.length === 0) return;
        if (paused) return; // don't start interval while paused

        const len = solarSystemData.length;
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i + 1) % len);
        }, 6000);

        return () => clearInterval(interval);
    }, [paused]);

    // Helper: compute relative offset from currentIndex to target index in range [-half, +half]
    const getRelativeOffset = (targetIndex: number) => {
        const len = solarSystemData.length;
        let offset = targetIndex - currentIndex;
        // normalize to [-len/2, len/2]
        if (offset > len / 2) offset -= len;
        if (offset < -len / 2) offset += len;
        return offset;
    };

    // When currentIndex changes, mark the new slide as entering so it can play a fade-in + zoom-in
    useEffect(() => {
        // clear any previous timer
        if (enteringTimerRef.current) {
            window.clearTimeout(enteringTimerRef.current);
            enteringTimerRef.current = null;
        }

        setEnteringIndex(currentIndex);
        setIsEntering(true);

        // Small timeout to allow initial 'small/transparent' render, then flip to normal so transition runs
        enteringTimerRef.current = window.setTimeout(() => {
            setIsEntering(false);
            enteringTimerRef.current = null;
        }, 40); // 40ms is enough to trigger the transition

        return () => {
            if (enteringTimerRef.current) {
                window.clearTimeout(enteringTimerRef.current);
                enteringTimerRef.current = null;
            }
        };
    }, [currentIndex]);

    return (
        <section
      id="about"
      className="relative rounded-sm bg-gray-50 flex flex-col items-center justify-center"
    >

   
        <>
            <style>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
                .star-animate {
                    animation: twinkle linear infinite;
                }
            `}</style>
            {/* Outer container for the 'window' gap and page background */}
            <div className="h-screen w-screen bg-white flex items-center justify-center p-35 md:p-20">
                <main className="relative h-full w-full bg-gray-900 bg-gradient-to-b from-[#000010] to-[#0c0024] font-sans overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-blue-500/20">
                    {/* Static Starry Background */}
                    <div className="absolute inset-0 z-0 font-['Inter']">
                        {stars.map((starStyle, index) => (
                            <Star
                                key={index}
                                style={{ ...starStyle, animationName: 'twinkle' }}
                                className="star-animate"
                            />
                        ))}
                    </div>

                    {/* Carousel Container */}
                    <div className="relative h-full w-full z-10">
                        {/* Slides Wrapper */}
                        <div
                            className="flex h-full w-full transition-transform duration-1000 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                            onMouseEnter={() => setPaused(true)}
                            onMouseLeave={() => setPaused(false)}
                        >
                          // ...existing code...
{solarSystemData.map((item, index) => {
    const offset = getRelativeOffset(index);
    const absOffset = Math.abs(offset);
    const centerScale = 1.25;
    const minScale = 0.45;
    const scale = offset === 0 ? centerScale : Math.max(minScale, centerScale - 0.6 * absOffset);
    const opacity = offset === 0 ? 1 : Math.max(0.15, 1 - 0.75 * absOffset);
    const zIndex = offset === 0 ? 30 : 10 - absOffset;

    return (

   

        <div key={index} className="h-full w-full flex-shrink-0 flex items-center justify-center p-4 md:p-8">

            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-8 relative px-4">
                {/* Left column: name only on md+ */}
                
                <div className={`hidden md:flex flex-col justify-center items-start max-w-xs pr-6 z-20 transition-opacity duration-1000 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-wider drop-shadow-lg">{item.name}</h2>
                </div>

                {/* Center image - placed in the middle column */}
                <div className="flex justify-center items-center col-span-1 md:col-span-1" style={{ zIndex }}>
                    <div className="w-72 md:w-96 flex justify-center">
                        <img
                            src={item.image}
                            alt={item.name}
                            className={`w-full h-auto object-contain ${item.shadowColor} drop-shadow-2xl`}
                            style={{
                                filter: `drop-shadow(0 0 40px var(--tw-shadow-color))`,
                                // If this slide is the entering (newly current) one and isEntering is true,
                                // start slightly smaller and transparent so CSS transition will animate it to full size/opacity.
                                transform: `translateX(${offset * 120}px) scale(${(currentIndex === index && isEntering) ? 0.7 : scale})`,
                                opacity: (currentIndex === index && isEntering) ? 0 : opacity,
                                transition: 'transform 700ms cubic-bezier(.2,.9,.26,1), opacity 700ms cubic-bezier(.2,.9,.26,1)',
                            }}
                            onError={(e) => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.onerror = null;
                                img.src = 'https://placehold.co/400x400/000000/FFFFFF?text=Image+Not+Found';
                            }}
                        />
                    </div>
                </div>

                {/* Right column: description on md+ rendered as bullets */}
                <div className={`hidden md:flex flex-col justify-center items-start max-w-xs pl-6 z-20 transition-opacity duration-1000 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                    <ul className="list-disc list-inside text-gray-300 text-base md:text-lg leading-relaxed space-y-2">
                        {item.description.split(/\.|\n/).map((s, si) => {
                            const t = s.trim();
                            if (!t) return null;
                            return (
                                <li key={si} className="text-gray-300">
                                    {t}.
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Mobile description displayed below the image */}
                <div className={`md:hidden mt-6 w-full px-4 transition-opacity duration-1000 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0'} text-center`}>
                    <h2 className="text-2xl font-bold text-white mb-3">{item.name}</h2>
                    <ul className="list-disc list-inside text-gray-300 text-sm leading-relaxed space-y-1 inline-block text-left">
                        {item.description.split(/\.|\n/).map((s, si) => {
                            const t = s.trim();
                            if (!t) return null;
                            return (
                                <li key={si} className="text-gray-300">
                                    {t}.
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
})}

                        </div>
                    </div>

                    {/* Navigation Controls */}
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 -translate-y-1/2 left-2 md:left-6 z-20 text-white transition-all hover:scale-110 hover:text-cyan-300"
                        aria-label="Previous Planet"
                    >
                        <ChevronLeft size={48} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 -translate-y-1/2 right-2 md:right-6 z-20 text-white transition-all hover:scale-110 hover:text-cyan-300"
                        aria-label="Next Planet"
                    >
                        <ChevronRight size={48} />
                    </button>
                </main>
            </div>
        </>
         </section>
    );




}
// ...existing code...