import { Outlet } from "react-router-dom";
import Header from "./header";
import Footer from "./footer";
import { Suspense, useEffect, useRef, useState } from "react";
import { PageSkeleton } from "./skeleton";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "./scroll-restoration";
import FloatingCartPreview from "./floating-cart-preview";

export default function Layout() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showHeaderOverlay, setShowHeaderOverlay] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollTop = useRef(0);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollTop = scrollContainer.scrollTop;
          const scrollDifference = Math.abs(currentScrollTop - lastScrollTop.current);
          const threshold = 5; // Ngưỡng tối thiểu để tránh giật khi scroll nhỏ
          const showDistance = 22; // Khoảng cách từ đầu trang để hiện HeaderOverlay khi cuộn lên
          const hideDistance = 60; // Khoảng cách tối thiểu cần cuộn xuống trước khi ẩn HeaderOverlay

          setIsScrolled(currentScrollTop > 50);

          if (currentScrollTop === 0) {
            setShowHeaderOverlay(true);
          } else if (scrollDifference >= threshold) {
            if (currentScrollTop > lastScrollTop.current) {
              if (currentScrollTop > hideDistance) {
                setShowHeaderOverlay(false);
              }
            } else {
              if (currentScrollTop <= showDistance) {
                setShowHeaderOverlay(true);
              }
            }
          }

          lastScrollTop.current = currentScrollTop;
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-section text-foreground">
      <Header showHeaderOverlay={showHeaderOverlay} isScrolled={isScrolled} />
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-background">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <Toaster
        containerClassName="toast-container"
        containerStyle={{
          top: "calc(50% - 24px)",
        }}
      />
      <FloatingCartPreview />
      <ScrollRestoration />
    </div>
  );
}
