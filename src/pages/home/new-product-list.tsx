import React, { useEffect, useState } from "react";
import ProductGridV2 from "@/components/product-grid";
import { ProductV2 } from "@/types";

function mapProductToV2(p: any): ProductV2 {
  if (!p) {
    return {
      body_html: "",
      body_plain: null,
      created_at: new Date().toISOString(),
      handle: "",
      id: 0,
      images: [{ src: "" }],
      product_type: "",
      published_at: new Date().toISOString(),
      published_scope: "global",
      tags: "",
      template_suffix: "",
      title: "",
      updated_at: new Date().toISOString(),
      variants: [],
      vendor: "",
      options: [],
      only_hide_from_list: false,
      not_allow_promotion: false,
    } as ProductV2;
  }

  // If already in ProductV2 format, return as is
  if (p.variants || (p.images && Array.isArray(p.images)) || p.title) {
    return p as ProductV2;
  }

  // Transform from other formats
  const price = Number(p.price ?? p.variants?.[0]?.price ?? 0);
  return {
    body_html: p.detail ?? p.body_html ?? "",
    body_plain: p.detail ?? p.body_plain ?? null,
    created_at: p.created_at ?? new Date().toISOString(),
    handle: String(p.handle ?? p.id ?? ""),
    id: Number(p.id ?? 0),
    images: p.images && Array.isArray(p.images) ? p.images.map((img: any) => ({ src: img.src ?? img ?? "" })) : [{ src: p.image ?? "" }],
    product_type: p.category?.name ?? p.product_type ?? "",
    published_at: p.published_at ?? new Date().toISOString(),
    published_scope: "global",
    tags: p.tags ?? "",
    template_suffix: p.template_suffix ?? "",
    title: p.name ?? p.title ?? "",
    updated_at: p.updated_at ?? new Date().toISOString(),
    variants:
      p.variants && Array.isArray(p.variants) && p.variants.length > 0
        ? p.variants
        : [
            {
              barcode: null,
              compare_at_price: 0,
              created_at: new Date().toISOString(),
              fulfillment_service: null,
              grams: 0,
              id: Number(p.id ?? 0),
              inventory_management: null,
              inventory_policy: "deny",
              inventory_quantity: 0,
              old_inventory_quantity: 0,
              inventory_quantity_adjustment: 0,
              position: 0,
              price,
              product_id: Number(p.id ?? 0),
              requires_shipping: true,
              sku: null,
              taxable: false,
              title: "Default",
              updated_at: new Date().toISOString(),
              image_id: null,
              option1: null,
              option2: null,
              option3: null,
              inventory_advance: null,
            },
          ],
    vendor: p.vendor ?? "",
    options: p.options ?? [],
    only_hide_from_list: false,
    not_allow_promotion: false,
  } as ProductV2;
}

interface NewProductListProps {
  collectionId?: string | number;
  enablePagination?: boolean;
  perPage?: number;
}

