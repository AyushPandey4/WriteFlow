import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/getUserId";

export async function POST(req, { params }) {
  try {
    const user = await getUserId(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blogId } = await params;

    // Check if the blog is already bookmarked
    const { data: existingBookmark, error: findError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user)
      .eq("blog_id", blogId)
      .single();

    if (existingBookmark) {
      // If exists, remove bookmark
      const { error: deleteError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", existingBookmark.id);

      if (deleteError) throw deleteError;
      return NextResponse.json({
        isBookmarked: false,
        message: "Bookmark removed",
      });
    } else {
      // If not, add to bookmarks
      const { error: insertError } = await supabase
        .from("bookmarks")
        .insert([{ user_id: user, blog_id: blogId }]);

      if (insertError) throw insertError;
      return NextResponse.json({
        isBookmarked: true,
        message: "Bookmark added",
      });
    }
  } catch (error) {
    console.error("Bookmark toggle error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    const user = await getUserId(req);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blogId } = await params;

    // Check if the blog is bookmarked by the user
    const { data: existingBookmark, error: findError } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("user_id", user)
      .eq("blog_id", blogId)
      .single();

    return NextResponse.json({
      isBookmarked: !!existingBookmark,
      bookmarkId: existingBookmark?.id || null,
    });
  } catch (error) {
    console.error("Bookmark status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check bookmark status",
        isBookmarked: false,
      },
      { status: 500 }
    );
  }
}
