import { atom } from "jotai";
import {
  atomFamily,
  atomWithRefresh,
  atomWithStorage,
  loadable,
  unwrap,
} from "jotai/utils";
import {
  Article,
  Cart,
  Category,
  Delivery,
  Location,
  Order,
  OrderStatus,
  Product,
  ShippingAddress,
  Station,
  UserInfo,
} from "@/types";
import { requestWithFallback } from "@/utils/request";
import {
  getLocation,
  getPhoneNumber,
  getSetting,
  getUserInfo,
} from "zmp-sdk/apis";
import toast from "react-hot-toast";
import { calculateDistance } from "./utils/location";
import { formatDistant } from "./utils/format";
import CONFIG from "./config";
import { searchProductsByTitle, fetchProductsPage } from "@/api/haravan";

export const userInfoKeyState = atom(0);

export const userInfoState = atom<Promise<UserInfo>>(async (get) => {
  get(userInfoKeyState);

  // Nếu người dùng đã chỉnh sửa thông tin tài khoản trước đó, sử dụng thông tin đã lưu trữ
  const savedUserInfo = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);
  // Phía tích hợp có thể thay đổi logic này thành fetch từ server
  // const savedUserInfo = await fetchUserInfo({ token: await getAccessToken() });
  if (savedUserInfo) {
    return JSON.parse(savedUserInfo);
  }

  const {
    authSetting: {
      "scope.userInfo": grantedUserInfo,
      "scope.userPhonenumber": grantedPhoneNumber,
    },
  } = await getSetting({});
  const isDev = !window.ZJSBridge;
  if (grantedUserInfo || isDev) {
    // Người dùng cho phép truy cập tên và ảnh đại diện
    const { userInfo } = await getUserInfo({});
    const phone =
      grantedPhoneNumber || isDev // Người dùng cho phép truy cập số điện thoại
        ? await get(phoneState)
        : "";
    return {
      id: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar,
      phone,
      email: "",
      address: "",
    };
  }
});

export const loadableUserInfoState = loadable(userInfoState);

export const phoneState = atom(async () => {
  let phone = "";
  try {
    const { token } = await getPhoneNumber({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getPhoneNumber/ để chuyển đổi token thành số điện thoại người dùng ở server.
    // phone = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    toast(
      "Đã lấy được token chứa số điện thoại người dùng. Phía tích hợp cần decode token này ở server. Giả lập số điện thoại 0912345678...",
      {
        icon: "ℹ",
        duration: 10000,
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    phone = "0912345678";
    // End demo
  } catch (error) {
    console.warn(error);
  }
  return phone;
});

export const bannersState = atom(() =>
  requestWithFallback<string[]>("/banners", [])
);

export const tabsState = atom(["Tất cả", "Nam", "Nữ", "Trẻ em"]);

export const selectedTabIndexState = atom(0);

export const categoriesState = atom(() =>
  requestWithFallback<Category[]>("/categories", [])
);

export const categoriesStateUpwrapped = unwrap(
  categoriesState,
  (prev) => prev ?? []
);

export const productsState = atom(async (get) => {
  const categories = await get(categoriesState);
  const products = await requestWithFallback<(Product & { categoryId: number })[]>('/products', []);
  const filtered = Array.isArray(products) ? products.filter((p: any) => (p?.published_scope ?? p?.publishedScope ?? '') === 'global') : [];
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
    // fallback to local productsState (map local Product -> ProductV2-like shape)
    const local = await get(productsState);
    return (local || []).slice(0, 6).map((p: any) => ({
      id: p.id,
      title: p.name ?? p.title ?? "",
      body_html: p.detail ?? "",
      body_plain: p.detail ?? "",
      created_at: p.createdAt ?? new Date().toISOString(),
      handle: p.handle ?? String(p.id),
      images: [{ src: p.image ?? "" }],
      variants: [{ price: p.price ?? 0 }],
      product_type: p.category?.name ?? "",
    } as any));
  } catch (err) {
    console.error("recommendedProductsState error:", err);
    const products = await get(productsState);
    return (products || []).slice(0, 6).map((p: any) => ({
      id: p.id,
      title: p.name ?? p.title ?? "",
      body_html: p.detail ?? "",
      body_plain: p.detail ?? "",
      created_at: p.createdAt ?? new Date().toISOString(),
      handle: p.handle ?? String(p.id),
      images: [{ src: p.image ?? "" }],
      variants: [{ price: p.price ?? 0 }],
      product_type: p.category?.name ?? "",
    } as any));
  }
});

export const productState = atomFamily((id: number) =>
  atom(async (get) => {
    const products = await get(productsState);
    return products.find((product) => product.id === id);
  })
);

export const cartState = atom<Cart>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartState);
  return {
    totalItems: items.length,
    totalAmount: items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    ),
  };
});

export const keywordState = atom("");

export const searchResultStateV2 = atom(async (get) => {
  const keyword = get(keywordState) || "";
  const q = keyword.trim();
  if (!q) return [];
  // Call Haravan search helper and return ProductV2[] so components expecting ProductV2 work
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

export const stationsState = atom(async () => {
  let location: Location | undefined;
  try {
    const { token } = await getLocation({});
    // Phía tích hợp làm theo hướng dẫn tại https://mini.zalo.me/documents/api/getLocation/ để chuyển đổi token thành thông tin vị trí người dùng ở server.
    // location = await decodeToken(token);

    // Các bước bên dưới để demo chức năng, phía tích hợp có thể bỏ đi sau.
    toast(
      "Đã lấy được token chứa thông tin vị trí người dùng. Phía tích hợp cần decode token này ở server. Giả lập vị trí tại VNG Campus...",
      {
        icon: "ℹ",
        duration: 10000,
      }
    );
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
    distance: location
      ? formatDistant(
          calculateDistance(
            location.lat,
            location.lng,
            station.location.lat,
            station.location.lng
          )
        )
      : undefined,
  }));

  return stationsWithDistance;
});

export const selectedStationIndexState = atom(0);

export const selectedStationState = atom(async (get) => {
  const index = get(selectedStationIndexState);
  const stations = await get(stationsState);
  return stations[index];
});

export const shippingAddressState = atomWithStorage<
  ShippingAddress | undefined
>(CONFIG.STORAGE_KEYS.SHIPPING_ADDRESS, undefined);

export const ordersState = atomFamily((status: OrderStatus) =>
  atomWithRefresh(async () => {
    // Phía tích hợp thay đổi logic filter server-side nếu cần:
    // const serverSideFilteredData = await requestWithFallback<Order[]>(`/orders?status=${status}`, []);
    const allMockOrders = await requestWithFallback<Order[]>("/orders", []);
    const clientSideFilteredData = allMockOrders.filter(
      (order) => order.status === status
    );
    return clientSideFilteredData;
  })
);

export const deliveryModeState = atomWithStorage<Delivery["type"]>(
  CONFIG.STORAGE_KEYS.DELIVERY,
  "shipping"
);

export const articlesState = atom(async () => {
  const list = await requestWithFallback<any[]>('/articles', []);
  if (!Array.isArray(list)) return [];
  return list.filter((a: any) => {
    if (typeof a.published === 'boolean') return a.published === true;
    if (a.publishedAt || a.published_at) return Boolean(a.publishedAt ?? a.published_at);
    return true; // keep if unknown shape
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
      .filter(
        (article) =>
          article.id !== currentArticleId &&
          (article.category === currentArticle.category ||
            article.tags.some((tag) => currentArticle.tags.includes(tag)))
      )
      .slice(0, 3);
  })
);
