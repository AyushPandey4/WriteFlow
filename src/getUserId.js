import { supabase } from "./lib/supabaseClient"; 
import { getAuth } from '@clerk/nextjs/server';

export async function getUserId(req) {
  const { userId } = getAuth(req);
  if (!userId) throw new Error("Unauthorized");

  // Use Supabase to query the users table
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single(); // Use .single() to get only one row

  if (error) throw error;
  if (!data) throw new Error("User not found");

  return data.id; // Return the user_id
}