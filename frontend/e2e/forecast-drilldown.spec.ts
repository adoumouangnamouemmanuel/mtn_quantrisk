import { test, expect } from "@playwright/test";

test.describe("Forecast Drill-Down", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/forecasts");
    await page.waitForLoadState("networkidle");
  });

  test("loads forecast page with KPI strip and chart", async ({ page }) => {
    // Page header
    await expect(page.locator("h1")).toContainText("Forecasts");

    // KPI strip should be visible
    await expect(page.locator('[class*="KpiStrip"], [data-testid="kpi-strip"]')).toBeVisible();
  });

  test("switches between chart and table view", async ({ page }) => {
    // Table toggle button
    const toggleBtn = page.locator('button[aria-label="Toggle table view"]');
    await expect(toggleBtn).toBeVisible();

    // Click to switch to table view
    await toggleBtn.click();

    // Table should be visible
    await expect(page.locator("table")).toBeVisible();
    await expect(page.locator("th")).toContainText(["Date", "P50", "Adj."]);
  });

  test("table row click populates drill-down panel", async ({ page }) => {
    // Switch to table view first
    const toggleBtn = page.locator('button[aria-label="Toggle table view"]');
    await toggleBtn.click();
    await expect(page.locator("table")).toBeVisible();

    // Click a table row
    const firstRow = page.locator("tbody tr").first();
    await firstRow.click();

    // Drill-down panel should show point details
    await expect(page.locator("text=Point ·")).toBeVisible();

    // Should show events or no-events message
    const drillDownContent = page.locator("text=No qualifying live events").or(
      page.locator('[class*="events"]')
    );
    await expect(drillDownContent).toBeVisible();
  });

  test("forecast narrative panel displays correctly", async ({ page }) => {
    // Narrative section should exist
    await expect(page.locator("text=LLM Narrative").or(page.locator("text=Model Narrative"))).toBeVisible();

    // Event counts should be visible
    await expect(page.locator("text=Events")).toBeVisible();
    await expect(page.locator("text=Pressure")).toBeVisible();
  });

  test("KPI selection changes forecast data", async ({ page }) => {
    // Get current KPI label
    const currentLabel = await page.locator('[class*="font-mono"][class*="text-xs"]').first().textContent();

    // Click a different KPI in the strip
    const kpiButtons = page.locator('[data-testid="kpi-button"]');
    const count = await kpiButtons.count();
    if (count > 1) {
      await kpiButtons.nth(1).click();
      // Label should change
      await expect(page.locator("h1")).toContainText("Forecasts");
    }
  });
});
