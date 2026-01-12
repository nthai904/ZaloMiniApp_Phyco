import React, { useEffect, useState } from "react";
import BlogItem from "./blog-item";

interface NewBlogListProps {
  categoryId?: string | number;
}

export default function NewBlogList({ categoryId }: NewBlogListProps = {}) {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchPostsForCategory(id: string | number) {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/${id}`);
        const data = await res.json();
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : data?.articles ?? data?.posts ?? data?.list ?? [];
        setArticles(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/`);
        const data = await res.json();
        const cats = Array.isArray(data) ? data : data?.blogs ?? data?.categories ?? [];
        if (!mounted) return;
        const list = Array.isArray(cats) ? cats : [];
        setCategories(list);

        // If user passed a categoryId prop, use it; otherwise select first
        if (categoryId) {
          setSelectedCategory(categoryId);
        } else {
          const first = list.length > 0 ? list[0] : null;
          const firstId = first?.id ?? first?.blog_id ?? first?.key ?? null;
          setSelectedCategory(firstId ?? null);
        }
      } catch (err) {
        console.error("Error fetching blog categories:", err);
        if (mounted) {
          setCategories([]);
          setArticles([]);
        }
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  useEffect(() => {
    if (!selectedCategory) {
      setArticles([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/${selectedCategory}`);
        const data = await res.json();
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : data?.articles ?? data?.posts ?? data?.list ?? [];
        setArticles(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  return (
    <div>
      {/* Categories pills */}
      <div className="flex gap-2 overflow-x-auto py-2">
        {categories.map((cat) => {
          const idVal = cat?.id ?? cat?.blog_id ?? cat?.key ?? String(cat?.handle ?? cat?.title ?? Math.random());
          const label = cat?.title ?? cat?.handle ?? cat?.name ?? "Danh mục";
          const isSelected = String(idVal) === String(selectedCategory);
          return (
            <button
              key={idVal}
              onClick={() => setSelectedCategory(idVal)}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-sm ${isSelected ? "bg-primary text-white" : "bg-white border"}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Articles grid or loading/empty state */}
      <div className="mt-3">
        {loading ? (
          <div className="text-center py-12 text-subtitle"></div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((article) => (
              <BlogItem key={article.id ?? article._id ?? Math.random()} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-subtitle">Chưa có bài viết trong danh mục này</div>
        )}
      </div>
    </div>
  );
}
