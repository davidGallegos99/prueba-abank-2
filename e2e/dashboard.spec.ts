import { test, expect } from '@playwright/test';

const assets = Array.from({ length: 12 }, (_, index) => ({
  id: `coin-${index}`,
  name: index === 0 ? 'Bitcoin' : `Coin ${index}`,
  symbol: index === 0 ? 'btc' : `c${index}`,
  image: '/favicon.svg',
  current_price: index + 1,
  price_change_percentage_24h: index - 5,
  market_cap: 1000000,
  market_cap_rank: index + 1,
  total_volume: 10000,
  high_24h: 15,
  low_24h: 1,
  circulating_supply: 1000,
  last_updated: '2026-10-05T00:00:00Z',
}));

test('loading, search, filters, sorting, favorite persistence, modal and automatic updates', async ({
  page,
}) => {
  let calls = 0;
  let fail = false;
  await page.clock.install();
  await page.route('https://api.coingecko.com/**', async (route) => {
    calls++;
    if (calls === 1) await new Promise((resolve) => setTimeout(resolve, 500));
    await route.fulfill({ status: fail ? 429 : 200, json: fail ? {} : assets });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Cargando');
  await expect(page.locator('.asset-row')).toHaveCount(12);
  const search = page.getByRole('searchbox');
  await search.fill('BTC');
  await expect(page.locator('.asset-row')).toHaveCount(1);
  await page.getByRole('button', { name: 'Agregar a favoritos: Bitcoin', exact: true }).click();
  await search.clear();
  await page.getByRole('button', { name: 'Solo favoritos' }).click();
  await expect(page.locator('.asset-row')).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Quitar de favoritos: Bitcoin', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Bitcoin BTC', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Capitalización');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Bitcoin BTC', exact: true })).toBeFocused();
  await page.getByRole('combobox', { name: 'Ordenar activos' }).selectOption('current_price:desc');
  await expect(page.locator('.asset-link').first()).toContainText('Coin 11');
  await page.getByLabel('Variación 24 h', { exact: true }).selectOption('up');
  await expect(page.locator('.asset-row')).toHaveCount(6);
  await page.getByLabel('Precio mín. (USD)').fill('10');
  await page.getByLabel('Precio máx. (USD)').fill('11');
  await expect(page.locator('.asset-row')).toHaveCount(2);
  await page.getByLabel('Precio mín. (USD)').fill('12');
  await expect(page.getByRole('status')).toContainText('supera');
  await expect(page.locator('.asset-row')).toHaveCount(0);
  await page.getByLabel('Precio mín. (USD)').clear();
  await page.getByLabel('Precio máx. (USD)').clear();
  fail = true;
  const before = calls;
  await page.clock.fastForward(60000);
  await expect.poll(() => calls).toBeGreaterThan(before);
  await expect(page.getByRole('alert')).toContainText('límite');
  await expect(page.locator('.asset-row')).toHaveCount(6);
  fail = false;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

for (const width of [375, 768, 1440]) {
  test(`layout and details at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('https://api.coingecko.com/**', (route) => route.fulfill({ json: assets }));
    await page.goto('/');
    await expect(page.locator('.asset-row')).toHaveCount(12);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Bitcoin BTC', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(
      await page
        .getByRole('dialog')
        .evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    await page.getByRole('button', { name: 'Cerrar detalle' }).click();
    await page.screenshot({ path: `test-results/dashboard-${width}.png`, fullPage: true });
  });
}

test('first-load failure can be retried', async ({ page }) => {
  let fail = true;
  await page.route('https://api.coingecko.com/**', (route) =>
    route.fulfill({ status: fail ? 500 : 200, json: fail ? {} : assets }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No pudimos actualizar');
  fail = false;
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.locator('.asset-row')).toHaveCount(12);
  await expect(page.getByRole('alert')).toHaveCount(0);
});
