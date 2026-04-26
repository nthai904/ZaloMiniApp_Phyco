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

// hàm liên quan đến checkout giỏ hàng
// export function useCheckout() {
//   const { totalAmount } = useAtomValue(cartTotalState);
//   const [cart, setCart] = useAtom(cartStateV2);
//   const setLocalOrders = useSetAtom(localOrdersState);
//   const requestInfo = useRequestInformation();
//   const shippingAddress = useAtomValue(shippingAddressState);
//   const deliveryMode = useAtomValue(deliveryModeState);
//   const selectedStation = useAtomValue(selectedStationState);
//   const paymentMethod = useAtomValue(paymentMethodState);
//   const navigate = useNavigate();
//   const refreshOrders = useSetAtom(ordersState("pending"));

//   return async () => {
//     try {
//       const userInfo = await requestInfo();

//       const cartToken = `ct_${Date.now()}`;
//       const checkoutToken = cartToken;
//       let orderId = Date.now();
//       let orderNumber = `#${orderId}`;

//       // Phương thức thanh toán
//       const transactions: any[] = [];
//       const transactionBase = {
//         amount: Number(totalAmount) || 0,
//         authorization: null,
//         created_at: new Date().toISOString(),
//         device_id: null,
//         receipt: null,
//         status: null,
//         user_id: (userInfo as any)?.id ?? null,
//         payment_details: null,
//         parent_id: null,
//         currency: "VND",
//         haravan_transaction_id: null,
//         external_transaction_id: null,
//         external_payment_type: null,
//       };

//       if (paymentMethod === "cod") {
//         transactions.push({
//           ...transactionBase,
//           gateway: "Thanh toán khi giao hàng (COD)",
//           id: orderId + 1,
//           kind: "pending",
//           order_id: orderId,
//           location_id: selectedStation?.id ?? null,
//         });
//       } else if (paymentMethod === "bank_transfer") {
//         transactions.push({
//           ...transactionBase,
//           gateway: "Chuyển khoản ngân hàng",
//           id: orderId + 1,
//           kind: "pending",
//           order_id: orderId,
//           location_id: null,
//         });
//       }

//       // data post lên api
//       const lineItems = cart.map((item) => {
//         const prod: any = item.product as any;
//         const variant = Array.isArray(prod?.variants) && prod.variants.length > 0 ? prod.variants[0] : null;
//         const variantId = variant?.id ? Number(variant.id) : 0;
//         const price = Number(variant?.price ?? prod?.price ?? 0);

//         return {
//           variant_id: String(variantId),
//           quantity: item.quantity,
//           price: price,
//         };
//       });

//       if (lineItems.length === 0) {
//         throw new Error("Không có sản phẩm hợp lệ trong giỏ hàng");
//       }

//       const orderEmail = (shippingAddress as any)?.email ?? userInfo?.email ?? "";
//       const orderPhone = shippingAddress?.phone ?? userInfo?.phone ?? "";

//       let shippingAddressData: any = null;
//       if (shippingAddress) {
//         // Ưu tiên dùng address1 nếu có (đã được ghép sẵn), nếu không thì tự ghép hoặc dùng address
//         let address1Value = shippingAddress.address1;
//         if (!address1Value) {
//           // Tự ghép: địa chỉ + xã + huyện + tỉnh
//           const addressParts: string[] = [];
//           if (shippingAddress.address) addressParts.push(shippingAddress.address);
//           if (shippingAddress.ward) addressParts.push(shippingAddress.ward);
//           if (shippingAddress.district) addressParts.push(shippingAddress.district);
//           if (shippingAddress.province) addressParts.push(shippingAddress.province);
//           address1Value = addressParts.length > 0 ? addressParts.join(" ") : shippingAddress.address ?? "";
//         }

