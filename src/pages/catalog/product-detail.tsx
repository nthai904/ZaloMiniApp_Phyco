import { useEffect, useState } from "react";
import HorizontalDivider from "@/components/horizontal-divider";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";
import { formatPrice } from "@/utils/format";
import ShareButton from "./share-buttont";
import RelatedProducts from "./related-products";
import { useAddToCartV2 } from "@/hooksv2";
import { Button } from "zmp-ui";
import Section from "@/components/section";
import { productDetailState, fetchProductDetailState } from "@/api/state";

export default function ProductDetailPage() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const fetchDetail = useSetAtom(fetchProductDetailState);
  const product = useAtomValue(productDetailState(Number(id)));

  const { addToCart } = useAddToCartV2(product ?? (null as any));
  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

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

  useEffect(() => {
    if (id) fetchDetail(Number(id));
  }, [id, fetchDetail]);

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
