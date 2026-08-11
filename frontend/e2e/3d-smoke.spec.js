import { test, expect } from '@playwright/test'

test('real TAYU 3D world starts, creates WebGL, and never falls back to 2D', async ({ page }) => {
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await page.goto('http://127.0.0.1:4173/3d-smoke.html', { waitUntil: 'networkidle' })
  await expect(page.locator('canvas')).toBeVisible({ timeout: 15000 })
  await expect.poll(async () => page.locator('html').getAttribute('data-tayu3d-ready'), { timeout: 15000 }).toBe('true')
  await page.waitForTimeout(2500)

  await expect(page.getByText('Oops! Something got tangled.')).toHaveCount(0)
  await expect(page.getByText(/Accessible 2D/i)).toHaveCount(0)
  const smokeError = await page.locator('html').getAttribute('data-three-smoke-error')
  expect(smokeError).toBeNull()
  expect(pageErrors).toEqual([])
})
