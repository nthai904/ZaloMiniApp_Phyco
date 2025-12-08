import ProductGrid from "@/components/product-grid";
import Section from "@/components/section";
import { useAtomValue } from "jotai";
import { flashSaleProductsState, productsState } from "@/state";
import TransitionLink from "@/components/transition-link";

export default function ProductList() {
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
      <ProductGrid products={products} />
    </Section>
  );
}
