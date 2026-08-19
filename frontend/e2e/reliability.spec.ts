import { expect, test, type APIRequestContext, type BrowserContext } from "@playwright/test";

const API_URL = "http://127.0.0.1:8100";
const FRONTEND_URL = "http://127.0.0.1:3100";

async function provisionIdentity(
  request: APIRequestContext,
  context: BrowserContext,
  name: string,
) {
  const sessionResponse = await request.post(`${API_URL}/api/auth/session`);
  expect(sessionResponse.ok()).toBeTruthy();
  const { token } = await sessionResponse.json() as { token: string };

  const profileResponse = await request.post(`${API_URL}/api/profile`, {
    headers: { "X-SignalForge-Token": token },
    data: {
      name,
      handle: `@${name.toLowerCase()}`,
      domains: ["Edge AI", "Robotics"],
      experience: "Senior Engineer",
      goal: "Build a startup",
      current_projects: "Edge inference and robot tooling",
    },
  });
  expect(profileResponse.ok()).toBeTruthy();

  await context.addCookies([{
    name: "sf_session",
    value: token,
    url: FRONTEND_URL,
    sameSite: "Lax",
  }]);
  await context.addInitScript((sessionToken) => {
    window.localStorage.setItem("sf-session", sessionToken);
  }, token);
  return token;
}

test("onboarding and daily command state survive reload and reset cleanly", async ({ page }) => {
  await page.goto("/onboarding");
  await page.getByPlaceholder("e.g. Sagar").fill("Reliability User");
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Edge AI" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("button", { name: "Senior Engineer" }).click();
  await page.getByRole("button", { name: "Build a startup" }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByPlaceholder(/Edge inference SDK/).fill("Production reliability work");
  await page.getByRole("button", { name: /Launch Terminal/ }).click();

  await expect(page).toHaveURL("/");
  await expect(page.getByText("Daily 3 · 3 · 1")).toBeVisible();

  const signal = page.locator('section[aria-labelledby="daily-signals-title"] button').first();
  const action = page.locator('section[aria-labelledby="daily-actions-title"] button').first();
  await signal.click();
  await action.click();
  await page.locator('section[aria-labelledby="daily-post-title"]')
    .getByRole("button", { name: "Mark posted" })
    .click();
  await expect(page.locator(".daily-command-status strong")).toHaveText("3/7");

  await page.reload();
  await expect(signal).toHaveAttribute("aria-pressed", "true");
  await expect(action).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".daily-command-status strong")).toHaveText("3/7");

  await page.getByRole("button", { name: "Reset today" }).click();
  await expect(page.locator(".daily-command-status strong")).toHaveText("0/7");
  await page.getByRole("button", { name: "Daily Focus", exact: true }).click();
  await expect(page.getByText("Today's Brief", { exact: true })).toBeHidden();
});

test("workbench progress is isolated between two user sessions", async ({ browser, request }) => {
  const alphaContext = await browser.newContext();
  const betaContext = await browser.newContext();
  await provisionIdentity(request, alphaContext, "Alpha");
  await provisionIdentity(request, betaContext, "Beta");

  const alpha = await alphaContext.newPage();
  const beta = await betaContext.newPage();
  await Promise.all([alpha.goto("/"), beta.goto("/")]);

  const alphaSignal = alpha.locator('section[aria-labelledby="daily-signals-title"] button').first();
  const saved = alpha.waitForResponse((response) =>
    response.url() === `${API_URL}/api/workbench` && response.request().method() === "POST"
  );
  await alphaSignal.click();
  await saved;
  await beta.reload();

  await expect(beta.locator('section[aria-labelledby="daily-signals-title"] button').first())
    .toHaveAttribute("aria-pressed", "false");
  await expect(beta.locator(".daily-command-status strong")).toHaveText("0/7");

  await alphaContext.close();
  await betaContext.close();
});

test("mobile dashboard has no horizontal document overflow", async ({ browser, request }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await provisionIdentity(request, context, "Mobile");
  const page = await context.newPage();
  await page.goto("/");

  await expect(page.getByText("Daily 3 · 3 · 1")).toBeVisible();
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  expect(hasOverflow).toBe(false);
  await context.close();
});

test("manual feed refresh rejects anonymous callers", async ({ request }) => {
  const response = await request.post(`${API_URL}/api/feeds/refresh`);
  expect(response.status()).toBe(401);
});
