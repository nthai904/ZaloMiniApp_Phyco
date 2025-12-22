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

    if (articlesFallback && articlesFallback.length > 0) {
      setList((articlesFallback ?? []).filter(hasHotTag).slice(0, 10));
    }

    (async () => {
      if (!articlesFallback || articlesFallback.length === 0) setLoading(true);
      try {
        const blogs = await fetchBLogList();
        const first = (blogs || []).find((b: any) => (b.article_count ?? b.count ?? 0) > 0) || blogs[0];
        if (first && first.id) {
          const articles = await fetchBlogDetail(first.id);
          if (!mounted) return;
          const newList = Array.isArray(articles) ? articles.filter(hasHotTag).slice(0, 10) : [];
          if (newList && newList.length > 0) setList(newList);
        } else {
          if ((!articlesFallback || articlesFallback.length === 0) && mounted) setList((articlesFallback ?? []).filter(hasHotTag).slice(0, 10));
        }
      } catch (err) {
        console.error("HotBlog fetch error:", err);
        if ((!articlesFallback || articlesFallback.length === 0) && mounted) setList((articlesFallback ?? []).filter(hasHotTag).slice(0, 10));
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
      <div className="-mx-4 px-4">
        <div ref={scrollerRef} onScroll={onScroll} className="flex gap-3 ml-3 pb-3 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hide">
          {list.map((article) => (
            <div key={article.id} className="hotblog-card snap-start w-56 sm:w-64 md:w-72 flex-shrink-0">
              <TransitionLink to={`/article/${article.id}`} className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                <div className="relative w-full aspect-[4/3] bg-skeleton overflow-hidden">
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
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{article.title}</h4>
                </div>
              </TransitionLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
