import { atom } from "jotai";
import {
  atomFamily
} from "jotai/utils";
import { requestWithFallback } from "@/utils/request";

// import các interface chức năng mới
import { CartV2 } from "./typesv2";

export const cartState = atom<CartV2>([]);

export const selectedCartItemIdsState = atom<number[]>([]);

export const cartTotalState = atom((get) => {
  const items = get(cartState);

  return {
    totalItems: items.length,

    totalAmount: items.reduce((total, item) => {
      const price = Number(item.product.variants?.[0]?.price ?? 0);
      return total + price * item.quantity;
    }, 0),
  };
});

export const articlesState = atom(async () => {
  const list = await requestWithFallback<any[]>('/articles', []);
  if (!Array.isArray(list)) return [];
  return list.filter((a: any) => {
    if (typeof a.published === 'boolean') return a.published === true;
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
      .filter(
        (article) =>
          article.id !== currentArticleId &&
          (article.category === currentArticle.category ||
            article.tags.some((tag) => currentArticle.tags.includes(tag)))
      )
      .slice(0, 3);
  })
);
