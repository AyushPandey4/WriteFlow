import { supabase } from "@/lib/supabaseClient"; 
import { NextResponse } from "next/server";

// fetch all blogs by a specific author
export async function GET(req, { params }) {
  const { authorId } = await params;

  // Validate authorId
  if (!authorId) {
    return NextResponse.json(
      { error: "Author ID is required" },
      { status: 400 }
    );
  }

  try {
    // Use Supabase to fetch blogs by author_id
    const { data, error } = await supabase
      .from("blogs")
      .select(
        "id, title, content, thumbnail, category, status, created_at, updated_at"
      )
      .eq("author_id", authorId)
      .eq("status", "public")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ blogs: data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching author's blogs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
