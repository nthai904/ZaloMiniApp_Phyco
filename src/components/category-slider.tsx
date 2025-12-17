import { categoriesState } from "@/state";
import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";
import TransitionLink from "./transition-link";
import { useRef, useEffect, useState } from "react";

export default function CategorySlider() {
  const { id } = useParams();
  const categories = useAtomValue(categoriesState);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 10);
    };

    checkScroll();
    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  return (
    <div className="relative bg-white">
      {showLeftGradient && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />}

      {showRightGradient && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />}

      <div
        ref={scrollContainerRef}
        className="px-4 py-3 overflow-x-auto scrollbar-hide flex space-x-2 scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categories.map((category) => {
          const isActive = String(category.id) === id;
          return (
            <TransitionLink
              to={`/category/${category.id}`}
              key={category.id}
              className={`group h-10 flex-none rounded-full px-3 flex items-center space-x-2 border transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primaryForeground border-primary shadow-md scale-105"
                  : "bg-white text-foreground border-black/10 hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <div className={`w-6 h-6 rounded-full overflow-hidden ${isActive ? "ring-2 ring-primaryForeground/20" : ""}`}>
                <img src={category.image} className={`w-full h-full object-cover bg-skeleton`} alt={category.name} loading="lazy" />
              </div>
              <p
                className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive ? "text-primaryForeground" : "text-foreground group-hover:text-primary"
                }`}
              >
                {category.name}
              </p>
            </TransitionLink>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
