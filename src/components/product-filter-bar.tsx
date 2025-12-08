import { Category } from "@/types";

interface ProductFilterBarProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
}

export default function ProductFilterBar({ categories, selectedCategory, onCategoryChange }: ProductFilterBarProps) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto pb-2"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* All Products Filter */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
          selectedCategory === null ? "bg-primary text-primaryForeground shadow-md scale-105" : "bg-white text-foreground border border-black/10 hover:border-primary/30"
        }`}
      >
        Tất cả
      </button>

      {/* Category Filters */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
            selectedCategory === category.id ? "bg-primary text-primaryForeground shadow-md scale-105" : "bg-white text-foreground border border-black/10 hover:border-primary/30"
          }`}
        >
          <img src={category.image} className="w-5 h-5 rounded-full object-cover" alt={category.name} />
          {category.name}
        </button>
      ))}

      <style>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
