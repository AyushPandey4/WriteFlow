import { supabase } from "@/lib/supabaseClient";


// Handle GET request (Get followers count)
export async function GET(req, { params }) {
  try {
    const { userId } = await params;

    // Validate the request
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch the follower count using Supabase
    const { count, error } = await supabase
      .from("followers")
      .select("*", { count: "exact", head: true }) // Get the total count
      .eq("following_id", userId); // Filter by the user being followed

    // Handle errors
    if (error) throw error;

    // Return the follower count
    return Response.json({ followersCount: count || 0 }, { status: 200 });
  } catch (error) {
    console.error("Error fetching follower count:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}