import { NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  token: process.env.SANITY_WRITE_TOKEN || "",
  useCdn: false,
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    // Check if already exists
    const existing = await sanityClient.fetch(`*[_type == "subscriber" && email == $email][0]`, { email });
    if (existing) {
      return NextResponse.json({ success: false, error: "You are already subscribed!" });
    }

    await sanityClient.create({
      _type: 'subscriber',
      email: email,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}