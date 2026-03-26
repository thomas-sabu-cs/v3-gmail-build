"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import type { EmailRow } from "@/types/database";
import type { MailboxKey } from "@/lib/email/mailboxes";

export function EmailList({
  emails,
  currentUserId,
  currentMailbox
}: {
  emails: EmailRow[];
  currentUserId: string;
  currentMailbox: MailboxKey;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleStar(email: EmailRow) {
    setBusyId(email.id);
    await supabase.from("emails").update({ is_starred: !email.is_starred }).eq("id", email.id);
    setBusyId(null);
    router.refresh();
  }

  async function moveToTrash(email: EmailRow) {
    setBusyId(email.id);
    await supabase.from("emails").update({ is_deleted: true }).eq("id", email.id);
    setBusyId(null);
    router.refresh();
  }

  async function recoverFromTrash(email: EmailRow) {
    setBusyId(email.id);
    await supabase.from("emails").update({ is_deleted: false }).eq("id", email.id);
    setBusyId(null);
    router.refresh();
  }

  async function permanentlyDelete(email: EmailRow) {
    setBusyId(email.id);
    await supabase.from("emails").delete().eq("id", email.id);
    setBusyId(null);
    router.refresh();
  }

  async function recoverAllInTrash() {
    if (emails.length === 0) return;
    const ids = emails.map((e) => e.id);
    setBusyId("bulk");
    await supabase.from("emails").update({ is_deleted: false }).in("id", ids);
    setBusyId(null);
    router.refresh();
  }

  async function permanentlyDeleteAllInTrash() {
    if (emails.length === 0) return;
    const ids = emails.map((e) => e.id);
    setBusyId("bulk");
    await supabase.from("emails").delete().in("id", ids);
    setBusyId(null);
    router.refresh();
  }

  if (emails.length === 0) {
    return (
      <p className="rounded-lg bg-white p-6 text-sm text-gray-600">
        No emails found in this mailbox.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {currentMailbox === "trash" ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            className="rounded-lg bg-white px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            disabled={busyId === "bulk"}
            onClick={recoverAllInTrash}
          >
            Recover all
          </button>
          <button
            className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-500 disabled:opacity-50"
            disabled={busyId === "bulk"}
            onClick={permanentlyDeleteAllInTrash}
          >
            Delete forever
          </button>
        </div>
      ) : null}

      <ul className="space-y-2">
        {emails.map((email) => (
          <li key={email.id} className="rounded-lg border bg-white p-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{email.subject || "(No subject)"}</p>
              <p className="mt-1 text-xs text-gray-600">
                {email.sender_id === currentUserId ? "You" : "Someone"} {"->"} {email.recipient_email}
              </p>
              <p className="mt-2 line-clamp-2 text-sm text-gray-700">{email.body}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
                onClick={() => toggleStar(email)}
                disabled={busyId === email.id}
              >
                <Star
                  className={`size-4 ${email.is_starred ? "fill-yellow-400 text-yellow-500" : "text-gray-500"}`}
                />
              </button>
              {currentMailbox === "trash" ? (
                <>
                  <button
                    className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
                    onClick={() => recoverFromTrash(email)}
                    disabled={busyId === email.id}
                  >
                    Recover
                  </button>
                  <button
                    className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500 disabled:opacity-50"
                    onClick={() => permanentlyDelete(email)}
                    disabled={busyId === email.id}
                  >
                    Delete forever
                  </button>
                </>
              ) : (
                <button
                  className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200 disabled:opacity-50"
                  onClick={() => moveToTrash(email)}
                  disabled={busyId === email.id}
                >
                  Trash
                </button>
              )}
            </div>
          </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
