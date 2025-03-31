import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/getUserId"; 
import { NextResponse } from "next/server";

// DELETE: Delete a comment
export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    const userId = await getUserId(req); // Get user ID from Clerk

    // Validate user authentication
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the comment exists and belongs to the user
    const { data: comment, error: checkError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", id)
      .single();

    if (checkError) throw checkError;
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user_id !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own comments" },
        { status: 403 }
      );
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
