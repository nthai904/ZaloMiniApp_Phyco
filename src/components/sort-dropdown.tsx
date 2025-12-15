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
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 px-3 py-1 border rounded shadow-sm bg-white">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18M7 12h10M10 18h4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm">{label}</span>
        <svg className={`transition-transform ${open ? "rotate-180" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-white border rounded shadow-lg z-40">
          <ul>
            <li>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${value === "none" ? "font-semibold" : ""}`}
                onClick={() => {
                  onChange("none");
                  setOpen(false);
                }}
              >
                Mặc định
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${value === "price-asc" ? "font-semibold" : ""}`}
                onClick={() => {
                  onChange("price-asc");
                  setOpen(false);
                }}
              >
                Giá tăng dần
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${value === "price-desc" ? "font-semibold" : ""}`}
                onClick={() => {
                  onChange("price-desc");
                  setOpen(false);
                }}
              >
                Giá giảm dần
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${value === "date-new" ? "font-semibold" : ""}`}
                onClick={() => {
                  onChange("date-new");
                  setOpen(false);
                }}
              >
                Mới nhất
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${value === "date-old" ? "font-semibold" : ""}`}
                onClick={() => {
                  onChange("date-old");
                  setOpen(false);
                }}
              >
                Cũ nhất
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
