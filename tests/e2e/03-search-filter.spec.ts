/**
 * Test 3 — 複合搜尋與篩選流程 (Filter Bar / Search Bar)
 *
 * 驗證資料連動：關鍵字搜尋 + 狀態 Tab 篩選 + 業務下拉篩選
 * 包含查無資料時的 Empty State，以及結果計數更新。
 */

import { test, expect } from '@playwright/test'

test.describe('搜尋與篩選功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations')
    await page.waitForLoadState('networkidle')
  })

  // ── T3-01：預設應顯示全部資料列 ──────────────────────────────────
  test('T3-01 頁面載入後應顯示全部 6 筆資料', async ({ page }) => {
    await expect(page.getByTestId('quotation-row')).toHaveCount(6)
    await expect(page.getByTestId('result-count')).toContainText('共 6 筆')
  })

  // ── T3-02：關鍵字搜尋 — 報價單號 ────────────────────────────────
  test('T3-02 輸入報價單號 "QUO-2025-0045" 應只顯示 1 筆', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('QUO-2025-0045')

    await expect(page.getByTestId('quotation-row')).toHaveCount(1)
    await expect(page.getByTestId('result-count')).toContainText('共 1 筆')

    // 該列應包含正確的報價單號
    await expect(
      page.getByTestId('quotation-row').first().getByRole('link', { name: 'QUO-2025-0045' })
    ).toBeVisible()
  })

  // ── T3-03：關鍵字搜尋 — 客戶名稱 ────────────────────────────────
  test('T3-03 輸入客戶名稱 "台灣數位" 應過濾相關列', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('台灣數位')

    const rows = page.getByTestId('quotation-row')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // 每一列都應包含「台灣數位科技」
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('台灣數位科技')
    }
  })

  // ── T3-04：查無資料時顯示 Empty State ───────────────────────────
  test('T3-04 搜尋不存在的關鍵字應顯示 Empty State', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('ZZZZNOTEXIST')

    // 無任何資料列
    await expect(page.getByTestId('quotation-row')).toHaveCount(0)

    // 結果計數變為 0
    await expect(page.getByTestId('result-count')).toContainText('共 0 筆')
  })

  // ── T3-05：狀態 Tab — 切換到「草稿」只顯示 draft ──────────────
  test('T3-05 點擊「草稿」Tab 應只顯示草稿狀態資料列', async ({ page }) => {
    await page.getByRole('tab', { name: /草稿/ }).click()

    const rows = page.getByTestId('quotation-row')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // 每一列的狀態 Badge 都應為「草稿」
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByTestId('status-badge')).toHaveText('草稿')
    }

    // 計數與 Tab 上的數字一致
    await expect(page.getByTestId('result-count')).toContainText(`共 ${count} 筆`)
  })

  // ── T3-06：狀態 Tab — 切換到「已成案」 ──────────────────────────
  test('T3-06 點擊「已成案」Tab 應只顯示 won 狀態資料列', async ({ page }) => {
    await page.getByRole('tab', { name: /已成案/ }).click()

    const rows = page.getByTestId('quotation-row')
    const count = await rows.count()

    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByTestId('status-badge')).toHaveText('已成案')
    }
  })

  // ── T3-07：業務下拉篩選 ──────────────────────────────────────────
  test('T3-07 選擇特定業務後只顯示該業務的資料', async ({ page }) => {
    // 點擊業務下拉（SelectTrigger）
    const salesSelect = page.getByRole('combobox', { name: /負責業務|全部業務/ })
      .or(page.locator('[class*="SelectTrigger"]').filter({ hasText: /全部業務|負責業務/ }))
    await salesSelect.first().click()

    // 選取「王小明」
    await page.getByRole('option', { name: '王小明' }).click()

    const rows = page.getByTestId('quotation-row')
    const count = await rows.count()
    expect(count).toBeGreaterThanOrEqual(1)

    // 每列負責業務欄位應含「王小明」
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText('王小明')
    }
  })

  // ── T3-08：複合篩選 — 狀態 Tab + 關鍵字同時作用 ────────────────
  test('T3-08 狀態 Tab 與關鍵字搜尋可同時套用', async ({ page }) => {
    // 先切到「議價中」Tab
    await page.getByRole('tab', { name: /議價中/ }).click()

    // 再輸入關鍵字
    await page.getByTestId('search-input').fill('台灣')

    const rows = page.getByTestId('quotation-row')
    const count = await rows.count()

    // 每列應同時滿足：狀態為「議價中」且含「台灣」
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByTestId('status-badge')).toHaveText('議價中')
      await expect(rows.nth(i)).toContainText('台灣')
    }
  })

  // ── T3-09：清除搜尋後恢復全部資料 ──────────────────────────────
  test('T3-09 清除搜尋輸入後應恢復全部資料', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')

    // 先搜尋
    await searchInput.fill('QUO-2025-0045')
    await expect(page.getByTestId('quotation-row')).toHaveCount(1)

    // 清除
    await searchInput.clear()
    await expect(page.getByTestId('quotation-row')).toHaveCount(6)
  })
})
