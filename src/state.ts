import { atom } from "jotai";
import { atomFamily, atomWithRefresh, atomWithStorage, loadable, unwrap } from "jotai/utils";
import { Cart, Category, Delivery, Location, Order, OrderStatus, Product, ShippingAddress, Station, UserInfo, CartV2 } from "@/types";
import { requestWithFallback } from "@/utils/request";
import { getLocation, getPhoneNumber, getSetting, getUserInfo } from "zmp-sdk/apis";

import toast from "react-hot-toast";
import { calculateDistance } from "./utils/location";
import { formatDistant } from "./utils/format";
import CONFIG from "./config";
import { searchProductsByTitle, fetchProductsPage } from "@/api/haravan";
import { fetchOrders, decodePhoneToken } from "@/api/service";

export const userInfoKeyState = atom(0);

export const userInfoState = atom<Promise<UserInfo>>(async (get) => {
  get(userInfoKeyState);

  // Lấy thông tin đã lưu trong localStorage (fallback)
  const savedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  const savedPhone = savedUserInfo ? JSON.parse(savedUserInfo).phone : "";

  try {
    const {
      authSetting: { "scope.userInfo": grantedUserInfo, "scope.userPhonenumber": grantedPhoneNumber },
    } = await getSetting({});
    const isDev = !window.ZJSBridge;

    if (grantedUserInfo || isDev) {
      // Người dùng cho phép truy cập tên và ảnh đại diện
      try {
        const { userInfo } = await getUserInfo({});

        // Ưu tiên lấy số điện thoại từ Zalo SDK (decode token)
        let phone = "";
        if (grantedPhoneNumber || isDev) {
          try {
            phone = await get(phoneState);
            console.log("✅ [UserInfo] Phone from Zalo SDK:", phone);
          } catch (error) {
            console.warn("⚠️ [UserInfo] Failed to get phone from Zalo SDK:", error);
          }
        }

        // Fallback về số điện thoại từ localStorage nếu không lấy được từ Zalo SDK
        if (!phone && savedPhone) {
          phone = savedPhone;
          console.log("✅ [UserInfo] Using phone from localStorage:", phone);
        }

        // Lưu số điện thoại từ Zalo SDK vào localStorage nếu có
        if (phone && phone !== savedPhone) {
          const updatedUserInfo = {
            id: userInfo.id,
            name: userInfo.name,
            avatar: userInfo.avatar,
            phone,
            email: savedUserInfo ? JSON.parse(savedUserInfo).email || "" : "",
            address: savedUserInfo ? JSON.parse(savedUserInfo).address || "" : "",
          };
          localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUserInfo));
        }

        return {
          id: userInfo.id,
          name: userInfo.name,
          avatar: userInfo.avatar,
          phone: phone || savedPhone || "",
          email: savedUserInfo ? JSON.parse(savedUserInfo).email || "" : "",
          address: savedUserInfo ? JSON.parse(savedUserInfo).address || "" : "",
        };
      } catch (error: any) {
        // Xử lý lỗi khi getUserInfo thất bại (ví dụ: lỗi -1401 - app chưa được kích hoạt)
        console.warn("getUserInfo error:", error);
        if (error?.code === -1401) {
          console.warn("Zalo app has not been activated. Please deploy and activate the app in Zalo Developer Console.");
        }

        // Fallback về thông tin từ localStorage nếu có
        if (savedUserInfo) {
          return JSON.parse(savedUserInfo);
        }

        // Trả về userInfo mặc định nếu không thể lấy thông tin
        return {
          id: 0,
          name: "Đăng nhập",
          avatar: "",
          phone: "",
          email: "",
          address: "",
        };
      }
    }

    // Nếu người dùng không cấp quyền, sử dụng thông tin từ localStorage nếu có
    if (savedUserInfo) {
      return JSON.parse(savedUserInfo);
    }

    // Trả về userInfo mặc định nếu không có thông tin
    return {
      id: 0,
      name: "Đăng nhập",
      avatar: "",
      phone: "",
      email: "",
      address: "",
    };
  } catch (error) {
    console.warn("getSetting error:", error);

    // Fallback về thông tin từ localStorage nếu có
    if (savedUserInfo) {
      return JSON.parse(savedUserInfo);
    }

    // Trả về userInfo mặc định nếu có lỗi
    return {
      id: 0,
      name: "Đăng nhập",
      avatar: "",
      phone: "",
      email: "",
      address: "",
    };
  }
});

