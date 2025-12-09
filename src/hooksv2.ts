import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import {
  cartState,
  cartTotalState,
  ordersState,
  userInfoKeyState,
  userInfoState,
} from "@/statev2";
// Keep compatibility with legacy UI which still reads from `@/state`
import { cartState as legacyCartState } from "@/state";
import { getConfig } from "@/utils/template";
import { authorize, createOrder, openChat } from "zmp-sdk/apis";
import { useAtomCallback } from "jotai/utils";
import { ProductV2 } from "./typesv2";

export function useRealHeight(
  element: MutableRefObject<HTMLDivElement | null>,
  defaultValue?: number
) {
  const [height, setHeight] = useState(defaultValue ?? 0);
  useLayoutEffect(() => {
    if (element.current && typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        const [{ contentRect }] = entries;
        setHeight(contentRect.height);
      });
      ro.observe(element.current);
      return () => ro.disconnect();
    }
    return () => {};
  }, [element.current]);

  if (typeof ResizeObserver === "undefined") {
    return -1;
  }
  return height;
}

export function useRequestInformation() {
  const getStoredUserInfo = useAtomCallback(async (get) => {
    const userInfo = await get(userInfoState);
    return userInfo;
  });
  const setInfoKey = useSetAtom(userInfoKeyState);
  const refreshPermissions = () => setInfoKey((key) => key + 1);

  return async () => {
    const userInfo = await getStoredUserInfo();
    if (!userInfo) {
      await authorize({
        scopes: ["scope.userInfo", "scope.userPhonenumber"],
      }).then(refreshPermissions);
      return await getStoredUserInfo();
    }
    return userInfo;
  };
}

export function useAddToCartV2(product?: ProductV2 | null) {
  const [cart, setCart] = useAtom(cartState);
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
    // Update v2 cart
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

    // Also update legacy v1 cart so existing UI components (header, floating preview, cart page)
    // that still read from `@/state` reflect changes. We map minimal fields required by v1.
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

export function useCustomerSupport() {
  return () =>
    openChat({
      type: "oa",
      id: getConfig((config) => config.template.oaIDtoOpenChat),
    });
}

export function useToBeImplemented() {
  return () =>
    toast("Chức năng dành cho các bên tích hợp phát triển...", {
      icon: "🛠️",
    });
}

export function useCheckoutV2() {
  const { totalAmount } = useAtomValue(cartTotalState);
  const [cart, setCart] = useAtom(cartState);
  const requestInfo = useRequestInformation();
  const navigate = useNavigate();
  const refreshOrders = useSetAtom(ordersState("pending"));

  return async () => {
    try {
      await requestInfo();

      // await createOrder({
      //   amount: totalAmount,
      //   desc: "Thanh toán đơn hàng",
      //   item: cart.map((item) => ({
      //     id: item.product.id,
      //     name: item.product.title,
      //     price: Number(item.product.variants[0].price),
      //     quantity: item.quantity,
      //   })),
      // });

      setCart([]);
      refreshOrders();

      navigate("/orders", { viewTransition: true });

      toast.success("Thanh toán thành công! 🎉");
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán thất bại");
    }
  };
}

export function useRouteHandle() {
  const matches = useMatches() as UIMatch<
    undefined,
    | {
        title?: string | Function;
        logo?: boolean;
        search?: boolean;
        noFooter?: boolean;
        noBack?: boolean;
        noFloatingCart?: boolean;
        scrollRestoration?: number;
      }
    | undefined
  >[];
  const lastMatch = matches[matches.length - 1];

  return [lastMatch.handle, lastMatch, matches] as const;
}
