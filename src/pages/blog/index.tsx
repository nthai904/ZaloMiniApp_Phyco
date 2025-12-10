import { useAtomValue } from "jotai";
import { articlesState } from "@/state";
import { useState, useMemo, useEffect } from "react";
import { fetchBlogDetail } from "@/api/service";
import BlogItem from "./blog-item";
import { blogsState } from "@/api/state";

export default function BlogList() {
  const articles = useAtomValue(articlesState);

  const blogs = useAtomValue(blogsState);
  console.log("Blogs from state:", blogs);

  useEffect(() => {
    const id = "1001000756";
    (async () => {
      try {
        const detail = await fetchBlogDetail(id);
        if (Array.isArray(detail) && detail.length > 0) {
          setApiArticles(detail);
        }
      } catch (err) {
        console.error(`Error fetching blog detail ${id}:`, err);
      }
    })();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [apiArticles, setApiArticles] = useState<any[]>([]);

  const filteredArticles = useMemo(() => {
    if (apiArticles && apiArticles.length > 0) return apiArticles;

    if (selectedCategory === "Tất cả") {
      return articles;
    }
    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory, apiArticles]);

  return (
    <div className="min-h-full bg-background">
      {/* Articles Grid */}
      <div className="p-4">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredArticles.map((article) => (
              <BlogItem key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-subtitle"></p>
          </div>
        )}
      </div>
    </div>
  );
}
