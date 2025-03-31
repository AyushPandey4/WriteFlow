import { supabase } from "@/lib/supabaseClient"; 
import { NextResponse } from "next/server";
import { getUserId } from "@/getUserId"; 

// PATCH: Update blog status (public/private)
export async function PATCH(req, { params }) {
  const { id } = params;
  const userId = await getUserId(req); // Get user ID from Clerk
  const { status } = await req.json();

  // Validate blog ID and status
  if (!id || !status) {
    return NextResponse.json(
      { error: "Blog ID and status are required" },
      { status: 400 }
    );
  }

  // Validate status value
  if (status !== "public" && status !== "private") {
    return NextResponse.json(
      { error: "Invalid status. Allowed values: 'public' or 'private'" },
      { status: 400 }
    );
  }

  try {
    // Check if the blog exists and is owned by the user
    const { data: blog, error: checkError } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', id)
      .single();

    if (checkError) throw checkError;
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    if (blog.author_id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update blog status
    const { data: updatedBlog, error: updateError } = await supabase
      .from('blogs')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, title, status, updated_at'); // Return specific fields

    if (updateError) throw updateError;

    return NextResponse.json(
      { message: "Blog status updated successfully", blog: updatedBlog[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}