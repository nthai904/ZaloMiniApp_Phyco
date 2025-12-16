import { collectionsState, productsByCollectionState } from "@/api/state";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductItemV2 from "@/components/product-item";

export default function CategoryListPage() {
  const collections = useAtomValue(collectionsState) as any[];
  const [activeCollection, setActiveCollection] = useState<number | string | null>(null);
  const products = useAtomValue(productsByCollectionState(activeCollection ?? ""));
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeCollection && Array.isArray(collections) && collections.length > 0) {
      setActiveCollection(collections[0].id);
    }
  }, [collections, activeCollection]);

  return (
    <div className="p-3">
      <div className="flex gap-3 overflow-x-auto pb-3">
        {collections.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setActiveCollection(c.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap border ${
              activeCollection === c.id ? "bg-primary text-white border-primary" : "bg-white text-foreground border-gray-200"
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Array.isArray(products) && products.length > 0 ? (
          products.map((p: any) => (
            <div key={p.id}>
              <ProductItemV2 product={p} />
            </div>
          ))
        ) : (
          <div className="text-center text-subtitle col-span-2 py-8">Chưa có sản phẩm trong danh mục này.</div>
        )}
      </div>
    </div>
  );
}
