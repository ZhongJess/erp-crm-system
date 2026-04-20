# CRM 作品集 — Prototype 規格文件

> 給 Claude Code 的交接文件。本文件說明系統現況、角色定義、核心流程，以及三個需要補齊的缺口。

---

## 一、專案背景

這是一套 B2B CRM/ERP 系統，以 Next.js + shadcn/ui 實作，目的是作為作品集展示。
注意：**不可出現前公司名稱**，所有 mock data 使用虛構公司名。

---

## 二、角色定義（共 5 人）

| 角色 | 人數 | 核心職責 |
|---|---|---|
| 經理 | 1 | 審核報價單（核准 / 退回）|
| AM / PM | 3 | 維護客戶資料、登錄聯絡紀錄；**可看全公司 Dashboard、可編輯全公司所有客戶** |
| HR 兼經理特助 | 1 | **唯一**可開立報價單者；報價單對外寄送的**唯一窗口** |

### 權限矩陣

| 功能 | 經理 | AM / PM | 特助 |
|---|:---:|:---:|:---:|
| Dashboard（全公司） | ✅ | ✅ | ✅ |
| 查看 / 新增 / 編輯客戶（全公司） | ✅ | ✅ | ✅ |
| 登錄聯絡紀錄（拜訪/通話/待辦） | ✅ | ✅ | ✅ |
| **開立報價單** | ❌ | ❌ | ✅ |
| **送審報價單** | ❌ | ❌ | ✅ |
| **審核報價單（核准/退回）** | ✅ | ❌ | ❌ |
| 寄送報價給客戶 | ❌ | ❌ | ✅ |
| 轉訂單（手動） | ✅ | ❌ | ✅ |
| 系統設定 / 使用者管理 | ✅ | ❌ | 部分（帳號、通知） |

---

## 三、核心業務流程

### Flow A：詢價 → 報價 → 審核 → 寄送（主流程）

```
AM 接到客戶詢價
  ↓
[客戶詳情頁] 新增「通話備忘錄」(e.g. 2026/04/15 14:32)
  ↓
[客戶詳情頁] 新增「待辦追蹤」：請特助開報價單
  ↓
特助 → [報價管理] 新增報價單（狀態：草稿）
  ↓
填寫品項、金額 → 儲存草稿
  ↓
特助點「送審」→ 狀態變為「待審核」→ 系統發通知給經理
  ↓
經理 [通知中心] 收到「報價單待審核」通知
  ↓
經理 [報價詳情] 點「核准」或「退回（附備註）」
  ↓
核准 → 狀態變為「已報價」→ 特助收到通知
  ↓
特助 [報價詳情] 點「寄送給客戶」→ 記錄寄送時間
```

### Flow B：議價 → 成案 → 轉訂單

```
客戶回覆要議價
  ↓
特助 [報價詳情] 點「新版本」→ 建立 V2（保留 V1 歷史）
  ↓
重新送審 → 核准 → 寄送
  ↓
客戶接受 → 特助/經理 手動改狀態為「已成案」
  ↓
點「轉為訂單」→ 訂單建立成功 → 跳轉訂單詳情
```

### Flow C：經理日常巡檢

```
登入 → Dashboard
  ↓
看到「即將到期報價」(1-3天) 和「待審核報價單」數量
  ↓
點進報價詳情 → 審核
```

---

## 四、報價單狀態機

```
草稿 (draft)
  → [特助送審] → 待審核 (pending_review)
    → [經理核准] → 已報價 (quoted)
      → [客戶議價] → 議價中 (negotiating)
        → [成案] → 已成案 (won)
        → [未成案] → 未成案 (lost)
    → [經理退回] → 草稿 (draft)  ← 回到起點，可重新編輯
```

**新增 `pending_review` 狀態**（目前程式碼缺少這個中間狀態）

---

## 五、需補齊的三個缺口

---

### 缺口 1：客戶聯絡紀錄（最重要）

**位置**：`app/(crm)/customers/[id]/page.tsx` 的「活動紀錄」Tab

**現況**：目前只有通用備忘錄（`activities` array），沒有結構化分類。

**需改成三種類型的聯絡紀錄：**

#### 類型 A：拜訪紀錄 (visit)
```typescript
{
  type: 'visit',
  datetime: '2026/04/15 14:30',  // 精確到分鐘
  location: string,               // 拜訪地點
  attendees: string,              // 與會人員（客戶側）
  summary: string,                // 拜訪摘要
  nextAction: string,             // 後續行動
  createdBy: { role: string, name: string }
}
```

