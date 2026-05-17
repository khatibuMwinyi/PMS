import { test, expect } from '@playwright/test';

const OWNER_EMAIL = 'juma@hamisi.co.tz';
const OWNER_PASSWORD = 'password';

test.describe('Owner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', OWNER_EMAIL);
    await page.fill('input[name="password"]', OWNER_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/owner/);
  });

  test('renders dashboard page and core sections', async ({ page }) => {
    await page.goto('/owner/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
    await expect(page.getByText('Total Paid to Oweru (YTD)')).toBeVisible();
    await expect(page.getByText('Active Services')).toBeVisible();
    await expect(page.getByText('Completion Rate')).toBeVisible();
    await expect(page.getByText('Active Properties')).toBeVisible();
    await expect(page.getByText('Recent Requests')).toBeVisible();
  });

  test('/owner redirects to /owner/dashboard', async ({ page }) => {
    await page.goto('/owner');
    await expect(page).toHaveURL(/\/owner\/dashboard$/);
  });

  test('sidebar shows new nav structure', async ({ page }) => {
    await page.goto('/owner/dashboard');
    const sidebar = page.locator('aside').first();
    await expect(sidebar.getByText('Dashboard')).toBeVisible();
    await expect(sidebar.getByText('Properties')).toBeVisible();
    await expect(sidebar.getByText('Services')).toBeVisible();
    await expect(sidebar.getByText('Financials')).toBeVisible();
    await expect(sidebar.getByText('Service Catalog')).toBeVisible();
    await expect(sidebar.getByText('Reports')).toBeVisible();
    await expect(sidebar.getByText('Work Orders')).toHaveCount(0);
    await expect(sidebar.getByText('Service Network')).toHaveCount(0);
    await expect(sidebar.getByText('Leases')).toHaveCount(0);
    await expect(sidebar.getByText('Analytics')).toHaveCount(0);
  });

  test('no provider businessName in DOM', async ({ page }) => {
    await page.goto('/owner/dashboard');
    const body = await page.locator('body').innerText();
    expect(body).not.toMatch(/provider:.+/i);
    expect(body).not.toMatch(/business name/i);
  });

  test('stub pages load without 404', async ({ page }) => {
    for (const path of ['/owner/work-orders', '/owner/financials', '/owner/service-network', '/owner/reports']) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByText('Coming soon')).toBeVisible();
    }
  });
});
