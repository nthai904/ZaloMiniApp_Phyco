import { atom } from "jotai";
import { fetchProductsList, fetchProductDetail, fetchBLogList, fetchBlogDetail } from "./service";

export const productsState = atom(async () => {
  try {
    const list = await fetchProductsList();
    return list ?? [];
  } catch (err) {
    console.error("Lỗi:", err);
    return [];
  }
});

export const productDetailState = atom<any | null>(null);

export const fetchProductDetailState = atom(null, async (get, set, id: number | string) => {
  try {
    const detail = await fetchProductDetail(id);
    set(productDetailState, detail);
  } catch (err) {
    console.error("Lỗi:", err);
    set(productDetailState, null);
  }
});

export const blogsState = atom(async () => {
  try {
    const list = await fetchBLogList();
    return list ?? [];
  } catch (err) {
    console.error("Lỗi:", err);
    return [];
  }
});

export const blogDetailState = atom<any | null>(null);

export const fetchBlogDetailState = atom(null, async (get, set, id: number | string) => {
  try {
    const detail = await fetchBlogDetail(id);
    set(blogDetailState, detail);
  } catch (err) {
    console.error("Lỗi:", err);
    set(blogDetailState, null);
  }
});
