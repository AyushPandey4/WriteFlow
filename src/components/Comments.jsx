"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

const Comments = ({ blogId, theme = "light" }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    fetchUserId();
    if (blogId) fetchComments();
  }, [blogId]);

  const fetchUserId = async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (data.user_id) {
        setUserId(data.user_id);
      }
    } catch (error) {
      console.error("Error fetching user ID:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${blogId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments/${blogId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/deletecomment/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Updated theme-based classes with better input border
  const containerClasses = `max-w-3xl mx-auto mt-8 p-6 rounded-lg shadow-md ${
    theme === "dark"
      ? "bg-gray-800 text-gray-100 border border-gray-700"
      : "bg-white text-gray-800 border border-gray-200"
  }`;

  const inputClasses = `w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${
    theme === "dark"
      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
      : "border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:border-blue-500"
  }`;

  const buttonClasses = `px-4 py-2 rounded-lg transition-colors ${
    theme === "dark"
      ? "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-900"
      : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-300"
  }`;

  const commentCardClasses = `flex gap-3 p-4 rounded-lg transition-colors ${
    theme === "dark"
      ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
  }`;

  return (
    <div className={containerClasses}>
      <h2
        className={`text-2xl font-bold mb-6 ${
          theme === "dark" ? "text-gray-100" : "text-gray-800"
        }`}
      >
        Comments
      </h2>

      {/* Add Comment */}
      <div className="mb-8">
        <div className="flex items-start gap-3">
          {userId && (
            <div className="flex-shrink-0">
              <div
                className="relative w-10 h-10 rounded-full overflow-hidden border ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }"
              >
                <Image
                  src={
                    comments.find((c) => c.user_id === userId)
                      ?.profile_picture || "/default-user.png"
                  }
                  alt="Your profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <div className="flex-1">
            <textarea
              className={inputClasses}
              placeholder="Write a comment..."
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleAddComment}
                className={buttonClasses}
                disabled={loading || !newComment.trim()}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  "Post Comment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p
            className={`text-center py-4 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={commentCardClasses}>
              <div className="flex-shrink-0">
                <div
                  className={`relative w-10 h-10 rounded-full overflow-hidden border ${
                    theme === "dark" ? "border-gray-600" : "border-gray-300"
                  }`}
                >
                  <Image
                    src={comment.profile_picture || "/default-user.png"}
                    alt={`${comment.username}'s profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      {comment.username || "Anonymous"}
                    </span>
                    <span
                      className={`text-xs ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {new Date(comment.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  {comment.user_id === userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className={`text-sm ${
                        theme === "dark"
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-500 hover:text-red-700"
                      }`}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p
                  className={`mt-1 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {comment.comment}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;
