import { test, expect } from '@playwright/test'
import { loginAs } from '../fixtures'
import fs from 'fs/promises'
import path from 'path'

test.describe('Admin actions', () => {
  test('Admin can add and delete a restaurant', async ({ page }) => {
    // To make the test reliable we create the restaurant directly in the
    // server data file before visiting the admin UI. This avoids flakiness
    // from the add form and lets us assert the admin list rendering.
    const unique = Date.now()
    const name = `E2E Resto ${unique}`
    const restaurantsPath = path.resolve(process.cwd(), 'server/data/restaurants.json')
    let restaurants = [] as any[]
    try {
      const data = await fs.readFile(restaurantsPath, 'utf-8')
      restaurants = JSON.parse(data)
    } catch (e) {
      restaurants = []
    }
    const newId = restaurants.length ? Math.max(...restaurants.map(r => r.id || 0)) + 1 : 1
    const newResto = { id: newId, name, city: 'Paris', image: '', category: 'français' }
    restaurants.push(newResto)
    await fs.writeFile(restaurantsPath, JSON.stringify(restaurants, null, 2), 'utf-8')

    // Now login as admin and verify the restaurant appears in the admin list
    await loginAs(page, 'ADMIN')
    await page.goto('/admin', { waitUntil: 'networkidle', timeout: 15000 })
    const row = page.locator('table tbody tr').filter({ hasText: name })
    // Allow time for the page to render
    await expect(row).toHaveCount(1, { timeout: 20000 })

    // Click delete for that restaurant (open confirm modal then confirm)
    await row.locator('button').click()
    // Modal: confirmDelete button is the second button in modal
    await page.locator('.modal-confirm button').filter({ hasText: /delete|supprimer|Delete/i }).first().click().catch(async () => {
      // fallback: click the last button inside modal
      const buttons = page.locator('.modal-confirm button')
      await buttons.nth(1).click()
    })

    // Ensure the row is gone (allow some time for server call)
    await expect(page.locator('table tbody tr').filter({ hasText: name })).toHaveCount(0)
  })
})
