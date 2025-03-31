import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    
    if (!q) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Clean and format the query for FTS
    const searchQuery = q
      .trim()
      .split(/\s+/) // Split on whitespace
      .filter(Boolean)
      .map(term => `${term}:*`)
      .join(' | ');

    // Perform the search query using Supabase
    const { data: blogs, error } = await supabase
      .from("blogs")
      .select(`
        id,
        title,
        content,
        thumbnail,
        category,
        status,
        created_at,
        updated_at,
        author:users!inner(
          id,
          name,
          username,
          profile_picture
        )
      `)
      .textSearch('search_vector', searchQuery, {
        type: 'websearch',
        config: 'english'
      })
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Transform the data
    const formattedBlogs = blogs.map((blog) => ({
      ...blog,
      author_id: blog.author.id,
      author_name: blog.author.name,
      author_username: blog.author.username,
      profile_picture: blog.author.profile_picture,
    }));

    return NextResponse.json(formattedBlogs, { status: 200 });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}