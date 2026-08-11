import { ClerkProvider } from "@clerk/nextjs";

import { clerkEnabled } from "@/lib/auth-config";
import { ClerkAuthBridge } from "./ClerkAuthBridge";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkEnabled) return children;

  return (
    <ClerkProvider>
      <ClerkAuthBridge>{children}</ClerkAuthBridge>
    </ClerkProvider>
  );
}
