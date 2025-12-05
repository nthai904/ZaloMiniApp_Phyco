import { Category } from "@/types";

interface EmptyProductListProps {
  selectedCategory: number | null;
  categories: Category[];
  onResetFilter: () => void;
}

export default function EmptyProductList({ selectedCategory, categories, onResetFilter }: EmptyProductListProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[400px]">
      <h3 className="text-xl font-semibold text-foreground mb-2">Không có sản phẩm</h3>
      <p className="text-sm text-subtitle text-center mb-6 max-w-xs">
        {selectedCategory
          ? `Không tìm thấy sản phẩm nào trong danh mục "${categories.find((c) => c.id === selectedCategory)?.name}".`
          : "Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại."}
      </p>
    </div>
  );
}
