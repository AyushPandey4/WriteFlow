import { getAuth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    // Extract Clerk user ID from the request
    const { userId: clerkUserId } = getAuth(req);

    // Check if the user is authenticated
    if (!clerkUserId) {
      return Response.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch user_id from Supabase using Clerk user ID
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    // Handle Supabase errors
    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Failed to fetch user data from database" },
        { status: 500 }
      );
    }

    // Check if user exists in the database
    if (!data) {
      return Response.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Return the user_id
    return Response.json({ user_id: data.id }, { status: 200 });
  } catch (err) {
    console.error("Internal server error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}