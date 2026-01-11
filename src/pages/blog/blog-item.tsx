import TransitionLink from "@/components/transition-link";
import LazyImage from "@/components/lazy-image";
import { Article } from "@/types";

const NO_IMAGE_URL = "https://theme.hstatic.net/200000436051/1000801313/14/no_image.jpg?v=721";

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
  const anyArticle: any = article as any;
  const articleId = anyArticle.id ?? anyArticle._id ?? anyArticle.handle ?? anyArticle.slug ?? anyArticle.page_id ?? "";
  const blogId = anyArticle.blog_id ?? anyArticle.blogId ?? anyArticle.category ?? anyArticle.categoryId ?? anyArticle.blog_handle ?? undefined;

  const getImageSrc = (a: any) => {
    if (!a) return NO_IMAGE_URL;
    if (typeof a === "string") return a;
    return a.src ?? a.attachment ?? a.url ?? NO_IMAGE_URL;
  };

  const imageSrc = getImageSrc(article.image);

  const published = article.publishedAt ?? new Date().toISOString();
  const publishedDate = new Date(published);
  const dateTime = formatDateTime(publishedDate);

  const authorName = typeof article.author === "string" ? article.author : article.author?.name;

  const title = article.title ?? "";

  const linkTo = blogId ? `/article/${encodeURIComponent(String(blogId))}/${encodeURIComponent(String(articleId))}` : `/article/${encodeURIComponent(String(articleId))}`;

  return (
    <TransitionLink to={linkTo} className="block bg-section rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      <div className="relative w-full aspect-[4/3] bg-skeleton">
        <LazyImage
          src={imageSrc || NO_IMAGE_URL}
          placeholder={""}
          className="w-full h-full"
          alt={title}
          onError={(e: any) => {
            const t = e?.target as HTMLImageElement | null;
            if (t && t.src !== NO_IMAGE_URL) t.src = NO_IMAGE_URL;
          }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 leading-tight">{title}</h3>
        <div className="flex items-center justify-between text-xs text-subtitle">
          <span>{dateTime}</span>
          <div className="flex items-center space-x-2">
            {article.author?.avatar ? <img src={article.author.avatar} alt={authorName} className="w-4 h-4 rounded-full object-cover" /> : null}
            <span>{authorName ?? "Tác giả"}</span>
          </div>
        </div>
      </div>
    </TransitionLink>
  );
}
