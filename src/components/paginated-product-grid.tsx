import React, { useEffect, useState } from "react";
import ProductGridV2 from "@/components/product-grid";
import { fetchProductsPage } from "@/api/haravan";
import { ProductV2 } from "@/types";

interface Props {
  initialPage?: number;
  perPage?: number;
  sortOrder?: "none" | "price-asc" | "price-desc" | "date-new" | "date-old";
}

export default function PaginatedProductGrid({ initialPage = 1, perPage = 20, sortOrder = "none" }: Props) {
  const [page, setPage] = useState(initialPage);
  const [products, setProducts] = useState<ProductV2[]>([]);
  const [allProductsCache, setAllProductsCache] = useState<ProductV2[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [isAppend, setIsAppend] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPage() {
      setLoading(true);
      setError(null);
      try {
        const { products: pageProducts, total_pages } = await fetchProductsPage(page, perPage);
        if (cancelled) return;
        if (isAppend) {
          setProducts((prev) => [...prev, ...pageProducts]);
        } else {
          setProducts(pageProducts);
        }
        setHasMore(pageProducts.length >= perPage && (total_pages == null || page < (total_pages || 0)));
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message ?? "Lỗi tải sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
        setIsAppend(false);
      }
    }

    // If user requested global sort (non-default), fetch all products once and cache
    const isGlobalSort = sortOrder !== "none";

    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const perFetch = Math.max(perPage, 50);
        const first = await fetchProductsPage(1, perFetch);
        let all = first.products.slice();
        if (first.total_pages && first.total_pages > 1) {
          for (let p = 2; p <= first.total_pages; p++) {
            const res = await fetchProductsPage(p, perFetch);
            all = all.concat(res.products);
          }
        } else {
          // fallback: keep fetching until a shorter page returned
          let p = 2;
          while (true) {
            const res = await fetchProductsPage(p, perFetch);
            if (!res.products || res.products.length === 0) break;
            all = all.concat(res.products);
            if (res.products.length < perFetch) break;
            p++;
          }
        }
        if (cancelled) return;
        setAllProductsCache(all);
        setProducts(all.slice((page - 1) * perPage, page * perPage));
        setHasMore(page * perPage < all.length);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message ?? "Lỗi tải sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
        setIsAppend(false);
      }
    }

    if (isGlobalSort) {
      // reset page and fetch all products to apply global sort
      if (!allProductsCache) {
        setPage(1);
        fetchAll();
      } else {
        // already cached: just slice for current page
        setProducts(allProductsCache.slice((page - 1) * perPage, page * perPage));
        setHasMore(page * perPage < (allProductsCache || []).length);
        setIsAppend(false);
      }
    } else {
      // clear cache when returning to paginated mode
      setAllProductsCache(null);
      loadPage();
    }

    return () => {
      cancelled = true;
    };
  }, [page, perPage, isAppend, sortOrder, allProductsCache]);

  function handleLoadMore() {
    setIsAppend(true);
    setPage((p) => p + 1);
  }

  function handlePrev() {
    if (page <= 1) return;
    setIsAppend(false);
    setPage((p) => p - 1);
  }

  function handleGoTo(p: number) {
    setIsAppend(false);
    setPage(p);
  }

  return (
    <div className="p-1">
      {error && <div className="mb-4 text-red-600">Có lỗi: {error}</div>}

      {/* If we have an all-products cache (global sort mode), sort the full list then slice for current page */}
      {allProductsCache ? (
        (() => {
          const all = allProductsCache.slice();
          if (sortOrder === "price-asc") {
            all.sort((a, b) => Number((a as any).price ?? a.variants?.[0]?.price ?? 0) - Number((b as any).price ?? b.variants?.[0]?.price ?? 0));
          } else if (sortOrder === "price-desc") {
            all.sort((a, b) => Number((b as any).price ?? b.variants?.[0]?.price ?? 0) - Number((a as any).price ?? a.variants?.[0]?.price ?? 0));
          } else if (sortOrder === "date-new") {
            all.sort(
              (a, b) => (Date.parse((b as any).created_at ?? (b as any).published_at ?? "") || 0) - (Date.parse((a as any).created_at ?? (a as any).published_at ?? "") || 0)
            );
          } else if (sortOrder === "date-old") {
            all.sort(
              (a, b) => (Date.parse((a as any).created_at ?? (a as any).published_at ?? "") || 0) - (Date.parse((b as any).created_at ?? (b as any).published_at ?? "") || 0)
            );
          }

          const start = (page - 1) * perPage;
          const sliced = all.slice(start, start + perPage);
          return <ProductGridV2 products={sliced} />;
        })()
      ) : (
        /* server-paginated mode (no global sort) — render server page as-is */
        <ProductGridV2 products={products} />
      )}

      {/* Pagination */}
      <div className="pb-9 flex items-center justify-center gap-2">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={page <= 1 || loading}
          className={`px-4 py-2 rounded border 
          ${page <= 1 || loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Trang trước
        </button>

        <span className="text-sm px-2 opacity-70">Trang {page}</span>

        {/* Next */}
        <button
          onClick={() => {
            setIsAppend(false);
            setPage(page + 1);
          }}
          disabled={!hasMore || loading}
          className={`px-4 py-2 rounded border 
          ${!hasMore || loading ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
