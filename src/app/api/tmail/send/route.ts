import { NextResponse } from "next/server";

import { sendEmailWithSMTP } from "@/lib/tmail/sendEmail";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { to, subject, text } = body as { to?: string; subject?: string; text?: string };

  if (!to || !subject || !text) {
    return NextResponse.json({ error: "`to`, `subject`, and `text` are required." }, { status: 400 });
  }

  try {
    // Fire-and-forget so the HTTP request doesn't time out.
    // The server will still attempt to send the email; failures are logged.
    void sendEmailWithSMTP({ to, subject, text }).catch((e) => {
      const message = e instanceof Error ? e.message : "Failed to send email.";
      console.error("[tmail] send failed:", message);
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

