import { expect, test } from "@playwright/test";
import {
  closeExtension,
  getBrowserFromProject,
  launchExtension,
  openExtensionPage,
  seedSettings,
} from "./helpers/extension-harness";

test("options renders Turkish interface without rewriting owned controls", async ({}, testInfo) => {
  const harness = await launchExtension(getBrowserFromProject(testInfo.project.name));

  try {
    await seedSettings(harness, { uiLocale: "tr" });
    const page = await openExtensionPage(harness, "options.html", "#tabs");

    await expect(page.locator("body")).toHaveAttribute("data-locale-ui");
    await page.click("#tab-ui");
    await expect(page.locator("text=Arayüz dili")).toBeVisible();
    await expect(page.locator("#languagePreset option[value=tr]")).toHaveText("Türkçe");
    await expect(page.locator("#uiLocale")).toHaveValue("tr");
  } finally {
    await closeExtension(harness.context, harness.userDataDir);
  }
});
