import { useAtom, useSetAtom } from "jotai";
import { useMemo } from "react";
import toast from "react-hot-toast";
import {
  cartState,
} from "@/statev2";
import { cartStateV2 as legacyCartState } from "@/state";
import { ProductV2 } from "./typesv2";

export function useAddToCartV2(product?: ProductV2 | null) {
  // Lấy hàm từ file statev2.ts
  const [cart, setCart] = useAtom(cartState);

  // Lấy hàm từ file state.ts 
  const setLegacyCart = useSetAtom(legacyCartState);

  const currentCartItem = useMemo(
    () => cart.find((item) => item.product.id === product?.id),
    [cart, product?.id]
  );

  const addToCart = (
    quantity: number | ((oldQuantity: number) => number),
    options?: { toast: boolean }
  ) => {
    if (!product) return;
    setCart((cart) => {
      const newQuantity =
        typeof quantity === "function"
          ? quantity(currentCartItem?.quantity ?? 0)
          : quantity;

      if (newQuantity <= 0) {
        return cart.filter((i) => i.product.id !== product.id);
      }

      if (currentCartItem) {
        currentCartItem.quantity = newQuantity;
        return [...cart];
      }

      return [...cart, { product, quantity: newQuantity }];
    });

    setLegacyCart((legacy) => {
      const legacyItemIndex = legacy.findIndex((i) => i.product.id === product.id);
      const newQuantity =
        typeof quantity === "function"
          ? quantity(legacyItemIndex >= 0 ? legacy[legacyItemIndex].quantity : 0)
          : quantity;

      const legacyProduct = {
        id: product.id,
        name: product.title,
        price: Number(product.variants?.[0]?.price ?? 0),
        image: product.images?.[0]?.src ?? "/placeholder.jpg",
        category: (product as any).category ?? { id: 0, name: product.product_type ?? "", image: "" },
      } as any;

      if (newQuantity <= 0) {
        return legacy.filter((i) => i.product.id !== product.id);
      }

      if (legacyItemIndex >= 0) {
        legacy[legacyItemIndex].quantity = newQuantity;
        return [...legacy];
      }

      return [...legacy, { product: legacyProduct, quantity: newQuantity }];
    });

    if (options?.toast) toast.success("Đã thêm vào giỏ hàng");
  };

  return { addToCart, cartQuantity: currentCartItem?.quantity ?? 0 };
}