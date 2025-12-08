import { useAtomValue } from "jotai";
import { articlesState } from "@/state";
import ArticleCard from "@/components/article-card";
import { useState, useMemo } from "react";

const categories = ["Tất cả", "Chăm sóc da", "Làm đẹp", "Dinh dưỡng"];

export default function ArticleListPage() {
  const articles = useAtomValue(articlesState);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "Tất cả") {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  return (
    <div className="min-h-full bg-background">
      {/* Category Filter */}
      <div className="bg-section sticky top-0 z-10 shadow-sm">
        <div className="px-4 py-3 overflow-x-auto scrollbar-hide flex space-x-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category ? "bg-primary text-primaryForeground shadow-md" : "bg-white text-foreground border border-black/10 hover:border-primary/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Articles Grid */}
      <div className="p-4">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-subtitle">Chưa có bài viết nào trong danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
}