//         shippingAddressData = {
//           first_name: shippingAddress.first_name ?? shippingAddress.name?.split(" ")?.slice(1).join(" ") ?? "",
//           last_name: shippingAddress.last_name ?? shippingAddress.name?.split(" ")?.[0] ?? "",
//           phone: shippingAddress.phone ?? orderPhone,
//           address1: address1Value,
//           province: shippingAddress.province ?? "",
//           country: shippingAddress.country ?? "Vietnam",
//         };
//       } else if (userInfo?.name) {
//         const nameParts = userInfo.name.split(" ");
//         shippingAddressData = {
//           first_name: nameParts.slice(1).join(" ") || "",
//           last_name: nameParts[0] ?? "",
//           phone: orderPhone,
//           address1: userInfo.address ?? "",
//           province: "",
//           country: "Vietnam",
//         };
//       }

//       let gateway = "";
//       let gatewayCode = "";
//       let isCodGateway: boolean | string = false;
//       if (paymentMethod === "cod") {
//         gateway = "Thanh toán khi giao hàng (COD)";
//         gatewayCode = "COD";
//         isCodGateway = true;
//       } else if (paymentMethod === "bank_transfer") {
//         gateway = "Chuyển khoản ngân hàng";
//         gatewayCode = "BANK_TRANSFER";
//         isCodGateway = false;
//       }

//       const simplePayload: CreateOrderPayload = {
//         order: {
//           email: orderEmail,
//           phone: orderPhone,
//           shipping_address: shippingAddressData,
//           source: "ZaloMiniApp",
//           source_name: "ZaloMiniApp",
//           gateway: gateway,
//           gateway_code: gatewayCode,
//           is_cod_gateway: isCodGateway,
//           financial_status: "pending",
//           line_items: lineItems,
//           total_price: Number(totalAmount),
//         },
//       };

//       let haravanOrderResponse: OrderResponse | null = null;
//       try {
//         haravanOrderResponse = await createHaravanOrder(simplePayload);

//         if (haravanOrderResponse?.order?.id) {
//           orderId = haravanOrderResponse.order.id;
//         }
//         if (haravanOrderResponse?.order?.order_number) {
//           orderNumber = haravanOrderResponse.order.order_number;
//         }
//       } catch (apiError: any) {
//         console.error("Lỗi khi tạo đơn hàng trên Haravan:", apiError);
//         toast.error(`Lỗi API: ${apiError.message || "Không thể tạo đơn hàng trên Haravan"}`);
//       }

//       // Tạo local order để lưu trữ
//       try {
//         const newOrder = {
//           id: haravanOrderResponse?.order?.id ?? orderId,
//           order_number: haravanOrderResponse?.order?.order_number ?? orderNumber,
//           status: "pending",
//           paymentStatus: "pending",
//           createdAt: new Date(),
//           receivedAt: new Date(),
//           items: cart.map((item) => ({ product: item.product, quantity: item.quantity })),
//           delivery: (deliveryMode === "pickup"
//             ? { type: "pickup", stationId: selectedStation?.id ?? 0 }
//             : shippingAddress
//             ? { type: "shipping", ...(shippingAddress as any) }
//             : { type: "shipping" }) as any,
//           total: Number(totalAmount) || 0,
//           note: "",
//           transactions,
//           gateway: transactions?.[0]?.gateway ?? null,
//           haravanOrder: haravanOrderResponse?.order ?? null, // Lưu thông tin order từ Haravan
//         } as any;

//         setLocalOrders((prev) => [newOrder, ...(prev ?? [])]);
//       } catch (err) {
//         console.warn("Failed to create local order", err);
//       }

//       setCart([]);
//       refreshOrders();

//       navigate("/orders", { viewTransition: true });

//       if (haravanOrderResponse) {
//         toast.success("Đặt hành thành công");
//       } else {
//         toast.success("Đơn hàng đã được lưu (chưa đồng bộ với Haravan)");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Thanh toán thất bại");
//     }
//   };
// }
// export function useCheckout() {
//   const { totalAmount } = useAtomValue(cartTotalState);
//   const [cart, setCart] = useAtom(cartStateV2);
//   const setLocalOrders = useSetAtom(localOrdersState);
//   const requestInfo = useRequestInformation();
//   const shippingAddress = useAtomValue(shippingAddressState);
//   const deliveryMode = useAtomValue(deliveryModeState);
//   const selectedStation = useAtomValue(selectedStationState);
//   const navigate = useNavigate();
//   const refreshOrders = useSetAtom(ordersState("pending"));

