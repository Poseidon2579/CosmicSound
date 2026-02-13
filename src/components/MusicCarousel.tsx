"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MusicCarouselProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export default function MusicCarousel({ title, subtitle, children, icon }: MusicCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftArrow(scrollLeft > 20);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, []);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section className="mb-16 relative group">
            <div className="flex items-center justify-between px-2 pb-5">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">{title}</h2>
                    {subtitle && (
                        <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30 flex items-center gap-1">
                            {subtitle}
                        </span>
                    )}
                </div>
            </div>

            <div className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll("left")}
                        aria-label="Scroll left"
                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 size-10 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all shadow-xl opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll("right")}
                        aria-label="Scroll right"
                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 size-10 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all shadow-xl opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>
                )}

                {/* Scroll Container */}
                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="flex w-full overflow-x-auto pb-4 gap-6 no-scrollbar snap-x snap-mandatory"
                >
                    {children}
                </div>

                {/* Fade Edges */}
                <div className={`absolute top-0 left-0 bottom-4 w-12 bg-gradient-to-r from-background-dark to-transparent pointer-events-none transition-opacity duration-300 ${showLeftArrow ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`absolute top-0 right-0 bottom-4 w-12 bg-gradient-to-l from-background-dark to-transparent pointer-events-none transition-opacity duration-300 ${showRightArrow ? 'opacity-100' : 'opacity-0'}`} />
            </div>
        </section>
    );
}
