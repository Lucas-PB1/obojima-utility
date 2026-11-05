import { expect, test } from '@playwright/test';

test('player shell supports core mobile workflows in E2E mode', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Obojima Utilities' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^\d+ gold$/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Forragear|Foraging/i })).toBeVisible();

  await page.getByRole('button', { name: /Coleção|Collection/i }).click();
  await expect(page.getByText(/Ingredientes|Ingredients/i).first()).toBeVisible();

  await page.getByRole('button', { name: /Poções|Potions/i }).click();
  await expect(page.getByText(/Ingredientes Disponíveis|Available Ingredients/i)).toBeVisible();

  await page.getByRole('button', { name: /Social/i }).click();
  await expect(page.getByText(/Mesa Teste|Friends|Amigos/i).first()).toBeVisible();
  await expect(page.getByText('friend@example.com')).toHaveCount(0);

  await page.getByRole('tab', { name: /Conversas|Chats/i }).click();
  await expect(page.getByText(/Mensagem dev|Dev message/i).first()).toBeVisible();

  await page.getByRole('tab', { name: /Amigos|Friends/i }).click();
  await page.getByRole('button', { name: /Abrir chat|Open chat/i }).click();
  await expect(page.getByPlaceholder(/Digite uma mensagem|Type a message/i)).toBeVisible();
  await page.getByRole('button', { name: /Voltar|Back/i }).click();
  await expect(page.getByRole('tab', { name: /Amigos|Friends/i })).toHaveAttribute(
    'aria-selected',
    'true'
  );
});

test('player can open the progression panel', async ({ page }) => {
  await page.goto('/');

  await page
    .getByRole('button', { name: /Nível|Level/i })
    .first()
    .click();
  await expect(page.getByText(/Sua jornada|Your journey/i)).toBeVisible();
  await expect(page.getByText(/Missões de hoje|Today's quests/i)).toBeVisible();
  await expect(page.getByText(/Conquistas|Achievements/i).first()).toBeVisible();
});

test('admin demo renders on desktop and mobile', async ({ page }) => {
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Operação de clientes' })).toBeVisible();
  await expect(page.getByText('Demo local')).toBeVisible();

  await page
    .getByRole('button', { name: /Dev Player|Dev Admin/i })
    .first()
    .click();
  await expect(page.getByRole('button', { name: /Inventário/i })).toBeVisible();
  await page.getByRole('button', { name: /Social/i }).click();
  await expect(page.getByText('Denúncias').first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Operação de clientes' })).toBeVisible();
});
