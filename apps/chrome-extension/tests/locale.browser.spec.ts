import { expect, test } from "@playwright/test";
import {
  closeExtension,
  getBrowserFromProject,
  launchExtension,
  openExtensionPage,
  seedSettings,
} from "./helpers/extension-harness";

test("options renders Turkish interface without rewriting user skill metadata", async ({}, testInfo) => {
  const harness = await launchExtension(getBrowserFromProject(testInfo.project.name));

  try {
    await seedSettings(harness, { uiLocale: "tr" });
    const page = await openExtensionPage(harness, "options.html", "#tabs");
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          {
            "automation.skillsSeeded": true,
            "automation.skills": {
              Delete: {
                name: "Delete",
                domainPatterns: ["example.com"],
                shortDescription: "Try again",
                description: "User-owned description",
                examples: "",
                library: "",
                createdAt: "2026-01-01T00:00:00.000Z",
                lastUpdated: "2026-01-01T00:00:00.000Z",
              },
            },
          },
          () => resolve(),
        );
      });
    });
    await page.reload();

    await expect(page.locator("body")).toHaveAttribute("data-locale-ui");
    await page.click("#tab-ui");
    await expect(page.locator("text=Arayüz dili")).toBeVisible();
    await expect(page.locator("#languagePreset option[value=tr]")).toHaveText("Türkçe");
    await expect(page.locator("#uiLocale")).toHaveValue("tr");
    await page.click("#tab-skills");
    await expect(page.locator(".skillName").filter({ hasText: "Delete" })).toHaveText("Delete");
    await expect(page.locator(".skillDescription")).toHaveText("Try again");
  } finally {
    await closeExtension(harness.context, harness.userDataDir);
  }
});
