import { Suspense } from "react";
import { ProductGridSkeleton } from "../search";
import PaginatedProductGrid from "@/components/paginated-product-grid";

export default function ProductsPage() {
  return (
    <div className="h-full flex flex-col bg-section">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Danh sách sản phẩm</h1>
            <p className="text-sm text-subtitle mt-1">Khám phá các sản phẩm của chúng tôi</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
          <PaginatedProductGrid perPage={10} />
        </Suspense>
      </div>
    </div>
  );
}
