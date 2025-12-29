import { ProductV2 } from "@/types";

export interface PaginatedProductsResponse {
  products: ProductV2[];
  page: number;
  perPage: number;
  total?: number;
  total_pages?: number;
}

export async function fetchProductsPage(page = 1, perPage = 20, collectionId?: string | number): Promise<PaginatedProductsResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(perPage));
  if (collectionId != null && collectionId !== "") qs.set("collection_id", String(collectionId));

  const path = `/api/product?${qs.toString()}`;

  const res = await fetch(path, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Không lấy sản phẩm ra được ${page}: ${res.status} ${res.statusText}`);
  }

  const body = await res.json();

  const products: ProductV2[] = Array.isArray(body.products) ? body.products : Array.isArray(body) ? body : [];

  return {
    products,
    page,
    perPage,
    total: typeof body.total === "number" ? body.total : undefined,
    total_pages: typeof body.total_pages === "number" ? body.total_pages : undefined,
  };
}

export async function fetchAllProducts(perFetch = 100, concurrency = 4, collectionId?: string | number): Promise<ProductV2[]> {
  const first = await fetchProductsPage(1, perFetch, collectionId);
  let all = first.products.slice();

  const totalPages = first.total_pages ?? 0;

  if (totalPages <= 1) {
    let p = 2;
    while (true) {
      const res = await fetchProductsPage(p, perFetch, collectionId);
      if (!res.products || res.products.length === 0) break;
      all = all.concat(res.products);
      if (res.products.length < perFetch) break;
      p++;
    }
    return all;
  }

  const pages: number[] = [];
  for (let p = 2; p <= totalPages; p++) pages.push(p);

  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    const promises = batch.map((p) => fetchProductsPage(p, perFetch, collectionId).then((r) => r.products || []));
    const results = await Promise.all(promises);
    for (const res of results) {
      if (res && res.length) all = all.concat(res);
    }
  }

  return all;
}

function normalizeForSearch(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export async function searchProductsByTitle(query: string): Promise<ProductV2[]> {
  const q = (query || "").trim();
  if (!q) return [];

  (searchProductsByTitle as any)._cache = (searchProductsByTitle as any)._cache || new Map<string, ProductV2[]>();
  const cache: Map<string, ProductV2[]> = (searchProductsByTitle as any)._cache;
  if (cache.has(q)) return cache.get(q)!;

  const perFetch = 100;
  const maxScanned = 1000;
  let scanned = 0;
  let page = 1;
  let matched: ProductV2[] = [];
  const qNorm = normalizeForSearch(q);

  try {
    while (scanned < maxScanned) {
      const res = await fetchProductsPage(page, perFetch);
      const items = res.products || [];
      scanned += items.length;
      for (const p of items) {
        const title = (p.title || "").toString();
        if (normalizeForSearch(title).includes(qNorm)) matched.push(p);
      }
      if (!items || items.length < perFetch) break;
      page++;
    }

    cache.set(q, matched.slice(0, 500));
    return matched;
  } catch (err) {
    throw err;
  }
}

export interface CreateOrderPayload {
  order: {
    email?: string;
    phone?: string;
    shipping_address?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      address1?: string;
      province?: string;
      country?: string;
      [key: string]: any;
    };
    source?: string;
    gateway?: string;
    gateway_code?: string;
    financial_status?: string;
    line_items: Array<{
      variant_id: string;
      quantity: number;
      price?: number;
      [key: string]: any;
    }>;
    total_price?: number;
    note_attributes?: Array<{
      name: string;
      value: string;
    }>;
    [key: string]: any;
  };
}

export interface OrderResponse {
  order: any;
}

/**
 * Tạo đơn hàng mới trên Haravan
 * @param payload - Payload chứa thông tin đơn hàng
 * @returns Promise<OrderResponse> - Response từ API
 */
export async function createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
  // console.log("Payload gửi lên API:", JSON.stringify(payload, null, 2));

  const res = await fetch("/api/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API Error Response:", errorText);
    let errorMessage = `Tạo đơn hàng thất bại: ${res.status} ${res.statusText}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorJson.errors || JSON.stringify(errorJson) || errorMessage;
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }

  const body = await res.json();
  return body;
}
