"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { TrashIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/ThemeProvider";

const Gallery = () => {
  const { theme } = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const router = useRouter();

  const cloudinaryLoader = ({ src, width, quality }) => {
    return `https://res.cloudinary.com/delc43sgj/image/upload/w_${width},q_${
      quality || 75
    }/${src.split("/upload/")[1]}`;
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/gallery", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch images");
        setImages(await response.json());
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleDelete = async (imageId) => {
    try {
      setDeletingId(imageId);
      const response = await fetch("/api/gallery", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ image_id: imageId }),
      });

      if (!response.ok) throw new Error("Failed to delete image");

      setImages(images.filter((img) => img.id !== imageId));
      toast.success("Image deleted successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        } p-6`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`animate-pulse h-8 w-64 rounded-full mb-8 ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square">
                <div
                  className={`w-full h-full rounded-xl ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-200"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${
          theme === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`p-8 rounded-2xl text-center ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } shadow-lg max-w-md w-full`}
        >
          <PhotoIcon
            className={`h-16 w-16 mx-auto mb-4 ${
              theme === "dark" ? "text-gray-500" : "text-gray-300"
            }`}
          />
          <h2
            className={`text-xl font-semibold mb-2 ${
              theme === "dark" ? "text-gray-100" : "text-gray-800"
            }`}
          >
            Your gallery is empty
          </h2>
          <p
            className={`mb-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Upload your first image to get started
          </p>
          <button
            onClick={() => router.push("/dashboard/create")}
            className={`px-6 py-2 rounded-lg font-medium ${
              theme === "dark"
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            } transition-colors`}
          >
            Upload Image
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-50"
      } p-6`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Your Gallery
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              theme === "dark"
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {images.length} {images.length === 1 ? "image" : "images"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className={`group relative aspect-square rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
                theme === "dark"
                  ? "bg-gray-800 hover:shadow-gray-700/30"
                  : "bg-white hover:shadow-gray-400/30"
              }`}
            >
              <Image
                loader={cloudinaryLoader}
                src={image.image_url}
                alt="User uploaded image"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />

              {/* Modern hover delete button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm("Are you sure you want to delete this image?")
                    ) {
                      handleDelete(image.id);
                    }
                  }}
                  disabled={deletingId === image.id}
                  className={`p-3 rounded-full backdrop-blur-sm transition-all ${
                    deletingId === image.id
                      ? "bg-gray-500/80 text-white"
                      : theme === "dark"
                      ? "bg-gray-800/90 hover:bg-red-600/90 text-red-400 hover:text-white"
                      : "bg-white/90 hover:bg-red-500/90 text-red-500 hover:text-white"
                  }`}
                >
                  {deletingId === image.id ? (
                    <div className="animate-spin">
                      <TrashIcon className="h-5 w-5" />
                    </div>
                  ) : (
                    <TrashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
