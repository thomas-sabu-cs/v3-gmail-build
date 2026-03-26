"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function ComposeModal() {
  const supabase = createClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function sendEmail() {
    setError(null);
    setSending(true);

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please log in to send mail.");
      setSending(false);
      return;
    }

    const { error: insertError } = await supabase.from("emails").insert({
      sender_id: user.id,
      recipient_email: recipientEmail,
      subject,
      body
    });

    if (insertError) {
      setError(insertError.message);
      setSending(false);
      return;
    }

    setOpen(false);
    setRecipientEmail("");
    setSubject("");
    setBody("");
    setSending(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="rounded-full bg-blue-600 px-5 py-2 text-sm text-white" onClick={() => setOpen(true)}>
        Compose
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-xl">
        <p className="mb-3 text-base font-semibold">New Message</p>
        <div className="space-y-2">
          <input
            className="w-full rounded-lg border p-2"
            placeholder="To"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border p-2"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <textarea
            className="h-40 w-full rounded-lg border p-2"
            placeholder="Write your email..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            disabled={sending || !recipientEmail}
            onClick={sendEmail}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
