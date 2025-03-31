import { supabase as db } from "@/lib/supabaseClient"; 

// Handle POST request (Follow/unfollow user)
export async function POST(req, { params }) {
  try {
    const { userId } = await params; // The user being followed/unfollowed
    const { followerId } = await req.json(); // The user who is following/unfollowing

    // Validate the request
    if (!userId || !followerId || userId === followerId) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check if the follower is already following the user
    const { data: existingFollow, error: checkError } = await db
      .from("followers")
      .select("*")
      .eq("follower_id", followerId)
      .eq("following_id", userId)
      .single(); // Fetch a single row

    if (checkError && checkError.code !== "PGRST116") throw checkError; // Ignore "No rows found" error

    if (existingFollow) {
      // Unfollow user
      const { error: deleteError } = await db
        .from("followers")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", userId);

      if (deleteError) throw deleteError;

      return Response.json(
        { message: "Unfollowed successfully" },
        { status: 200 }
      );
    } else {
      // Follow user
      const { error: insertError } = await db
        .from("followers")
        .insert([{ follower_id: followerId, following_id: userId }]);

      if (insertError) throw insertError;

      return Response.json(
        { message: "Followed successfully" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in follow/unfollow:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
