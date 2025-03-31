import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/getUserId"; 
import { NextResponse } from "next/server";

// GET: Fetch like count for a blog
export async function GET(req, { params }) {
  const { blogId } = await params;

  try {
    // Use Supabase to count likes for the blog
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('blog_id', blogId);

    if (error) throw error;

    return NextResponse.json({ total_likes: count || 0 }, { status: 200 });
  } catch (error) {
    console.error("Error fetching likes:", error);
    return NextResponse.json(
      { error: "Failed to fetch likes" },
      { status: 500 }
    );
  }
}

// POST: Like/unlike a blog
export async function POST(req, { params }) {
  const { blogId } = await params;
  const userId = await getUserId(req); // Get user ID from Clerk

  // Validate user authentication
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Check if the user has already liked the blog
    const { data: existingLike, error: checkError } = await supabase
      .from('likes')
      .select('id')
      .eq('blog_id', blogId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError; // Ignore "No rows found" error

    if (existingLike) {
      // Unlike (delete the like entry)
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('blog_id', blogId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      return NextResponse.json(
        { message: "Unliked successfully" },
        { status: 200 }
      );
    }

    // Like (insert new like entry)
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ blog_id: blogId, user_id: userId }]);

    if (insertError) throw insertError;

    return NextResponse.json(
      { message: "Liked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error liking/unliking blog:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}