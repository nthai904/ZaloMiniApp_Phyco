import { useEffect, useState } from "react";
import HorizontalDivider from "@/components/horizontal-divider";
import { useNavigate, useParams } from "react-router-dom";
import { formatPrice } from "@/utils/format";
import ShareButton from "./share-buttont";
import { useAddToCartV2 } from "@/hooks";
import { Button } from "zmp-ui";
import Section from "@/components/section";
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

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductV2 | null>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`https://api-server-nuj6.onrender.com/api/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("🔥 PRODUCT DETAIL FROM SERVER:", data);
        const productData = data?.product ?? data;
        const transformedProduct = mapProductToV2(productData);
        setProduct(transformedProduct);
      })
      .catch((err) => {
        console.error("❌ API ERROR:", err);
      });
  }, [id]);

  useEffect(() => {
    const content: string = product?.body_html ?? product?.body_plain ?? "";
    if (!content) {
      setSanitizedHtml(null);
      return;
    }

    (async () => {
      try {
        const DOMPurifyModule = await import("dompurify");
        const DOMPurify = (DOMPurifyModule && (DOMPurifyModule as any).default) || DOMPurifyModule;
        const clean = DOMPurify.sanitize(content);
        setSanitizedHtml(clean);
      } catch (e) {
        // fallback to raw content if DOMPurify unavailable
        setSanitizedHtml(content);
      }
    })();
  }, [product?.body_html, product?.body_plain]);

  const { addToCart } = useAddToCartV2(product ?? (null as any));

  if (!product) return <div className="p-4"></div>;

  const variant = product.variants?.[0];
  const price = variant?.price;
  const image = product.images?.[0]?.src ?? "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 pb-2 space-y-4 bg-section">
          <img
            key={product.id}
            src={image ?? "/placeholder.png"}
            alt={product.title}
            className="w-full h-full object-cover rounded-lg"
            style={{
              viewTransitionName: `product-image-${product.id}`,
            }}
          />
          <div>
            <div className="text-xl font-bold text-primary">{formatPrice(price)}</div>
            <div className="text-2xs space-x-0.5">{/* <span className="text-subtitle">Tồn kho: {inventory}</span> */}</div>
            <div className="text-base mt-1">{product.title}</div>
          </div>
          <ShareButton product={product} />
        </div>

        {(product.body_plain || product.body_html) && (
          <>
            <div className="bg-background h-2 w-full"></div>
            <Section title="Mô tả sản phẩm">
              <div className="text-sm text-subtitle p-4 pt-2">
                {sanitizedHtml ? <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : <div className="whitespace-pre-wrap">{product.body_plain ?? ""}</div>}
              </div>
            </Section>
          </>
        )}

        <div className="bg-background h-2 w-full"></div>
        {/* <Section title="Sản phẩm khác">
          <RelatedProducts currentProductId={product.id} />
        </Section> */}
      </div>

      <HorizontalDivider />
      <div className="flex-none grid grid-cols-2 gap-2 py-3 px-4 bg-section">
        <Button
          variant="primary"
          onClick={() => {
            addToCart(1, { toast: true });
          }}
        >
          Thêm vào giỏ
        </Button>
        <Button
          onClick={() => {
            addToCart(1);
            navigate("/cart", { viewTransition: true });
          }}
        >
          Mua ngay
        </Button>
      </div>
    </div>
  );
}
