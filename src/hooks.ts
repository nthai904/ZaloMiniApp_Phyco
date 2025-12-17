import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MutableRefObject, useLayoutEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { UIMatch, useMatches, useNavigate } from "react-router-dom";
import {
  cartState,
  cartStateV2,
  cartTotalState,
  ordersState,
  userInfoKeyState,
  userInfoState,
} from "@/state";
import {Product,  ProductV2 } from "./types";
import { getConfig } from "@/utils/template";
import { authorize, createOrder, openChat } from "zmp-sdk/apis";
import { useAtomCallback } from "jotai/utils";

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

  if (p.variants || p.images || p.title) return p as ProductV2;

  const price = Number(p.price ?? (p.variants?.[0]?.price ?? 0));
  return {
    body_html: p.detail ?? p.body_html ?? "",
    body_plain: p.detail ?? p.body_plain ?? null,
    created_at: new Date().toISOString(),
    handle: String(p.handle ?? p.id ?? ""),
    id: Number(p.id ?? 0),
    images: [{ src: p.image ?? (p.images?.[0]?.src ?? "") }],
    product_type: p.category?.name ?? p.product_type ?? "",
    published_at: new Date().toISOString(),
    published_scope: "global",
    tags: p.tags ?? "",
    template_suffix: p.template_suffix ?? "",
    title: p.name ?? p.title ?? "",
    updated_at: new Date().toISOString(),
    variants: [
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

export function useAddToCartV2(product?: ProductV2 | null) {
  const [cart, setCart] = useAtom(cartState);
  const setLegacyCart = useSetAtom(cartStateV2);

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

export function useAddToCartCompat(product?: Product | null) {
  const mapped = product ? mapProductToV2(product) : null;
  return useAddToCartV2(mapped as any);
}


export function useCheckout() {
  const { totalAmount } = useAtomValue(cartTotalState);
  const [cart, setCart] = useAtom(cartStateV2);
  const requestInfo = useRequestInformation();
  const navigate = useNavigate();
  const refreshOrders = useSetAtom(ordersState("pending"));

  return async () => {
    try {
      const userInfo = await requestInfo();

      const payload: any = {
        order: {
          email: userInfo?.email ?? "",
          currency: "VND",
          total_price: Number(totalAmount) || 0,
          line_items: cart.map((item) => {
            const prod: any = item.product as any;
            const variantId = Number(prod?.variants?.[0]?.id ?? prod?.id ?? 0);
            const productId = Number(prod?.id ?? variantId ?? 0);
            const title = String(prod?.title ?? prod?.name ?? "");
            const price = Number(prod?.variants?.[0]?.price ?? prod?.price ?? 0) || 0;
            return {
              variant_id: variantId,
              product_id: productId,
              title,
              quantity: item.quantity,
              price,
            };
          }),
          billing_address: {
            first_name: userInfo?.name ?? "",
            phone: userInfo?.phone ?? "",
            address1: userInfo?.address ?? "",
            country: "Vietnam",
          },
          shipping_address: {
            first_name: userInfo?.name ?? "",
            phone: userInfo?.phone ?? "",
            address1: userInfo?.address ?? "",
            country: "Vietnam",
          },
          financial_status: "pending",
          source: "web",
        },
      };
      console.log("Checkout payload:", payload);

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
