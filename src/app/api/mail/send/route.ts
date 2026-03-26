import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { createClient as createAuthedClient } from "@/lib/supabase/server";
import { sendEmailWithSMTP } from "@/lib/tmail/sendEmail";

export async function POST(req: Request) {
  // Parse payload
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { recipientEmail, subject, body } = payload as {
    recipientEmail?: string;
    subject?: string;
    body?: string;
  };

  if (!recipientEmail) {
    return NextResponse.json({ error: "`recipientEmail` is required." }, { status: 400 });
  }

  // Ensure user is logged in (using anon key + session cookies)
  const authed = await createAuthedClient();
  const {
    data: { user },
    error: userError,
  } = await authed.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const to = recipientEmail.trim().toLowerCase();
  const emailSubject = subject || "(No subject)";
  const emailText = body || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Missing Supabase service role env vars." },
      { status: 500 }
    );
  }

  // Use service role to bypass RLS for inserts/upserts (we still validate user identity above).
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Ensure sender profile exists (emails.sender_id references profiles.id)
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
    { id: user.id, email: user.email ?? "", full_name: null },
    { onConflict: "id" }
  );
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  // Store the email row (for in-app inbox/sent/trash)
  const { error: insertError } = await supabaseAdmin.from("emails").insert({
    sender_id: user.id,
    recipient_email: to,
    subject: emailSubject,
    body: emailText,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  // Send real email via SMTP ("tmail") in background so the request doesn't time out.
  void sendEmailWithSMTP({ to, subject: emailSubject, text: emailText }).catch((e) => {
    const message = e instanceof Error ? e.message : "Failed to send email.";
    console.error("[tmail] send failed:", message);
  });

  return NextResponse.json({ ok: true });
}

