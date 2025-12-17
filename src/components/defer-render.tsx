import React, { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  rootMargin?: string;
  placeholder?: React.ReactNode;
}

export default function DeferRender({ children, rootMargin = "200px", placeholder = null }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setActive(true);
            io.disconnect();
          }
        });
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active, rootMargin]);

  return <div ref={ref}>{active ? children : placeholder}</div>;
}
