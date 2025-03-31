"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/ThemeProvider";
import Image from "next/image";

export default function AuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();
  const [userId, setUserId] = useState(null);

  // Fetch Supabase user_id from API route
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const res = await fetch("/api/user");
        const data = await res.json();
        if (data.user_id) {
          setUserId(data.user_id);
        } else {
          throw new Error("User ID not found");
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        setError("Failed to fetch user ID");
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  // Fetch authors (users being followed) once userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchAuthors = async () => {
      try {
        const res = await fetch(`/api/following/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch authors");
        const data = await res.json();
        setAuthors(data.following || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [userId]);

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

  if (error) {
    return (
      <div
        className={`flex justify-center items-center min-h-screen ${
          theme === "dark"
            ? "bg-gray-900 text-red-400"
            : "bg-gray-50 text-red-600"
        }`}
      >
        <div className="text-center p-6 max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4"
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
          <p className="text-xl font-medium mb-2">Error loading authors</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`mt-4 px-4 py-2 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Try Again
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1
            className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Authors You Follow
          </h1>
          <p
            className={`mt-3 max-w-2xl mx-auto text-xl ${
              theme === "dark" ? "text-gray-300" : "text-gray-500"
            }`}
          >
            {authors.length === 0
              ? "Discover and follow your favorite authors"
              : `You're following ${authors.length} author${
                  authors.length !== 1 ? "s" : ""
                }`}
          </p>
        </div>

        {authors.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3
              className={`mt-2 text-lg font-medium ${
                theme === "dark" ? "text-gray-200" : "text-gray-900"
              }`}
            >
              Not following anyone yet
            </h3>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Follow authors to see their latest content here
            </p>
            <button
              onClick={() => router.push("/explore")}
              className={`mt-4 px-4 py-2 rounded-lg ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              Explore Authors
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author) => (
              <div
                key={author.id}
                className={`group relative rounded-xl p-5 transition-all duration-300 ${
                  theme === "dark"
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } shadow-md hover:shadow-lg cursor-pointer border ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
                onClick={() => router.push(`/author/${author.following_id}`)}
              >
                <div className="flex items-center">
                  <div
                    className={`relative h-14 w-14 rounded-full overflow-hidden border-2 ${
                      theme === "dark" ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <Image
                      src={author.users.profile_picture || "/default-user.png"}
                      alt={author.users.name || author.users.username}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.target.src = "/default-user.png";
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3
                      className={`font-bold ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {author.users.name || author.users.username}
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      @{author.users.username}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <div
                    className={`p-1 rounded-full ${
                      theme === "dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