#### 類型 B：通話備忘錄 (call)
```typescript
{
  type: 'call',
  datetime: '2026/04/15 10:15',  // 精確到分鐘
  contactPerson: string,          // 通話對象（客戶端聯絡人）
  duration: string,               // 通話時長（e.g. '15 分鐘'）
  summary: string,                // 通話重點
  createdBy: { role: string, name: string }
}
```

#### 類型 C：待辦追蹤 (todo)
```typescript
{
  type: 'todo',
  title: string,                  // 待辦事項標題
  dueDateTime: '2026/04/20 17:00', // 截止時間，精確到分鐘
  assignedTo: string,              // 指派給誰
  status: 'pending' | 'done',
  note: string,
  createdBy: { role: string, name: string }
}
```

**UI 需求：**
- Tab 上方加類型篩選器（全部 / 拜訪紀錄 / 通話備忘錄 / 待辦追蹤）
- Timeline 顯示，每筆紀錄左側有對應 icon（MapPin / Phone / CheckSquare）
- 「新增紀錄」按鈕 → Dialog 彈出，先選類型，再填對應欄位
- 日期時間欄位用 `<Input type="datetime-local" />` 或 DateTimePicker，**需顯示到分鐘**
- 待辦追蹤的 `status` 可直接在列表 inline 切換（勾選即完成）

**異動歷史 Tab** 也需更新：每次新增/編輯聯絡紀錄都要自動記錄一筆，格式：
```
欄位：聯絡紀錄  |  操作：新增  |  操作人：AM 王小明  |  時間：2026/04/15 14:32
```

---

### 缺口 2：報價單「送審」按鈕

**位置**：`app/(crm)/quotations/[id]/page.tsx`

**現況**：草稿狀態沒有「送審」按鈕；「核准/退回」按鈕在 `status === 'quoted'` 才出現（已正確），但缺少 `pending_review` 狀態的邏輯。

**需修改：**

```typescript
// 狀態對應按鈕邏輯（按角色區分）

// 特助視角：
if (status === 'draft') → 顯示「送審」按鈕（藍色）
if (status === 'quoted') → 顯示「寄送給客戶」按鈕（綠色）+ 記錄寄送時間
if (status === 'won') → 顯示「轉為訂單」按鈕

// 經理視角：
if (status === 'pending_review') → 顯示「核准」（綠色）+ 「退回」（紅色）按鈕
// 退回時 AlertDialog 要求填退回備註

// 所有人：
if (status === 'draft') → 顯示「編輯」按鈕
```

**狀態 Badge 新增：**
```typescript
pending_review: 'bg-[#FEF9C3] text-[#92400E] border-[#FDE68A]'  // 待審核，橘黃色
```

**送審後行為：**
- 狀態改為 `pending_review`
- 觸發通知給經理（見缺口 3）
- 「送審」按鈕變成 disabled + tooltip「審核中，請等待經理核准」

---

### 缺口 3：通知中心新增「報價單待審核」類型

**位置**：`app/(crm)/notifications/page.tsx`

**現況**：有 `quotation_expiry`、`customer_update`、`order_update`、`transfer`、`system` 五種類型，缺少審核相關。

**新增兩種類型：**

```typescript
// 1. 給經理看：報價單待審核
{
  type: 'quotation_review_request',
  title: '報價單待審核',
  description: 'QUO-2026-0045《台灣數位科技 — 官網改版》已送出，請審核。',
  link: '/quotations/QUO-2026-0045',
  // icon: FileCheck, color: text-orange-500 bg-orange-50
}

// 2. 給特助看：報價單審核結果
{
  type: 'quotation_review_result',
  title: '報價單已核准',   // 或「報價單已退回」
  description: 'QUO-2026-0045《官網改版》已由張經理核准，可寄送給客戶。',
  link: '/quotations/QUO-2026-0045',
  // icon: CheckCircle（核准）/ XCircle（退回）, color: green / red
}
```

**`typeConfig` 需補上：**
```typescript
quotation_review_request: {
  icon: <FileCheck className="h-4 w-4" />,
  color: 'text-orange-500 bg-orange-50',
  label: '待審核',
},
quotation_review_result: {
  icon: <CheckCircle className="h-4 w-4" />,
  color: 'text-green-500 bg-green-50',
  label: '審核結果',
},
```

**篩選器 Select 也要加這兩個選項。**

---

### 缺口 4：Dashboard 三角色分流 + 訂單狀態機（新增）

