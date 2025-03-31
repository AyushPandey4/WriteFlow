import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/getUserId";

export async function GET(req) {
  try {
    const user = await getUserId(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Get bookmarks with blog data in a single query using a join
    const { data, error } = await supabase
      .from("bookmarks")
      .select(
        `
        blog:blogs (
          id, 
          title, 
          thumbnail, 
          content, 
          category, 
          created_at
        )
      `
      )
      .eq("user_id", user);

    if (error) throw error;

    // Extract just the blog data from the result
    const blogs = data.map((item) => item.blog);

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}
