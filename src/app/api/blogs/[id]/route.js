import { supabase } from "@/lib/supabaseClient"; 
import { NextResponse } from "next/server";
import { getUserId } from "@/getUserId"; 

// GET: Fetch a specific blog by ID
export async function GET(req, { params }) {
  const { id } = await params;

  // Validate blog ID
  if (!id) {
    return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
  }

  try {
    // Use Supabase to fetch the blog by ID
    const { data, error } = await supabase
      .from("blogs")
      .select(
        "id, author_id, title, content, thumbnail, category, status, created_at, updated_at"
      )
      .eq("id", id)
      .single(); // Fetch a single row

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH: Edit a specific blog
export async function PATCH(req, { params }) {
  const { id } = await params;
  const userId = await getUserId(req); // Get user ID from Clerk
  const { title, content, thumbnail, category, status } = await req.json();

  // Validate required fields
  if (!id || !title || !content || !category || !status) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Check if the blog exists and is owned by the user
    const { data: blog, error: checkError } = await supabase
      .from("blogs")
      .select("author_id")
      .eq("id", id)
      .single();

    if (checkError) throw checkError;
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.author_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the blog
    const { data: updatedBlog, error: updateError } = await supabase
      .from("blogs")
      .update({
        title,
        content,
        thumbnail,
        category,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(); // Return the updated row

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: "Blog updated successfully", blog: updatedBlog[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific blog
export async function DELETE(req, { params }) {
  const { id } = await params;
  const userId = await getUserId(req); // Get user ID from Clerk

  // Validate blog ID
  if (!id) {
    return NextResponse.json({ error: "Blog ID is required" }, { status: 400 });
  }

  try {
    // Check if the blog exists and is owned by the user
    const { data: blog, error: checkError } = await supabase
      .from("blogs")
      .select("author_id")
      .eq("id", id)
      .single();

    if (checkError) throw checkError;
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.author_id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the blog
    const { error: deleteError } = await supabase
      .from("blogs")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
