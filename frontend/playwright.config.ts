import path from "node:path";
import os from "node:os";

import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://127.0.0.1:3100";
const apiUrl = "http://127.0.0.1:8100";
const dataDir = path.join(os.tmpdir(), `signalforge-e2e-${process.pid}`);
const backendPython = process.env.E2E_PYTHON ?? (process.env.CI ? "python" : ".venv/bin/python");

export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `${backendPython} -m uvicorn main:app --host 127.0.0.1 --port 8100 --lifespan off`,
      cwd: path.resolve(__dirname, "../backend"),
      url: `${apiUrl}/health`,
      timeout: 60_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        ALLOW_LEGACY_SESSIONS: "true",
        CLERK_SECRET_KEY: "",
        ENABLE_COLD_FEED_REFRESH: "false",
        ENV: "test",
        FRONTEND_URL: frontendUrl,
        SESSION_SECRET: "signalforge-e2e-session-secret",
        SIGNALFORGE_DATA_DIR: dataDir,
        UPSTASH_REDIS_REST_TOKEN: "",
        UPSTASH_REDIS_REST_URL: "",
        VERCEL: "",
      },
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      cwd: __dirname,
      url: frontendUrl,
      timeout: 90_000,
      reuseExistingServer: false,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "",
        SIGNALFORGE_DATA_DIR: dataDir,
      },
    },
  ],
});
