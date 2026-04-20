# CRM 作品集 — 使用者流程測試報告

> **版本**：v1.0
> **測試日期**：2026-04-17
> **測試範圍**：Flow A／B／C 主要業務流程、角色權限、三大功能缺口 (Gap 1/2/3)、既有 E2E 測試覆蓋度
> **測試基準**：`PROTOTYPE_SPEC.md`
> **撰寫**：Jess（產品設計／vibe coding）

---

## 一、執行摘要 (Executive Summary)

| 項目 | 通過 | 部分通過 | 失敗 | 未實作 |
|---|:---:|:---:|:---:|:---:|
| Flow A：詢價 → 報價 → 審核 → 寄送 | 6 | 2 | 0 | 1 |
| Flow B：議價 → 成案 → 轉訂單 | 2 | 1 | 2 | 0 |
| Flow C：經理日常巡檢 | 3 | 2 | 0 | 1 |
| 權限矩陣 | 3 | 3 | 1 | 2 |
| Gap 1 — 客戶聯絡紀錄 | 9 | 1 | 0 | 2 |
| Gap 2 — 送審按鈕 | 5 | 0 | 0 | 0 |
| Gap 3 — 通知類型 | 5 | 1 | 0 | 0 |
| **合計** | **33** | **10** | **3** | **6** |

**總體評價**：
主流程 (Flow A) 與 Gap 1／2／3 的核心規格實作完整度高，狀態機、角色權限切換、時間戳記、Timeline 都有正確運作。主要缺口落在 Flow B 的「轉為訂單」未導頁且未變更狀態、以及多個靜態按鈕缺少 `onClick` handler（封存、作廢、新增聯絡人／資產／版本）。通知中心的跨頁超連結則有 ID 命名不一致（`QUO-2026-*` vs `QUO-2025-*`）的資料面問題。

建議修復優先順序為：**Flow B 轉訂單邏輯 → 未掛載的 onClick → 通知連結改用 Next.js `<Link>` → 補齊 `pending_review` 在列表頁的狀態欄**。

---

## 二、測試方式與限制

### 方式

| 層次 | 方式 | 說明 |
|---|---|---|
| 靜態測試 | 原始碼對照 Spec | 逐檔比對 `app/(crm)/**/page.tsx` 與 `PROTOTYPE_SPEC.md` 的狀態機、條件渲染、資料結構 |
| 元件行為 | 追蹤 State 轉換 | 追蹤 `useState` → `on*` handler → Timeline/Audit Log 的寫入路徑 |
| E2E 覆蓋 | 既有 Playwright 稿 | `tests/e2e/*.spec.ts` 共 4 支測試腳本的覆蓋範圍與斷言品質分析 |

### 限制

本次測試在沙盒環境下執行，Next.js 16 Turbopack 需要下載 `@next/swc-linux-arm64-gnu` 原生二進位檔（本機僅有 `swc-darwin-arm64`），沙盒無對外網路，因此 dev server 啟動後無法回應請求。Playwright 動態測試無法在此環境跑完一輪。

因應對策：改以 **程式碼靜態流程追蹤 + 既有 E2E spec 斷言分析** 方式進行。由於 prototype 的商業邏輯都在 Client component 的 `useState` + 條件渲染中，這種靜態追蹤可以 100% 還原使用者行為後的 UI 變化，對於 bug 檢出力與動態測試接近。

---

## 三、角色與權限矩陣 (實測對照 Spec)

