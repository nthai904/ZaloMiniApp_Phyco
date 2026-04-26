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
  shippingAddressState,
  deliveryModeState,
  paymentMethodState,
  selectedStationState,
  localOrdersState,
} from "@/state";
import { Product, ProductV2 } from "./types";
import { getConfig } from "@/utils/template";
import { authorize, createOrder as createZaloOrder, openChat } from "zmp-sdk/apis";
import { useAtomCallback } from "jotai/utils";
import { createOrder as createHaravanOrder, OrderResponse, CreateOrderPayload, createMac } from "@/api/haravan";
import pay from "./utils/product";
import { Payment } from "zmp-sdk";

export function useRealHeight(element: MutableRefObject<HTMLDivElement | null>, defaultValue?: number) {
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

  const price = Number(p.price ?? p.variants?.[0]?.price ?? 0);
  return {
    body_html: p.detail ?? p.body_html ?? "",
    body_plain: p.detail ?? p.body_plain ?? null,
    created_at: new Date().toISOString(),
    handle: String(p.handle ?? p.id ?? ""),
    id: Number(p.id ?? 0),
    images: [{ src: p.image ?? p.images?.[0]?.src ?? "" }],
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

  const currentCartItem = useMemo(() => cart.find((item) => item.product.id === product?.id), [cart, product?.id]);

  const addToCart = (quantity: number | ((oldQuantity: number) => number), options?: { toast: boolean }) => {
    if (!product) return;
    setCart((cart) => {
      const newQuantity = typeof quantity === "function" ? quantity(currentCartItem?.quantity ?? 0) : quantity;

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
      const newQuantity = typeof quantity === "function" ? quantity(legacyItemIndex >= 0 ? legacy[legacyItemIndex].quantity : 0) : quantity;

      const legacyProduct = {
        id: product.id,
        name: product.title,
        price: Number(product.variants?.[0]?.price ?? 0),
        image: product.images?.[0]?.src ?? "/placeholder.jpg",
        variants: product.variants,
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

export function useCheckout() {
  const { totalAmount } = useAtomValue(cartTotalState);
  const [cart, setCart] = useAtom(cartStateV2);
  const setLocalOrders = useSetAtom(localOrdersState);
  const requestInfo = useRequestInformation();
  const shippingAddress = useAtomValue(shippingAddressState);
  const deliveryMode = useAtomValue(deliveryModeState);
  const selectedStation = useAtomValue(selectedStationState);
  const navigate = useNavigate();
  const refreshOrders = useSetAtom(ordersState("pending"));

  return async () => {
    try {
      const userInfo = await requestInfo();

      let orderId = Date.now();
      let orderNumber = `#${orderId}`;

      const lineItems = cart.map((item) => {
        const prod: any = item.product;
        const variant = prod?.variants?.[0];
        return {
          variant_id: String(variant?.id ?? 0),
          quantity: item.quantity,
          price: Number(variant?.price ?? prod?.price ?? 0),
        };
      });

      if (!lineItems.length) throw new Error("Giỏ hàng trống");

      const orderEmail = shippingAddress?.email ?? userInfo?.email ?? "";
      const orderPhone = shippingAddress?.phone ?? userInfo?.phone ?? "";

      const receiverName = shippingAddress?.name?.trim() || userInfo?.name || "";

      const shippingAddressData = shippingAddress
        ? {
            first_name: shippingAddress.first_name ?? receiverName,
            last_name: shippingAddress.last_name ?? "",
            phone: orderPhone,
            address1: shippingAddress.address1 ?? "",
            province: shippingAddress.province ?? "",
            country: "Vietnam",
          }
        : undefined;

      console.log(shippingAddressData);

      const payload: CreateOrderPayload = {
        order: {
          email: orderEmail,
          phone: orderPhone,
          source: "ZaloMiniApp",
          source_name: "ZaloMiniApp",
          financial_status: "pending",
          line_items: lineItems,
          total_price: Number(totalAmount),
          ...(shippingAddressData ? { shipping_address: shippingAddressData } : {}),
        },
      };

      const haravanOrderResponse = await createHaravanOrder(payload);
      const order = haravanOrderResponse?.order;
      if (order?.id) {
        orderId = order.id;
        orderNumber = order.order_number;
      }

      try {
        const amount = Number(totalAmount);
        const desc = "Thanh toán cho PHYCO";
        const item = cart.map((cartItem) => {
          const prod: any = cartItem.product;
          const variant = prod?.variants?.[0];
          return {
            id: String(variant?.id ?? prod?.id ?? 0),
            amount: Number(variant?.price ?? prod?.price ?? 0) * cartItem.quantity,
          };
        });

        const extradata = JSON.stringify({ orderId });

        const macPayload = { amount, desc, item, extradata };
        const { mac } = await createMac(macPayload);

        await new Promise((resolve, reject) => {
          Payment.createOrder({
            amount,
            desc,
            item,
            extradata,
            mac,
            success: resolve,
            fail: reject,
          });
        });
        setCart([]);
        navigate("/cart", {
          viewTransition: true,
        });
        toast.success("Thanh toán thành công. Cảm ơn bạn đã mua hàng!", {
          icon: "🎉",
          duration: 5000,
        });
      } catch (err) {
        toast.error("Không thể mở thanh toán");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Thanh toán thất bại");
    }
  };
}
