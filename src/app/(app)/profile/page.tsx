"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");

  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      setError(null);

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (userError || !user) {
        setError(userError?.message ?? "Not logged in.");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        return;
      }

      const current = profile?.full_name ?? "";
      setFullName(current);
      setNewName(current);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function saveName() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError?.message ?? "Not logged in.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        { id: user.id, email: user.email ?? "", full_name: newName },
        { onConflict: "id" }
      );

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setFullName(newName);
    setLoading(false);
    router.refresh();
  }

  async function changePassword() {
    setLoading(true);
    setError(null);

    // Supabase requires the user to be signed in. We don't send currentPassword because
    // this app uses `updateUser({ password })` (re-auth rules are handled by Supabase).
    // If Supabase prompts for re-auth, you'll see the error here.

    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) {
      setError(passwordError.message);
      setLoading(false);
      return;
    }

    setNewPassword("");
    setLoading(false);
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </div>

      <section className="rounded-xl border bg-white p-4">
        <div className="text-sm text-gray-600">Email</div>
        <div className="mt-1 text-base font-medium">{email || "—"}</div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Display name</h2>
        <p className="mt-1 text-sm text-gray-600">This shows as “full name” in your app.</p>

        <div className="mt-3 space-y-2">
          <input
            className="w-full rounded-lg border p-2"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your name"
          />
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
            disabled={loading || newName.trim().length === 0}
            onClick={saveName}
          >
            {loading ? "Saving..." : "Save name"}
          </button>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="mt-1 text-sm text-gray-600">Password update must be done while signed in.</p>

        <div className="mt-3 space-y-2">
          <input
            type="password"
            className="w-full rounded-lg border p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
          />
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
            disabled={loading || newPassword.length < 6}
            onClick={changePassword}
          >
            {loading ? "Updating..." : "Update password"}
          </button>
        </div>
      </section>
    </div>
  );
}

