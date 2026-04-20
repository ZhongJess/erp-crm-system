/**
 * Test 4 — 檔案上傳與異常處理 (File Upload / Feedback)
 *
 * 測試邊緣情況與系統回饋：
 *   - 超過 10MB 的檔案應被攔截並顯示 Alert
 *   - 格式不符的檔案應被拒絕
 *   - 合法檔案應顯示 Progress Bar，完成後出現在 Attachments 列表
 */

import { test, expect } from '@playwright/test'

const QUOTATION_ID = 'QUO-2025-0043'

test.describe('檔案上傳功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/quotations/${QUOTATION_ID}`)
    await page.waitForLoadState('networkidle')
    // 切換到附件 Tab
    await page.getByRole('tab', { name: /附件/ }).click()
  })

  // ── T4-01：上傳區域應可見且有拖放提示文字 ────────────────────────
  test('T4-01 上傳區域應顯示拖放提示文字', async ({ page }) => {
    const dropZone = page.getByTestId('file-drop-zone')
    await expect(dropZone).toBeVisible()
    await expect(dropZone).toContainText(/拖放/)
    await expect(dropZone).toContainText(/10 MB/)
  })

  // ── T4-02：已存在的附件應在列表顯示 ─────────────────────────────
  test('T4-02 初始應顯示預設附件', async ({ page }) => {
    const items = page.getByTestId('attachment-item')
    await expect(items).toHaveCount(1)
    await expect(items.first()).toContainText('合約草稿_v1.pdf')
  })

  // ── T4-03：超過 10MB 的檔案應顯示「檔案過大」錯誤 ───────────────
  test('T4-03 上傳超過 10MB 的 PDF 應顯示檔案過大錯誤', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    await fileInput.setInputFiles({
      name: 'large-file.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(11 * 1024 * 1024, 'A'), // 11 MB
    })

    const errorAlert = page.getByTestId('upload-error-alert')
    await expect(errorAlert).toBeVisible({ timeout: 2000 })
    await expect(errorAlert).toContainText(/檔案過大/)

    // 進度條不應出現
    await expect(page.getByTestId('upload-progress')).not.toBeVisible()
  })

  // ── T4-04：格式不符的檔案應顯示「不支援的格式」錯誤 ─────────────
  test('T4-04 上傳 .exe 格式應顯示不支援格式錯誤', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('fake binary'),
    })

    const errorAlert = page.getByTestId('upload-error-alert')
    await expect(errorAlert).toBeVisible({ timeout: 2000 })
    await expect(errorAlert).toContainText(/不支援/)
  })

  // ── T4-05：合法 PDF 應顯示進度條 ────────────────────────────────
  test('T4-05 上傳合法 PDF 應顯示進度條', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    await fileInput.setInputFiles({
      name: 'contract.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(1 * 1024 * 1024, 'A'), // 1 MB
    })

    const progressBar = page.getByTestId('upload-progress')
    await expect(progressBar).toBeVisible({ timeout: 2000 })

    // 錯誤 Alert 不應出現
    await expect(page.getByTestId('upload-error-alert')).not.toBeVisible()
  })

  // ── T4-06：上傳完成後檔名應出現在附件列表 ────────────────────────
  test('T4-06 上傳完成後檔名應出現在附件列表', async ({ page }) => {
    const filename = 'contract-2025.pdf'
    const fileInput = page.getByTestId('file-input')

    await fileInput.setInputFiles({
      name: filename,
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(512 * 1024, 'A'), // 0.5 MB
    })

    // 等進度條消失（上傳完成）
    await expect(page.getByTestId('upload-progress')).not.toBeVisible({ timeout: 10_000 })

    // 附件列表應包含新檔案
    await expect(
      page.getByTestId('attachment-item').filter({ hasText: filename })
    ).toBeVisible()

    // sonner toast 出現
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 3000 })
  })

  // ── T4-07：刪除附件後從列表移除 ────────────────────────────────
  test('T4-07 點擊刪除按鈕後附件應從列表移除', async ({ page }) => {
    const countBefore = await page.getByTestId('attachment-item').count()

    // 點擊第一個附件的刪除按鈕（Trash2 icon button）
    await page.getByTestId('attachment-item').first()
      .getByRole('button').last().click()

    await expect(page.getByTestId('attachment-item')).toHaveCount(countBefore - 1)
  })

  // ── T4-08：上傳錯誤後再上傳合法檔案，錯誤應消失 ─────────────────
  test('T4-08 上傳合法檔案後先前的錯誤 Alert 應消失', async ({ page }) => {
    const fileInput = page.getByTestId('file-input')

    // 先上傳過大檔案製造錯誤
    await fileInput.setInputFiles({
      name: 'too-big.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(11 * 1024 * 1024, 'A'),
    })
    await expect(page.getByTestId('upload-error-alert')).toBeVisible()

    // 再上傳合法檔案
    await fileInput.setInputFiles({
      name: 'valid.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.alloc(100 * 1024, 'A'),
    })

    // 錯誤應消失，進度條出現
    await expect(page.getByTestId('upload-error-alert')).not.toBeVisible()
    await expect(page.getByTestId('upload-progress')).toBeVisible({ timeout: 2000 })
  })
})
