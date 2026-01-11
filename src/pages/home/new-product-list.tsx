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
}

export default function NewProductList({ collectionId }: NewProductListProps = {}) {
  const [products, setProducts] = useState<ProductV2[]>([]);

  useEffect(() => {
    if (collectionId) {
      // Fetch collects để lấy product_ids của collection
      fetch(`https://api-server-nuj6.onrender.com/api/collect?collection_id=${collectionId}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("🔥 COLLECT DATA FROM SERVER:", data);

          const collects = data?.collects ?? data ?? [];
          if (!Array.isArray(collects) || collects.length === 0) {
            setProducts([]);
            return;
          }

          // Lấy danh sách product_ids
          const productIds = Array.from(new Set(collects.map((c: any) => Number(c.product_id)).filter(Boolean)));

          if (productIds.length === 0) {
            setProducts([]);
            return;
          }

          // Fetch từng product theo id
          Promise.all(
            productIds.map((id) =>
              fetch(`https://api-server-nuj6.onrender.com/api/product/${id}`)
                .then((res) => res.json())
                .then((data) => {
                  const productData = data?.product ?? data;
                  return productData;
                })
                .catch((err) => {
                  console.error(`❌ Error fetching product ${id}:`, err);
                  return null;
                })
            )
          )
            .then((productsData) => {
              const validProducts = productsData.filter((p) => p != null);
              const transformedProducts = validProducts.map(mapProductToV2);
              setProducts(transformedProducts);
            })
            .catch((err) => {
              console.error("❌ API ERROR:", err);
              setProducts([]);
            });
        })
        .catch((err) => {
          console.error("❌ API ERROR (collects):", err);
          setProducts([]);
        });
    } else {
      // Không có collectionId, fetch tất cả sản phẩm
      fetch("https://api-server-nuj6.onrender.com/api/product")
        .then((res) => res.json())
        .then((data) => {
          console.log("🔥 PRODUCT DATA FROM SERVER:", data);

          let productArray: any[] = [];

          if (Array.isArray(data)) {
            productArray = data;
          } else if (data.products && Array.isArray(data.products)) {
            productArray = data.products;
          } else if (data) {
            productArray = [data];
          }

          const transformedProducts = productArray.filter((p) => p != null).map(mapProductToV2);
          setProducts(transformedProducts);
        })
        .catch((err) => {
          console.error("❌ API ERROR:", err);
          setProducts([]);
        });
    }
  }, [collectionId]);

  if (products.length === 0) {
    return null;
  }

  return <ProductGridV2 products={products} />;
}
