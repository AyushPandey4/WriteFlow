import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { supabase as db } from '@/lib/supabaseClient';

let clerkClient;
try {
  clerkClient = createClerkClient({ 
    secretKey: process.env.CLERK_SECRET_KEY 
  });
} catch (err) {
  console.error('Clerk initialization failed:', err);
};

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: dbUser, error } = await db
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error && !error.message.includes('No rows found')) {
      throw error;
    }

    return NextResponse.json({
      bio: dbUser?.bio || '',
      lastSync: dbUser?.updated_at
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
    try {
      // Verify Clerk client is initialized
      if (!clerkClient) {
        throw new Error('Clerk client not initialized');
      }
  
      // Authenticate request
      const { userId } = getAuth(req);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      // console.log('Starting profile sync for user:', userId);
  
      // Get user data from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      if (!clerkUser) {
        throw new Error('User not found in Clerk');
      }
  
      // Get primary email address
      const primaryEmail = clerkUser.emailAddresses.find(
        email => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress;
  
      if (!primaryEmail) {
        throw new Error('No email address found for user');
      }
  
      // console.log('Retrieved Clerk user data:', {
      //   name: `${clerkUser.firstName} ${clerkUser.lastName}`,
      //   username: clerkUser.username,
      //   email: primaryEmail,
      //   imageUrl: clerkUser.imageUrl
      // });
  
      // Prepare data for upsert
      const userData = {
        clerk_id: userId,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        username: clerkUser.username,
        email: primaryEmail, // Include the required email field
        profile_picture: clerkUser.imageUrl,
        updated_at: new Date().toISOString()
      };
  
      // console.log('Prepared data for upsert:', userData);
  
      // Upsert user data
      const { data: updatedUser, error: dbError } = await db
        .from('users')
        .upsert(userData, { 
          onConflict: 'clerk_id'
        })
        .select()
        .single();
  
      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
  
      // console.log('Successfully synced profile:', updatedUser);
      return NextResponse.json(updatedUser);
      
    } catch (error) {
      console.error('Profile sync error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to sync profile',
          details: error.message 
        },
        { status: 500 }
      );
    }
  }


export async function PATCH(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bio } = await req.json();

    const { data: updatedUser, error } = await db
      .from('users')
      .update({ 
        bio,
        updated_at: new Date().toISOString() // Update timestamp on bio change
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Bio update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update bio' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';