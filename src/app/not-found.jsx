export const metadata = {
    title: "404 - Page Not Found",
  };

  
export default function NotFoundPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Oops! The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Back Home
        </a>
      </div>
    );
  }
  