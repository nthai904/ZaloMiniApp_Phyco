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
  selectedStationState,
  localOrdersState,
} from "@/state";
import { Product, ProductV2 } from "./types";
import { getConfig } from "@/utils/template";
import { authorize, createOrder, openChat } from "zmp-sdk/apis";
import { useAtomCallback } from "jotai/utils";

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

// hàm liên quan đến checkout giỏ hàng
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

      const cartToken = `ct_${Date.now()}`;
      const checkoutToken = cartToken;

      const payload: any = {
        order: {
          email: (shippingAddress as any)?.email ?? userInfo?.email ?? "",
          currency: "VND",
          cart_token: cartToken,
          checkout_token: checkoutToken,
          line_items: cart.map((item) => {
            const prod: any = item.product as any;
            const variant = prod?.variants?.[0] ?? {};
            const variantId = Number(variant?.id ?? prod?.id ?? 0);
            const productId = Number(prod?.id ?? 0);
            const title = String(prod?.title ?? prod?.name ?? "");
            const variantTitle = String(variant?.title ?? "Default");
            const price = Number(variant?.price ?? prod?.price ?? 0);
            return {
              id: undefined,
              product_id: productId,
              variant_id: variantId,
              title,
              variant_title: variantTitle,
              quantity: item.quantity,
              price: price,
              price_original: price,
              price_promotion: 0,
              total_discount: 0,
              fulfillable_quantity: item.quantity,
              requires_shipping: true,
              sku: variant?.sku ?? null,
              vendor: prod?.vendor ?? null,
              type: prod?.product_type ?? null,
              name: `${title} - ${variantTitle}`,
              product_exists: true,
              image: { src: prod?.images?.[0]?.src ?? null },
              taxable: false,
            };
          }),
          // data địa chỉ
          billing_address: (function () {
            if (shippingAddress) {
              return {
                address1: shippingAddress.address ?? "",
                email: (shippingAddress as any)?.email ?? userInfo?.email ?? "",
                address2: shippingAddress.address2 ?? null,
                city: shippingAddress.city ?? null,
                company: shippingAddress.company ?? null,
                country: shippingAddress.country ?? "Vietnam",
                first_name: shippingAddress.first_name ?? shippingAddress.name ?? userInfo?.name ?? "",
                id: shippingAddress.id ?? undefined,
                last_name: shippingAddress.last_name ?? "",
                phone: shippingAddress.phone ?? userInfo?.phone ?? "",
                province: shippingAddress.province ?? null,
                zip: shippingAddress.zip ?? null,
                name: shippingAddress.name ?? "",
                province_code: shippingAddress.province_code ?? null,
                country_code: shippingAddress.country_code ?? "VN",
                default: shippingAddress.default ?? true,
                district: shippingAddress.district ?? null,
                district_code: shippingAddress.district_code ?? null,
                ward: shippingAddress.ward ?? null,
                ward_code: shippingAddress.ward_code ?? null,
              };
            }

            return {
              address1: userInfo?.address ?? "",
              email: userInfo?.email ?? "",
              address2: null,
              city: null,
              company: null,
              country: "Vietnam",
              first_name: userInfo?.name ?? "",
              id: undefined,
              last_name: "",
              phone: userInfo?.phone ?? "",
              province: null,
              zip: null,
              name: userInfo?.name ?? "",
              province_code: null,
              country_code: "VN",
              default: true,
              district: null,
              district_code: null,
              ward: null,
              ward_code: null,
            };
          })(),
          shipping_address: (function () {
            if (deliveryMode === "pickup") {
              return {
                first_name: selectedStation?.name ?? userInfo?.name ?? "",
                email: userInfo?.email ?? "",
                phone: userInfo?.phone ?? "",
                address1: selectedStation?.address ?? userInfo?.address ?? "",
                country: "Vietnam",
              };
            }

            if (shippingAddress) {
              return {
                address1: shippingAddress.address ?? userInfo?.address ?? "",
                email: (shippingAddress as any)?.email ?? userInfo?.email ?? "",
                address2: shippingAddress.address2 ?? null,
                city: shippingAddress.city ?? null,
                company: shippingAddress.company ?? null,
                country: shippingAddress.country ?? "Vietnam",
                first_name: shippingAddress.first_name ?? shippingAddress.name ?? userInfo?.name ?? "",
                id: shippingAddress.id ?? undefined,
                last_name: shippingAddress.last_name ?? "",
                phone: shippingAddress.phone ?? userInfo?.phone ?? "",
                province: shippingAddress.province ?? null,
                zip: shippingAddress.zip ?? null,
                name: shippingAddress.name ?? "",
                province_code: shippingAddress.province_code ?? null,
                country_code: shippingAddress.country_code ?? "VN",
                default: shippingAddress.default ?? true,
                district: shippingAddress.district ?? null,
                district_code: shippingAddress.district_code ?? null,
                ward: shippingAddress.ward ?? null,
                ward_code: shippingAddress.ward_code ?? null,
              };
            }

            return {
              first_name: userInfo?.name ?? "",
              phone: userInfo?.phone ?? "",
              address1: userInfo?.address ?? "",
              country: "Vietnam",
            };
          })(),
          // phương thức thanh toán
          transactions: [
            {
              amount: Number(totalAmount) || 0,
              authorization: null,
              created_at: new Date().toISOString(),
              device_id: null,
              gateway: "Thanh toán khi giao hàng (COD)",
              id: undefined,
              kind: "pending",
              order_id: undefined,
              receipt: null,
              status: null,
              user_id: null,
              location_id: selectedStation?.id ?? null,
              payment_details: null,
              parent_id: null,
              currency: "VND",
              haravan_transaction_id: null,
              external_transaction_id: null,
              external_payment_type: null,
            },
          ],
          transactions_count: 1,
          shipping_lines: [
            {
              code: "Freeship",
              price: 0,
              source: null,
              title: "Freeship",
            },
          ],
          subtotal_price: Number(totalAmount) || 0,
          total_line_items_price: Number(totalAmount) || 0,
          total_price: Number(totalAmount) || 0,
          total_discounts: 0,
          total_tax: 0,
          taxes_included: false,
          gateway: "Thanh toán khi giao hàng (COD)",
          gateway_code: "COD",
          created_at: new Date().toISOString(),
          buyer_accepts_marketing: true,
          client_details: {
            accept_language: null,
            browser_ip: null,
            session_hash: checkoutToken,
            user_agent: null,
            browser_height: null,
            browser_width: null,
          },
          customer: {
            id: userInfo?.id ?? undefined,
            email: userInfo?.email ?? "",
            phone: userInfo?.phone ?? "",
            first_name: userInfo?.name?.split(" ")?.[0] ?? userInfo?.name ?? "",
            last_name: (userInfo?.name?.split(" ")?.slice(1).join(" ") as string) ?? "",
            created_at: new Date().toISOString(),
            addresses: shippingAddress
              ? [
                  {
                    address1: shippingAddress.address ?? "",
                    address2: shippingAddress.address2 ?? null,
                    city: shippingAddress.city ?? null,
                    company: shippingAddress.company ?? null,
                    country: shippingAddress.country ?? "Vietnam",
                    first_name: shippingAddress.first_name ?? shippingAddress.name ?? userInfo?.name ?? "",
                    id: shippingAddress.id ?? undefined,
                    last_name: shippingAddress.last_name ?? "",
                    phone: shippingAddress.phone ?? userInfo?.phone ?? "",
                    province: shippingAddress.province ?? null,
                    zip: shippingAddress.zip ?? null,
                    name: shippingAddress.name ?? "",
                    province_code: shippingAddress.province_code ?? null,
                    country_code: shippingAddress.country_code ?? "VN",
                    default: shippingAddress.default ?? true,
                    district: shippingAddress.district ?? null,
                    district_code: shippingAddress.district_code ?? null,
                    ward: shippingAddress.ward ?? null,
                    ward_code: shippingAddress.ward_code ?? null,
                  },
                ]
              : [],
            default_address: shippingAddress
              ? {
                  address1: shippingAddress.address ?? "",
                  address2: shippingAddress.address2 ?? null,
                  city: shippingAddress.city ?? null,
                  company: shippingAddress.company ?? null,
                  country: shippingAddress.country ?? "Vietnam",
                  first_name: shippingAddress.first_name ?? shippingAddress.name ?? userInfo?.name ?? "",
                  id: shippingAddress.id ?? undefined,
                  last_name: shippingAddress.last_name ?? "",
                  phone: shippingAddress.phone ?? userInfo?.phone ?? "",
                  province: shippingAddress.province ?? null,
                  zip: shippingAddress.zip ?? null,
                  name: shippingAddress.name ?? "",
                  province_code: shippingAddress.province_code ?? null,
                  country_code: shippingAddress.country_code ?? "VN",
                  default: shippingAddress.default ?? true,
                  district: shippingAddress.district ?? null,
                  district_code: shippingAddress.district_code ?? null,
                  ward: shippingAddress.ward ?? null,
                  ward_code: shippingAddress.ward_code ?? null,
                }
              : null,
          },
        },
      };
      console.log("Payload:", payload);

      try {
        const newOrder = {
          id: Date.now(),
          status: "pending",
          paymentStatus: "pending",
          createdAt: new Date(),
          receivedAt: new Date(),
          items: cart.map((item) => ({ product: item.product, quantity: item.quantity })),
          delivery: (deliveryMode === "pickup"
            ? { type: "pickup", stationId: selectedStation?.id ?? 0 }
            : shippingAddress
            ? { type: "shipping", ...(shippingAddress as any) }
            : { type: "shipping" }) as any,
          total: Number(totalAmount) || 0,
          note: "",
        } as any;

        setLocalOrders((prev) => [newOrder, ...(prev ?? [])]);
      } catch (err) {
        console.warn("Failed to create local order", err);
      }

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
