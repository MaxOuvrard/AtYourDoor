import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('Register then login', async ({ page }) => {
    const unique = Date.now()
    const email = `e2e-${unique}@example.com`
    const password = 'password123'

    // Create the user via the API (more reliable than the UI registration flow)
    const regRes = await page.request.post('/api/login/register', {
      data: { name: `E2E User ${unique}`, email, password, role: 'USER' }
    })
    const regBody = await regRes.json()
    if (regBody && (regBody as any).error) throw new Error('Registration failed: ' + (regBody as any).error)

    // Now navigate to login page and perform UI login
    // Try a direct navigation, with a fallback to visiting the home page and clicking a login link.
    try {
      await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 })
    } catch (e) {
      await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 })
      const loginLink = page.locator('a[href="/login"], a[href="/login/"]')
      if (await loginLink.count() > 0) {
        await loginLink.first().click()
        await page.waitForURL(/\/login/, { timeout: 10000 })
      } else {
        // final attempt
        await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 })
      }
    }

    // Now login with created credentials
    await page.fill('#username', email)
    await page.fill('#password', password)
    await page.click('button[type="submit"]')

    // Expect to be redirected to restaurants
    // Wait for redirect to restaurants (give extra time for redirects)
    await page.waitForURL(/\/restaurants/, { timeout: 15000 })
    await expect(page.locator('h1')).toHaveText(/Restaurants/i)
  })
})
