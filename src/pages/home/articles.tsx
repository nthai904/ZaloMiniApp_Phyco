import { useAtomValue } from "jotai";
import { articlesState } from "@/state";
import ArticleCard from "@/components/article-card";
import Section from "@/components/section";
import TransitionLink from "@/components/transition-link";

export default function Articles() {
  const articles = useAtomValue(articlesState);
  const featuredArticles = articles.slice(0, 4);

  if (featuredArticles.length === 0) {
    return null;
  }

  return (
    <Section
      title={
        <div className="flex items-center justify-between w-full">
          <span>Bài viết nổi bật</span>
          <TransitionLink to="/articles" className="text-xs text-primary font-medium hover:underline">
            Xem tất cả →
          </TransitionLink>
        </div>
      }
    >
      <div className="px-2 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {featuredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </Section>
  );
}
