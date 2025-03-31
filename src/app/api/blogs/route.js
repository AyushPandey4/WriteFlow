import { getUserId } from "@/getUserId";
import { supabase as db } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

// GET /api/blogs → Get all public blogs (home page)
export async function GET(req) {
  try {
    const { data: blogs, error } = await db
      .from("blogs")
      .select(
        `
        id, 
        author_id, 
        title, 
        content, 
        thumbnail, 
        category, 
        status, 
        created_at,
        author:users(id, name, username, profile_picture)
      `
      )
      .eq("status", "public")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs → Create a new blog
export async function POST(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, thumbnail, category, status } = await req.json();

    // Validate required fields
    if (!title || !content || !category || !status) {
      return NextResponse.json(
        { error: "Title, content, category, and status are required" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data consistency
    const { data: newBlog, error: blogError } = await db
      .from("blogs")
      .insert([
        {
          author_id: userId,
          title,
          content,
          thumbnail: thumbnail || null,
          category,
          status,
        },
      ])
      .select()
      .single();

    if (blogError) throw blogError;

    // If thumbnail was provided, create a record in images table
    if (thumbnail) {
      const { error: imageError } = await db.from("images").insert([
        {
          user_id: userId,
          blog_id: newBlog.id,
          image_url: thumbnail,
        },
      ]);

      if (imageError) throw imageError;
    }

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Blog creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}

// PATCH /api/blogs/:id → Update a blog (including thumbnail)
export async function PATCH(req) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = req.params;
    const { title, content, thumbnail, category, status } = await req.json();

    // First verify the user owns the blog
    const { data: existingBlog, error: fetchError } = await db
      .from("blogs")
      .select("*")
      .eq("id", id)
      .eq("author_id", userId)
      .single();

    if (fetchError || !existingBlog) {
      return NextResponse.json(
        { error: "Blog not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the blog
    const { data: updatedBlog, error: updateError } = await db
      .from("blogs")
      .update({
        title: title || existingBlog.title,
        content: content || existingBlog.content,
        thumbnail: thumbnail || existingBlog.thumbnail,
        category: category || existingBlog.category,
        status: status || existingBlog.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // If thumbnail was changed, update images table
    if (thumbnail && thumbnail !== existingBlog.thumbnail) {
      // First check if image record exists
      const { data: existingImage, error: imageFetchError } = await db
        .from("images")
        .select("*")
        .eq("blog_id", id)
        .eq("user_id", userId)
        .single();

      if (imageFetchError && !existingImage) {
        // Create new image record
        await db.from("images").insert([
          {
            user_id: userId,
            blog_id: id,
            image_url: thumbnail,
          },
        ]);
      } else {
        // Update existing image record
        await db
          .from("images")
          .update({ image_url: thumbnail })
          .eq("id", existingImage.id);
      }
    }

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error("Blog update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}