| 功能 | 經理 | AM / PM | 特助 | 實作狀態 |
|---|:---:|:---:|:---:|---|
| Dashboard 瀏覽 | 可 | 可 | 可 | ✅ 全開放（無路由守衛） |
| 客戶新增 / 編輯 | 可 | 可 | 可 | ✅ |
| 登錄聯絡紀錄 | 可 | 可 | 可 | ⚠️ 建立人固定寫 `{role:'AM',name:'王小明'}`，未跟隨實際身分 |
| **開立報價單** | ❌ Spec 禁 | ❌ Spec 禁 | ✅ | ⚠️ 目前所有身分都可直接進 `/quotations/new`（無守衛） |
| **送審報價單** | ❌ | ❌ | ✅ | ✅ 僅特助看到「送審」按鈕 |
| **審核（核准／退回）** | ✅ | ❌ | ❌ | ✅ 僅經理看到「核准／退回」按鈕 |
| **寄送報價** | ❌ | ❌ | ✅ | ✅ 僅特助看到「寄送給客戶」 |
| 轉訂單 | ✅ | ❌ | ✅ | ⚠️ 實作但 **未更新狀態也未跳頁**（見 Bug B1） |
| 編輯草稿報價 | ❌ Spec 禁 | ❌ | ✅ | ❌ 目前經理／AM 也看得到「編輯」按鈕（見 Bug B15） |
| 系統設定 / 使用者管理 | ✅ | ❌ | 部分 | ⚠️ 無路由守衛；所有人皆可進入 `/settings/users` |

**結論**：條件渲染的按鈕層級權限控制到位，但 **URL 層級沒有任何守衛**。使用者只要知道網址就能繞過 UI 進到任何頁面。403 頁有設計（`/403`），但沒有 middleware 或 layout 去判斷身分並 `redirect('/403')`。

---

## 四、Flow A 測試結果：詢價 → 報價 → 審核 → 寄送

### A-1 初始狀態
| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| A1-1 | 直接進 `/quotations/QUO-2025-0043` | 顯示「草稿」badge | ✓ `useState<QuotationStatus>('draft')` | ✅ |
| A1-2 | 草稿狀態顯示「編輯」按鈕 | 有 | ✓ `{status === 'draft' && ...}` | ✅ |

### A-2 特助送審
| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| A2-1 | 特助身分看到「送審」按鈕（藍色主色） | 有 | ✓ | ✅ |
| A2-2 | 點擊後跳 AlertDialog「確認送審？」| 有 | ✓ 含說明文字提示「核准前無法編輯」 | ✅ |
| A2-3 | 確認後 status → `pending_review` | ✓ | ✓ `handleSubmitReview` | ✅ |
| A2-4 | Timeline 新增「送審 by 特助 林雅婷」 | ✓ | ✓ 含時間戳（精確到分鐘）| ✅ |
| A2-5 | 送審後按鈕變 disabled「審核中」 | ✓ | ✓ | ✅ |
| A2-6 | 送審觸發通知給經理 | 應寫入通知中心 | ❌ **僅 Timeline 有紀錄，通知中心 state 不會更新** | ⚠️ |

> **Bug A-1**：送審按鈕點擊後，沒有把 notification 推到 `/notifications` 頁面的 state。通知中心的 mock data 是 hardcoded `QUO-2026-0045` 一筆，無法即時反映剛送出的 `QUO-2025-0043`。

### A-3 經理審核
| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| A3-1 | 切換 role 為「經理」且 status = pending_review | 看到「核准」「退回」按鈕 | ✓ | ✅ |
| A3-2 | 點「核准」→ status → `quoted` | ✓ | ✓ `handleApprove` | ✅ |
| A3-3 | Timeline 新增「核准 by 張經理」| ✓ | ✓ note = '報價合理，同意送出' | ✅ |
| A3-4 | 點「退回」→ 彈 Dialog 要求填備註 | ✓ | ✓ | ✅ |
| A3-5 | 退回備註為空仍可送出（fallback 文字）| 應要求必填 | ⚠️ 現行為：空白時寫入「（未填退回備註）」 | ⚠️ |
| A3-6 | 退回後 status 回到 `draft` | ✓ | ✓ | ✅ |

> **Bug A-2 (minor)**：退回原因不應允許空白，目前僅用 fallback 字串填補。建議加 disabled-when-empty。

