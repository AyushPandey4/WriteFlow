"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Comments from "./Comments";
import { useTheme } from "@/ThemeProvider";
import {
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import Image from "next/image";

const BlogPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [blog, setBlog] = useState(null);
  const [author, setAuthor] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlogDetails();
      fetchLikes();
      checkBookmarkStatus();
    }
  }, [id]);

  const fetchBlogDetails = async () => {
    try {
      const res = await fetch(`/api/blogs/${id}`);
      if (!res.ok) throw new Error("Failed to fetch blog");
      const data = await res.json();
      setBlog(data);

      if (data.author_id) {
        const { data: user, error } = await supabase
          .from("users")
          .select("username, name, profile_picture")
          .eq("id", data.author_id)
          .single();

        if (!error && user) setAuthor(user);
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const res = await fetch(`/api/likes/${id}`);
      if (!res.ok) throw new Error("Failed to fetch likes");
      const data = await res.json();
      setLikes(data.total_likes || 0);
      setLiked(data.user_liked || false);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const checkBookmarkStatus = async () => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/likes/${id}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like/unlike");

      const data = await res.json();
      setLiked(data.message === "Liked successfully");
      fetchLikes();
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const handleBookmark = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const generateSummary = async () => {
    if (!blog?.content) return;

    setIsSummarizing(true);
    try {
      const response = await fetch("/api/summarizeblog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: blog.content,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const data = await response.json();
      setSummary(data.summary.join("\n"));
      setShowSummary(true);
    } catch (error) {
      console.error("Error generating summary:", error);
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!blog) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            theme === "dark" ? "border-blue-400" : "border-blue-600"
          }`}
        ></div>
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto p-4 md:p-6 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-white text-gray-900"
      }`}
    >
      {/* Thumbnail */}
      {blog.thumbnail && (
        <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <Image
            src={blog.thumbnail}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              blog.category
                ? theme === "dark"
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-100 text-blue-800"
                : theme === "dark"
                ? "bg-gray-700 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {blog.category || "Uncategorized"}
          </span>
          <span
            className={`text-sm ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {new Date(blog.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1
          className={`text-3xl md:text-4xl font-bold mb-4 ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          {blog.title}
        </h1>

        <div className="flex items-center gap-3">
          <div
            onClick={() => router.push(`/author/${blog.author_id}`)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              {author?.profile_picture ? (
                <Image
                  src={author.profile_picture || '/default-user.png'}
                  alt={author.name || author.username}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-medium">
                    {author
                      ? (author.name || author.username).charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p
                className={`font-medium group-hover:underline ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {author?.name || author?.username || "Unknown author"}
              </p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {blog.status === "public" ? "Public" : "Private"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <article
        className={`prose max-w-none dark:prose-invert prose-img:rounded-xl prose-img:w-full ${
          theme === "dark"
            ? "prose-headings:text-gray-100 prose-p:text-gray-300"
            : ""
        }`}
      >
        <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      </article>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-10 mb-8">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            liked
              ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" // More prominent red when liked
              : theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {liked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" /> // Ensured icon is red
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span className={liked ? "text-red-500" : ""}>
            {likes} {likes === 1 ? "Like" : "Likes"}
          </span>
        </button>

        <button
          onClick={handleBookmark}
          disabled={isLoading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            bookmarked
              ? "bg-blue-500/10 text-blue-500"
              : theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } ${isLoading ? "opacity-50" : ""}`}
        >
          {bookmarked ? (
            <BookmarkIconSolid className="h-5 w-5" />
          ) : (
            <BookmarkIcon className="h-5 w-5" />
          )}
          <span>{isLoading ? "Processing..." : "Bookmark"}</span>
        </button>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === "dark"
              ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          <ShareIcon className="h-5 w-5" />
          <span>{copySuccess ? "Copied!" : "Share"}</span>
        </button>

        <button
          onClick={generateSummary}
          disabled={isSummarizing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            theme === "dark"
              ? "bg-purple-600 hover:bg-purple-500 text-white"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          } ${isSummarizing ? "opacity-50" : ""}`}
        >
          <SparklesIcon className="h-5 w-5" />
          <span>{isSummarizing ? "Generating..." : "AI Summary"}</span>
        </button>
      </div>

      {/* Summary Display */}
      {showSummary && (
        <div
          className={`mt-8 p-6 rounded-xl ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3
              className={`text-xl font-semibold ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}
            >
              AI Summary
            </h3>
            <button
              onClick={handleCopySummary}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                theme === "dark"
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          </div>
          <div
            className={`whitespace-pre-line ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {summary}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-12">
        <Comments blogId={id} theme={theme} />
      </div>
    </div>
  );
};

export default BlogPage;
