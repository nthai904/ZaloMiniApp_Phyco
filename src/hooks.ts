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
import { createOrder as createHaravanOrder, OrderResponse, CreateOrderPayload } from "@/api/haravan";

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

// hàm liên quan đến checkout giỏ hàng
export function useCheckout() {
  const { totalAmount } = useAtomValue(cartTotalState);
  const [cart, setCart] = useAtom(cartStateV2);
  const setLocalOrders = useSetAtom(localOrdersState);
  const requestInfo = useRequestInformation();
  const shippingAddress = useAtomValue(shippingAddressState);
  const deliveryMode = useAtomValue(deliveryModeState);
  const selectedStation = useAtomValue(selectedStationState);
  const paymentMethod = useAtomValue(paymentMethodState);
  const navigate = useNavigate();
  const refreshOrders = useSetAtom(ordersState("pending"));

  return async () => {
    try {
      const userInfo = await requestInfo();

      const cartToken = `ct_${Date.now()}`;
      const checkoutToken = cartToken;
      let orderId = Date.now();
      let orderNumber = `#${orderId}`;

      // Phương thức thanh toán
      const transactions: any[] = [];
      const transactionBase = {
        amount: Number(totalAmount) || 0,
        authorization: null,
        created_at: new Date().toISOString(),
        device_id: null,
        receipt: null,
        status: null,
        user_id: (userInfo as any)?.id ?? null,
        payment_details: null,
        parent_id: null,
        currency: "VND",
        haravan_transaction_id: null,
        external_transaction_id: null,
        external_payment_type: null,
      };

      if (paymentMethod === "cod") {
        transactions.push({
          ...transactionBase,
          gateway: "Thanh toán khi giao hàng (COD)",
          id: orderId + 1,
          kind: "pending",
          order_id: orderId,
          location_id: selectedStation?.id ?? null,
        });
      } else if (paymentMethod === "bank_transfer") {
        transactions.push({
          ...transactionBase,
          gateway: "Chuyển khoản ngân hàng",
          id: orderId + 1,
          kind: "pending",
          order_id: orderId,
          location_id: null,
        });
      }

      const payload: any = {
        order: {
          id: orderId,
          cart_token: cartToken,
          checkout_token: checkoutToken,
          token: checkoutToken,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          currency: "VND",
          name: orderNumber,
          number: orderId,
          order_number: orderNumber,

          email: (shippingAddress as any)?.email ?? userInfo?.email ?? "",
          contact_email: (shippingAddress as any)?.email ?? userInfo?.email ?? "",
          browser_ip: null,
          buyer_accepts_marketing: false,

          customer: {
            id: userInfo?.id ?? undefined,
            email: userInfo?.email ?? "",
            phone: userInfo?.phone ?? null,
            first_name: userInfo?.name?.split(" ")?.[0] ?? null,
            last_name: (userInfo?.name?.split(" ")?.slice(1).join(" ") as string) ?? null,
            created_at: new Date().toISOString(),
            addresses: shippingAddress
              ? [
                  {
                    address1: shippingAddress.address ?? null,
                    address2: shippingAddress.address2 ?? null,
                    city: shippingAddress.city ?? null,
                    company: shippingAddress.company ?? null,
                    country: shippingAddress.country ?? "Vietnam",
                    first_name: shippingAddress.first_name ?? shippingAddress.name ?? null,
                    id: shippingAddress.id ?? undefined,
                    last_name: shippingAddress.last_name ?? null,
                    phone: shippingAddress.phone ?? userInfo?.phone ?? null,
                    province: shippingAddress.province ?? null,
                    zip: shippingAddress.zip ?? null,
                    name: shippingAddress.name ?? null,
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
                  address1: shippingAddress.address ?? null,
                  address2: shippingAddress.address2 ?? null,
                  city: shippingAddress.city ?? null,
                  company: shippingAddress.company ?? null,
                  country: shippingAddress.country ?? "Vietnam",
                  first_name: shippingAddress.first_name ?? shippingAddress.name ?? null,
                  id: shippingAddress.id ?? undefined,
                  last_name: shippingAddress.last_name ?? null,
                  phone: shippingAddress.phone ?? userInfo?.phone ?? null,
                  province: shippingAddress.province ?? null,
                  zip: shippingAddress.zip ?? null,
                  name: shippingAddress.name ?? null,
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
          billing_address: shippingAddress
            ? {
                address1: shippingAddress.address ?? null,
                address2: shippingAddress.address2 ?? null,
                city: shippingAddress.city ?? null,
                company: shippingAddress.company ?? null,
                country: shippingAddress.country ?? "Vietnam",
                first_name: shippingAddress.first_name ?? shippingAddress.name ?? null,
                id: shippingAddress.id ?? undefined,
                last_name: shippingAddress.last_name ?? null,
                phone: shippingAddress.phone ?? userInfo?.phone ?? null,
                province: shippingAddress.province ?? null,
                zip: shippingAddress.zip ?? null,
                name: shippingAddress.name ?? null,
                province_code: shippingAddress.province_code ?? null,
                country_code: shippingAddress.country_code ?? "VN",
                default: shippingAddress.default ?? true,
                district: shippingAddress.district ?? null,
                district_code: shippingAddress.district_code ?? null,
                ward: shippingAddress.ward ?? null,
                ward_code: shippingAddress.ward_code ?? null,
              }
            : {
                address1: userInfo?.address ?? null,
                email: userInfo?.email ?? null,
                address2: null,
                city: null,
                company: null,
                country: "Vietnam",
                first_name: userInfo?.name ?? null,
                id: undefined,
                last_name: null,
                phone: userInfo?.phone ?? null,
                province: null,
                zip: null,
                name: userInfo?.name ?? null,
                province_code: null,
                country_code: "VN",
                default: true,
                district: null,
                district_code: null,
                ward: null,
                ward_code: null,
              },

          shipping_address: shippingAddress
            ? {
                address1: shippingAddress.address ?? null,
                address2: shippingAddress.address2 ?? null,
                city: shippingAddress.city ?? null,
                company: shippingAddress.company ?? null,
                country: shippingAddress.country ?? "Vietnam",
                first_name: shippingAddress.name ?? null,
                id: shippingAddress.id ?? undefined,
                last_name: shippingAddress.last_name ?? null,
                phone: shippingAddress.phone ?? null,
                province: shippingAddress.province ?? null,
                zip: shippingAddress.zip ?? null,
                name: shippingAddress.name ?? null,
                province_code: shippingAddress.province_code ?? null,
                country_code: shippingAddress.country_code ?? "VN",
                default: shippingAddress.default ?? true,
                district: shippingAddress.district ?? null,
                district_code: shippingAddress.district_code ?? null,
                ward: shippingAddress.ward ?? null,
                ward_code: shippingAddress.ward_code ?? null,
              }
            : null,
          // Danh sach sản phẩm trong giỏ hàng
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

          financial_status: "pending",
          fulfillment_status: "notfulfilled",
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
          transactions,
          transactions_count: transactions.length,
          discount_codes: [],
          refunds: [],
          fulfillments: [],
          note: null,
          note_attributes: [],
          gateway: null,
          gateway_code: null,
          closed_status: "unclosed",
          cancelled_status: "uncancelled",
          confirmed_status: "unconfirmed",
          user_id: (userInfo as any)?.id ?? undefined,
          device_id: null,
          location_id: selectedStation?.id ?? null,
          ref_order_id: 0,
          payment_url: null,
        },
      };

      // in ra payload ở console
      console.log("Data API đơn hàng đầy đủ:", payload);

      // Tạo payload theo format yêu cầu của Haravan API
      const lineItems = cart
        .map((item) => {
          const prod: any = item.product as any;
          const variant = prod?.variants?.[0] ?? {};
          const variantId = Number(variant?.id ?? prod?.id ?? 0);
          const price = Number(variant?.price ?? prod?.price ?? 0);
          const title = String(prod?.title ?? prod?.name ?? "");

          if (!variantId || variantId === 0) {
            console.warn("Variant ID không hợp lệ cho sản phẩm:", prod);
          }

          if (!title) {
            console.warn("Tên sản phẩm không có cho sản phẩm:", prod);
          }

          return {
            variant_id: variantId,
            quantity: item.quantity,
            price: price,
            title: title, 
          };
        })
        .filter((item) => item.variant_id > 0 && item.title); // Lọc bỏ các item không hợp lệ

      if (lineItems.length === 0) {
        throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng");
      }

      // Lấy thông tin email và phone từ userInfo hoặc shippingAddress
      const orderEmail = (shippingAddress as any)?.email ?? userInfo?.email ?? "";
      const orderPhone = shippingAddress?.phone ?? userInfo?.phone ?? "";

      // Tạo shipping_address từ shippingAddress hoặc userInfo
      let shippingAddressData: any = null;
      if (shippingAddress) {
        shippingAddressData = {
          first_name: shippingAddress.first_name ?? shippingAddress.name?.split(" ")?.[0] ?? "",
          last_name: shippingAddress.last_name ?? shippingAddress.name?.split(" ")?.slice(1).join(" ") ?? "",
          phone: shippingAddress.phone ?? orderPhone,
          address1: shippingAddress.address ?? "",
          province: shippingAddress.province ?? "",
          country: shippingAddress.country ?? "Vietnam",
        };
      } else if (userInfo?.name) {
        // Nếu không có shippingAddress, tạo từ userInfo
        const nameParts = userInfo.name.split(" ");
        shippingAddressData = {
          first_name: nameParts[0] ?? "",
          last_name: nameParts.slice(1).join(" ") ?? "",
          phone: orderPhone,
          address1: userInfo.address ?? "",
          province: "",
          country: "Vietnam",
        };
      }

      const simplePayload: CreateOrderPayload = {
        order: {
          email: orderEmail,
          phone: orderPhone,
          shipping_address: shippingAddressData,
          line_items: lineItems,
          total_price: Number(totalAmount) || 0,
        },
      };

      console.log("Payload gửi lên Haravan API:", simplePayload);

      // Gọi API Haravan để tạo đơn hàng
      let haravanOrderResponse: OrderResponse | null = null;
      try {
        haravanOrderResponse = await createHaravanOrder(simplePayload);
        console.log("Đơn hàng đã được tạo trên Haravan:", haravanOrderResponse);

        // Cập nhật orderId và orderNumber từ response nếu có
        if (haravanOrderResponse?.order?.id) {
          orderId = haravanOrderResponse.order.id;
        }
        if (haravanOrderResponse?.order?.order_number) {
          orderNumber = haravanOrderResponse.order.order_number;
        }
      } catch (apiError: any) {
        console.error("Lỗi khi tạo đơn hàng trên Haravan:", apiError);
        // Vẫn tiếp tục tạo local order nếu API thất bại
        toast.error(`Lỗi API: ${apiError.message || "Không thể tạo đơn hàng trên Haravan"}`);
        // Không throw error để vẫn có thể tạo local order
      }

      // Tạo local order để lưu trữ
      try {
        const newOrder = {
          id: haravanOrderResponse?.order?.id ?? orderId,
          order_number: haravanOrderResponse?.order?.order_number ?? orderNumber,
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
          transactions,
          gateway: transactions?.[0]?.gateway ?? null,
          haravanOrder: haravanOrderResponse?.order ?? null, // Lưu thông tin order từ Haravan
        } as any;

        setLocalOrders((prev) => [newOrder, ...(prev ?? [])]);
      } catch (err) {
        console.warn("Failed to create local order", err);
      }

      setCart([]);
      refreshOrders();

      navigate("/orders", { viewTransition: true });

      if (haravanOrderResponse) {
        toast.success("Thanh toán thành công! 🎉");
      } else {
        toast.success("Đơn hàng đã được lưu (chưa đồng bộ với Haravan)");
      }
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán thất bại");
    }
  };
}
