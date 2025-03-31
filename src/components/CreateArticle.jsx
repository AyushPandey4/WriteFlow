"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useTheme } from "@/ThemeProvider";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import OrderedList from "@tiptap/extension-ordered-list";
import BulletList from "@tiptap/extension-bullet-list";
import { Markdown } from "tiptap-markdown";
import {
  FaBold,
  FaItalic,
  FaListUl,
  FaListOl,
  FaImage,
  FaUndo,
  FaRedo,
  FaRobot,
  FaSave,
} from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";

// Memoized Toolbar component to prevent unnecessary re-renders
const Toolbar = memo(({ editor, handleImageUpload }) => {
  const buttonClass = (active) =>
    `p-2 rounded flex items-center justify-center ${
      active
        ? "bg-blue-600 text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    } transition-colors`;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive("bold"))}
        aria-label="Bold"
      >
        <FaBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive("italic"))}
        aria-label="Italic"
      >
        <FaItalic />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive("bulletList"))}
        aria-label="Bullet List"
      >
        <FaListUl />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive("orderedList"))}
        aria-label="Numbered List"
      >
        <FaListOl />
      </button>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`${buttonClass(false)} cursor-pointer`}
        aria-label="Insert Image"
      >
        <FaImage />
      </label>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className={buttonClass(false)}
        aria-label="Undo"
        disabled={!editor.can().undo()}
      >
        <FaUndo />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className={buttonClass(false)}
        aria-label="Redo"
        disabled={!editor.can().redo()}
      >
        <FaRedo />
      </button>
    </div>
  );
});

// Memoized AI Panel component
const AIPanel = memo(({ 
  aiPrompt, 
  keywords, 
  isGenerating, 
  setAiPrompt, 
  setKeywords, 
  generateWithAI, 
  setShowAIPanel 
}) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <FaRobot className="text-blue-600 dark:text-blue-400" />
          AI Article Generator
        </h3>
        <button
          onClick={() => setShowAIPanel(false)}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Close AI panel"
        >
          &times;
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Article Topic
          </label>
          <input
            type="text"
            value={aiPrompt}
            disabled={isGenerating}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="What do you want to write about?"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Keywords (comma separated)
          </label>
          <input
            type="text"
            value={keywords}
            disabled={isGenerating}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="technology, future, innovation"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={generateWithAI}
            disabled={isGenerating || !aiPrompt.trim()}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
              isGenerating || !aiPrompt.trim()
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isGenerating ? "Generating..." : "Generate Article"}
          </button>
        </div>
      </div>
    </div>
  );
});

export default function CreateArticle() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const thumbnailInputRef = useRef(null);

  // State management
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("public");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [keywords, setKeywords] = useState("");
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Editor initialization with proper list extensions
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      OrderedList.configure({
        HTMLAttributes: {
          class: "ordered-list",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "bullet-list",
        },
      }),
      Markdown.configure({
        html: true,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert focus:outline-none min-h-[500px] p-4",
      },
    },
  });

  // Fetch data for editing
  useEffect(() => {
    const editQuery = searchParams.get("edit");
    const blogId = searchParams.get("blogId");

    const fetchData = async () => {
      if (editQuery === "true" && blogId && editor) {
        try {
          const response = await fetch(`/api/blogs/${blogId}`);
          const blog = await response.json();

          if (response.ok) {
            setTitle(blog.title);
            editor.commands.setContent(blog.content);
            setCategory(blog.category);
            setStatus(blog.status);
            setThumbnail(blog.thumbnail || "");
            setThumbnailPreview(blog.thumbnail || "");
            setIsEditing(true);
          }
        } catch (error) {
          console.error("Error fetching blog data:", error);
        }
      }
    };

    fetchData();
  }, [searchParams, editor]);

  // Event handlers
  const handleThumbnailUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setThumbnail(data.image_url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload thumbnail");
      setThumbnailPreview("");
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file || !editor) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        editor.chain().focus().setImage({ src: data.image_url }).run();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }, [editor]);

  const generateWithAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      alert("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generateblog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiPrompt,
          keywords: keywords
            .split(",")
            .map((k) => k.trim())
            .filter((k) => k),
        }),
      });

      if (!response.ok) throw new Error("AI generation failed");

      const { title, category, content } = await response.json();
      setTitle(title || "");
      setCategory(category || "");

      if (content && editor) {
        editor.commands.setContent(content);
      }

      setShowAIPanel(false);
      setAiPrompt("");
      setKeywords("");
    } catch (error) {
      console.error("AI generation error:", error);
      alert(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  }, [aiPrompt, keywords, editor]);

  const handleSubmit = useCallback(async () => {
    if (!title || !editor?.getHTML() || !category) {
      alert("Title, Content, and Category are required!");
      return;
    }

    try {
      const blogData = {
        title,
        content: editor.getHTML(),
        category,
        status,
        thumbnail,
      };

      const url = isEditing
        ? `/api/blogs/${searchParams.get("blogId")}`
        : "/api/blogs";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          isEditing
            ? "Blog updated successfully!"
            : "Blog created successfully!"
        );
        router.push(`/blog/${result.id}`);
      } else {
        throw new Error(isEditing ? "Update failed" : "Creation failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.message);
    }
  }, [title, editor, category, status, thumbnail, isEditing, searchParams, router]);

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            {isEditing ? "Edit Article" : "Create New Article"}
          </h2>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                showAIPanel
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              }`}
            >
              <FaRobot />
              {showAIPanel ? "Hide AI" : "AI Assistant"}
            </button>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              <FaSave />
              {isEditing ? "Update" : "Publish"}
            </button>
          </div>
        </div>

        {showAIPanel && (
          <AIPanel
            aiPrompt={aiPrompt}
            keywords={keywords}
            isGenerating={isGenerating}
            setAiPrompt={setAiPrompt}
            setKeywords={setKeywords}
            generateWithAI={generateWithAI}
            setShowAIPanel={setShowAIPanel}
          />
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              placeholder="Enter your article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <input
                type="text"
                placeholder="e.g. Technology, Lifestyle"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Thumbnail Image
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-full sm:w-40 h-32 flex-shrink-0">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      No thumbnail
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  ref={thumbnailInputRef}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploading}
                />
                <label
                  htmlFor="thumbnail-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                    isUploading
                      ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  }`}
                >
                  {isUploading
                    ? "Uploading..."
                    : thumbnail
                    ? "Change Thumbnail"
                    : "Upload Thumbnail"}
                </label>

                {thumbnail && !isUploading && (
                  <button
                    onClick={() => {
                      setThumbnail("");
                      setThumbnailPreview("");
                      if (thumbnailInputRef.current) {
                        thumbnailInputRef.current.value = "";
                      }
                    }}
                    className="ml-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                  >
                    Remove Thumbnail
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            {editor && (
              <Toolbar editor={editor} handleImageUpload={handleImageUpload} />
            )}
            <div className="bg-white dark:bg-gray-800">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}