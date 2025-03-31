import { getUserId } from "@/getUserId";
import { supabase as db } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// GET /api/blogs → Get all blogs for the authenticated user with likes and comments count
export async function GET(req) {
  try {
    // Step 1: Get the authenticated user's ID
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: Fetch all blogs for the authenticated user
    const { data: blogs, error: blogsError } = await db
      .from("blogs")
      .select("id, title, status, created_at")
      .eq("author_id", userId) // Filter by the authenticated user's ID
      .order("created_at", { ascending: false });

    if (blogsError) throw blogsError;

    // Step 3: Fetch likes and comments count for each blog
    const blogsWithCounts = await Promise.all(
      blogs.map(async (blog) => {
        // Fetch likes count
        const { count: likesCount, error: likesError } = await db
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("blog_id", blog.id);

        if (likesError) throw likesError;

        // Fetch comments count
        const { count: commentsCount, error: commentsError } = await db
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("blog_id", blog.id);

        if (commentsError) throw commentsError;

        // Return blog with likes and comments count
        return {
          ...blog,
          likes: likesCount || 0,
          comments: commentsCount || 0,
        };
      })
    );

    // Step 4: Return the combined data
    return NextResponse.json(blogsWithCounts);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}