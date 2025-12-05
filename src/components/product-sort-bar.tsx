import { useState } from "react";
import { Category } from "@/types";

export type SortOption = "default" | "price-asc" | "price-desc" | "name-asc";

interface ProductSortBarProps {
  selectedCategory: number | null;
  categories: Category[];
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Mặc định" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "name-asc", label: "Tên A-Z" },
];

export default function ProductSortBar({ selectedCategory, categories, sortOption, onSortChange }: ProductSortBarProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <div className="bg-white border-b border-black/5 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="text-sm text-subtitle">{selectedCategory ? `Danh mục: ${categories.find((c) => c.id === selectedCategory)?.name}` : "Tất cả danh mục"}</div>
      <div className="relative">
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:border-primary/30 transition-colors text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span>{sortOptions.find((opt) => opt.value === sortOption)?.label}</span>
          <svg className={`w-3 h-3 transition-transform duration-200 ${showSortMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showSortMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-black/10 min-w-[160px] z-40 overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-section ${
                    sortOption === option.value ? "bg-primary/10 text-primary font-medium" : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