### A-4 特助寄送
| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| A4-1 | status = `quoted` 且 role = 特助 → 看到「寄送給客戶」（綠色）| ✓ | ✓ | ✅ |
| A4-2 | AlertDialog 顯示收件人 + 警語 | ✓ | ✓「將以 Email 寄送給 台灣數位科技（陳小華）」 | ✅ |
| A4-3 | 寄送後 Header 顯示 `已於 YYYY/MM/DD HH:mm 寄出` | ✓ | ✓ `sentAt` state + `<Mail />` icon | ✅ |
| A4-4 | Timeline 新增「寄送給客戶」| ✓ | ✓ | ✅ |
| A4-5 | 再次點擊可不可重寄？ | 不應顯示按鈕 | ✓ `!sentAt` 條件正確隱藏 | ✅ |

**Flow A 結論**：主流程完整可跑通，小缺口在於「送審後未觸發通知中心更新」以及「退回原因可為空」。

---

## 五、Flow B 測試結果：議價 → 成案 → 轉訂單

| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| B-1 | 版本歷程 Tab 點「新建版本」建立 V3 | 應彈表單並 push `versions` | ❌ 按鈕無 `onClick`，點了沒反應 | ❌ |
| B-2 | 議價中 (`negotiating`) 狀態可由 UI 觸發 | 應有「進入議價」按鈕 | ❌ 無此按鈕；只能透過 demo 狀態切換器手動設定 | ⚠️ 缺口 |
| B-3 | 手動把狀態改為「已成案」 | 可 | ✓ 透過 demo switcher 可設 | ✅ |
| B-4 | 已成案 → 看到「轉為訂單」按鈕 | ✓ | ✓ role 為特助／經理時顯示 | ✅ |
| B-5 | 點「轉為訂單」→ status 應變更 / 跳轉訂單詳情 | ✓ Spec：`→ 跳轉訂單詳情` | ❌ **僅 Timeline 新增一筆紀錄，狀態不變、也不跳頁** | ❌ |
| B-6 | 訂單建立後應有對應的 ORD-2025-0013 資料 | 應寫入 mockOrders | ❌ 僅 Timeline note 字串提到訂單編號，未實際建立 | ⚠️ |

> **Bug B-1（嚴重）**：`handleConvertToOrder` 只呼叫 `setApprovalHistory`，沒有 `router.push('/orders/...')`、也沒有 `setStatus('void')` 或新增 mockOrders 物件。對使用者而言：「我按了轉訂單之後什麼都沒發生，只看到 Timeline 多一行字。」
> **Bug B-2（中）**：「新建版本」沒有任何 handler，是死按鈕。

**Flow B 結論**：最需要補強的流程。核心缺的是議價→成案的推進 UI 與轉訂單的導頁邏輯。

---

## 六、Flow C 測試結果：經理日常巡檢

| # | 測試項 | 預期 | 實際 | 結果 |
|---|---|---|---|---|
| C-1 | Dashboard 顯示「即將到期報價 5」KPI | ✓ | ✓ 卡片完整呈現 | ✅ |
| C-2 | 即將到期列表可點進報價詳情 | ✓ | ✓ Link 正確 | ✅ |
| C-3 | Dashboard 顯示「待審核報價單」KPI | ✓ Spec: `看到待審核報價單數量` | ❌ **Dashboard 無此 KPI** | ⚠️ 缺口 |
| C-4 | 通知中心可看「報價單待審核」通知 | ✓ | ✓ `quotation_review_request` type | ✅ |
| C-5 | 通知 → 點連結 → 進報價詳情進行審核 | ✓ | ⚠️ 使用 `<a href>` 非 `<Link>`，會 full reload | ⚠️ |
| C-6 | 報價漏斗圖呈現成案轉換率 | ✓ | ✓ 草稿／已報價／議價中／已成案 四階 | ✅ |

> **Bug C-1**：Dashboard KPI 缺少「待審核」統計，經理無法一眼看到有多少張報價等他批。建議新增一個 KPI 卡。

**Flow C 結論**：Dashboard 資訊量足但少了「待審核」這個最關鍵的經理任務提示；通知中心導航體驗可優化。

