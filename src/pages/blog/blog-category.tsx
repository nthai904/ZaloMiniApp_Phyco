import TransitionLink from "@/components/transition-link";
import { blogsState } from "@/api/state";
import { articlesState } from "@/state";
import { useAtomValue } from "jotai";
import { useMemo, useEffect, useState } from "react";

export default function BlogCategory() {
  const blogs = useAtomValue(blogsState) as any[] | undefined;
  const articles = useAtomValue(articlesState) as any[] | undefined;

  const categories = useMemo(() => {
    if (Array.isArray(blogs) && blogs.length > 0) {
      return blogs.map((b) => ({
        id: b.id ?? b.handle ?? String(b.title ?? Math.random()),
        title: b.title ?? b.name ?? b.handle ?? "",
        count: b.article_count ?? b.count ?? 0,
      }));
    }

    const map = new Map<string, { id: string; title: string; count: number }>();
    (articles ?? []).forEach((a) => {
      const key = a.category ?? "Chưa phân loại";
      if (!map.has(key)) {
        map.set(key, { id: key, title: key, count: 0 });
      }
      const item = map.get(key)!;
      item.count += 1;
    });

    return Array.from(map.values());
  }, [blogs, articles]);

  const [countsById, setCountsById] = useState<Record<string, number>>({});

  useEffect(() => {
    const ids = categories.map((c: any) => String(c.id)).filter((id) => id && /^\d+$/.test(id)) as string[];
    if (!ids || ids.length === 0) return;

    let mounted = true;

    (async () => {
      try {
        const promises = ids.map(async (id) => {
          try {
            const res = await fetch(`/api/blog/${encodeURIComponent(id)}/count`, { method: "GET", headers: { Accept: "application/json" } });
            if (!res.ok) {
              throw new Error(`${res.status} ${res.statusText}`);
            }
            const data = await res.json().catch(() => ({}));
            // Haravan count response expected { count: N }
            const count = data?.count ?? data?.total ?? (Array.isArray(data?.articles) ? data.articles.length : undefined) ?? null;
            return { id, count };
          } catch (err) {
            return { id, count: null };
          }
        });

        const results = await Promise.all(promises);
        if (!mounted) return;
        const next: Record<string, number> = {};
        results.forEach((r) => {
          if (r.count != null) next[r.id] = Number(r.count);
        });
        setCountsById((prev) => ({ ...prev, ...next }));
      } catch (e) {}
    })();

    return () => {
      mounted = false;
    };
  }, [categories]);

  if (!categories || categories.length === 0) return null;

  return (
    <div className="min-h-full bg-background">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4 tracking-wide" style={{ color: "#182864" }}>
          Danh mục bài viết
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const hasId = Boolean((cat as any).id);
            const href = hasId ? `/articles-v2?blogId=${encodeURIComponent(String((cat as any).id))}` : `/articles?category=${encodeURIComponent(cat.title)}`;

            return (
              <TransitionLink
                to={href}
                key={(cat as any).id ?? cat.title}
                className="
                  group block rounded-lg border border-gray-200
                  bg-white px-4 py-3
                  shadow-sm hover:shadow-md
                  transition-all duration-300
                "
                style={{
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="
                    flex flex-col justify-center
                    transition-all duration-300
                    group-hover:text-white
                  "
                >
                  <h3
                    className="
                      text-sm font-semibold mb-1 
                      line-clamp-2
                    "
                  >
                    {cat.title}
                  </h3>
                  <p className="text-xs opacity-70">{countsById[String((cat as any).id)] ?? cat.count} bài viết</p>
                </div>

                {/* Hover background */}
                <style>
                  {`
                    .group:hover {
                      background-color: #182864 !important;
                      border-color: #182864 !important;
                    }
                  `}
                </style>
              </TransitionLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}
