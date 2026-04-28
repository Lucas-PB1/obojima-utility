import { expect, test } from '@playwright/test';

test('player shell supports core mobile workflows in E2E mode', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Obojima Utilities' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Forragear|Foraging/i })).toBeVisible();

  await page.getByRole('button', { name: /Coleção|Collection/i }).click();
  await expect(page.getByText(/Ingredientes|Ingredients/i).first()).toBeVisible();

  await page.getByRole('button', { name: /Poções|Potions/i }).click();
  await expect(page.getByText(/Ingredientes Disponíveis|Available Ingredients/i)).toBeVisible();

  await page.getByRole('button', { name: /Social/i }).click();
  await expect(page.getByText(/Mesa Teste|Friends|Amigos/i).first()).toBeVisible();
});
