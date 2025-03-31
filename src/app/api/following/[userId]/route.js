import { supabase } from "@/lib/supabaseClient";

// Handle GET request (Get list of users a person is following)
export async function GET(req, { params }) {
  try {
    const { userId } = await params;
    // console.log(userId)
    // Validate the request
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const { data: following, error } = await supabase
      .from("followers")
      .select(
        `
    *,
    users!followers_following_id_fkey (id, name, profile_picture, username)
  `
      )
      .eq("follower_id", userId);

    // Handle errors
    if (error) throw error;

    // Extract and format the user data
    const followingUsers = following.map((follow) => follow.users);
    // console.log(following);
    // Return the list of users being followed
    return Response.json({ following: following }, { status: 200 });
  } catch (error) {
    console.error("Error fetching following list:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
