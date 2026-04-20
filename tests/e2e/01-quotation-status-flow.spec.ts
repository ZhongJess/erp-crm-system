/**
 * Test 1 — 報價單狀態轉換流程 (Status Flow / Stepper)
 *
 * 驗證報價單從「草稿」→「待審核」→「已報價」的業務流程：
 *   特助 送審 → 經理 核准 → 狀態更新至 quoted，並在 Timeline 留下紀錄
 */

import { test, expect } from '@playwright/test'

const QUOTATION_ID = 'QUO-2025-0043' // mock data 中唯一 status === 'draft' 的項目

test.describe('報價單狀態轉換流程', () => {
  test.beforeEach(async ({ page }) => {
    // 直接進入報價單詳情（原型不需登入）
    await page.goto(`/quotations/${QUOTATION_ID}`)
    await page.waitForLoadState('networkidle')
  })

  // ── T1-01：初始狀態為草稿 ──────────────────────────────────────────
  test('T1-01 初始狀態應顯示「草稿」', async ({ page }) => {
    const badge = page.getByTestId('quotation-status-badge')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('草稿')
  })

  // ── T1-02：特助身分 — 送審 → pending_review ──────────────────────
  test('T1-02 特助送審後狀態應變為「待審核」並新增 Timeline 記錄', async ({ page }) => {
    // 確認 role switcher 已是「特助」（原型預設值）
    const roleSelect = page.getByRole('combobox').first()
    await expect(roleSelect).toContainText('特助')

    // 點擊「送審」觸發 AlertDialog
    const btnSubmit = page.getByTestId('btn-submit-review')
    await expect(btnSubmit).toBeVisible()
    await btnSubmit.click()

    // AlertDialog 出現後點確認
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('確認送審？')

    const btnConfirm = page.getByTestId('btn-confirm-submit-review')
    await btnConfirm.click()

    // 狀態 Badge 應更新為「待審核」
    await expect(page.getByTestId('quotation-status-badge')).toHaveText('待審核')

    // Timeline 應新增「送審」記錄
    const timeline = page.getByTestId('approval-timeline')
    await expect(timeline).toBeVisible()
    const entries = timeline.getByTestId('timeline-entry')
    await expect(entries.last()).toContainText('送審')
  })

  // ── T1-03：特助送審後「送審」按鈕應不可用 ────────────────────────
  test('T1-03 待審核狀態下特助應看到「審核中」disabled 按鈕', async ({ page }) => {
    // 用原型 role/status switcher 直接切到 pending_review
    await page.goto(`/quotations/${QUOTATION_ID}`)

    // 切換 status 到 pending_review（第二個 combobox）
    const statusSelect = page.getByRole('combobox').nth(1)
    await statusSelect.click()
    await page.getByRole('option', { name: '待審核' }).click()

    // 「送審」按鈕應消失，取而代之是 disabled 的「審核中」
    await expect(page.getByTestId('btn-submit-review')).not.toBeVisible()
    const disabledBtn = page.getByRole('button', { name: '審核中' })
    await expect(disabledBtn).toBeDisabled()
  })

  // ── T1-04：切換為經理身分後可核准，狀態更新為「已報價」 ───────────
  test('T1-04 經理核准後狀態應變為「已報價」並新增 Timeline 記錄', async ({ page }) => {
    // 切換 role 為「經理」
    const roleSelect = page.getByRole('combobox').first()
    await roleSelect.click()
    await page.getByRole('option', { name: '經理' }).click()

    // 切換 status 到 pending_review
    const statusSelect = page.getByRole('combobox').nth(1)
    await statusSelect.click()
    await page.getByRole('option', { name: '待審核' }).click()

    // 點擊「核准」
    const btnApprove = page.getByTestId('btn-approve')
    await expect(btnApprove).toBeVisible()
    await btnApprove.click()

    // 狀態 Badge 更新為「已報價」
    await expect(page.getByTestId('quotation-status-badge')).toHaveText('已報價')

    // Timeline 最新記錄應包含「核准」
    const entries = page.getByTestId('approval-timeline').getByTestId('timeline-entry')
    await expect(entries.last()).toContainText('核准')
  })

  // ── T1-05：核准頁 Stepper 中當前狀態應高亮 ──────────────────────
  test('T1-05 狀態機圖表中當前節點應有 ring 高亮', async ({ page }) => {
    // 切到 approval tab
    await page.getByRole('tab', { name: '核准記錄' }).click()

    // 「草稿」Badge 應有 ring（當前狀態）
    const draftBadge = page.locator('[class*="ring-2"]').filter({ hasText: '草稿' })
    await expect(draftBadge).toBeVisible()
  })
})
