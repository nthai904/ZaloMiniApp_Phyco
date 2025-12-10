import { useAtomValue } from "jotai";
import { useParams } from "react-router-dom";
import { articleState, relatedArticlesState } from "@/state";
import { useState, useEffect } from "react";
import BlogItem from "./blog-item";
import { fetchBlogDetail } from "@/api/service";

function formatDateTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${hours}:${minutes}, ${day}/${month}/${year}`;
}

function formatContent(content: string): JSX.Element {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let key = 0;
  let currentListItems: string[] = [];

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={key++} className="list-disc list-inside space-y-2 my-3 ml-5">
          {currentListItems.map((item, idx) => (
            <li key={idx} className="text-sm text-foreground leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line) => {
    if (line.startsWith("## ")) {
      flushList();
      const heading = line.substring(3);
      const isSectionHeading = heading.endsWith(":");
      elements.push(
        <div key={key++} className="mt-6 mb-3">
          {isSectionHeading ? (
            <h2 className="text-base font-bold text-foreground flex items-center">
              <span className="mr-2">👉</span>
              {heading}
            </h2>
          ) : (
            <h2 className="text-base font-bold text-foreground">{heading}</h2>
          )}
        </div>
      );
    } else if (line.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-sm font-semibold text-foreground mt-4 mb-2">
          {line.substring(4)}
        </h3>
      );
    } else if (line.trim() === "") {
      flushList();
    } else if (line.startsWith("- ")) {
      currentListItems.push(line.substring(2));
    } else if (line.trim() !== "") {
      flushList();
      elements.push(
        <p key={key++} className="text-sm text-foreground leading-relaxed mb-3">
          {line}
        </p>
      );
    }
  });

  flushList();

  return <div>{elements}</div>;
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const article = useAtomValue(articleState(Number(id)));
  const relatedArticles = useAtomValue(relatedArticlesState(Number(id)));
  const [imageLoaded, setImageLoaded] = useState(false);

  const [apiArticle, setApiArticle] = useState<any | null>(null);
  const [apiRelated, setApiRelated] = useState<any[]>([]);

  useEffect(() => {
    if (article) return;
    const blogId = "1001000756";
    (async () => {
      try {
        const articles = await fetchBlogDetail(blogId);
        if (Array.isArray(articles) && articles.length > 0) {
          const found = articles.find((a: any) => String(a.id) === String(id));
          if (found) {
            setApiArticle(found);
            setApiRelated(articles.filter((a: any) => String(a.id) !== String(id)).slice(0, 6));
            return;
          }
        }
        setApiArticle(null);
        setApiRelated([]);
      } catch (err) {
        console.error(`Error fetching blog articles for blog ${blogId}:`, err);
      }
    })();
  }, [id, article]);

  const currentArticle = article ?? apiArticle;
  const currentRelated = article ? relatedArticles : apiRelated;

  const [sanitizedHtml, setSanitizedHtml] = useState<string | null>(null);

  useEffect(() => {
    const content: string = currentArticle?.content ?? "";
    if (!content) {
      setSanitizedHtml(null);
      return;
    }

    const hasHtml = /<[^>]+>/.test(content);
    if (!hasHtml) {
      setSanitizedHtml(null);
      return;
    }

    (async () => {
      try {
        const DOMPurifyModule = await import("dompurify");
        const DOMPurify = (DOMPurifyModule && (DOMPurifyModule as any).default) || DOMPurifyModule;
        const clean = DOMPurify.sanitize(content);
        setSanitizedHtml(clean);
      } catch (e) {
        console.warn("DOMPurify not available, rendering raw HTML. Install 'dompurify' to sanitize output.", e);
        setSanitizedHtml(content);
      }
    })();
  }, [currentArticle]);

  if (!currentArticle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-subtitle"></p>
      </div>
    );
  }

  const publishedDate = new Date(currentArticle.publishedAt);
  const dateTime = formatDateTime(publishedDate);

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {/* Hero Image */}
        <div className="relative w-full aspect-[4/3] bg-skeleton">
          {!imageLoaded && <div className="absolute inset-0 bg-skeleton animate-pulse" />}
          <img src={currentArticle.image} alt={currentArticle.title} className="w-full h-full object-cover" onLoad={() => setImageLoaded(true)} />
        </div>

        {/*  Tiêu đề */}
        <div className="bg-section px-4 py-4">
          <h1 className="font-bold text-foreground text-xl mb-3 leading-tight">{currentArticle.title}</h1>

          {/* Meta  */}
          <div className="flex items-center justify-between text-xs text-subtitle">
            <span>{dateTime}</span>
            <div className="flex items-center space-x-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{currentArticle.views}</span>
            </div>
          </div>
        </div>

        {/* Đây là body_html */}
        <div className="bg-section px-4 py-4">{sanitizedHtml ? <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : formatContent(currentArticle.content)}</div>

        {/* Bài viết liên quan  */}
        {currentRelated.length > 0 && (
          <>
            <div className="bg-background h-2 w-full"></div>
            <div className="bg-section px-4 py-4">
              <h2 className="text-base font-bold text-foreground mb-3">Bài viết liên quan</h2>
              <div className="grid grid-cols-2 gap-3">
                {currentRelated.map((relatedArticle) => (
                  <BlogItem key={relatedArticle.id} article={relatedArticle} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
