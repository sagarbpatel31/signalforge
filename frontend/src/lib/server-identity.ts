import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

import { clerkEnabled } from "./auth-config";
import { SESSION_COOKIE_NAME } from "./identity";

/** Verified account token, or the local signed-session token in keyless mode. */
export async function getServerSessionToken(): Promise<string> {
  if (clerkEnabled) {
    const { getToken, isAuthenticated } = await auth();
    if (!isAuthenticated) return "";
    return (await getToken()) ?? "";
  }

  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? "";
}
