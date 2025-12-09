import ProductItemV2 from "./product-itemv2";
import { ProductV2 } from "@/typesv2";
import React from "react";

export default function ProductGridV2({ products, className, replace, ...props }: { products: ProductV2[]; className?: string; replace?: boolean; [key: string]: any }) {
  return (
    <div className={"grid grid-cols-2 px-4 pt-2 pb-8 gap-4 ".concat(className ?? "")} {...props}>
      {products.map((p) => (
        <ProductItemV2 key={p.id} product={p} replace={replace} />
      ))}
    </div>
  );
}
