// app/api/get-stream-token/route.js
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import { auth } from '@clerk/nextjs/server';

export async function GET(request) {
  try {
    // 1. Authenticate with Clerk
    const { userId } = auth(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // 2. Get Stream credentials
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.STREAM_SECRET_KEY;
    
    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Stream credentials not configured' },
        { status: 500 }
      );
    }

    // 3. Generate token
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    const token = serverClient.createToken(userId);
    
    return NextResponse.json({
      token,
      apiKey, // Needed for client initialization
      userId  // For verification
    });

  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}