**位置**：`app/(crm)/dashboard/page.tsx`

**現況**：目前是單一 Dashboard，不區分角色。

**改動目標**：同一路由依登入角色顯示不同 widget 組合；新增訂單狀態機與「我負責客戶的進行中訂單」widget。

**完整 wireframe 規範**：請對照 `wireframes/dashboard-wireframe.html`（1920 low-fi 線稿，頂部 tab 可切換三角色檢視）。

#### 4.1 三角色 Dashboard widget 順序

**經理**：
1. KPI：待我審核報價單（優先紅框） / 本月成案金額 / Pipeline 總金額 / 本月新增客戶
2. 待我審核的報價單（主列表，第一屏可見）＋ 報價單漏斗
3. AM/PM 本月業績排行 ＋ 大額議價中案件 Top 5
4. 客戶集中度 / 風險警示

**AM/PM**：
1. KPI：我的今日待辦（優先） / 我的本月業績 / 我負責的客戶 / 我的進行中報價
2. 我的今日待辦（主列表）＋ 客戶聯絡提醒
3. 我的進行中報價單 ＋ 我負責客戶的最近變動
4. **我負責客戶的進行中訂單（新 widget，見 4.2）**
5. 我的本月業績趨勢（折線圖）

**特助**：
1. KPI：已核准待寄送（優先） / AM 請我開的報價 / 待客戶回覆 / 本月已寄送
2. 已核准·待我寄送給客戶（主列表，全寬）
3. AM 請我開的報價單 ＋ 報價單狀態總覽
4. 寄送後 5 天以上沒回覆 ＋ 今日我的操作紀錄

#### 4.2 訂單狀態機（新增）

訂單資料模型加入 `progressStatus` 欄位：

```typescript
type ProgressStatus =
  | 'pending_schedule'   // 待排程 （自動：成案轉訂單進此狀態）
  | 'scheduling'         // 排程中 （特助/經理 指派負責人 & 開工日）
  | 'in_delivery'        // 交付中 （到預計開工日自動或手動進入）
  | 'delivered'          // 已交付 （特助/經理 點「交付」並填交付日）
  | 'uat'                // 驗收中 （特助登錄驗收啟動）
  | 'closed'             // 已結案 （客戶驗收通過，終態）
  | 'cancelled'          // 已取消 （任一階段可轉，需填原因）

// 進度百分比（只在 in_delivery 有意義）
progressPercent?: 0 | 25 | 50 | 75 | 100  // 特助每週手動更新
```

**狀態轉換規則：**
```
pending_schedule → scheduling → in_delivery → delivered → uat → closed
                       ↓             ↓            ↓         ↓
                   任一可轉 → cancelled （需填取消原因）

退回：
uat → in_delivery        （驗收不過要返工）
delivered → in_delivery  （交付後發現要改）
```

**每個狀態必填欄位：**
| 狀態 | 進入時必填 | Dashboard 顯示 |
|---|---|---|
| pending_schedule | 成案日 | 已等幾天（> 3 天警示） |
| scheduling | 預計開工日、負責人姓名（mock） | 距開工 X 天 |
| in_delivery | 實際開工日、預計交付日、progressPercent | 進度條、距預計交付 X 天 |
| delivered | 實際交付日 | 已交付 X 天（> 7 天警示） |
| uat | 驗收啟動日、驗收 deadline | 剩 X 天（< 3 天警示） |
| closed | 結案日 | （不顯示在主 dashboard） |
| cancelled | 取消日、取消階段、取消原因 | 獨立標籤 |

**狀態 Badge 顏色：**
```typescript
pending_schedule: 中性灰（neutral gray）
scheduling:       藍 bg-blue-50 text-blue-700
in_delivery:      深藍 bg-blue-100 text-blue-800
delivered:        橘 bg-orange-50 text-orange-700
uat:              黃 bg-yellow-50 text-yellow-800
closed:           綠 bg-green-50 text-green-700
cancelled:        紅 bg-red-50 text-red-700 + 斜線淡化
```

#### 4.3 「我負責客戶的進行中訂單」widget 規格

**顯示欄位**：訂單編號 / 客戶 / 金額 / 當前狀態（彩色 pill） / 狀態指標 / 預計交付 / 操作（查看）

**排序邏輯**（由上到下）：
1. uat 剩 < 3 天（紅色警示）
2. delivered 超過 7 天未啟動驗收（橘色警示）
3. in_delivery 逾預計交付日
4. 其他依狀態預設順序：uat → delivered → in_delivery → scheduling → pending_schedule

