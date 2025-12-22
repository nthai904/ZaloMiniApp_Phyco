import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductGridSkeleton } from "../search";
import PaginatedProductGrid from "@/components/paginated-product-grid";
import SortDropdown from "@/components/sort-dropdown";
import { useAtomValue } from "jotai";
import { collectionsWithProductsState } from "@/api/state";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

export default function ProductsPage() {
  const [sortOrder, setSortOrder] = useState<"none" | "price-asc" | "price-desc" | "date-new" | "date-old">("none");
  const [activeCollection, setActiveCollection] = useState<string | number | undefined>(undefined);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const a = searchParams.get("active");
    if (a && !activeCollection) setActiveCollection(a);
  }, [searchParams, activeCollection]);

  return (
    <div className="h-full flex flex-col bg-section">
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Danh sách sản phẩm</h1>
            <p className="text-sm text-subtitle mt-1">Khám phá các sản phẩm của chúng tôi</p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="flex items-center gap-3 pb-0">{/* <SortDropdown value={sortOrder} onChange={(v) => setSortOrder(v)} /> */}</div>

        <Suspense fallback={<div className="h-12" />}>
          <CategoryFilterBar active={activeCollection} onSelect={(id) => setActiveCollection(id)} />
        </Suspense>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
          <PaginatedProductGrid key={`grid-${activeCollection ?? "all"}`} perPage={10} sortOrder={sortOrder} collectionId={activeCollection} />
        </Suspense>
      </div>
    </div>
  );
}

// initialize from ?active= when page first loads
function useInitActiveFromQuery(setActive: (id?: string | number) => void) {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const a = searchParams.get("active");
    if (a) setActive(a);
    // only run on mount; ignore deps intentionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function CategoryFilterBar({ onSelect, active }: { onSelect?: (id?: string | number) => void; active?: string | number }) {
  const collections = useAtomValue(collectionsWithProductsState) as any[];

  function handleClick(id?: string | number) {
    onSelect?.(id);
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x snap-mandatory scroll-smooth">
        <div className="flex gap-4 items-start py-2 pl-2">
          <button
            onClick={() => handleClick(undefined)}
            className={`flex flex-col items-center gap-2 w-24 shrink-0 snap-center text-center focus:outline-none transition-transform hover:scale-105`}
            aria-pressed={active == null}
          >
            <div
              className={`w-14 h-14 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border transition-shadow ${
                active == null ? "ring-2 ring-main/30 shadow-sm" : "border-gray-100"
              }`}
            >
              <img src={NO_IMAGE_URL} alt="Tất cả" className="w-full h-full object-cover" />
            </div>
            <div className={`${active == null ? "text-main font-semibold" : "text-subtitle"} text-xs truncate`}>Tất cả</div>
          </button>

          {Array.isArray(collections) &&
            collections.map((c) => {
              const img = (c?.image && (c.image.src || c.image)) || NO_IMAGE_URL;
              return (
                <button
                  key={c.id}
                  onClick={() => handleClick(c.id)}
                  className={`flex flex-col items-center gap-2 w-24 shrink-0 snap-center text-center focus:outline-none transition-transform hover:scale-105`}
                  aria-pressed={String(active) === String(c.id)}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border transition-shadow ${
                      String(active) === String(c.id) ? "ring-2 ring-main/30 border-main shadow-sm" : "border-gray-100"
                    }`}
                  >
                    <img src={img} alt={c.title || c.handle} className="w-full h-full object-cover" />
                  </div>
                  <div className={`text-xs truncate w-full ${String(active) === String(c.id) ? "text-main font-semibold" : "text-subtitle"}`}>{c.title}</div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
