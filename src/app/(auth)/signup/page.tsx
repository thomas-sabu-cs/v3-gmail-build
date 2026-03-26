import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4">
      <AuthForm mode="signup" />
    </main>
  );
}