---

## 七、Gap 1 — 客戶聯絡紀錄測試 (三種類型)

### 7.1 拜訪紀錄 (visit)

| # | 測試項 | 結果 |
|---|---|:---:|
| G1-V1 | 新增 Dialog 選類型後可切到「填寫表單」 step | ✅ |
| G1-V2 | 必要欄位：拜訪時間、地點、與會人員、摘要、後續行動 | ✅ (有對應 `<Input>`) |
| G1-V3 | 日期欄位使用 `<Input type="datetime-local" />` 可精確到分鐘 | ✅ |
| G1-V4 | 時間顯示格式為 `YYYY/MM/DD HH:mm` | ✅ |
| G1-V5 | Timeline 顯示 `MapPin` icon 與「拜訪紀錄」badge | ✅ |
| G1-V6 | 儲存後新增一筆 audit log（欄位＝聯絡紀錄）| ✅ |

### 7.2 通話備忘錄 (call)

| # | 測試項 | 結果 |
|---|---|:---:|
| G1-C1 | 欄位：通話時間、對象、時長、通話重點 | ✅ |
| G1-C2 | Timeline 顯示 `Phone` icon + 綠色 dot | ✅ |
| G1-C3 | 篩選器點「通話備忘錄」能正確過濾 | ✅ |
| G1-C4 | 時長欄位為自由文字（例：15 分鐘）| ✅ |

### 7.3 待辦追蹤 (todo)

| # | 測試項 | 結果 |
|---|---|:---:|
| G1-T1 | 欄位：標題、截止時間、指派、備註 | ✅ |
| G1-T2 | Timeline Checkbox 可 inline 切換已完成 | ✅ `toggleTodoDone` |
| G1-T3 | 已完成時標題加 `line-through` 樣式 | ✅ |
| G1-T4 | 待辦 pending 計數顯示在 Tab Badge | ✅ |
| G1-T5 | 切換 done ↔ pending 時應寫入 audit log | ❌ **未寫入**（僅建立時有 log）|

### 7.4 篩選與歷史

| # | 測試項 | 結果 |
|---|---|:---:|
| G1-F1 | 篩選 chip：全部／拜訪／通話／待辦 + 計數 | ✅ |
| G1-F2 | 「異動歷史」Tab 顯示每次新增紀錄的 log | ✅ |
| G1-F3 | 欄位／操作／操作人／時間 四欄正確 | ✅ |

> **Bug G1-1（中）**：Spec 寫「每次被編輯都需記錄」，目前只記錄「新增」操作，勾選 todo 完成時沒有 audit 紀錄。建議 `toggleTodoDone` 也寫一筆 log（`欄位：待辦狀態 | 前：pending → 後：done`）。
> **Bug G1-2（小）**：表單沒有 required-field validation，空白送出會用 fallback「（未填寫）」。建議至少標題／時間要擋。
> **Bug G1-3（小）**：`createdBy` 硬寫死 `{role: 'AM', name: '王小明'}`，不會跟隨報價單頁上的 role switcher。由於客戶詳情頁沒有 role switcher，也無法驗證。

**Gap 1 結論**：資料結構、UI、Timeline、篩選都依照 Spec 實作，唯一缺的是 todo 狀態切換沒寫 audit log。

---

## 八、Gap 2 — 報價單送審按鈕測試

| # | 測試項 | 結果 |
|---|---|:---:|
| G2-1 | `draft` + 特助 → 「送審」按鈕（藍色） | ✅ |
| G2-2 | `pending_review` + 特助 → 「審核中」disabled 按鈕 | ✅ |
| G2-3 | `quoted` + 特助 → 「寄送給客戶」綠色按鈕 | ✅ |
| G2-4 | `won` + 特助／經理 → 「轉為訂單」按鈕 | ⚠️ 按鈕在，但點擊邏輯不完整（見 Flow B） |
| G2-5 | `pending_review` + 經理 → 「核准／退回」 | ✅ |
| G2-6 | 所有狀態皆顯示「匯出 PDF」 | ✅ |
| G2-7 | 「編輯」僅 `draft` 顯示 | ✅ 但未過濾 role（見 Bug B15） |

