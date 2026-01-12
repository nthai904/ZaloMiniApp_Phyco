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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function fetchHotArticles() {
      setLoading(true);
      try {
        // Fetch tất cả blogs
        const blogsRes = await fetch(`${import.meta.env.VITE_RENDER_API_URL}/api/blog/`);
        const blogsData = await blogsRes.json();
        const blogs = Array.isArray(blogsData) ? blogsData : blogsData?.blogs ?? blogsData?.categories ?? [];

        if (!mounted || !Array.isArray(blogs) || blogs.length === 0) {
          setList([]);
          return;
        }

        // Fetch articles của tất cả blogs
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

        // Lọc articles có tag noi-bat hoặc noibat
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

  if (loading) return <div className="text-center py-6 text-subtitle">Đang tải bài viết...</div>;

  if (!list || list.length === 0) {
    return <div className="text-center py-6 text-subtitle">Chưa có bài viết nổi bật</div>;
  }

  const scrollByPage = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".hotblog-card") as HTMLElement | null;
    const gap = 12;
    const cardWidth = card ? card.offsetWidth + gap : Math.floor(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * cardWidth * 2, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector(".hotblog-card") as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 12 : el.clientWidth;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setPage(idx);
  };

  const getImageSrc = (img: any) => {
    if (!img) return NO_IMAGE_URL;
    if (typeof img === "string") return img;
    return img.src ?? img.attachment ?? img.url ?? NO_IMAGE_URL;
  };

  return (
    <div className="py-4 relative w-full overflow-hidden">
      <div className="w-full px-4">
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex gap-3 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth"
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

            return (
              <div key={aid} className="hotblog-card snap-start w-[200px] sm:w-[220px] flex-shrink-0">
                <TransitionLink to={to} className="bg-section rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group h-full flex flex-col">
                  <div className="relative w-full aspect-[4/3] bg-skeleton">
                    <LazyImage
                      src={imageSrc || NO_IMAGE_URL}
                      placeholder={""}
                      className="w-full h-full"
                      alt={article.title ?? ""}
                      onError={(e: any) => {
                        const t = e?.target as HTMLImageElement | null;
                        if (t && t.src !== NO_IMAGE_URL) {
                          t.src = NO_IMAGE_URL;
                        }
                      }}
                    />
                    <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="bg-primary text-primaryForeground text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">Nổi bật</span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-200">
                      {article.title ?? "Không có tiêu đề"}
                    </h4>
                  </div>
                </TransitionLink>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .hotblog-card::-webkit-scrollbar {
          display: none;
        }
        .hotblog-card {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