//   return async () => {
//     try {
//       const userInfo = await requestInfo();

//       let orderId = Date.now();
//       let orderNumber = `#${orderId}`;

//       // =======================
//       // 🧩 LINE ITEMS
//       // =======================
//       const lineItems = cart.map((item) => {
//         const prod: any = item.product;
//         const variant = prod?.variants?.[0];

//         return {
//           variant_id: String(variant?.id ?? 0),
//           quantity: item.quantity,
//           price: Number(variant?.price ?? prod?.price ?? 0),
//         };
//       });

//       if (!lineItems.length) {
//         throw new Error("Giỏ hàng trống");
//       }

//       // =======================
//       // 🧩 USER INFO
//       // =======================
//       const orderEmail = shippingAddress?.email ?? userInfo?.email ?? "";
//       const orderPhone = shippingAddress?.phone ?? userInfo?.phone ?? "";

//       const shippingAddressData = shippingAddress
//         ? {
//             first_name: shippingAddress.first_name ?? "",
//             last_name: shippingAddress.last_name ?? "",
//             phone: orderPhone,
//             address1: shippingAddress.address1 ?? "",
//             province: shippingAddress.province ?? "",
//             country: "Vietnam",
//           }
//         : undefined;

//       // =======================
//       // 🚀 CREATE HARAVAN ORDER
//       // =======================
//       const payload: CreateOrderPayload = {
//         order: {
//           email: orderEmail,
//           phone: orderPhone,
//           source: "ZaloMiniApp",
//           source_name: "ZaloMiniApp",
//           financial_status: "pending",
//           line_items: lineItems,
//           total_price: Number(totalAmount),
//           ...(shippingAddressData ? { shipping_address: shippingAddressData } : {}),
//         },
//       };

//       const haravanOrderResponse = await createHaravanOrder(payload);
//       const order = haravanOrderResponse?.order;

//       if (order?.id) {
//         orderId = order.id;
//         orderNumber = order.order_number;
//       }
//       try {
//         const macRes = await createMac({
//           amount: Number(totalAmount),
//           desc: `Thanh toán đơn ${orderNumber}`,
//           item: [],
//           extradata: JSON.stringify({}),
//           method: {
//             id: "ZALOPAY_SANDBOX",
//             isCustom: false,
//           },
//         });

//         await pay({
//           amount: Number(totalAmount),
//           mac: macRes.mac,
//           description: `Thanh toán đơn ${orderNumber}`,
//         });

//         return;
//       } catch (err) {
//         console.error("Payment error:", err);
//         toast.error("Không thể mở thanh toán");
//         return;
//       }
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err.message || "Thanh toán thất bại");
//     }
//   };
// }
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
      const shippingAddressData = shippingAddress
        ? {
            first_name: shippingAddress.first_name ?? "",
            last_name: shippingAddress.last_name ?? "",
            phone: orderPhone,
            address1: shippingAddress.address1 ?? "",
            province: shippingAddress.province ?? "",
            country: "Vietnam",
          }
        : undefined;

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
// export function useCheckout() {
//   const { totalAmount } = useAtomValue(cartTotalState);
//   // const cart = useAtomValue(cartStateV2);

//   return async () => {
//     try {
//       const amount = 2000;
//       const desc = "Thanh toan test";

//       const item = [
//         { id: "1", amount: 1000 },
//         { id: "2", amount: 1000 }
//       ];

//       const orderId = 12345678;

//       const payload = {
//         amount,
//         desc,
//         item,
//         extradata: JSON.stringify({ orderId }),
//       };

//       const { mac } = await createMac(payload);
//       console.log("Payload gửi:", JSON.stringify(payload, null, 2));
//       console.log(mac);
//       await new Promise((resolve, reject) => {
//         Payment.createOrder({
//           amount,
//           desc,
//           item,
//           extradata: JSON.stringify({ orderId }),
//           mac,
//           success: resolve,
//           fail: reject,
//         });
//       });
//     } catch (err: any) {
//       console.error(err);
//       toast.error(err?.message || "Thanh toán thất bại");
//     }
//   };
// }
