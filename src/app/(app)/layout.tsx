import { redirect } from "next/navigation";
import Link from "next/link";
import { PersonStanding } from "lucide-react";

import { ComposeModal } from "@/components/compose-modal";
import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen">
      <Sidebar />
      <section className="flex-1 p-4">
        <div className="mb-4 flex items-center justify-end gap-2">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <PersonStanding className="size-4" />
            Profile
          </Link>
          <ComposeModal />
        </div>
        {children}
      </section>
    </main>
  );
}
