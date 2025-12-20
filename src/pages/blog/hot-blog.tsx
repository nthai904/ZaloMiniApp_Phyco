import { useAtomValue } from "jotai";
import { articlesState } from "@/state";
import TransitionLink from "@/components/transition-link";
import LazyImage from "@/components/lazy-image";
import { useEffect, useState, useRef } from "react";
import { fetchBLogList, fetchBlogDetail } from "@/api/service";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

export default function HotBlog() {
  const articlesFallback = useAtomValue(articlesState) as any[] | undefined;
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // 1) try to fetch blogs, take first blog with articles
        const blogs = await fetchBLogList();
        const first = (blogs || []).find((b: any) => (b.article_count ?? b.count ?? 0) > 0) || blogs[0];
        if (first && first.id) {
          const articles = await fetchBlogDetail(first.id);
          if (!mounted) return;
          setList(Array.isArray(articles) ? articles.slice(0, 10) : []);
          setLoading(false);
          return;
        }

        // fallback to local articlesState
        setList((articlesFallback ?? []).slice(0, 10));
      } catch (err) {
        console.error("HotBlog fetch error:", err);
        setList((articlesFallback ?? []).slice(0, 10));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [articlesFallback]);

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

  return (
    <div className="py-3 relative">
      {/* <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-base font-semibold">Bài viết nổi bật</h3>
        <div className="flex items-center space-x-2">
          <button aria-label="prev" onClick={() => scrollByPage(-1)} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-sm border">
            ‹
          </button>
          <button aria-label="next" onClick={() => scrollByPage(1)} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-sm border">
            ›
          </button>
        </div>
      </div> */}

      <div className="-mx-4 px-4">
        <div ref={scrollerRef} onScroll={onScroll} className="flex gap-3 pb-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {list.map((article) => (
            <div key={article.id} className="hotblog-card snap-start w-72 md:w-80 lg:w-96 flex-shrink-0">
              <TransitionLink to={`/article/${article.id}`} className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
                <div className="relative w-full aspect-[16/9] bg-skeleton">
                  <LazyImage
                    src={article.image ?? article.image_src ?? NO_IMAGE_URL}
                    placeholder={""}
                    className="w-full h-full object-cover"
                    alt={article.title}
                    onError={(e: any) => {
                      const t = e?.target as HTMLImageElement | null;
                      if (t && t.src !== NO_IMAGE_URL) t.src = NO_IMAGE_URL;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  <div className="absolute left-3 right-3 bottom-3 text-white">
                    <h4 className="text-sm font-semibold line-clamp-2">{article.title}</h4>
                    <div className="text-xs text-white/80 mt-1 flex items-center justify-between">
                      <span>{article.author?.name ?? "Tác giả"}</span>
                      <span>{new Date(article.publishedAt ?? article.published_at ?? Date.now()).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-subtitle line-clamp-2">{article.excerpt ?? ""}</p>
                </div>
              </TransitionLink>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-3">
        <div className="flex items-center space-x-2">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                const el = scrollerRef.current;
                const card = el?.querySelector(".hotblog-card") as HTMLElement | null;
                const cardWidth = card ? card.offsetWidth + 12 : el?.clientWidth ?? 0;
                el?.scrollTo({ left: i * cardWidth, behavior: "smooth" });
              }}
              className={`w-2 h-2 rounded-full ${i === page ? "bg-primary" : "bg-gray-300"}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
