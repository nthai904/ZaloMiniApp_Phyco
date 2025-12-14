import React, { useEffect, useState } from "react";
import ProductGridV2 from "@/components/product-gridv2";
import { fetchProductsPage } from "@/api/haravan";
import { ProductV2 } from "@/types";

interface Props {
  initialPage?: number;
  perPage?: number;
}

export default function PaginatedProductGrid({ initialPage = 1, perPage = 20 }: Props) {
  const [page, setPage] = useState(initialPage);
  const [products, setProducts] = useState<ProductV2[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [isAppend, setIsAppend] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { products: pageProducts } = await fetchProductsPage(page, perPage);
        if (cancelled) return;
        if (isAppend) {
          setProducts((prev) => [...prev, ...pageProducts]);
        } else {
          setProducts(pageProducts);
        }
        setHasMore(pageProducts.length >= perPage);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message ?? "Lỗi tải sản phẩm");
      } finally {
        if (!cancelled) setLoading(false);
        setIsAppend(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, perPage, isAppend]);

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

      <ProductGridV2 products={products} />

      {/* Pagination */}
      <div className="pb-3 flex items-center justify-center gap-2">
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
