import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import BlogItem from "./blog-item";
import { Article } from "@/types";
import { useAtomValue } from "jotai";
import { blogsState } from "@/api/state";

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
}

export default function BlogListV2() {
  const [searchParams] = useSearchParams();
  const blogId = searchParams.get("blogId");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const blogs = useAtomValue(blogsState) as any[] | undefined;

  const blogTitle = useMemo(() => {
    if (!blogId || !blogs) return undefined;
    const b = blogs.find((x) => String(x.id) === String(blogId) || String(x.handle) === String(blogId));
    return b?.title ?? b?.name ?? undefined;
  }, [blogId, blogs]);

  useEffect(() => {
    if (!blogId) return;

    let mounted = true;
    const url = `/api/blog/${encodeURIComponent(blogId)}`;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
        if (!res.ok) {
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        const raw = data?.articles ?? [];

        const mapped: Article[] = Array.isArray(raw)
          ? raw.map((a: any) => {
              const content = a.body_html ?? a.content ?? a.excerpt ?? "";
              const image = a.image?.src ?? a.image ?? "";
              const tags = typeof a.tags === "string" ? a.tags.split(",").map((t: string) => t.trim()) : a.tags ?? [];
              return {
                id: Number(a.id) || 0,
                title: a.title ?? "",
                excerpt: a.excerpt ?? a.summary_html ?? "",
                content: content,
                image: image,
                author: { name: a.author ?? "", avatar: "" },
                category: String(a.blog_id ?? a.blogId ?? blogId ?? ""),
                publishedAt: a.published_at ?? a.publishedAt ?? new Date().toISOString(),
                readTime: Math.max(1, Math.round((stripHtml(content) || "").length / 200)),
                views: a.views ?? 0,
                tags: tags,
              };
            })
          : [];

        if (mounted) setArticles(mapped);
      } catch (err: any) {
        if (mounted) setError(err.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [blogId]);

  return (
    <div className="min-h-full bg-background">
      <div className="bg-section sticky top-0 z-10 px-4 py-3 shadow-sm">
        <h2 className="text-lg font-semibold">{blogTitle ? `Bài viết: ${blogTitle}` : blogId ? `Danh mục ${blogId}` : "Bài viết"}</h2>
      </div>

      <div className="p-4">
        {loading && (
          <div className="text-center py-12">
            <p className="text-subtitle">Đang tải bài viết...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Lỗi: {error}</p>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-subtitle">Không có bài viết cho danh mục này.</p>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((article) => (
              <BlogItem key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
