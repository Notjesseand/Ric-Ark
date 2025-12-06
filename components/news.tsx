// components/news.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { HiOutlineExternalLink } from "react-icons/hi";

type NewsItem = {
  url: string;
  title: string;
  description: string | null;
  publishedAt: string;
  urlToImage: string | null;
  source: { id: string | null; name: string };
  author: string | null;
  content: string | null;
};

export function News() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        const data = await res.json();
        console.log("Fetched news data:", data);
        const items = data.results || data.articles;
        if (!items || items.length === 0) {
          setError("No news data available.");
          setArticles([]);
          return;
        }
        setArticles(items);
      } catch (err) {
        console.error("Failed to fetch news:", err);
        setError("Failed to load news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleArticleClick = (article: NewsItem) => {
    setSelectedArticle(article);
  };

  const handleReadFullArticle = (url: string) => {
    toast.info("You will be redirected to an external site.", {
      duration: 3000,
    });
    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 1000);
  };

  if (loading) {
    return (
      <p className="px-4 text-sm text-center font-montserrat">
        Loading news...
      </p>
    );
  }

  return (
    <div className="px-4 lg:px-6 mt-6 font-montserrat   ">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Latest Crypto News
      </h2>
      {error ? (
        <p className="text-sm text-center text-red-500">{error}</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-center text-muted-foreground">
          No news articles available at this time.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((item) => (
            <Card
              key={item.url}
              className="cursor-pointer overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-none shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => handleArticleClick(item)}
            >
              {item.urlToImage && (
                <div className="relative h-48 w-full">
                  <img
                    src={item.urlToImage}
                    alt={item.title}
                    className="object-cover rounded-t-lg w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback.jpeg";
                    }}
                  />
                </div>
              )}
              <CardHeader className="p-4">
                <CardTitle className="text-base font-semibold line-clamp-2 text-gray-900 dark:text-gray-100">
                  {item.title}
                </CardTitle>
                <CardDescription className="text-xs mt-2 text-muted-foreground">
                  {new Date(item.publishedAt).toLocaleString()} ·{" "}
                  {item.source.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm line-clamp-3 text-gray-600 dark:text-gray-300">
                  {item.description || "No description available."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedArticle && (
        <Dialog
          open={!!selectedArticle}
          onOpenChange={() => setSelectedArticle(null)}
        >
          <DialogContent className="sm:max-w-[600px] bg-gradient-to-t from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 font-montserrat">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedArticle.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {new Date(selectedArticle.publishedAt).toLocaleString()} ·{" "}
                {selectedArticle.source.name}{" "}
                {selectedArticle.author && `· By ${selectedArticle.author}`}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {selectedArticle.urlToImage && (
                <div className="relative w-full mb-4 overflow-hidden rounded-lg">
                  <img
                    src={selectedArticle.urlToImage || "/fallback.jpeg"}
                    alt={selectedArticle.title}
                    className="object-cover w-full h-44"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback.jpeg";
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-700 dark:text-gray-200 font-montserrat">
                {selectedArticle.description ||
                  selectedArticle.content ||
                  "No additional details available."}
              </p>
            </div>
            <DialogFooter className="mt-6 space-y-2 md:space-y-0">
              <Button
                variant="outline"
                onClick={() => setSelectedArticle(null)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 border-none"
              >
                Close
              </Button>
              <Button
                onClick={() => handleReadFullArticle(selectedArticle.url)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white border-none"
              >
                Read Full Article
              </Button>
            </DialogFooter>
            <p className="text-xs mt-0 text-muted-foreground underline flex items-center text-right w-full justify-end">
              You will be redirected to an external site
              <HiOutlineExternalLink className="text-lg ml-0.5" />
            </p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