export const loadableUserInfoState = loadable(userInfoState);

export const phoneState = atom(async () => {
  let phone = "";

  // Ưu tiên 1: Lấy số điện thoại từ localStorage (user đã nhập thủ công)
  const savedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  if (savedUserInfo) {
    const parsed = JSON.parse(savedUserInfo);
    if (parsed.phone && parsed.phone.trim()) {
      phone = parsed.phone.trim();
      console.log("📱 [PhoneState] Using phone from localStorage:", phone);
    }
  }

  // Ưu tiên 2: Lấy token từ Zalo SDK và decode qua backend API
  try {
    const { token } = await getPhoneNumber({});

    if (token) {
      try {
        // Gọi API backend để decode token thành số điện thoại thật
        const decodedPhone = await decodePhoneToken(token);

        if (decodedPhone && decodedPhone.trim()) {
          phone = decodedPhone.trim();
          console.log("✅ [PhoneState] Phone decoded from Zalo SDK:", phone);

          // Lưu số điện thoại từ Zalo SDK vào localStorage để dùng lần sau
          if (savedUserInfo) {
            const parsed = JSON.parse(savedUserInfo);
            parsed.phone = phone;
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(parsed));
          } else {
            // Nếu chưa có userInfo trong localStorage, tạo mới
            const newUserInfo = {
              id: 0,
              name: "Đăng nhập",
              avatar: "",
              phone: phone,
              email: "",
              address: "",
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(newUserInfo));
          }
        }
      } catch (decodeError) {
        console.warn("⚠️ [PhoneState] Failed to decode phone token:", decodeError);
        // Tiếp tục với fallback
      }
    }
  } catch (error) {
    console.warn("⚠️ [PhoneState] Failed to get phone number from Zalo SDK:", error);
    // Tiếp tục với fallback
  }

  // Fallback cuối cùng: Số điện thoại test (chỉ dùng trong môi trường dev)
  const isDev = !window.ZJSBridge;
  if (!phone && isDev) {
    phone = "0912345678";
    console.warn("⚠️ [PhoneState] Using test phone (dev mode):", phone);
  }

  return phone || "";
});

export const bannersState = atom(() => requestWithFallback<string[]>("/banners", []));

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

export const categoriesState = atom(() => requestWithFallback<Category[]>("/categories", []));

export const categoriesStateUpwrapped = unwrap(categoriesState, (prev) => prev ?? []);

