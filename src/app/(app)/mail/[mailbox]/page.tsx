import { notFound } from "next/navigation";

import { EmailList } from "@/components/email-list";
import { applyMailboxFilter, MAILBOXES, type MailboxKey } from "@/lib/email/mailboxes";
import { createClient } from "@/lib/supabase/server";
import type { EmailRow } from "@/types/database";

export default async function MailboxPage({
  params
}: {
  params: Promise<{ mailbox: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    notFound();
  }

  const { mailbox } = await params;
  const mailboxKey = mailbox as MailboxKey;
  const isValidMailbox = MAILBOXES.some((entry) => entry.key === mailboxKey);

  if (!isValidMailbox) {
    notFound();
  }

  const baseQuery = supabase.from("emails").select("*").order("created_at", { ascending: false });
  const scopedQuery = applyMailboxFilter(baseQuery, mailboxKey, user.id, user.email);
  const { data, error } = (await scopedQuery) as { data: EmailRow[] | null; error: { message: string } | null };

  if (error) {
    return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error.message}</p>;
  }

  const label = MAILBOXES.find((entry) => entry.key === mailboxKey)?.label ?? "Mailbox";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{label}</h1>
      <EmailList emails={data ?? []} currentUserId={user.id} currentMailbox={mailboxKey} />
    </div>
  );
}
