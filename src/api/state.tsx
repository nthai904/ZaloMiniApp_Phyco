import { atom } from "jotai";
import {
  fetchProductsList,
  fetchProductDetail,
  fetchBLogList,
  fetchBlogDetail,
  fetchBlogCount,
  fetchBlogHasPublished,
  fetchCollections,
  fetchProductsByCollection,
} from "./service";
import { atomFamily } from "jotai/utils";

// Danh sách sản phẩm
export const productsState = atom(async () => {
  try {
    const list = await fetchProductsList();
    return list ?? [];
  } catch (err: any) {
    console.error("Lỗi:", err.message);
    return [];
  }
});

// Chi tiết sản phẩm theo id
export const productDetailState = atomFamily((id: number | string) => atom<any | null>(null));

export const fetchProductDetailState = atom(null, async (get, set, id: number | string) => {
  try {
    const detail = await fetchProductDetail(id);
    set(productDetailState(id), detail);
  } catch (err: any) {
    console.error("Lỗi:", err.message);
    set(productDetailState(id), null);
  }
});

export const blogsState = atom(async () => {
  try {
    const list = (await fetchBLogList()) ?? [];
    const ids: (number | string)[] = Array.isArray(list) ? list.map((b: any) => b.id).filter(Boolean) : [];
    if (ids.length > 0) {
      try {
        const promises = ids.map((id) => Promise.all([fetchBlogCount(id).catch(() => null), fetchBlogHasPublished(id).catch(() => false)]));
        const results = await Promise.all(promises);
        const mapped = list.map((b: any, idx: number) => {
          const [count, hasPublished] = results[idx] ?? [];
          return { ...(b ?? {}), article_count: count ?? b.article_count ?? b.count ?? 0, hasPublished: Boolean(hasPublished) };
        });
        return mapped;
      } catch (e) {
        return list;
      }
    }

    return list;
  } catch (err: any) {
    console.error("Lỗi:", err.message);
    return [];
  }
});

export const blogArticlesState = atomFamily((blogId: number | string) =>
  atom(async () => {
    try {
      const articles = await fetchBlogDetail(blogId);
      return articles ?? [];
    } catch (err: any) {
      console.error("Lỗi lấy bài viết blog:", err.message);
      return [];
    }
  })
);

export const blogDetailState = atom<any | null>(null);

export const fetchBlogDetailState = atom(null, async (get, set, id: number | string) => {
  try {
    const detail = await fetchBlogDetail(id);
    set(blogDetailState, detail);
  } catch (err: any) {
    console.error("Lỗi:", err.message);
    set(blogDetailState, null);
  }
});

export const collectionsState = atom(async () => {
  try {
    return await fetchCollections();
  } catch (e: any) {
    console.error("Lỗi load danh mục:", e.message);
    return [];
  }
});

// Sản phẩm theo danh mục
export const productsByCollectionState = atomFamily((collectionId: number | string) =>
  atom(async () => {
    try {
      return await fetchProductsByCollection(collectionId);
    } catch (e: any) {
      console.error("Lỗi load sản phẩm:", e.message);
      return [];
    }
  })
);
