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
  const [showCategories, setShowCategories] = useState(false);
  const [sortOrder, setSortOrder] = useState<"none" | "price-asc" | "price-desc" | "date-new" | "date-old">("none");
  const [activeCollection, setActiveCollection] = useState<string | number | undefined>(undefined);
  const [searchParams, setSearchParams] = useSearchParams();

  const [isParentOpen, setIsParentOpen] = useState(true);
  useEffect(() => {
    const a = searchParams.get("active");
    if (a) {
      setActiveCollection(a);
    } else {
      setActiveCollection(undefined);
    }
  }, [searchParams]);

  function handleCategoryChange(id?: string | number) {
    console.log("[ProductsPage] handleCategoryChange ->", id);
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
          <div>
            {/* <button
              onClick={() => setShowCategories(true)}
              aria-label="Mở danh mục"
              title="Danh mục"
              className="h-10 w-10 grid place-items-center rounded-full bg-white/90 border border-gray-200 shadow-sm hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-main/30 transition-all"
            >
              <svg
                className="w-5 h-5 text-subtitle"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-2">
          <div className="flex items-center gap-3 pb-0">{/* <SortDropdown value={sortOrder} onChange={(v) => setSortOrder(v)} /> */}</div>
          <CategoryFilterBar onSelect={handleCategoryChange} active={activeCollection} />

          <Suspense fallback={<div className="h-10" />}></Suspense>
        </div>

        <div className="px-2 pt-2">
          <Suspense fallback={<ProductGridSkeleton className="pt-4" />}>
            <NewProductList collectionId={activeCollection} enablePagination={true} perPage={10} />
          </Suspense>
        </div>
      </div>

      <div className={`fixed inset-0 z-40 ${showCategories ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!showCategories}>
        <div
          onClick={() => setShowCategories(false)}
          className={`pointer-events-${showCategories ? "auto" : "none"} absolute left-0 right-0 top-[100px] bottom-0 bg-black/40 transition-opacity ${
            showCategories ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`fixed top-[100px] left-0 bottom-0 w-[84%] max-w-xs bg-white shadow-lg transform transition-transform ${
            showCategories ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="font-semibold">Danh mục</div>
            </div>
            <button
              onClick={() => setShowCategories(false)}
              aria-label="Đóng"
              title="Đóng"
              className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-subtitle transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="p-3 overflow-y-auto h-full">
            <ul className="space-y-2">
              <li>
                <button
                  className="w-full text-left py-3 px-2 rounded hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => setIsParentOpen((prev) => !prev)}
                  aria-expanded={isParentOpen}
                >
                  <span>Thực phẩm, đồ uống</span>
                  <span className={`text-subtitle transform transition-transform ${isParentOpen ? "rotate-90" : "rotate-0"}`}>›</span>
                </button>

                {isParentOpen && (
                  <div className="mt-2">
                    <ChildCategoryList
                      active={activeCollection}
                      onSelect={(id) => {
                        handleCategoryChange(id);
                        setShowCategories(false);
                      }}
                    />
                  </div>
                )}
              </li>

              <li>
                <button
                  onClick={() => {
                    handleCategoryChange(undefined);
                    setShowCategories(false);
                  }}
                  className="w-full text-left py-3 px-2 rounded hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>Bách hoá Online</span>
                  <span className="text-subtitle">›</span>
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    handleCategoryChange(undefined);
                    setShowCategories(false);
                  }}
                  className="w-full text-left py-3 px-2 rounded hover:bg-gray-50 flex items-center justify-between"
                >
                  <span>Thời trang, phụ kiện</span>
                  <span className="text-subtitle">›</span>
                </button>
              </li>
            </ul>
          </div>
        </aside>
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

        collectionArray = collectionArray.filter((c) => c != null && (c.published_scope ?? c.publishedScope ?? "") === "web");

        const mappedCollections = collectionArray.map((c: any) => ({
          id: c.id ?? 0,
          title: c.title ?? "",
          handle: c.handle ?? "",
          image: c.image ?? null,
        }));

        const collectRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect`);
        const collectData = await collectRes.json();
        const allCollects = collectData?.collects ?? collectData ?? [];

        const collectionsWithProducts = mappedCollections.filter((collection) => {
          if (!Array.isArray(allCollects)) return false;

          const filteredCollects = allCollects.filter((c: any) => String(c.collection_id) === String(collection.id));

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
              <div
                className={`${
                  active == null ? "text-main font-semibold" : "text-subtitle"
                } text-xs leading-tight break-words whitespace-normal text-center max-h-[32px] overflow-hidden`}
              >
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
                  <div
                    className={`text-xs leading-tight break-words whitespace-normal text-center max-h-[32px] overflow-hidden ${
                      String(active) === String(c.id) ? "text-main font-semibold" : "text-subtitle"
                    }`}
                  >
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

function ChildCategoryList({ onSelect, active }: { onSelect?: (id?: string | number) => void; active?: string | number }) {
  const [items, setItems] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collection/`);
        const data = await res.json();

        let collectionArray: any[] = [];
        if (data.custom_collections && Array.isArray(data.custom_collections)) collectionArray = data.custom_collections;
        else if (Array.isArray(data)) collectionArray = data;
        else if (data.collections && Array.isArray(data.collections)) collectionArray = data.collections;

        // Only include collections that are published to web
        collectionArray = collectionArray.filter((c) => c != null && (c.published_scope ?? c.publishedScope ?? "") === "web");

        const mappedCollections = collectionArray.map((c: any) => ({ id: c.id ?? 0, title: c.title ?? "", handle: c.handle ?? "", image: c.image ?? null }));

        // fetch collects to ensure collections have products
        const collectRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect`);
        const collectData = await collectRes.json();
        const allCollects = collectData?.collects ?? collectData ?? [];

        const filtered = mappedCollections.filter((collection) => {
          if (!Array.isArray(allCollects)) return false;
          const filteredCollects = allCollects.filter((c: any) => String(c.collection_id) === String(collection.id));
          return filteredCollects.length > 0;
        });

        if (mounted) setItems(filtered);
      } catch (err) {
        console.error(err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="py-3 border-b">
            <div className="h-4 w-3/4 bg-skeleton animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white">
      <ul>
        {items.map((c) => (
          <li key={c.id} className="border-b">
            <button
              data-collection-id={String(c.id)}
              onClick={() => {
                console.log("[ChildCategoryList] click:", c.id, c.title);
                onSelect?.(c.id);
              }}
              className={`w-full text-left py-3 px-3 flex items-center gap-3 ${String(active) === String(c.id) ? "text-main font-medium" : "text-subtitle"}`}
            >
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              <span className="truncate">{c.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
