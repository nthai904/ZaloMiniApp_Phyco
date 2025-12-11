import { Suspense } from "react";
import { ProductGridSkeleton } from "../search";
import ProductListV2 from "../home/product-list";

export default function ProductsPage() {
  return (
    <div className="h-full flex flex-col bg-section">
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
          <ProductListV2 />
        </Suspense>
      </div>
    </div>
  );
}
