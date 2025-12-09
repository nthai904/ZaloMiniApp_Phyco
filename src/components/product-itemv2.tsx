import { ProductV2 } from "@/typesv2";
import { formatPrice } from "@/utils/format";
import { Button } from "zmp-ui";
import QuantityInput from "./quantity-input";
import TransitionLink from "./transition-link";
import { useState } from "react";
import { useAddToCartV2 } from "@/hooksv2";

export interface ProductItemProps {
  product: ProductV2;
  replace?: boolean;
}

export default function ProductItemV2({ product, replace }: ProductItemProps) {
  const [selected, setSelected] = useState(false);

  // Haravan fields
  const image = product.images?.[0]?.src ?? "/placeholder.jpg";
  const price = Number(product.variants?.[0]?.price ?? 0);

  const { addToCart, cartQuantity } = useAddToCartV2(product);

  return (
    <div className="flex flex-col cursor-pointer bg-section rounded-xl shadow-[0_10px_24px_#0D0D0D17]" onClick={() => setSelected(true)}>
      <TransitionLink to={`/product/${product.id}`} replace={replace} className="p-2 pb-0">
        {({ isTransitioning }) => (
          <>
            <img
              src={image}
              className="w-full aspect-square object-cover rounded-lg"
              style={{
                viewTransitionName: isTransitioning && selected ? `product-image-${product.id}` : undefined,
              }}
              alt={product.title}
            />

            <div className="pt-2 pb-1.5">
              <div className="pt-1 pb-0.5">
                <div className="text-xs h-9 line-clamp-2">{product.title}</div>
              </div>

              <div className="mt-0.5 text-sm font-bold text-primary truncate">{formatPrice(price)}</div>
            </div>
          </>
        )}
      </TransitionLink>

      <div className="p-2">
        {cartQuantity === 0 ? (
          <Button
            className="bg-primary opacity-95"
            size="small"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              addToCart(1);
            }}
          >
            Thêm vào giỏ
          </Button>
        ) : (
          <QuantityInput value={cartQuantity} onChange={addToCart} />
        )}
      </div>
    </div>
  );
}