export const stationsState = atom(async () => {
  let location: Location | undefined;
  try {
    const { token } = await getLocation({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getLocation/ để chuyển đổi token thành thông tin vị trí người dùng ở server.
    // location = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    // toast("Đã lấy được token chứa thông tin vị trí người dùng. Phía tích hợp cần decode token này ở server. Giả lập vị trí tại VNG Campus...", {
    //   icon: "ℹ",
    //   duration: 10000,
    // });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    location = {
      lat: 10.773756,
      lng: 106.689247,
    };
    // End demo
  } catch (error) {
    console.warn(error);
  }

  const stations = await requestWithFallback<Station[]>("/stations", []);
  const stationsWithDistance = stations.map((station) => ({
    ...station,
    distance: location ? formatDistant(calculateDistance(location.lat, location.lng, station.location.lat, station.location.lng)) : undefined,
  }));

  return stationsWithDistance;
});

export const selectedStationIndexState = atom(0);

export const selectedStationState = atom(async (get) => {
  const index = get(selectedStationIndexState);
  const stations = await get(stationsState);
  return stations[index];
});

export const shippingAddressState = atomWithStorage<ShippingAddress | undefined>(CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS, undefined);

export const ordersState = atomFamily((status: OrderStatus) =>
  atomWithRefresh(async (get) => {
    try {
      // Lấy thông tin user hiện tại
      const userInfo = await get(userInfoState);
      let userPhone = (userInfo.phone || "").trim();

      // Nếu không có số điện thoại trong userInfo, thử lấy từ phoneState
      if (!userPhone) {
        console.warn("⚠️ [Orders] User phone is empty, trying to get from phoneState...");
        try {
          userPhone = (await get(phoneState)).trim();
        } catch (error) {
          console.warn("Failed to get phone from phoneState:", error);
        }
      }

      // Fallback về số điện thoại test nếu vẫn không có
      if (!userPhone) {
        console.warn("⚠️ [Orders] No phone found, using test phone: 0912345678");
        userPhone = "0912345678";
      }

      // console.log("🔍 [Orders] User info:", { id: userInfo.id, name: userInfo.name, phone: userPhone });

      // Gọi API lấy danh sách đơn hàng
      const apiOrders = await fetchOrders();
      // console.log("📦 [Orders] Total orders from API:", apiOrders.length);

      // Helper function để normalize số điện thoại (loại bỏ khoảng trắng, dấu gạch ngang, v.v.)
      const normalizePhone = (phone: string) => {
        return phone.replace(/\s+/g, "").replace(/-/g, "").replace(/\(/g, "").replace(/\)/g, "");
      };

      // Filter đơn hàng theo số điện thoại của user
      const userOrders = apiOrders.filter((order: any) => {
        const orderPhone = (order?.customer?.phone || order?.billing_address?.phone || order?.shipping_address?.phone || "").trim();
        const normalizedUserPhone = normalizePhone(userPhone);
        const normalizedOrderPhone = normalizePhone(orderPhone);
        const isMatch = normalizedOrderPhone && normalizedUserPhone && normalizedOrderPhone === normalizedUserPhone;

        // console.log(`📞 [Orders] Order #${order.order_number || order.id}: orderPhone="${orderPhone}", userPhone="${userPhone}", normalizedOrder="${normalizedOrderPhone}", normalizedUser="${normalizedUserPhone}", match=${isMatch}`);

        return isMatch;
      });

      // console.log("✅ [Orders] Filtered orders by phone:", userOrders.length, "out of", apiOrders.length);

      // Map dữ liệu từ API format sang Order format
      const mappedOrders: Order[] = userOrders.map((order: any) => {
        // Map paymentStatus từ financial_status (giữ nguyên giá trị từ API)
        let paymentStatus: PaymentStatus = "pending";
        const validPaymentStatuses: PaymentStatus[] = ["pending", "authorized", "partially_paid", "paid", "partially_refunded", "refunded", "voided"];

        if (order.financial_status && validPaymentStatuses.includes(order.financial_status as PaymentStatus)) {
          paymentStatus = order.financial_status as PaymentStatus;
        } else {
          // Fallback cho các giá trị cũ hoặc không hợp lệ
          if (order.financial_status === "paid") {
            paymentStatus = "paid";
          } else if (order.financial_status === "refunded") {
            paymentStatus = "refunded";
          } else if (order.financial_status === "voided") {
            paymentStatus = "voided";
          } else {
            paymentStatus = "pending";
          }
        }

        // Map status - ưu tiên kiểm tra đơn hàng đã hủy
        let orderStatus: OrderStatus = "pending";

        // Kiểm tra đơn hàng đã hủy: cancelled_at có giá trị hoặc cancelled_status === "cancelled"
        const isCancelled = (order.cancelled_at !== null && order.cancelled_at !== undefined) || order.cancelled_status === "cancelled";

        if (isCancelled) {
          orderStatus = "cancelled";
        } else {
          // Map fulfillment_status sang orderStatus
          // Valid values: fulfilled, null, notfulfilled, partial, restocked
          const fulfillmentStatus = order.fulfillment_status;

          if (fulfillmentStatus === "fulfilled") {
            // Tất cả sản phẩm đã được giao
            orderStatus = "completed";
          } else if (fulfillmentStatus === "partial") {
            // Ít nhất một sản phẩm đã được giao
            orderStatus = "shipping";
          } else if (fulfillmentStatus === "restocked") {
            // Tất cả sản phẩm đã được hoàn trả và đơn hàng đã hủy
            orderStatus = "cancelled";
          } else if (fulfillmentStatus === null || fulfillmentStatus === "notfulfilled" || fulfillmentStatus === undefined || fulfillmentStatus === "") {
            // Chưa có sản phẩm nào được giao
            orderStatus = "pending";
          } else {
            // Fallback cho các giá trị không xác định
            orderStatus = "pending";
          }
        }

        // console.log(`📋 [Orders] Order #${order.order_number || order.id}: cancelled_at="${order.cancelled_at}", cancelled_status="${order.cancelled_status}", fulfillment_status="${order.fulfillment_status}" → status="${orderStatus}", financial_status="${order.financial_status}" → paymentStatus="${paymentStatus}"`);

        // Map line_items sang items (CartItem[])
        const items: CartItem[] = (order.line_items || []).map((item: any) => {
          // Tạo product object từ line_item data
          const product: Product = {
            id: item.product_id || 0,
            title: item.title || item.name || "",
            name: item.title || item.name || "",
            body_html: "",
            body_plain: null,
            created_at: "",
            handle: String(item.product_id || ""),
            images: item.image?.src ? [{ src: item.image.src }] : [],
            product_type: item.type || "",
            published_at: "",
            published_scope: "global",
            tags: "",
            template_suffix: "",
            updated_at: "",
            variants: [
              {
                barcode: item.barcode || null,
                compare_at_price: item.price_original || item.price || 0,
                created_at: "",
                fulfillment_service: item.fulfillment_service || null,
                grams: item.grams || 0,
                id: item.variant_id || 0,
                inventory_management: null,
                inventory_policy: "deny",
                inventory_quantity: 0,
                old_inventory_quantity: 0,
                inventory_quantity_adjustment: null,
                position: 0,
                price: item.price || 0,
                product_id: item.product_id || 0,
                requires_shipping: item.requires_shipping !== false,
                sku: item.sku || null,
                taxable: item.taxable !== false,
                title: item.variant_title || "",
                updated_at: "",
                image_id: null,
                option1: null,
                option2: null,
                option3: null,
                inventory_advance: null,
              },
            ],
            vendor: item.vendor || "",
            options: [],
            only_hide_from_list: false,
            not_allow_promotion: item.not_allow_promotion || false,
          };

          // Thêm các field cần thiết cho OrderItem component
          (product as any).image = item.image?.src || "";
          (product as any).price = item.price || 0;
          (product as any).originalPrice = item.price_original || undefined;

          return {
            product,
            quantity: item.quantity || 1,
          };
        });

        // Map shipping address
        const shippingAddress: ShippingAddress = {
          alias: "",
          address: order.shipping_address?.address1 || "",
          address1: order.shipping_address?.address1 || null,
          address2: order.shipping_address?.address2 || null,
          name: order.shipping_address?.name || "",
          first_name: order.shipping_address?.first_name || null,
          last_name: order.shipping_address?.last_name || null,
          phone: order.shipping_address?.phone || "",
          email: order.email || null,
          company: order.shipping_address?.company || null,
          city: order.shipping_address?.city || null,
          province: order.shipping_address?.province || null,
          province_code: order.shipping_address?.province_code || null,
          district: order.shipping_address?.district || null,
          district_code: order.shipping_address?.district_code || null,
          ward: order.shipping_address?.ward || null,
          ward_code: order.shipping_address?.ward_code || null,
          zip: order.shipping_address?.zip || null,
          country: order.shipping_address?.country || null,
          country_code: order.shipping_address?.country_code || null,
          id: order.shipping_address?.id || undefined,
          default: order.shipping_address?.default || false,
        };

        const delivery: Delivery = {
          type: "shipping",
          ...shippingAddress,
        };

        // Tính shipping fee từ shipping_lines
        const shippingFee = order.shipping_lines?.reduce((sum: number, line: any) => sum + (line.price || 0), 0) || 0;
        const subtotal = order.subtotal_price || order.total_line_items_price || 0;

        return {
          id: order.id || order.number || 0,
          status: orderStatus,
          paymentStatus,
          createdAt: order.created_at ? new Date(order.created_at) : new Date(),
          receivedAt: order.updated_at ? new Date(order.updated_at) : new Date(),
          items,
          delivery,
          total: order.total_price || 0,
          note: order.note || "",
          transactions: order.transactions || [],
          gateway: order.gateway || null,
          order_number: order.order_number || order.name || order.number || undefined,
          subtotal,
          shippingFee,
        } as Order;
      });

      // Filter theo status
      const filteredByStatus = mappedOrders.filter((order) => order.status === status);

      // console.log(`🎯 [Orders] Filtered by status "${status}":`, filteredByStatus.length, "orders");
      // console.log("📊 [Orders] Final orders:", filteredByStatus);

      return filteredByStatus;
    } catch (error) {
      console.error("Error fetching orders:", error);
      // Trả về mảng rỗng nếu API lỗi, không fallback về local orders
      return [];
    }
  })
);

export const localOrdersState = atomWithStorage<Order[]>(CONFIG.STORAGE_KEYS.LOCAL_ORDERS, []);

export const deliveryModeState = atomWithStorage<Delivery["type"]>(CONFIG.STORAGE_KEYS.DELIVERY, "shipping");

// Lưu phương thức thanh toán được chọn: 'cod' hoặc 'bank_transfer'
export const paymentMethodState = atomWithStorage<string>("paymentMethod", "cod");

export const productsState = atom(async (get) => {
  const categories = await get(categoriesState);
  const products = await requestWithFallback<(Product & { categoryId: number })[]>("/products", []);
  const filtered = Array.isArray(products) ? products.filter((p: any) => (p?.published_scope ?? p?.publishedScope ?? "") === "global") : [];
  return filtered.map((product) => ({
    ...product,
    category: categories.find((category) => category.id === product.categoryId)!,
  }));
});

export const flashSaleProductsState = atom((get) => get(productsState));

export const recommendedProductsState = atom(async (get) => {
  try {
    const { products } = await fetchProductsPage(1, 10);
    if (products && products.length > 0) {
      return products.slice(0, 6);
    }
    const local = await get(productsState);
    return (local || []).slice(0, 6).map(
      (p: any) =>
        ({
          id: p.id,
          title: p.name ?? p.title ?? "",
          body_html: p.detail ?? "",
          body_plain: p.detail ?? "",
          created_at: p.createdAt ?? new Date().toISOString(),
          handle: p.handle ?? String(p.id),
          images: [{ src: p.image ?? "" }],
          variants: [{ price: p.price ?? 0 }],
          product_type: p.category?.name ?? "",
        } as any)
    );
  } catch (err) {
    console.error("recommendedProductsState error:", err);
    const products = await get(productsState);
    return (products || []).slice(0, 6).map(
      (p: any) =>
        ({
          id: p.id,
          title: p.name ?? p.title ?? "",
          body_html: p.detail ?? "",
          body_plain: p.detail ?? "",
          created_at: p.createdAt ?? new Date().toISOString(),
          handle: p.handle ?? String(p.id),
          images: [{ src: p.image ?? "" }],
          variants: [{ price: p.price ?? 0 }],
          product_type: p.category?.name ?? "",
        } as any)
    );
  }
});

export const productState = atomFamily((id: number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id === id);
  })
);

