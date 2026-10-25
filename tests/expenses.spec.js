import { test, expect } from "@playwright/test";
async function add(page, name, amount, category, date) {
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Description").fill(name);
  await dialog.getByLabel("Amount (£)").fill(amount);
  await dialog.getByLabel("Category", { exact: true }).selectOption(category);
  await dialog.getByLabel("Date", { exact: true }).fill(date);
  await dialog
    .getByRole("button", { name: "Add expense", exact: true })
    .click();
  await expect(dialog).toBeHidden();
}
test("expense lifecycle, category/date filters, totals, and reload persistence", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("A fresh start for your finances")).toBeVisible();
  const date = await page.evaluate(() =>
    new Date().toLocaleDateString("en-CA"),
  );
  await add(page, "Sunday coffee", "4.50", "Food", date);
  await add(page, "Train ticket", "12.80", "Transport", "2024-01-12");
  await expect(page.getByTestId("monthly-total")).toHaveText("£4.50");
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Sunday coffee", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Train ticket", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Sunday coffee", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByLabel("Description")
    .fill("Lunch with Alex");
  await page.getByRole("dialog").getByLabel("Amount (£)").fill("18.25");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByTestId("monthly-total")).toHaveText("£18.25");
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Lunch with Alex", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Sunday coffee", { exact: true })).toHaveCount(0);
  await page.getByLabel("Filter by category").selectOption("Transport");
  await expect(
    page.getByRole("cell", { name: "Train ticket", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Lunch with Alex", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("From date").fill(date);
  await page.getByLabel("To date").fill(date);
  await expect(
    page.getByRole("cell", { name: "Lunch with Alex", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "Train ticket", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByLabel("Search transactions").fill("alex");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete Lunch with Alex", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Lunch with Alex", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Delete Lunch with Alex", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete expense", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("cell", { name: "Lunch with Alex", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByTestId("monthly-total")).toHaveText("£0.00");
  await expect(
    page.getByRole("cell", { name: "Train ticket", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("spendwise.expenses.v1")).length,
    ),
  ).toBe(1);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/spendwise-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("empty filtering and invalid storage recover gracefully", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("spendwise.expenses.v1", "broken json"),
  );
  await page.goto("/");
  await expect(page.getByTestId("monthly-total")).toHaveText("£0.00");
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Description").fill("Invalid amount");
  await dialog.getByLabel("Amount (£)").fill("0");
  await dialog
    .getByRole("button", { name: "Add expense", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});
