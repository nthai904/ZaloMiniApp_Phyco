import Section from "@/components/section";
import { useAtomValue } from "jotai";
import TransitionLink from "@/components/transition-link";
import ProductGridV2 from "@/components/product-grid";
import { productsState } from "@/api/state";

export default function ProductList() {
  const products = useAtomValue(productsState);

  return <ProductGridV2 products={products} />;
}
