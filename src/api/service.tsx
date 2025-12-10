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
export async function fetchBLogList() {
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

// Route lấy ra chi tiết bài viết
export async function fetchBlogDetail(id: number | string) {
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

        return {
          id: Number(a.id) || 0,
          title: a.title ?? "",
          excerpt: a.excerpt ?? a.summary ?? "",
          content: content,
          image: imageSrc,
          author: { name: a.author ?? a.author_name ?? "", avatar: "" },
          category: a.blog_id ? String(a.blog_id) : a.category ?? "",
          publishedAt: a.published_at ?? a.publishedAt ?? new Date().toISOString(),
          readTime: Math.max(1, Math.round((content || "").length / 200)),
          views: a.views ?? 0,
          tags: tags,
        };
      })
    : rawArticles;

  return mapped;
}