export default function NewProductList({ collectionId, enablePagination = false, perPage = 20 }: NewProductListProps = {}) {
  const [products, setProducts] = useState<ProductV2[]>([]);
  const [allProducts, setAllProducts] = useState<ProductV2[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState<number | undefined>(undefined);

  // Reset page when collectionId changes
  useEffect(() => {
    setPage(1);
  }, [collectionId]);

  // Fetch all products when collectionId or enablePagination changes
  useEffect(() => {
    let cancelled = false;

    async function loadAllProducts() {
      if (!enablePagination) return;

      setLoading(true);
      setAllProducts([]);

      try {
        let productArray: any[] = [];

        if (collectionId) {
          const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect`);
          const data = await res.json();
          const collects = data?.collects ?? data ?? [];

          if (!Array.isArray(collects) || collects.length === 0) {
            if (cancelled) return;
            setAllProducts([]);
            return;
          }

          const filteredCollects = collects.filter((c: any) => String(c.collection_id) === String(collectionId));

          if (filteredCollects.length === 0) {
            if (cancelled) return;
            setAllProducts([]);
            return;
          }

          const productIds = Array.from(new Set(filteredCollects.map((c: any) => Number(c.product_id)).filter(Boolean)));

          if (productIds.length === 0) {
            if (cancelled) return;
            setAllProducts([]);
            return;
          }

          const productsData = await Promise.all(
            productIds.map((id) =>
              fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product/${id}`)
                .then((res) => res.json())
                .then((data) => data?.product ?? data)
                .catch(() => null)
            )
          );

          if (cancelled) return;
          productArray = productsData.filter((p) => p != null);
        } else {
          const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product`);
          const data = await res.json();

          if (Array.isArray(data)) {
            productArray = data;
          } else if (data.products && Array.isArray(data.products)) {
            productArray = data.products;
          } else if (data) {
            productArray = [data];
          }
        }

        if (cancelled) return;

        const transformedProducts = productArray.filter((p) => p != null).map(mapProductToV2);
        setAllProducts(transformedProducts);
      } catch (err) {
        if (cancelled) return;
        console.error("❌ API ERROR:", err);
        setAllProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAllProducts();

    return () => {
      cancelled = true;
    };
  }, [collectionId, enablePagination]);

  useEffect(() => {
    if (!enablePagination) return;

    const total = allProducts.length;
    const calculatedTotalPages = Math.ceil(total / perPage);
    setTotalPages(calculatedTotalPages);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedProducts = allProducts.slice(start, end);
    setProducts(paginatedProducts);

    setHasMore(page < calculatedTotalPages);
  }, [page, allProducts, perPage, enablePagination]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      if (enablePagination) {
        return;
      }

      setLoading(true);

      try {
        if (collectionId) {
          const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/collect`);
          const data = await res.json();
          const collects = data?.collects ?? data ?? [];

          if (!Array.isArray(collects) || collects.length === 0) {
            setProducts([]);
            return;
          }

          const filteredCollects = collects.filter((c: any) => String(c.collection_id) === String(collectionId));

          if (filteredCollects.length === 0) {
            setProducts([]);
            return;
          }

          const productIds = Array.from(new Set(filteredCollects.map((c: any) => Number(c.product_id)).filter(Boolean)));

          if (productIds.length === 0) {
            setProducts([]);
            return;
          }

          const productsData = await Promise.all(
            productIds.map((id) =>
              fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product/${id}`)
                .then((res) => res.json())
                .then((data) => data?.product ?? data)
                .catch(() => null)
            )
          );

          if (cancelled) return;
          const validProducts = productsData.filter((p) => p != null);
          const transformedProducts = validProducts.map(mapProductToV2);
          setProducts(transformedProducts);
        } else {
          const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product`);
          const data = await res.json();

          let productArray: any[] = [];
          if (Array.isArray(data)) {
            productArray = data;
          } else if (data.products && Array.isArray(data.products)) {
            productArray = data.products;
          } else if (data) {
            productArray = [data];
          }

          if (cancelled) return;
          const transformedProducts = productArray.filter((p) => p != null).map(mapProductToV2);
          setProducts(transformedProducts);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("❌ API ERROR:", err);
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [collectionId, enablePagination]);

  function handlePrev() {
    if (page <= 1) return;
    setPage((p) => p - 1);
  }

  function handleNext() {
    if (!hasMore) return;
    setPage((p) => p + 1);
  }

  if (products.length === 0 && !loading) {
    return null;
  }

  if (loading && products.length === 0) {
    return <div className="text-center py-6 text-subtitle">Đang tải sản phẩm...</div>;
  }

  return (
    <div>
      <ProductGridV2 products={products} />

      {enablePagination && products.length > 0 && (
        <div className="pb-4 pt-2 flex items-center justify-center gap-4">
          <button
            onClick={handlePrev}
            disabled={page <= 1 || loading}
            aria-label="Trang trước"
            title="Trang trước"
            className={`p-2 rounded-full border flex items-center justify-center transition-colors duration-150 ${
              page <= 1 || loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 active:scale-95"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <span className="text-sm px-2 opacity-70">
            Trang {page}
            {totalPages ? ` / ${totalPages}` : ""}
          </span>

          <button
            onClick={handleNext}
            disabled={!hasMore || loading}
            aria-label="Trang sau"
            title="Trang sau"
            className={`p-2 rounded-full border flex items-center justify-center transition-colors duration-150 ${
              !hasMore || loading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50 active:scale-95"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
