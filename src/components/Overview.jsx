"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/ThemeProvider";
import { useRouter } from "next/navigation";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

// Cache implementation
const blogCache = {
  data: null,
  timestamp: null,
  maxAge: 5 * 60 * 1000, // 5 minutes cache
};

export default function Overview() {
  const { theme } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch blogs with caching
  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);

      // Check cache first
      if (
        blogCache.data &&
        Date.now() - blogCache.timestamp < blogCache.maxAge
      ) {
        setBlogs(blogCache.data);
        setIsLoading(false);
        return;
      }

      const res = await fetch("/api/blogs/overview");
      const data = await res.json();

      // Update cache
      blogCache.data = data || [];
      blogCache.timestamp = Date.now();

      setBlogs(blogCache.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();

    // Set up periodic refresh
    const interval = setInterval(fetchBlogs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchBlogs]);

  // Toggle blog status
  const toggleStatus = useCallback(async (blogId, currentStatus) => {
    try {
      const newStatus = currentStatus === "public" ? "private" : "public";

      // Optimistic UI update
      setBlogs((prev) =>
        prev.map((blog) =>
          blog.id === blogId ? { ...blog, status: newStatus } : blog
        )
      );

      await fetch(`/api/blogs/${blogId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      // Invalidate cache
      blogCache.timestamp = 0;
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setBlogs((prev) =>
        prev.map((blog) =>
          blog.id === blogId ? { ...blog, status: currentStatus } : blog
        )
      );
    }
  }, []);

  // Handle delete blog
  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      // Optimistic UI update
      setBlogs((prev) => prev.filter((blog) => blog.id !== selectedBlog.id));

      await fetch(`/api/blogs/${selectedBlog.id}`, { method: "DELETE" });

      // Invalidate cache
      blogCache.timestamp = 0;
    } catch (error) {
      console.error("Error deleting blog:", error);
      // Revert on error
      fetchBlogs();
    } finally {
      setDeleteModal(false);
      setSelectedBlog(null);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } p-4 md:p-6`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1
          className={`text-2xl font-bold ${
            theme === "dark" ? "text-gray-100" : "text-gray-900"
          }`}
        >
          Articles
        </h1>
        <Link
          href="/dashboard/create"
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-500 text-gray-100"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <PlusIcon className="h-5 w-5 mr-2" /> Create Blog
        </Link>
      </div>

      {/* Blog Table */}
      <div
        className={`rounded-lg shadow-md overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className={
                    theme === "dark"
                      ? "bg-gray-750 text-gray-100"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  <th className="py-3 px-4 text-left font-medium">Title</th>
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Likes</th>
                  <th className="py-3 px-4 text-left font-medium">Comments</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className={`${
                        theme === "dark"
                          ? "border-b border-gray-700 hover:bg-gray-750"
                          : "border-b border-gray-200 hover:bg-gray-50"
                      } transition-colors`}
                    >
                      <td
                        className="py-3 px-4 cursor-pointer"
                        onClick={() => router.push(`/blog/${blog.id}`)}
                      >
                        <span
                          className={`hover:underline ${
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {blog.title}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              blog.status === "public"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {blog.status === "public" ? "Public" : "Private"}
                          </span>
                          <button
                            onClick={() => toggleStatus(blog.id, blog.status)}
                            className={`p-1 rounded-full transition-colors ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-gray-300"
                                : "hover:bg-gray-200 text-gray-600"
                            }`}
                          >
                            {blog.status === "public" ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {blog.likes}
                      </td>
                      <td
                        className={`py-3 px-4 ${
                          theme === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {blog.comments}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() =>
                              router.push(
                                `/dashboard/create?edit=true&blogId=${blog.id}`
                              )
                            }
                            className={`p-1 rounded-full transition-colors ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-blue-400"
                                : "hover:bg-gray-200 text-blue-600"
                            }`}
                          >
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBlog(blog);
                              setDeleteModal(true);
                            }}
                            className={`p-1 rounded-full transition-colors ${
                              theme === "dark"
                                ? "hover:bg-gray-700 text-red-400"
                                : "hover:bg-gray-200 text-red-600"
                            }`}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center">
                      <p
                        className={
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }
                      >
                        No blogs found. Create your first blog!
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow-lg w-96 max-w-full mx-4 ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-bold mb-4 ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Confirm Deletion
            </h2>
            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
              Are you sure you want to delete "{selectedBlog?.title}"?
            </p>
            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setDeleteModal(false)}
                className={`px-4 py-2 rounded transition-colors ${
                  theme === "dark"
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