export const cartStateV2 = atom<Cart>([]);

export const cartState = atom<CartV2>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartStateV2);
  return {
    totalItems: items.length,
    totalAmount: items.reduce((total, item) => {
      const price = (item.product as any).price ?? Number(item.product.variants?.[0]?.price ?? 0);
      return total + price * item.quantity;
    }, 0),
  };
});

export const keywordState = atom("");

export const searchResultStateV2 = atom(async (get) => {
  const keyword = get(keywordState) || "";
  const q = keyword.trim();
  if (!q) return [];
  const haravanProducts = await searchProductsByTitle(q);
  return haravanProducts || [];
});

export const productsByCategoryState = atomFamily((id: String) =>
  atom(async (get) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const products = await get(productsState);
    return products.filter((product) => String(product.categoryId) === id);
  })
);

export const articlesState = atom(async () => {
  const list = await requestWithFallback<any[]>("/articles", []);
  if (!Array.isArray(list)) return [];
  return list.filter((a: any) => {
    if (typeof a.published === "boolean") return a.published === true;
    if (a.publishedAt || a.published_at) return Boolean(a.publishedAt ?? a.published_at);
    return true;
  });
});

export const articleState = atomFamily((id: number) =>
  atom(async (get) => {
    const articles = await get(articlesState);
    return articles.find((article) => article.id === id);
  })
);

export const relatedArticlesState = atomFamily((currentArticleId: number) =>
  atom(async (get) => {
    const articles = await get(articlesState);
    const currentArticle = articles.find((a) => a.id === currentArticleId);
    if (!currentArticle) return [];

    // Lấy các bài viết cùng category hoặc có tag chung, loại trừ bài hiện tại
    return articles
      .filter((article) => article.id !== currentArticleId && (article.category === currentArticle.category || article.tags.some((tag) => currentArticle.tags.includes(tag))))
      .slice(0, 3);
  })
);
