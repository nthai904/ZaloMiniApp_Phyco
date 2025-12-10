import { atom } from "jotai";
import { fetchProductsList, fetchProductDetail, fetchBLogList, fetchBlogDetail } from "./service";
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
    const list = await fetchBLogList();
    return list ?? [];
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
