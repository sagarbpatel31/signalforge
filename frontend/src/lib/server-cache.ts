import fs from "fs";
import path from "path";

// process.cwd() = frontend/ (npm --prefix frontend sets cwd); backend/data is one level up
const DATA_ROOT = process.env.SIGNALFORGE_DATA_DIR
  ? path.resolve(process.env.SIGNALFORGE_DATA_DIR)
  : path.resolve(process.cwd(), "../backend/data");

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
