import fs from "fs";
import path from "path";

// process.cwd() = frontend/ (npm --prefix frontend sets cwd); backend/data is one level up
const DATA_ROOT = path.resolve(process.cwd(), "../backend/data");

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

export function readCacheFile<T>(name: string): T | null {
  return readJson<T>(path.join(DATA_ROOT, "cache", `${name}.json`));
}

export function readProfileFile<T>(sessionToken?: string): T | null {
  const userId = sessionToken ? sessionToken.split(".")[0] : "";
  if (userId.startsWith("u_")) {
    // Scoped profile only. profile.json is the unscoped local-dev seed, so
    // returning it here would hand one session another session's profile.
    return readJson<T>(path.join(DATA_ROOT, "profiles", `${userId}.json`));
  }
  return readJson<T>(path.join(DATA_ROOT, "profile.json"));
}
