import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { clerkEnabled } from "@/lib/auth-config";

export default function SignInPage() {
  if (!clerkEnabled) redirect("/onboarding");

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span>SignalForge</span>
        <small>ACCOUNT ACCESS</small>
      </div>
      <SignIn />
    </main>
  );
}