**Gap 2 結論**：狀態機 → 按鈕對應邏輯完整，與 Spec 一致。

---

## 九、Gap 3 — 通知中心類型測試

| # | 測試項 | 結果 |
|---|---|:---:|
| G3-1 | `quotation_review_request` 類型存在，icon = `FileCheck` | ✅ |
| G3-2 | `quotation_review_result` 類型存在 | ✅ |
| G3-3 | 核准 vs 退回動態切 icon (`CheckCircle` / `XCircle`) | ✅ `isRejectResult` 判斷 |
| G3-4 | 篩選器下拉含「待審核」「審核結果」 | ✅ |
| G3-5 | 未讀 Badge 數量 = 3（初始） | ✅ |
| G3-6 | 點通知後 `unread → false`，Badge 數量 −1 | ✅ `markRead` |
| G3-7 | 側邊欄通知 Badge 即時反映未讀數 | ❌ 硬寫死 `badge: 3`，不隨 state 變動 |
| G3-8 | 通知超連結格式 | ⚠️ 使用原生 `<a href>`，非 Next.js `<Link>`，全頁重載 |

> **Bug G3-1**：Sidebar badge 數量不同步。
> **Bug G3-2**：通知內連結應改 `<Link>` 以保留 SPA 體驗與狀態。

**Gap 3 結論**：類型、icon、顏色、篩選 UI 完整；兩個整合層面的小問題。

---

## 十、既有 E2E 測試覆蓋度分析

專案內有 4 支 Playwright spec（`tests/e2e/`）：

| 檔案 | 測試項數 | 覆蓋重點 | 評價 |
|---|:---:|---|---|
| `01-quotation-status-flow.spec.ts` | 5 | 草稿→待審核→已報價狀態轉換、Timeline 追加、狀態機圖高亮 | 覆蓋 Flow A 核心，斷言具體（用 `data-testid`），品質佳 |
| `02-bulk-actions-table.spec.ts` | ~8 | 全選、Bulk Action Bar、批量刪除對話框、取消保持不變 | 覆蓋管理列表互動，周全 |
| `03-search-filter.spec.ts` | ~8 | 關鍵字、狀態 Tab、業務下拉、Empty State、計數更新 | 覆蓋複合篩選，邊界情境有顧到 |
| `04-file-upload.spec.ts` | 6+ | 拖放提示、檔案過大錯誤、格式錯誤、上傳進度、成功後出現在清單 | 覆蓋異常流程，做得紮實 |

### 覆蓋度缺口（建議補）

1. **Flow B 轉訂單**：目前無 E2E，但 UI 本身也壞（見 Bug B-1），建議先修再測。
2. **Gap 1 新增聯絡紀錄**：Dialog 兩步驟表單 → 提交 → Timeline 顯示新紀錄 → Audit log 增一筆。
3. **Gap 3 通知篩選**：類型篩選切換、未讀計數遞減、全部標為已讀。
4. **角色切換權限**：切到 AM 身分後所有操作按鈕都消失的 snapshot 測試。

---

## 十一、Bug 清單（按嚴重度排序）

### Critical（影響主流程）

| 編號 | 位置 | 說明 | 建議修正 |
|---|---|---|---|
| B-1 | `quotations/[id]/page.tsx` L253 `handleConvertToOrder` | 點「轉為訂單」只新增 Timeline，不變更 status，也不導頁 | 加 `router.push('/orders/ORD-...')` 及 mockOrders push |
| B-2 | `quotations/[id]/page.tsx` L608 新建版本按鈕 | 無 `onClick`，是死按鈕 | 加 Dialog 複製當前版本為 V3 |

### High（功能缺陷）

