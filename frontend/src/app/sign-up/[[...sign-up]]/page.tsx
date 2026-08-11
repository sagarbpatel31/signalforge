import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { clerkEnabled } from "@/lib/auth-config";

export default function SignUpPage() {
  if (!clerkEnabled) redirect("/onboarding");

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <span>SignalForge</span>
        <small>CREATE ACCOUNT</small>
      </div>
      <SignUp />
    </main>
  );
}
