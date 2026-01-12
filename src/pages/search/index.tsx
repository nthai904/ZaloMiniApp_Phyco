import ProductItem from "@/components/product-item";
import Section from "@/components/section";
import { ProductItemSkeleton } from "@/components/skeleton";
import { useAtomValue } from "jotai";
import { HTMLAttributes, Suspense, useEffect, useState, useMemo } from "react";
import { keywordState } from "@/state";
import ProductGrid from "@/components/product-grid";
import { EmptySearchResult } from "@/components/empty";
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

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim();
}

export function SearchResult() {
  const keyword = useAtomValue(keywordState);
  const [allProducts, setAllProducts] = useState<ProductV2[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product`)
      .then((res) => res.json())
      .then((data) => {
        let productArray: any[] = [];

        if (Array.isArray(data)) {
          productArray = data;
        } else if (data.products && Array.isArray(data.products)) {
          productArray = data.products;
        } else if (data) {
          productArray = [data];
        }

        const transformedProducts = productArray.filter((p) => p != null).map(mapProductToV2);
        setAllProducts(transformedProducts);
      })
      .catch((err) => {
        console.error("❌ API ERROR:", err);
        setAllProducts([]);
      });
  }, []);

  const searchResult = useMemo(() => {
    const q = keyword.trim();
    if (!q) return [];

    const qNorm = normalizeForSearch(q);
    return allProducts.filter((p) => {
      const title = normalizeForSearch(p.title || "");
      return title.includes(qNorm);
    });
  }, [keyword, allProducts]);

  return (
    <div className="w-full h-full space-y-2 bg-background mt-10">
      <Section title={`Kết quả (${searchResult.length})`} className="h-full flex flex-col overflow-y-auto pb-16">
        {searchResult.length ? <ProductGrid products={searchResult} /> : <EmptySearchResult />}
      </Section>
    </div>
  );
}

export function SearchResultSkeleton() {
  return (
    <Section title={`Kết quả`} className="mt-10">
      <ProductGridSkeleton />
    </Section>
  );
}

export function ProductGridSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={"grid grid-cols-2 px-4 pt-2 pb-8 gap-4 ".concat(className ?? "")} {...props}>
      <ProductItemSkeleton />
      <ProductItemSkeleton />
      <ProductItemSkeleton />
      <ProductItemSkeleton />
    </div>
  );
}

export function RecommendedProducts() {
  const [recommendedProducts, setRecommendedProducts] = useState<ProductV2[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/product`)
      .then((res) => res.json())
      .then((data) => {
        let productArray: any[] = [];

        if (Array.isArray(data)) {
          productArray = data;
        } else if (data.products && Array.isArray(data.products)) {
          productArray = data.products;
        } else if (data) {
          productArray = [data];
        }

        const transformedProducts = productArray.filter((p) => p != null).map(mapProductToV2);
        setRecommendedProducts(transformedProducts.slice(0, 10));
      })
      .catch((err) => {
        console.error("❌ API ERROR:", err);
        setRecommendedProducts([]);
      });
  }, []);

  return (
    <Section title="Gợi ý sản phẩm" className="mt-10">
      <div className="py-2 px-4 pb-6 flex space-x-2 overflow-x-auto">
        {recommendedProducts.map((product) => (
          <div key={product.id} className="flex-none" style={{ flexBasis: "calc((100vw - 48px) / 2)" }}>
            <ProductItem key={product.id} product={product} />
          </div>
        ))}
      </div>
    </Section>
  );
}

export default function SearchPage() {
  const keyword = useAtomValue(keywordState);

  if (keyword) {
    return (
      <Suspense fallback={<SearchResultSkeleton />}>
        <SearchResult />
      </Suspense>
    );
  }
  return <RecommendedProducts />;
}
