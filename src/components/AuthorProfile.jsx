"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/ThemeProvider";
import Image from "next/image";

export default function AuthorProfile() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const authorId = id;
  const [author, setAuthor] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current user ID
        const userRes = await fetch("/api/user");
        const userData = await userRes.json();
        if (userData.user_id) {
          setCurrentUserId(userData.user_id);
        } else {
          throw new Error("User ID not found");
        }

        // Fetch author details
        const authorRes = await fetch(`/api/users/${authorId}`);
        if (!authorRes.ok) throw new Error("Failed to fetch author details");
        const authorData = await authorRes.json();
        setAuthor(authorData);

        // Fetch followers count
        const followersRes = await fetch(`/api/followers/${authorId}`);
        if (!followersRes.ok)
          throw new Error("Failed to fetch followers count");
        const followersData = await followersRes.json();
        setFollowersCount(followersData.followersCount);

        // Fetch blogs by the author
        const blogsRes = await fetch(`/api/blogs/author/${authorId}`);
        if (!blogsRes.ok) throw new Error("Failed to fetch blogs");
        const blogsData = await blogsRes.json();
        setBlogs(blogsData.blogs);

        // Check if current user is following the author
        const checkFollowingRes = await fetch(
          `/api/follow/check?followerId=${userData.user_id}&followingId=${authorId}`
        );
        if (!checkFollowingRes.ok)
          throw new Error("Failed to check follow status");
        const checkFollowingData = await checkFollowingRes.json();
        setIsFollowing(checkFollowingData.isFollowing);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId]);

  const handleFollowToggle = async () => {
    try {
      const res = await fetch(`/api/follow/${authorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (!res.ok) throw new Error("Failed to follow/unfollow");
      setIsFollowing(!isFollowing);
      setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  if (loading) {
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

  if (!author) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="text-center p-6 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold mt-4">Author not found</h2>
          <p className="mt-2">
            The author you're looking for doesn't exist or may have been
            removed.
          </p>
          <button
            onClick={() => router.push("/")}
            className={`mt-4 px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Author Profile Section */}
        <div
          className={`rounded-xl shadow-lg overflow-hidden mb-12 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 p-6 flex flex-col items-center">
              <div
                className={`relative h-40 w-40 rounded-full overflow-hidden border-4 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <Image
                  src={author.profile_picture || "/default-user.png"}
                  alt={author.name}
                  fill
                  className="object-cover"
                  onError={(e) => (e.target.src = "/default-user.png")}
                />
              </div>

              {currentUserId !== authorId && (
                <button
                  onClick={handleFollowToggle}
                  className={`mt-6 px-6 py-2 rounded-full font-medium transition-colors ${
                    isFollowing
                      ? theme === "dark"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                      : theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {isFollowing ? (
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Following
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Follow
                    </span>
                  )}
                </button>
              )}
            </div>

            <div className="md:w-2/3 p-6 md:p-8">
              <h1
                className={`text-3xl font-bold mb-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {author.name}
              </h1>
              <p
                className={`text-lg mb-4 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                @{author.username}
              </p>

              <div
                className={`flex items-center gap-4 mb-6 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {followersCount}{" "}
                  {followersCount === 1 ? "Follower" : "Followers"}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {blogs.length} {blogs.length === 1 ? "Blog" : "Blogs"}
                </span>
              </div>

              <div
                className={`p-4 rounded-lg ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}
                >
                  About
                </h3>
                <p
                  className={
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }
                >
                  {author.bio || "This author hasn't written a bio yet."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Blogs Section */}
        <div className="mb-8">
          <h2
            className={`text-2xl font-bold mb-6 ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            {blogs.length === 0
              ? "No blogs yet"
              : `Latest Blogs by ${author.name}`}
          </h2>

          {blogs.length === 0 ? (
            <div
              className={`text-center py-12 rounded-xl ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3
                className={`mt-4 text-lg font-medium ${
                  theme === "dark" ? "text-gray-200" : "text-gray-900"
                }`}
              >
                No blogs published yet
              </h3>
              <p
                className={`mt-1 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Check back later for new content from this author
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div
                  key={blog.id}
                  className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                    theme === "dark"
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } cursor-pointer`}
                  onClick={() => router.push(`/blog/${blog.id}`)}
                >
                  <div className="relative h-48 w-full">
                    {blog.thumbnail ? (
                      <Image
                        src={blog.thumbnail}
                        alt={blog.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
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
                  <div className="p-5">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        blog.category
                          ? theme === "dark"
                            ? "bg-blue-900/30 text-blue-300"
                            : "bg-blue-100 text-blue-800"
                          : theme === "dark"
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {blog.category || "Uncategorized"}
                    </div>
                    <h3
                      className={`text-lg font-bold mb-2 line-clamp-2 ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {blog.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
