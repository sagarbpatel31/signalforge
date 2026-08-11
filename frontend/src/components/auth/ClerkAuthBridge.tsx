"use client";

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { migrateLegacySession } from "@/lib/api";
import {
  clearAccountIdentity,
  clearSession,
  configureAccountIdentity,
  getBrowserSessionToken,
} from "@/lib/identity";

export function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [readyIdentity, setReadyIdentity] = useState("");
  const expectedIdentity = isSignedIn && userId ? userId : "signed-out";

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    async function prepareIdentity() {
      if (!isSignedIn || !userId) {
        clearAccountIdentity();
        if (!cancelled) setReadyIdentity("signed-out");
        return;
      }

      const legacyToken = getBrowserSessionToken();
      configureAccountIdentity(userId, getToken);

      try {
        const accountToken = await getToken();
        if (accountToken && legacyToken) {
          const migration = await migrateLegacySession(accountToken, legacyToken);
          clearSession();
          if (migration.profile_migrated && pathname === "/onboarding") {
            router.replace("/");
            router.refresh();
          }
        }
      } catch {
        // Keep the legacy token so migration can retry on the next load.
      } finally {
        if (!cancelled) setReadyIdentity(userId);
      }
    }

    void prepareIdentity();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, pathname, router, userId]);

  if (!isLoaded || readyIdentity !== expectedIdentity) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        Connecting your SignalForge account…
      </div>
    );
  }

  return children;
}
