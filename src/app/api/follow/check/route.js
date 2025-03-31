import { supabase as db } from "@/lib/supabaseClient";

// Handle GET request (Check if user is following another user)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId");
    const followingId = searchParams.get("followingId");

    // Validate the request
    if (!followerId || !followingId) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check if the follower is following the user
    const { data: existingFollow, error } = await db
      .from("followers")
      .select("*")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // Ignore "No rows found" error

    return Response.json({ isFollowing: !!existingFollow }, { status: 200 });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}