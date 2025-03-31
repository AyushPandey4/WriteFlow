import { supabase as db } from "@/lib/supabaseClient"; 
import { NextResponse } from "next/server";

// GET /api/users/:id → Get user profile by ID
export async function GET(req, { params }) {
  const { id } = await params;

  try {
    // Fetch user data from Supabase
    const { data: user, error } = await db
      .from("users")
      .select("id, name, email, bio, profile_picture, username")
      .eq("id", id)
      .single(); // Fetch a single row

    // Handle errors
    if (error) throw error;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return the user data
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
