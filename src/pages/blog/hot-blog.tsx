import TransitionLink from "@/components/transition-link";
import LazyImage from "@/components/lazy-image";
import { useEffect, useState, useRef } from "react";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

export default function HotBlog() {
  const [list, setList] = useState<any[]>([]);
  const HOT_TAGS = new Set(["noi-bat", "noibat"]);

  const hasHotTag = (article: any) => {
    if (!article) return false;
    const raw = article.tags ?? article.tags_raw ?? article.tags_list ?? article.tag_list ?? article.meta_tags;
    if (!raw) return false;
    if (Array.isArray(raw)) {
      return raw.some((t) => typeof t === "string" && HOT_TAGS.has(t.trim().toLowerCase()));
    }
    if (typeof raw === "string") {
      return raw
        .split(/[;,|\s]+/)
        .map((s) => s.trim().toLowerCase())
        .some((t) => HOT_TAGS.has(t));
    }
    return false;
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchHotArticles() {
      setLoading(true);
      try {
        const blogsRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/`);
        const blogsData = await blogsRes.json();
        const blogs = Array.isArray(blogsData) ? blogsData : blogsData?.blogs ?? blogsData?.categories ?? [];

        if (!mounted || !Array.isArray(blogs) || blogs.length === 0) {
          setList([]);
          return;
        }

        const allArticlesPromises = blogs.map(async (blog: any) => {
          const blogId = blog.id ?? blog.blog_id ?? blog.key;
          if (!blogId) return [];

          try {
            const articlesRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/${blogId}`);
            const articlesData = await articlesRes.json();
            const articles = Array.isArray(articlesData) ? articlesData : articlesData?.articles ?? articlesData?.posts ?? articlesData?.list ?? [];
            return Array.isArray(articles) ? articles : [];
          } catch (err) {
            console.error(`Error fetching articles for blog ${blogId}:`, err);
            return [];
          }
        });

        const allArticlesArrays = await Promise.all(allArticlesPromises);
        const allArticles = ([] as any[]).concat(...allArticlesArrays);

        if (!mounted) return;

        const hotArticles = allArticles.filter(hasHotTag).slice(0, 10);
        setList(hotArticles);
      } catch (err) {
        console.error("HotBlog fetch error:", err);
        if (mounted) setList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchHotArticles();

    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && (!list || list.length === 0)) {
    return <div className="text-center py-6 text-subtitle"></div>;
  }

  const getImageSrc = (img: any) => {
    if (!img) return NO_IMAGE_URL;
    if (typeof img === "string") return img;
    return img.src ?? img.attachment ?? img.url ?? NO_IMAGE_URL;
  };

  const getSummary = (a: any) => {
    const raw =
      a?.excerpt ??
      a?.summary ??
      a?.description ??
      a?.short_description ??
      a?.content ??
      a?.body ??
      "";
    if (typeof raw !== "string") return "";
    return raw.replace(/<[^>]+>/g, "").trim();
  };

  if (loading) {
    return (
      <div className="py-4 relative w-full overflow-hidden">
        <div className="w-full px-4">
          <div
            className="hotblog-scroller flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="hotblog-card snap-start w-[240px] sm:w-[260px] flex-shrink-0">
                <div className="bg-section rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
                  <div className="relative w-full aspect-[16/9] bg-skeleton animate-pulse" />
                  <div className="p-3 flex-1">
                    <div className="h-4 bg-skeleton rounded w-3/4 animate-pulse" />
                    <div className="mt-2 h-3 bg-skeleton rounded w-full animate-pulse" />
                    <div className="mt-1 h-3 bg-skeleton rounded w-5/6 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .hotblog-scroller::-webkit-scrollbar {
            display: none;
          }
          .hotblog-scroller {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="py-4 relative w-full overflow-hidden">
      <div className="w-full px-4">
        <div
          className="hotblog-scroller flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {list.map((article) => {
            const a: any = article as any;
            const aid = a.id ?? a._id ?? a.handle ?? a.slug ?? Math.random();
            const bid = a.blog_id ?? a.blogId ?? a.category ?? a.categoryId ?? a.blog_handle ?? undefined;
            const to = bid ? `/article/${encodeURIComponent(String(bid))}/${encodeURIComponent(String(aid))}` : `/article/${encodeURIComponent(String(aid))}`;
            const imageSrc = getImageSrc(article.image);
            const summary = getSummary(article);

            return (
              <div key={aid} className="hotblog-card snap-start w-[240px] sm:w-[260px] flex-shrink-0">
                <TransitionLink to={to} className="bg-section rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group h-full flex flex-col">
                  <div className="relative w-full aspect-[16/9] bg-skeleton">
                    <LazyImage
                      src={imageSrc || NO_IMAGE_URL}
                      placeholder={""}
                      className="w-full h-full object-cover"
                      alt={article.title ?? ""}
                      onError={(e: any) => {
                        const t = e?.target as HTMLImageElement | null;
                        if (t && t.src !== NO_IMAGE_URL) {
                          t.src = NO_IMAGE_URL;
                        }
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h4 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
                      {article.title ?? "Không có tiêu đề"}
                    </h4>
                    {summary && (
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {summary}
                      </p>
                    )}
                  </div>
                </TransitionLink>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .hotblog-scroller::-webkit-scrollbar {
          display: none;
        }
        .hotblog-scroller {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
