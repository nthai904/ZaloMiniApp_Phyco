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
        className="inline-flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md bg-background text-sm text-foreground hover:shadow-sm transition"
      >
        <span className="text-sm font-medium">{label}</span>
        <svg className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-background border border-gray-100 rounded-md shadow-md z-40">
          <ul role="menu" aria-label="Sắp xếp" className="py-1">
            {[
              { key: "none", label: "Mặc định" },
              { key: "price-asc", label: "Giá tăng dần" },
              { key: "price-desc", label: "Giá giảm dần" },
              { key: "date-new", label: "Mới nhất" },
              { key: "date-old", label: "Cũ nhất" },
            ].map((opt) => (
              <li key={opt.key} role="none">
                <button
                  role="menuitem"
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${
                    value === opt.key ? "bg-primary/10 font-semibold text-foreground" : "text-foreground hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    onChange(opt.key as any);
                    setOpen(false);
                  }}
                >
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
