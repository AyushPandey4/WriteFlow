import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "@/ThemeProvider";

export default function Bookmarks() {
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch("/api/bookmarks");
        if (!response.ok) throw new Error("Failed to fetch bookmarks");
        const data = await response.json();
        setBookmarkedBlogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-blue-400' : 'border-blue-600'
        }`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-3xl font-extrabold tracking-tight sm:text-4xl ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Your Bookmarks
          </h1>
          <p className={`mt-3 max-w-2xl mx-auto text-xl ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
          }`}>
            {bookmarkedBlogs.length === 0 
              ? "Save your favorite blogs here" 
              : `You have ${bookmarkedBlogs.length} bookmarked blog${bookmarkedBlogs.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {bookmarkedBlogs.length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="mx-auto h-24 w-24 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className={`mt-2 text-lg font-medium ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>No bookmarks yet</h3>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Bookmark blogs to see them appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {bookmarkedBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`group relative rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => router.push(`/blog/${blog.id}`)}
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={blog.thumbnail || "/default-thumbnail.png"}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${
                    theme === 'dark' 
                      ? 'from-gray-900/80 to-transparent' 
                      : 'from-gray-900/50 to-transparent'
                  }`}></div>
                </div>
                <div className="p-5">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                    blog.category 
                      ? theme === 'dark'
                        ? 'bg-blue-900/30 text-blue-300'
                        : 'bg-blue-100 text-blue-800'
                      : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-700'
                  }`}>
                    {blog.category || "Uncategorized"}
                  </div>
                  <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {blog.title}
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {new Date(blog.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className={`absolute top-4 right-4 p-2 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-800/80 text-yellow-400' 
                    : 'bg-white/80 text-yellow-500'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}