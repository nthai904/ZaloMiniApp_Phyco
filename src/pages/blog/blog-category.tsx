import TransitionLink from "@/components/transition-link";
import { blogsState } from "@/api/state";
import { articlesState } from "@/state";
import { useAtomValue } from "jotai";
import { useMemo, useEffect, useState } from "react";

type BlogCategoryItem = {
  id: any;
  title: string;
  count: number;
  hasPublished: boolean;
  image?: string | undefined;
};

export default function BlogCategory({
  onSelect,
  selectedKey,
  onCategoryChange,
}: {
  onSelect?: (payload: { id?: string; title?: string }) => void;
  selectedKey?: string | null;
  onCategoryChange?: (id: string | null) => void;
}) {
  const blogs = useAtomValue(blogsState) as any[] | undefined;
  const articles = useAtomValue(articlesState) as any[] | undefined;

  const categories = useMemo<BlogCategoryItem[]>(() => {
    if (Array.isArray(blogs) && blogs.length > 0) {
      return blogs.map((b) => ({
        id: b.id ?? b.handle ?? String(b.title ?? Math.random()),
        title: b.title ?? b.name ?? b.handle ?? "",
        count: b.article_count ?? b.count ?? 0,
        hasPublished: typeof b.hasPublished !== "undefined" ? Boolean(b.hasPublished) : true,
      }));
    }

    const map = new Map<string, { id: string; title: string; count: number; hasPublished: boolean; image?: string }>();
    (articles ?? []).forEach((a) => {
      const key = a.category ?? "Chưa phân loại";
      if (!map.has(key)) {
        map.set(key, { id: key, title: key, count: 0, hasPublished: false, image: undefined });
      }
      const item = map.get(key)!;
      item.count += 1;
      if (!item.hasPublished) {
        if (a.published === true) item.hasPublished = true;
        else if (a.publishedAt || a.published_at) item.hasPublished = true;
      }
    });

    return Array.from(map.values());
  }, [blogs, articles]);

  const visibleCategories = (categories ?? []).filter((c) => c.hasPublished !== false && c.count > 0);
  if (!visibleCategories || visibleCategories.length === 0) return null;
  const [activeKey, setActiveKey] = useState<string | null>(selectedKey ?? null);

  useEffect(() => {
    setActiveKey(selectedKey ?? null);
  }, [selectedKey]);

  function handleClick(cat: { id?: string; title?: string }) {
    const key = cat.id ? String(cat.id) : cat.title ?? null;
    setActiveKey(key ?? null);
    if (onCategoryChange) {
      onCategoryChange(key ?? null);
    }
    if (onSelect) {
      onSelect({ id: cat.id ? String(cat.id) : undefined, title: cat.title });
    }
  }

  return (
    <div className="min-h-full bg-background pb-8">
      <div>
        {/* Header */}
        <div className="bg-white px-4 py-6 border-b border-black/5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Góc kiến thức</h1>
              <p className="text-sm text-subtitle mt-1">Khám phá các bài viết của chúng tôi</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}>
          {visibleCategories.map((category) => {
            const key = category.id !== undefined && category.id !== null ? String(category.id) : String(category.title ?? "");
            const isActive = key === (activeKey ?? null);
            return (
              <button
                key={key}
                onClick={() => handleClick({ id: category.id != null ? String(category.id) : undefined, title: category.title })}
                className={`flex-none px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                  isActive ? "bg-main text-white shadow-md scale-105" : "bg-white text-foreground border border-black/10 hover:border-main/30"
                }`}
              >
                {category.title}
              </button>
            );
          })}

          <style>{`
            .overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
