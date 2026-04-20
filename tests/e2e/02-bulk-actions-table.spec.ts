/**
 * Test 2 — 批量操作與選擇邏輯 (Bulk Actions / Table)
 *
 * 測試表格 Header Checkbox 全選、Bulk Action Bar、
 * Modal 確認取消／確認刪除 + Toast 回饋。
 */

import { test, expect } from '@playwright/test'

test.describe('表格基本互動', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations')
    await page.waitForLoadState('networkidle')
  })

  // ── T2-01：表格應渲染預設資料列 ──────────────────────────────────
  test('T2-01 報價單列表應顯示 6 筆資料', async ({ page }) => {
    await expect(page.getByTestId('quotation-row')).toHaveCount(6)
  })

  // ── T2-02：操作下拉菜單應顯示「查看詳情」與「作廢」 ──────────────
  test('T2-02 操作下拉菜單應包含「查看詳情」與「作廢」', async ({ page }) => {
    const firstRowMenu = page.getByTestId('quotation-row').first().getByRole('button')
    await firstRowMenu.click()

    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: /查看詳情/ })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: /作廢/ })).toBeVisible()
  })

  // ── T2-03：點擊作廢後 ESC 關閉，資料保持不變 ────────────────────
  test('T2-03 點擊「作廢」後按 ESC 資料應保持不變', async ({ page }) => {
    const rowsBefore = await page.getByTestId('quotation-row').count()

    const firstRowMenu = page.getByTestId('quotation-row').first().getByRole('button')
    await firstRowMenu.click()
    await page.getByRole('menuitem', { name: /作廢/ }).click()
    await page.keyboard.press('Escape')

    await expect(page.getByTestId('quotation-row')).toHaveCount(rowsBefore)
  })
})

test.describe('批量操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quotations')
    await page.waitForLoadState('networkidle')
  })

  // ── T2-04：Header Checkbox 全選 ───────────────────────────────────
  test('T2-04 點擊 Header Checkbox 應全選所有列', async ({ page }) => {
    const selectAll = page.getByTestId('select-all-checkbox')
    await selectAll.click()

    const rowCheckboxes = page.getByTestId('row-checkbox')
    const count = await rowCheckboxes.count()
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked()
    }
  })

  // ── T2-05：選取後顯示 Bulk Action Bar ──────────────────────────
  test('T2-05 勾選任一列後應出現 Bulk Action Bar，顯示已選取數量', async ({ page }) => {
    await page.getByTestId('row-checkbox').first().click()

    const bulkBar = page.getByTestId('bulk-action-bar')
    await expect(bulkBar).toBeVisible()
    await expect(bulkBar).toContainText('已選取 1 項')
  })

  // ── T2-06：批量刪除 — 取消 → 資料保持不變 ──────────────────────
  test('T2-06 批量刪除取消後資料應保持不變', async ({ page }) => {
    await page.getByTestId('select-all-checkbox').click()
    const countBefore = await page.getByTestId('quotation-row').count()

    await page.getByTestId('btn-bulk-delete').click()

    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('確認刪除')

    await dialog.getByRole('button', { name: '取消' }).click()
    await expect(dialog).not.toBeVisible()

    await expect(page.getByTestId('quotation-row')).toHaveCount(countBefore)
  })

  // ── T2-07：批量刪除 — 確認 → 顯示 Toast 並移除列 ───────────────
  test('T2-07 確認批量刪除後應顯示 Toast 並移除該列', async ({ page }) => {
    await page.getByTestId('row-checkbox').first().click()
    await page.getByTestId('btn-bulk-delete').click()

    const dialog = page.getByRole('alertdialog')
    await dialog.getByRole('button', { name: '確認刪除' }).click()

    // sonner toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 })

    // 6 筆 → 5 筆
    await expect(page.getByTestId('quotation-row')).toHaveCount(5)
  })

  // ── T2-08：取消全選 ────────────────────────────────────────────
  test('T2-08 再次點擊 Header Checkbox 應取消全選', async ({ page }) => {
    // 全選
    await page.getByTestId('select-all-checkbox').click()
    await expect(page.getByTestId('bulk-action-bar')).toBeVisible()

    // 取消全選
    await page.getByTestId('select-all-checkbox').click()
    await expect(page.getByTestId('bulk-action-bar')).not.toBeVisible()
  })
})
