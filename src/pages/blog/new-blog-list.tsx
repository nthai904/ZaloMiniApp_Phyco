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

    // Bật loading trong lúc lấy danh mục để tránh màn trắng
    setLoading(true);

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
        const allCategories = Array.isArray(cats) ? cats : [];

        const categoriesWithPublished = await Promise.all(
          allCategories.map(async (cat: any) => {
            try {
              const catId = cat?.id ?? cat?.blog_id ?? cat?.key ?? null;
              if (!catId) return null;

              const articlesRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/${catId}`);
              const articlesData = await articlesRes.json();
              const articles = Array.isArray(articlesData) ? articlesData : articlesData?.articles ?? articlesData?.posts ?? articlesData?.list ?? [];
              const articlesArray = Array.isArray(articles) ? articles : [];

              const hasPublished = articlesArray.some((a: any) => {
                if (typeof a.published === "boolean") return a.published === true;
                if (a.published_at || a.publishedAt) return Boolean(a.published_at ?? a.publishedAt);
                return false;
              });

              return hasPublished ? cat : null;
            } catch (err) {
              console.error(`Error checking published articles for category ${cat?.id}:`, err);
              return null;
            }
          })
        );

        const filteredCategories = categoriesWithPublished.filter((c) => c != null);
        setCategories(filteredCategories);

        if (categoryId) {
          setSelectedCategory(categoryId);
        } else {
          const first = filteredCategories.length > 0 ? filteredCategories[0] : null;
          const firstId = first?.id ?? first?.blog_id ?? first?.key ?? null;
          setSelectedCategory(firstId ?? null);
        }

        // Nếu không có danh mục nào thì dừng loading để không hiển thị skeleton vô hạn
        if (filteredCategories.length === 0) {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching blog categories:", err);
        if (mounted) {
          setCategories([]);
          setArticles([]);
          // Tắt loading khi lỗi để tránh treo skeleton
          setLoading(false);
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
      // giữ nguyên loading trạng thái hiện tại để tránh flicker
      return;
    }
    let mounted = true;
    (async () => {
      try {
        setLoading(true); // giữ skeleton trong lúc lấy bài viết
        const res = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/${selectedCategory}`);
        const data = await res.json();
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : data?.articles ?? data?.posts ?? data?.list ?? [];
        setArticles(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        if (mounted) setArticles([]);
      } finally {
        if (mounted) setLoading(false); // tắt skeleton sau khi lấy xong
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  const SkeletonCard: React.FC = () => (
    <div className="rounded-lg border overflow-hidden">
      <div className="aspect-video bg-gray-200 animate-pulse"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div>
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

      <div className="mt-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {articles.map((article) => (
              <BlogItem key={article.id ?? article._id ?? Math.random()} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-subtitle"></div>
        )}
      </div>
    </div>
  );
}
