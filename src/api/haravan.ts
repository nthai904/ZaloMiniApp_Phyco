import { ProductV2 } from "@/typesv2";

export interface PaginatedProductsResponse {
  products: ProductV2[];
  page: number;
  perPage: number;
  total?: number;
  total_pages?: number;
}

export async function fetchProductsPage(
  page = 1,
  perPage = 20
): Promise<PaginatedProductsResponse> {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(perPage));

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

  const products: ProductV2[] = Array.isArray(body.products)
    ? body.products
    : 
      Array.isArray(body)
    ? body
    : [];

  return {
    products,
    page,
    perPage,
    total: typeof body.total === "number" ? body.total : undefined,
    total_pages: typeof body.total_pages === "number" ? body.total_pages : undefined,
  };
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

  try {
    const { products } = await fetchProductsPage(1, 1000);
    const qNorm = normalizeForSearch(q);

    const matched = (products || []).filter((p) => {
      const title = (p.title || "").toString();
      return normalizeForSearch(title).includes(qNorm);
    });

    return matched;
  } catch (err) {
    throw err;
  }
}
