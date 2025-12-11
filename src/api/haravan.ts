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
    throw new Error(`Failed to fetch products page ${page}: ${res.status} ${res.statusText}`);
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
