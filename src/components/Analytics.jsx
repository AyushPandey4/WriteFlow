import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js";
import { useTheme } from "@/ThemeProvider";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

const Analytics = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("bar");
  const { theme } = useTheme();

  useEffect(() => {
    const fetchBlogAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/blogs/overview", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch analytics");

        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAnalytics();
  }, []);

  // Process data for charts
  const processData = () => {
    const sortedBlogs = [...blogs].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const now = new Date();
    let filteredBlogs = sortedBlogs;

    if (timeRange === "week") {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      filteredBlogs = sortedBlogs.filter(
        (blog) => new Date(blog.created_at) >= oneWeekAgo
      );
    } else if (timeRange === "month") {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      filteredBlogs = sortedBlogs.filter(
        (blog) => new Date(blog.created_at) >= oneMonthAgo
      );
    }

    // Shorten long titles for better display
    const labels = filteredBlogs.map((blog) =>
      blog.title.length > 20 ? `${blog.title.substring(0, 20)}...` : blog.title
    );
    const likesData = filteredBlogs.map((blog) => blog.likes);
    const commentsData = filteredBlogs.map((blog) => blog.comments);

    return { labels, likesData, commentsData, filteredBlogs };
  };

  const { labels, likesData, commentsData, filteredBlogs } = processData();

  // Chart data configuration with theme support
  const chartData = {
    labels,
    datasets: [
      {
        label: "Likes",
        data: likesData,
        backgroundColor:
          theme === "dark"
            ? "rgba(59, 130, 246, 0.7)"
            : "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Comments",
        data: commentsData,
        backgroundColor:
          theme === "dark"
            ? "rgba(239, 68, 68, 0.7)"
            : "rgba(239, 68, 68, 0.5)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: theme === "dark" ? "#e5e7eb" : "#374151",
        },
      },
      title: {
        display: true,
        text: "Blog Engagement Analytics",
        color: theme === "dark" ? "#e5e7eb" : "#374151",
        font: {
          size: 16,
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
          color: theme === "dark" ? "#e5e7eb" : "#374151",
        },
        grid: {
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#374151",
        },
      },
      x: {
        title: {
          display: true,
          text: "Blog Posts",
          color: theme === "dark" ? "#e5e7eb" : "#374151",
        },
        grid: {
          color:
            theme === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: theme === "dark" ? "#e5e7eb" : "#374151",
        },
      },
    },
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-64 ${
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

  if (blogs.length === 0) {
    return (
      <div
        className={`text-center py-12 rounded-lg ${
          theme === "dark"
            ? "bg-gray-800 text-gray-200"
            : "bg-white text-gray-600"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2">
          No Analytics Data Available
        </h3>
        <p className="max-w-md mx-auto">
          You don't have any blog data to display analytics yet. Create some
          content to see engagement metrics.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              Blog Analytics Dashboard
            </h1>
            <p
              className={`mt-1 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Track your blog performance and engagement metrics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto">
              <label
                htmlFor="timeRange"
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Time Range
              </label>
              <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="week">Last Week</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label
                htmlFor="chartType"
                className={`block text-sm font-medium mb-1 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Chart Type
              </label>
              <select
                id="chartType"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className={`w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === "dark"
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div
          className={`p-6 rounded-xl shadow-lg mb-8 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="h-80 w-full">
            {chartType === "bar" ? (
              <Bar data={chartData} options={options} />
            ) : (
              <Line data={chartData} options={options} />
            )}
          </div>
        </div>

        {/* Detailed Statistics */}
        <div
          className={`rounded-xl shadow-lg overflow-hidden ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">Detailed Statistics</h2>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Showing {filteredBlogs.length} of {blogs.length} blogs
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead
                className={theme === "dark" ? "bg-gray-700" : "bg-gray-50"}
              >
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Blog Title
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Likes
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Comments
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody
                className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                  theme === "dark" ? "bg-gray-800" : "bg-white"
                }`}
              >
                {filteredBlogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-blue-300" : "text-blue-600"
                      } font-medium`}
                    >
                      {blog.title.length > 40
                        ? `${blog.title.substring(0, 40)}...`
                        : blog.title}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        theme === "dark" ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {new Date(blog.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {blog.likes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {blog.comments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span className="mr-2">
                          {blog.likes + blog.comments * 2}
                        </span>
                        <div className="relative w-full">
                          <div
                            className={`h-2 rounded-full ${
                              theme === "dark" ? "bg-gray-600" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`h-2 rounded-full ${
                                blog.likes + blog.comments * 2 > 50
                                  ? "bg-green-500"
                                  : blog.likes + blog.comments * 2 > 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (blog.likes + blog.comments * 2) / 2
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
