import React, { useEffect, useRef, useState } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  placeholder?: string;
}

export default function LazyImage({ src, placeholder, className, alt, ...rest }: LazyImageProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  const imgSrc = inView && !errored ? src : placeholder ?? "";

  return (
    <div ref={ref} className={className} style={{ position: "relative", overflow: "hidden" }}>
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgSrc} alt={alt} className="w-full h-full object-cover" onError={() => setErrored(true)} {...(rest as any)} />
      ) : (
        <div className="w-full h-full bg-skeleton" />
      )}
    </div>
  );
}
