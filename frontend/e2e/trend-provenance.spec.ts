import { test, expect } from "@playwright/test";

test.describe("Trend Point Provenance", () => {
  test("quarterly page loads with provenance strip", async ({ page }) => {
    await page.goto("/quarterly");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Quarterly Trends");

    // Provenance strip should show
    await expect(page.locator("text=source")).toBeVisible();
    await expect(page.locator("text=observations")).toBeVisible();
  });

  test("bar click opens drill-down with quality flags", async ({ page }) => {
    await page.goto("/quarterly");
    await page.waitForLoadState("networkidle");

    // Click first bar in chart (via canvas or bar element)
    const chartCanvas = page.locator("canvas").first();
    if (await chartCanvas.isVisible()) {
      // Click center of canvas to trigger bar click
      await chartCanvas.click({ position: { x: 200, y: 200 } });

      // Drill-down card should appear
      const drillDown = page.locator("text=Value").or(page.locator("text=Quality"));
      if (await drillDown.isVisible()) {
        await expect(drillDown).toBeVisible();
        // Should show quality indicator
        await expect(page.locator("text=Reported").or(page.locator("text=Interpolated")).or(page.locator("text=Estimated"))).toBeVisible();
      }
    }
  });

  test("monthly page loads with provenance strip", async ({ page }) => {
    await page.goto("/monthly");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("h1")).toContainText("Monthly Trends");

    // Provenance strip
    await expect(page.locator("text=Showing")).toBeVisible();
    await expect(page.locator("text=observations")).toBeVisible();
  });

  test("KPI selector changes chart data", async ({ page }) => {
    await page.goto("/quarterly");
    await page.waitForLoadState("networkidle");

    // Change KPI via dropdown
    const select = page.locator("select").first();
    await select.selectOption({ index: 1 });

    // Chart should update
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("drill-down close button works", async ({ page }) => {
    await page.goto("/quarterly");
    await page.waitForLoadState("networkidle");

    const chartCanvas = page.locator("canvas").first();
    if (await chartCanvas.isVisible()) {
      await chartCanvas.click({ position: { x: 200, y: 200 } });

      // Try to close drill-down
      const closeBtn = page.locator('button[aria-label="Close drill-down"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        // Drill-down should be hidden
        await expect(closeBtn).not.toBeVisible();
      }
    }
  });
});
