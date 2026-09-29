import { expect, test } from "@playwright/test";
import { SITE_NAME } from "../../src/config/site";

test("home page loads with the site name in the title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(SITE_NAME);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(SITE_NAME);
});
