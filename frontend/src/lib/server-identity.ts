import { cookies } from "next/headers";

import { USER_COOKIE_NAME, normalizeUserKey } from "./identity";

export async function getServerUserKey(): Promise<string> {
  const store = await cookies();
  return normalizeUserKey(store.get(USER_COOKIE_NAME)?.value ?? "");
}
