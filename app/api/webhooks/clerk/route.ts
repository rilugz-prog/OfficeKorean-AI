// ---------------------------------------------------------------------------
// Clerk webhook → Neon profile synchronization.
//
// Subscribe this endpoint (https://<domain>/api/webhooks/clerk) to the
// user.created / user.updated / user.deleted events in the Clerk dashboard.
// Requests are verified with svix using CLERK_WEBHOOK_SECRET.
// ---------------------------------------------------------------------------

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  deleteProfileByClerkId,
  upsertProfileFromClerk,
} from "@/lib/user-sync";

export const runtime = "nodejs";

// Minimal shapes for the Clerk events we handle.
interface ClerkEmail {
  id: string;
  email_address: string;
}
interface ClerkUserData {
  id: string;
  email_addresses?: ClerkEmail[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
}
interface ClerkEvent {
  type: string;
  data: ClerkUserData;
}

function primaryEmail(data: ClerkUserData): string | null {
  const list = data.email_addresses ?? [];
  const primary = list.find((e) => e.id === data.primary_email_address_id);
  return primary?.email_address ?? list[0]?.email_address ?? null;
}

function fullName(data: ClerkUserData): string | null {
  return (
    [data.first_name, data.last_name].filter(Boolean).join(" ") ||
    data.username ||
    null
  );
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[clerk webhook] CLERK_WEBHOOK_SECRET is not set.");
    return NextResponse.json(
      { success: false, message: "Webhook not configured." },
      { status: 500 }
    );
  }

  // Verify the svix signature against the raw body.
  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { success: false, message: "Missing svix headers." },
      { status: 400 }
    );
  }

  const body = await req.text();

  let event: ClerkEvent;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch (err) {
    console.error("[clerk webhook] signature verification failed", err);
    return NextResponse.json(
      { success: false, message: "Invalid signature." },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "user.created":
      case "user.updated":
        await upsertProfileFromClerk({
          clerkUserId: event.data.id,
          email: primaryEmail(event.data),
          fullName: fullName(event.data),
          avatarUrl: event.data.image_url ?? null,
        });
        break;
      case "user.deleted":
        if (event.data.id) await deleteProfileByClerkId(event.data.id);
        break;
      default:
        // Ignore other event types.
        break;
    }
  } catch (err) {
    console.error("[clerk webhook] handler error", event.type, err);
    return NextResponse.json(
      { success: false, message: "Handler error." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