**不顯示**：closed、cancelled（可另闢「近 30 天結案」區塊，選配）。

**權限**：
- AM/PM：只看自己負責客戶的訂單
- 經理：可看全部
- 特助：可看全部（狀態更新者）

#### 4.4 RWD 斷點

| 斷點 | 規則 |
|---|---|
| ≥ 1920 (桌機主版) | 4 欄 KPI、2 欄 grid（2:1 或 1:1） |
| 1280–1919 (筆電) | 同桌機布局，padding 與字級略縮 |
| 768–1279 (平板) | 4 欄 KPI → 2 欄；2 欄 grid → 1 欄堆疊；sidebar 保留 |
| 375–767 (手機) | KPI → 1 欄；所有 grid → 1 欄；sidebar → drawer；table → 卡片式列表 |

---

## 六、客戶列表 Filter 規格

**位置**：`app/(crm)/customers/page.tsx`

### Filter 欄位

| Filter | 類型 | 觸發方式 | 選項 |
|---|---|---|---|
| 搜尋框 | text input | **debounce 300ms** 後觸發 | placeholder：搜尋客戶名稱、簡稱、統一編號... |
| 企業類型 | dropdown | 即時篩選 | 全部 / 企業 / 政府機關 / 非營利組織 |
| 負責 AM/PM | dropdown | 即時篩選 | 全部 / 各 AM、PM 姓名 |
| 客戶狀態 | dropdown | 即時篩選 | 全部 / 潛在客戶 / 合作中 / 已流失 |
| 建立日期區間 | date range picker（開始 ～ 結束） | 即時篩選 | — |

### 設計說明

- 搜尋框用 debounce 避免大量資料時每次按鍵都觸發 query
- Dropdown 類 filter 選完即觸發，不需確認按鈕
- **不設漏斗 icon**（所有 filter 皆即時反應，無需手動送出）
- 搭配後端分頁（建議每頁 20～50 筆）確保效能

---

## 七、現有頁面清單（已完成，不需修改）

| 頁面 | 路徑 | 狀態 |
|---|---|---|
| 登入 | `/login` | ✅ |
| 忘記密碼 | `/forgot-password` | ✅ |
| Dashboard | `/dashboard` | ⚠️ 需重構為三角色分流 + RWD（缺口4） |
| 客戶列表 | `/customers` | ✅ |
| 新增客戶 | `/customers/new` | ✅ |
| 客戶詳情 | `/customers/[id]` | ⚠️ 需補聯絡紀錄（缺口1） |
| 編輯客戶 | `/customers/[id]/edit` | ✅ |
| 報價列表 | `/quotations` | ✅ |
| 新增報價單 | `/quotations/new` | ✅ |
| 報價詳情 | `/quotations/[id]` | ⚠️ 需補送審按鈕（缺口2） |
| 編輯報價單 | `/quotations/[id]/edit` | ✅ |
| 訂單列表 | `/orders` | ⚠️ 需加 progressStatus 狀態欄位（缺口4） |
| 訂單詳情 | `/orders/[id]` | ⚠️ 需加狀態機操作與時序（缺口4） |
| 通知中心 | `/notifications` | ⚠️ 需補通知類型（缺口3） |
| 系統設定 | `/settings` | ✅ |
| 使用者管理 | `/settings/users` | ✅ |
| 角色權限 | `/settings/roles` | ✅ |
| 通知設定 | `/settings/notifications` | ✅ |
| 操作紀錄 | `/settings/logs` | ✅ |
| 帳號設定 | `/settings/account` | ✅ |
| 轉移資料 | `/settings/transfer` | ✅ |
| 403 | `/403` | ✅ |

---

## 七、給 Claude Code 的執行順序建議

1. **先做缺口 4（Dashboard 三角色分流 + RWD + 訂單狀態機）** — 骨幹最大，先定 mock data schema
2. **再做缺口 1（客戶聯絡紀錄）** — 最複雜，也是最能展示系統深度的功能
3. **再做缺口 2（送審按鈕 + pending_review 狀態）** — 邏輯修改為主，不複雜
4. **最後做缺口 3（通知類型）** — 在現有結構上新增兩種類型，最快

**注意事項：**
- 所有 mock data 用繁體中文
- 時間格式統一：`YYYY/MM/DD HH:mm`（含分鐘）
- 不要出現前公司名稱
- 角色名稱用通用職稱（不用真實姓名以外的 identifier）
