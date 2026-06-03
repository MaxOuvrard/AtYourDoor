import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures'

test.describe('Roles access', () => {
  test('USER can view restaurants list', async ({ page }) => {
    await loginAs(page, 'USER')
    await page.goto('/restaurants')
    await expect(page.locator('h1')).toHaveText(/Restaurants/i)
  })

  test('ADMIN can access admin page', async ({ page }) => {
    await loginAs(page, 'ADMIN')
    await page.goto('/admin')
    // admin page exposes a link to add restaurant
    await expect(page.locator('a[href="/admin/ajouter"]')).toBeVisible()
  })

  test('OWNER can access owner page and see form', async ({ page }) => {
    await loginAs(page, 'OWNER')
    await page.goto('/owner')
    // owner page contains a name input and update button
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('button.owner-btn')).toBeVisible()
  })
})
