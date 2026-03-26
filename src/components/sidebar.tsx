"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Mail, PersonStanding, Send, Star, Trash2 } from "lucide-react";

import { MAILBOXES, type MailboxKey } from "@/lib/email/mailboxes";

const iconByKey: Record<MailboxKey, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  starred: Star,
  sent: Send,
  "all-mail": Mail,
  trash: Trash2
};

export function Sidebar() {
  const pathname = usePathname();
  const profileHref = "/profile";
  const profileActive = pathname === profileHref;

  return (
    <aside className="w-64 border-r bg-white p-4">
      <p className="mb-4 text-lg font-semibold">Gmail v3</p>
      <nav className="space-y-1">
        <Link
          href={profileHref}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            profileActive ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <PersonStanding className="size-4" />
          Profile
        </Link>
        {MAILBOXES.map((mailbox) => {
          const Icon = iconByKey[mailbox.key];
          const href = `/mail/${mailbox.key}`;
          const active = pathname === href;
          return (
            <Link
              key={mailbox.key}
              href={href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                active ? "bg-red-100 text-red-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="size-4" />
              {mailbox.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