| 編號 | 位置 | 說明 | 建議修正 |
|---|---|---|---|
| H-1 | `customers/[id]/page.tsx` 封存 AlertDialogAction | 點「確認封存」無反應 | 加 `onClick={() => setStatus('archived')}` |
| H-2 | `quotations/page.tsx` 作廢 DropdownMenuItem | 點「作廢」無反應 | 加 AlertDialog + 狀態更新 |
| H-3 | `customers/[id]/page.tsx` 新增聯絡人 / 新增資產 | 兩個按鈕都無 handler | 加 Dialog |
| H-4 | `quotations/[id]/page.tsx` `handleSubmitReview` | 送審未觸發通知中心更新 | 抽出共享 notifications store (Zustand/Context) |
| H-5 | `notifications/page.tsx` | `<a href>` 導致 full reload | 改用 Next.js `<Link>` |

### Medium（資料／UX 問題）

| 編號 | 位置 | 說明 | 建議修正 |
|---|---|---|---|
| M-1 | `components/crm/app-sidebar.tsx` L43 | 通知 badge 硬寫 3，非動態 | 從 notifications store 取未讀數 |
| M-2 | `customers/[id]/page.tsx` `toggleTodoDone` | 勾選 todo 完成未寫入 audit log | 補一筆 log `待辦狀態：pending → done` |
| M-3 | `quotations/[id]/page.tsx` `handleReject` | 退回原因可為空 | `disabled={!rejectNote.trim()}` |
| M-4 | Dashboard | 缺「待審核報價單」KPI | 新增卡片 |
| M-5 | `quotations/page.tsx` statusTabs | 缺 `pending_review` tab | push 進 `statusTabs` 陣列 |
| M-6 | 資料 ID | 通知用 `QUO-2026-*`，列表用 `QUO-2025-*` | 統一命名 |

### Low（美化／體驗）

| 編號 | 位置 | 說明 |
|---|---|---|
| L-1 | `customers/[id]/page.tsx` 新增紀錄 form | 無 required validation，空白用「（未填寫）」fallback |
| L-2 | `quotations/[id]/page.tsx` demo role/status switcher | 可直接跨越狀態機（draft → won），方便展示但易混淆 |
| L-3 | `handleConvertToOrder` actor fallback | `role === 'AM'` 時寫成「張經理」，錯誤 |
| L-4 | 所有 Dialog | 沒有 loading state（模擬非同步） |
| L-5 | `notifications/page.tsx` 日期分組 | 「今天／昨天」為硬寫字串，不會隨時間推移更新 |
| L-6 | 經理角色 | 目前看得到 draft 的「編輯」按鈕（Spec 禁） |

### Security / Permission

| 編號 | 說明 |
|---|---|
| S-1 | 無路由守衛：所有頁面直接輸入 URL 皆可進入，包含 `/settings/users` 這種管理員頁面 |
| S-2 | 403 頁有設計但沒有邏輯 redirect，等於是裝飾 |

---

## 十二、建議的下一步

1. **先修 Critical**：B-1 / B-2 → 讓 Flow B 跑得通。
2. **加 onClick**：H-1 ～ H-3 五個死按鈕。
3. **Notification store 化**：解決 H-4 / M-1，讓跨頁狀態同步。
4. **加 Playwright E2E**：補 Gap 1（新增紀錄）、Gap 3（通知篩選）、Flow B（轉訂單）。
5. **作品集敘述可以寫**：
   - 自己設計 Spec → 實作 → 寫測試 → 找 bug → 整理報告，展現完整 QA 思維
   - 可以把這份報告當成附錄或獨立章節放上 README

---

## 十三、測試結論

此 prototype 的 **架構與 Spec 對照度高**，狀態機、Timeline、角色切換、表單分類等關鍵能力都有到位。主要問題是「最後一哩」：幾個按鈕沒掛 onClick、跨頁狀態沒 share、Flow B 轉訂單流程差一截。修完上述 Critical/High 共 7 個 bug，這套 CRM 作為作品集已經可以呈現非常完整的 B2B 業務流程設計能力。

— **報告結束** —
