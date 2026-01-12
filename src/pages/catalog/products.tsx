import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductGridSkeleton } from "../search";
import NewProductList from "../home/new-product-list";

interface Collection {
  id: number | string;
  title: string;
  handle: string;
  image: { src: string } | string | null;
}

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

export default function ProductsPage() {
  const [sortOrder, setSortOrder] = useState<"none" | "price-asc" | "price-desc" | "date-new" | "date-old">("none");
  const [activeCollection, setActiveCollection] = useState<string | number | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const a = searchParams.get("active");
    if (a) {
      setActiveCollection(a);
    } else {
      setActiveCollection(undefined);
    }
  }, [searchParams]);

  function handleCategoryChange(id?: string | number) {
    setActiveCollection(id);
    if (id) {
      setSearchParams({ active: String(id) });
    } else {
      setSearchParams({});
    }
  }

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

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 pb-0">{/* <SortDropdown value={sortOrder} onChange={(v) => setSortOrder(v)} /> */}</div>

          <Suspense fallback={<div className="h-10" />}>
            <CategoryFilterBar active={activeCollection} onSelect={handleCategoryChange} />
          </Suspense>
        </div>

        <div className="px-2 pt-2">
          <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
            <NewProductList collectionId={activeCollection} enablePagination={true} perPage={10} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function useInitActiveFromQuery(setActive: (id?: string | number) => void) {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const a = searchParams.get("active");
    if (a) setActive(a);
  }, []);
}

function CategoryFilterBar({ onSelect, active }: { onSelect?: (id?: string | number) => void; active?: string | number }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollectionsWithProducts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collection/`);
        const data = await res.json();

        let collectionArray: any[] = [];

        if (data.custom_collections && Array.isArray(data.custom_collections)) {
          collectionArray = data.custom_collections;
        } else if (Array.isArray(data)) {
          collectionArray = data;
        } else if (data.collections && Array.isArray(data.collections)) {
          collectionArray = data.collections;
        }

        const mappedCollections = collectionArray
          .filter((c) => c != null)
          .map((c: any) => ({
            id: c.id ?? 0,
            title: c.title ?? "",
            handle: c.handle ?? "",
            image: c.image ?? null,
          }));

        // Fetch all collects once (API returns all collects, not filtered)
        const collectRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect`);
        const collectData = await collectRes.json();
        const allCollects = collectData?.collects ?? collectData ?? [];

        // Filter collections that have more than 1 product
        const collectionsWithProducts = mappedCollections.filter((collection) => {
          if (!Array.isArray(allCollects)) return false;

          // Filter collects by collection_id
          const filteredCollects = allCollects.filter((c: any) => String(c.collection_id) === String(collection.id));

          // Only return collections with more than 1 product
          return filteredCollects.length > 1;
        });

        const filteredCollections = collectionsWithProducts.filter((c) => c != null) as Collection[];
        setCollections(filteredCollections);
      } catch (err) {
        console.error("❌ API ERROR:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }

    loadCollectionsWithProducts();
  }, []);

  function handleClick(id?: string | number) {
    onSelect?.(id);
  }

  const activeTitle = active != null ? collections.find((c) => String(c.id) === String(active))?.title : undefined;

  return (
    <div className="relative bg-section">
      {loading ? (
        <div className="overflow-x-auto no-scrollbar -mx-4 px-0 pb-1 snap-x snap-mandatory scroll-smooth">
          <div className="flex gap-3 items-start py-1.5 pl-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-24 shrink-0 snap-center text-center">
                <div className="w-12 h-12 rounded-full bg-skeleton animate-pulse" />
                <div className="w-16 h-3 rounded bg-skeleton animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto no-scrollbar -mx-4 px-0 pb-1 snap-x snap-mandatory scroll-smooth">
          <div className="flex gap-3 items-start py-1.5 pl-1">
            <button
              onClick={() => handleClick(undefined)}
              className={`flex flex-col items-center gap-1.5 w-24 shrink-0 snap-center text-center focus:outline-none transition-transform hover:scale-105`}
              aria-pressed={active == null}
              title="Tất cả"
            >
              <div
                className={`w-12 h-12 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border transition-shadow ${
                  active == null ? "ring-1 ring-main/30 shadow-sm" : "border-gray-100"
                }`}
              >
                <img src={NO_IMAGE_URL} alt="Tất cả" className="w-full h-full object-cover" />
              </div>
              <div className={`${active == null ? "text-main font-semibold" : "text-subtitle"} text-xs leading-tight break-words whitespace-normal text-center max-h-[32px] overflow-hidden`}>
                Tất cả
              </div>
            </button>

            {collections.map((c) => {
              const img = (c?.image && (typeof c.image === "object" ? c.image.src : c.image)) || NO_IMAGE_URL;
              return (
                <button
                  key={c.id}
                  onClick={() => handleClick(c.id)}
                  className={`flex flex-col items-center gap-1.5 w-24 shrink-0 snap-center text-center focus:outline-none transition-transform hover:scale-105`}
                  aria-pressed={String(active) === String(c.id)}
                  title={c.title || c.handle}
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-skeleton flex items-center justify-center overflow-hidden border transition-shadow ${
                      String(active) === String(c.id) ? "ring-1 ring-main/30 border-main shadow-sm" : "border-gray-100"
                    }`}
                  >
                    <img src={img} alt={c.title || c.handle} className="w-full h-full object-cover" />
                  </div>
                  <div className={`text-xs leading-tight break-words whitespace-normal text-center max-h-[32px] overflow-hidden ${String(active) === String(c.id) ? "text-main font-semibold" : "text-subtitle"}`}>
                    {c.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
