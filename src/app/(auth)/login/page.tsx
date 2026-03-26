import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <AuthForm mode="login" />
    </main>
  );
}
