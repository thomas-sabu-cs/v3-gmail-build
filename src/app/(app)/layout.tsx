import { redirect } from "next/navigation";

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
        <div className="mb-4 flex justify-end">
          <ComposeModal />
        </div>
        {children}
      </section>
    </main>
  );
}
