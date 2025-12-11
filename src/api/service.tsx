import { Article, Blog } from "@/types";

// Route lấy ra danh sách sản phẩm
export async function fetchProductsList() {
  const url = `/api/product`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.products ?? data;
}

// Route lấy ra chi tiết sản phẩm theo id
export async function fetchProductDetail(id: number | string) {
  const url = `/api/product/${id}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }

  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.product ?? data;
}

// Route lấy ra danh sách bài viết
export async function fetchBLogList(): Promise<Blog[]> {
  const url = `/api/blog`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return data?.blogs ?? data;
}

// Route lấy số lượng bài viết của blog (count)
export async function fetchBlogCount(id: number | string): Promise<number> {
  const url = `/api/blog/${id}/count`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  return Number(data?.count ?? data?.total ?? 0);
}

export async function fetchBlogHasPublished(id: number | string): Promise<boolean> {
  const url = `/api/blog/${id}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }
  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  const rawArticles = data?.articles ?? [];
  if (!Array.isArray(rawArticles)) return false;

  return rawArticles.some((a: any) => {
    if (typeof a.published === "boolean") return a.published === true;
    if (a.published_at) return Boolean(a.published_at);
    return false;
  });
}

// Route lấy ra chi tiết bài viết
export async function fetchBlogDetail(id: number | string): Promise<Article[]> {
  const url = `/api/blog/${id}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kết nối thất bại ${res.status} ${res.statusText} - ${text.slice(0, 200)}`);
  }

  const data = await res.json().catch((err) => {
    throw new Error(`Không kết nối được api - ${err.message}`);
  });

  const rawArticles = data?.articles ?? data;

  const mapped = Array.isArray(rawArticles)
    ? rawArticles.map((a: any) => {
        const content = a.body_html ?? a.content ?? a.excerpt ?? "";
        const imageSrc = a.image?.src ?? a.image ?? (a.featured_image || "") ?? "";
        const tags = typeof a.tags === "string" ? a.tags.split(",").map((t: string) => t.trim()) : a.tags ?? [];

        const authorName = ((): string => {
          if (!a) return "";
          // author can be string, or object { name, avatar }
          if (typeof a.author === "string") return a.author;
          if (a.author && typeof a.author === "object") {
            return a.author.name ?? a.author_name ?? "";
          }
          return a.author_name ?? "";
        })();

        const authorAvatar = ((): string => {
          if (!a) return "";
          if (a.author && typeof a.author === "object") return a.author.avatar ?? a.author.image ?? "";
          return a.author_avatar ?? a.author_image ?? "";
        })();

        return {
          id: Number(a.id) || 0,
          title: a.title ?? "",
          excerpt: a.excerpt ?? a.summary ?? "",
          content: content,
          image: imageSrc,
          author: { name: authorName, avatar: authorAvatar },
          category: a.blog_id ? String(a.blog_id) : a.category ?? "",
          blog_id: a.blog_id ?? a.blogId ?? undefined,
          blog_handle: a.blog_handle ?? a.handle ?? undefined,
          publishedAt: a.published_at ?? a.publishedAt ?? new Date().toISOString(),
          readTime: Math.max(1, Math.round((content || "").length / 200)),
          views: a.views ?? 0,
          tags: tags,
        };
      })
    : rawArticles;

  return mapped;
}
