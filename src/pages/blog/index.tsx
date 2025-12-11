import { useAtomValue } from "jotai";
import { blogsState } from "@/api/state";
import { articlesState } from "@/state";
import BlogCategory from "./blog-category";
import BlogItem from "./blog-item";
import { fetchBlogDetail } from "@/api/service";
import { useEffect, useState } from "react";

export default function BlogList() {
  const blogs = useAtomValue(blogsState) as any[] | undefined;
  const articles = useAtomValue(articlesState) as any[] | undefined;

  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [apiArticles, setApiArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!blogs || blogs.length === 0) return;
    if (selectedBlogId || selectedCategory) return;
    const first = blogs.find((b) => b.hasPublished || (b.article_count ?? b.count) > 0);
    if (first && first.id) {
      setSelectedBlogId(String(first.id));
    }
  }, [blogs, selectedBlogId, selectedCategory]);

  useEffect(() => {
    let mounted = true;
    if (!selectedBlogId) return;
    setLoading(true);
    (async () => {
      try {
        const list = await fetchBlogDetail(selectedBlogId);
        if (!mounted) return;
        setApiArticles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error fetching blog detail", err);
        if (mounted) setApiArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedBlogId]);

  useEffect(() => {
    if (selectedCategory && !selectedBlogId) {
      const filtered = (articles ?? []).filter((a) => a.category === selectedCategory);
      setApiArticles(filtered);
    }
  }, [selectedCategory, selectedBlogId, articles]);

  function handleSelect(payload: { id?: string; title?: string }) {
    if (!payload || (typeof payload.id === "undefined" && typeof payload.title === "undefined") || (payload.id == null && payload.title == null)) {
      setSelectedBlogId(null);
      setSelectedCategory(null);
      return;
    }

    if (payload.id && /^\d+$/.test(String(payload.id))) {
      setSelectedCategory(null);
      setSelectedBlogId(String(payload.id));
    } else if (payload.title) {
      setSelectedBlogId(null);
      setSelectedCategory(payload.title);
    }
  }

  return (
    <div className="min-h-full bg-background">
      <div className="p-4">
        <BlogCategory
          onSelect={handleSelect}
          selectedKey={selectedBlogId ?? selectedCategory}
          onCategoryChange={(k) => {
            // k is string|null
            if (!k) {
              handleSelect({});
            } else if (/^\d+$/.test(String(k))) {
              handleSelect({ id: String(k) });
            } else {
              handleSelect({ title: String(k) });
            }
          }}
        />

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-12 text-subtitle">Đang tải bài viết...</div>
          ) : apiArticles && apiArticles.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {apiArticles.map((article) => (
                <BlogItem key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-subtitle">Chưa có bài viết trong danh mục này</div>
          )}
        </div>
      </div>
    </div>
  );
}
