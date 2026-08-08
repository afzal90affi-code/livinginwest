import { client } from "@/lib/sanityClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Duplicate check
    const existing = await client.fetch(
      `*[_type == "subscriber" && email == $email][0]{_id}`,
      { email: cleanEmail }
    );

    if (existing) {
      return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 });
    }

    await client.create({
      _type: "subscriber",
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}