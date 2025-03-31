"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/blogs");
        if (!response.ok) throw new Error("Failed to fetch blogs");
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const stripHtml = (html) => {
    if (typeof window !== "undefined") {
      const doc = new DOMParser().parseFromString(html, "text/html");
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]*>/g, "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse mb-12 text-center">
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-full w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-80 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="h-56 bg-gray-200 dark:bg-gray-800"></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-24"></div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-full w-2/3"></div>
                  </div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Discover Insights
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the latest articles on technology, design, and more
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto h-48 w-48 text-gray-300 dark:text-gray-700 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-full h-full"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
              No articles yet
            </h3>
            <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
              It looks like we're just getting started. Check back soon or create your own post!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="group bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/blog/${blog.id}`)}
              >
                <div className="relative h-64 w-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-full shadow-md">
                    {blog.category || "General"}
                  </span>
                  {blog.thumbnail ? (
                    <Image
                      src={blog.thumbnail}
                      alt={blog.title || "Blog thumbnail"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-gray-300', 'to-gray-400', 'dark:from-gray-700', 'dark:to-gray-800');
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-16 h-16"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {blog.author?.profile_picture ? (
                        <Image
                          src={blog.author.profile_picture}
                          alt={blog.author.name}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-white dark:border-gray-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                            {blog.author?.name?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {blog.author?.name || "Unknown author"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {blog.author?.role || "Writer"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
                    {blog.title || "Untitled Blog"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-5">
                    {stripHtml(blog.content) || "No content available"}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      Read article →
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                      {Math.ceil(blog.content.split(" ").length / 200)} min read
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;