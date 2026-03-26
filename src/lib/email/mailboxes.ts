export type MailboxKey = "inbox" | "starred" | "sent" | "all-mail" | "trash";

type EmailQueryBuilder = any;

export function applyMailboxFilter(
  query: EmailQueryBuilder,
  mailbox: MailboxKey,
  userId: string,
  userEmail: string
) {
  switch (mailbox) {
    case "inbox":
      return query
        .eq("recipient_email", userEmail)
        .eq("is_deleted", false)
        .eq("is_archived", false);
    case "starred":
      return query.eq("is_starred", true).eq("is_deleted", false);
    case "sent":
      return query.eq("sender_id", userId).eq("is_deleted", false);
    case "trash":
      return query.eq("is_deleted", true);
    case "all-mail":
    default:
      return query.eq("is_deleted", false);
  }
}

export const MAILBOXES: Array<{ key: MailboxKey; label: string }> = [
  { key: "inbox", label: "Inbox" },
  { key: "starred", label: "Starred" },
  { key: "sent", label: "Sent" },
  { key: "all-mail", label: "All Mail" },
  { key: "trash", label: "Trash" }
];
