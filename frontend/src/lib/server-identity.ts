import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./identity";

/** Session token for the current request, or "" when the visitor is anonymous. */
export async function getServerSessionToken(): Promise<string> {
  const store = await cookies();
  return store.get(SESSION_COOKIE_NAME)?.value ?? "";
}
