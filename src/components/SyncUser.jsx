"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; // Ensure Supabase client is initialized correctly
import { v4 as uuidv4 } from "uuid"; // Import UUID library

export default function SyncUser() {
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (!isSignedIn || !user) return; // Ensure user is signed in before proceeding

    // console.log("Syncing user:", user);

    const { id: clerkId, username, profileImageUrl, fullName, emailAddresses } = user; // ✅ Corrected email retrieval

    // Extract the correct email address (Clerk provides an array)
    const email = emailAddresses?.[0]?.emailAddress || "no-email@domain.com"; // ✅ Extract just the email string

    const checkAndSyncUser = async () => {
      try {
        // Use `.maybeSingle()` to prevent "JSON object requested" error
        const { data: existingUser, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("clerk_id", clerkId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching user from Supabase:", fetchError);
          return;
        }

        if (!existingUser) {
          // If the user does not exist, insert a new record with a UUID
          const { data, error: insertError } = await supabase
            .from("users")
            .insert([
              {
                id: uuidv4(), // Generate UUID only if inserting
                clerk_id: clerkId,
                name: fullName || "Unnamed User", // ✅ Insert `fullName`, fallback if missing
                username: username || `user_${clerkId.slice(0, 8)}`, // ✅ Fallback for username
                email: email, // ✅ Extracted correct email string
                profile_picture: profileImageUrl || null, // ✅ Ensure profile picture URL is saved correctly
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error("Error creating user in Supabase:", insertError);
            return;
          }

          // console.log("User created in Supabase:", data);
        } else {
          // console.log("User already exists in Supabase:", existingUser);
        }
      } catch (error) {
        console.error("Unexpected error syncing user:", error);
      }
    };

    checkAndSyncUser();
  }, [isSignedIn, user]);

  return null;
}
