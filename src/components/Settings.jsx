"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { useTheme } from "@/ThemeProvider";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const Settings = () => {
  const { user } = useUser();
  const { theme } = useTheme();
  const [bio, setBio] = useState("");
  const [lastSync, setLastSync] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setBio(data.bio || "");
        setLastSync(
          data.lastSync
            ? new Date(data.lastSync).toLocaleString()
            : "Never synced"
        );
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleSyncProfile = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/profile", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync profile");
      }

      const data = await response.json();
      setLastSync(new Date(data.updated_at).toLocaleString());
      toast.success("Profile synchronized successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateBio = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingBio(true);
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bio }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update bio");
      }

      const data = await response.json();
      setLastSync(new Date(data.updated_at).toLocaleString());
      toast.success("Bio updated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdatingBio(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`flex justify-center items-center min-h-[300px] ${
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
      className={`max-w-4xl mx-auto p-6 rounded-xl shadow-lg ${
        theme === "dark"
          ? "bg-gray-800 text-gray-100"
          : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p
          className={`mt-1 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Manage your profile information and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Profile Section */}
        <div className="flex-1">
          <div
            className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-full h-full rounded-full border-2",
                        userButtonAvatarBox: {
                          borderColor: theme === "dark" ? "#3b82f6" : "#2563eb",
                        },
                      },
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    @{user?.username}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSyncProfile}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50`}
              >
                {isSyncing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Profile"
                )}
              </button>
            </div>

            <div
              className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-sm font-medium mb-3 ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Profile Information
              </h3>
              <div className="space-y-2">
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Email:
                  </span>{" "}
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`font-medium ${
                      theme === "dark" ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Last Updated:
                  </span>{" "}
                  {lastSync}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="flex-1">
          <div
            className={`p-6 rounded-xl ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-50"
            }`}
          >
            <h2
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-gray-100" : "text-gray-800"
              }`}
            >
              About Me
            </h2>
            <form onSubmit={handleUpdateBio}>
              <div className="mb-6">
                <label
                  htmlFor="bio"
                  className={`block text-sm font-medium mb-2 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-gray-100"
                      : "bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  } shadow-sm transition-colors`}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingBio}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-500 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  } disabled:opacity-50`}
                >
                  {isUpdatingBio ? "Updating..." : "Update Bio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
