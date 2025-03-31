import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient"; 
import { getUserId } from "@/getUserId"; 
import { NextResponse } from "next/server";

// GET: Fetch all comments for a blog
export async function GET(req, { params }) {
  const { blogId } = await params;

  try {
    // Use Supabase to fetch comments with user details
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        blog_id,
        user_id,
        content,
        created_at,
        users (username, profile_picture)
      `)
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the response to include username
    const comments = data.map((comment) => ({
      id: comment.id,
      blog_id: comment.blog_id,
      user_id: comment.user_id,
      comment: comment.content,
      created_at: comment.created_at,
      username: comment.users.username,
      profile_picture: comment.users.profile_picture
    }));

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST: Add a comment
export async function POST(req, { params }) {
  const { blogId } = await params;
  const { content } = await req.json();

  // Validate comment content
  if (!content || content.trim() === "") {
    return NextResponse.json(
      { error: "Comment cannot be empty" },
      { status: 400 }
    );
  }

  try {
    const userId = await getUserId(req); // Get user ID from Clerk
    if (!userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Use Supabase to insert a new comment
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          blog_id: blogId,
          user_id: userId,
          content,
        },
      ])
      .select('id, created_at'); // Return the inserted row

    if (error) throw error;

    return NextResponse.json(
      {
        message: "Comment added",
        commentId: data[0].id,
        createdAt: data[0].created_at,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}