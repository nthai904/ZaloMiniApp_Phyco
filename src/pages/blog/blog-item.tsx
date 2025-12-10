import TransitionLink from "@/components/transition-link";
import { Article } from "@/types";

export interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured";
}

function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function BlogItem({ article }: ArticleCardProps) {
  const publishedDate = new Date(article.publishedAt);
  const dateTime = formatDateTime(publishedDate);

  return (
    <TransitionLink to={`/article/${article.id}`} className="block bg-section rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative w-full aspect-[4/3] bg-skeleton">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-tight">{article.title}</h3>
        <div className="flex items-center justify-between text-xs text-subtitle">
          <span>{dateTime}</span>
          <div className="flex items-center space-x-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{article.views}</span>
          </div>
        </div>
      </div>
    </TransitionLink>
  );
}
