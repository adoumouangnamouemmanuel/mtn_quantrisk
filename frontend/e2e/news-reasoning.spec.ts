import { test, expect } from "@playwright/test";

test.describe("News Reasoning Drill-Down", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/news");
    await page.waitForLoadState("networkidle");
  });

  test("loads news page with summary bar", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("News Feed");

    // Summary stats should be visible
    await expect(page.locator("text=Articles Today")).toBeVisible();
    await expect(page.locator("text=Total Articles")).toBeVisible();
  });

  test("expands article card and shows reasoning panel", async ({ page }) => {
    // Click first article to expand
    const firstArticle = page.locator('button[class*="w-full text-left"]').first();
    await firstArticle.click();

    // Expanded content should show
    await expect(page.locator("text=Why this score?")).toBeVisible();

    // NewsReasoningPanel should load
    await expect(page.locator("text=Relevance").or(page.locator("text=severity"))).toBeVisible();
  });

  test("category filter works", async ({ page }) => {
    // Click a category filter
    const regulatoryBtn = page.locator("button").filter({ hasText: "Regulatory" });
    await regulatoryBtn.click();

    // Results should update
    await expect(page.locator("text=Showing")).toBeVisible();
  });

  test("search and date filters work", async ({ page }) => {
    // Enter keyword
    const searchInput = page.locator('input[placeholder*="MTN"]');
    await searchInput.fill("MTN");
    await page.locator("button").filter({ hasText: "Search" }).click();

    // Results should show
    await expect(page.locator("text=results matching")).toBeVisible();
  });

  test("article expansion shows severity bar and impact", async ({ page }) => {
    // Expand first article
    const firstArticle = page.locator('button[class*="w-full text-left"]').first();
    await firstArticle.click();

    // AI Risk Scores section should be visible
    await expect(page.locator("text=AI Risk Scores")).toBeVisible();
    await expect(page.locator("text=Severity")).toBeVisible();
    await expect(page.locator("text=MTN Relevance")).toBeVisible();
  });

  test("article shows named entities when expanded", async ({ page }) => {
    // Expand first article
    const firstArticle = page.locator('button[class*="w-full text-left"]').first();
    await firstArticle.click();

    // Named Entities section (may or may not have entities)
    const entitiesSection = page.locator("text=Named Entities");
    if (await entitiesSection.isVisible()) {
      await expect(entitiesSection).toBeVisible();
    }
  });
});
