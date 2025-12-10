import Section from "@/components/section";
import { useAtomValue } from "jotai";
import TransitionLink from "@/components/transition-link";
import ProductGridV2 from "@/components/product-gridv2";
import { productsState } from "@/api/state";

export default function ProductListV2() {
  const products = useAtomValue(productsState);

  return (
    <Section
      title={
        <div className="flex items-center justify-between w-full">
          <span>Danh sách sản phẩm</span>
          <TransitionLink to="/products" className="text-xs text-primary font-medium hover:underline">
            Xem tất cả →
          </TransitionLink>
        </div>
      }
    >
      <ProductGridV2 products={products} />
    </Section>
  );
}
