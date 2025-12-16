import React, { useEffect, useRef, useState } from "react";

export default function SortDropdown({
  value,
  onChange,
}: {
  value: "none" | "price-asc" | "price-desc" | "date-new" | "date-old";
  onChange: (v: "none" | "price-asc" | "price-desc" | "date-new" | "date-old") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const label = value === "none" ? "Mặc định" : value === "price-asc" ? "Giá tăng dần" : value === "price-desc" ? "Giá giảm dần" : value === "date-new" ? "Mới nhất" : "Cũ nhất";
  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-3 px-3 py-2 border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <path d="M3 6h18M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <svg className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-40 ring-1 ring-black ring-opacity-5">
          <ul role="menu" aria-label="Sắp xếp" className="py-2">
            {[
              { key: "none", label: "Mặc định", icon: "dots" },
              { key: "price-asc", label: "Giá tăng dần", icon: "arrow-up" },
              { key: "price-desc", label: "Giá giảm dần", icon: "arrow-down" },
              { key: "date-new", label: "Mới nhất", icon: "clock" },
              { key: "date-old", label: "Cũ nhất", icon: "clock" },
            ].map((opt) => (
              <li key={opt.key} role="none">
                <button
                  role="menuitem"
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition hover:bg-gray-50 ${value === opt.key ? "bg-primary/5 font-semibold" : "text-foreground"}`}
                  onClick={() => {
                    onChange(opt.key as any);
                    setOpen(false);
                  }}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-primary">
                    {opt.icon === "arrow-up" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 19V6M5 13l7-7 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {opt.icon === "arrow-down" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v13M19 11l-7 7-7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {opt.icon === "clock" && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    )}
                    {opt.icon === "dots" && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h.01M12 12h.01M19 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>

                  <span className="flex-1 text-left">{opt.label}</span>

                  {value === opt.key && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
