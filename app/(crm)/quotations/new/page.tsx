'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  FilePlus,
  AlertTriangle,
  FileDown,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { PaymentTermsSelector } from '@/components/crm/payment-terms-selector'
import { NotesSelector } from '@/components/crm/notes-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { NOTES_OPTIONS } from './terms'

// ── 報價常數 ──────────────────────────────────────────────
const DISCOUNT_RATE = 0.9   // 議價優惠固定 9 折
const TAX_RATE = 0.05       // 稅率 5%

// ── Mock data ─────────────────────────────────────────────

const mockCustomers = [
  { id: 'CUS-2025-0024', name: '台灣數位科技' },
  { id: 'CUS-2025-0023', name: '創新軟體開發' },
  { id: 'CUS-2025-0022', name: '智慧製造公司' },
  { id: 'CUS-2025-0021', name: '東方貿易公司' },
]

const mockContacts = [
  { id: 1, name: '陳小華', customerId: 'CUS-2025-0024' },
  { id: 2, name: '林大偉', customerId: 'CUS-2025-0024' },
  { id: 3, name: '張志明', customerId: 'CUS-2025-0023' },
]

// ── Types ─────────────────────────────────────────────────

interface LineItem {
  id: number
  name: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

interface VersionEntry {
  version: number
  timestamp: string
  user: string
  changes: string[]
}

// ── Page ──────────────────────────────────────────────────

export default function NewQuotationPage() {
  const router = useRouter()
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [historyExpanded, setHistoryExpanded] = useState(false)

  // Form state
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [projectName, setProjectName] = useState('')
  const [selectedContact, setSelectedContact] = useState('')
  const [validDays, setValidDays] = useState('30')
  const [schedule, setSchedule] = useState('')
  const [showDiscount, setShowDiscount] = useState(false)

  // 付款條件 & 備註（新結構）
  const [paymentTermId, setPaymentTermId] = useState<string | null>(null)
  const [customPaymentNote, setCustomPaymentNote] = useState('')
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>(
    NOTES_OPTIONS.filter((o) => o.defaultChecked).map((o) => o.id)
  )
  const [customNote, setCustomNote] = useState('')

  // Line items
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 1, name: '', description: '', quantity: 1, unit: '式', unitPrice: 0, amount: 0 },
  ])

  // Version history
  const [versionHistory, setVersionHistory] = useState<VersionEntry[]>([])

  // ── Computed values ──────────────────────────────────────

  const expiryDate = useMemo(() => {
    const days = parseInt(validDays) || 30
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }, [validDays])

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const discount = showDiscount ? subtotal - Math.floor(subtotal * DISCOUNT_RATE) : 0
  const negotiatedSubtotal = subtotal - discount
  const tax = Math.round(negotiatedSubtotal * TAX_RATE)
  const totalWithTax = negotiatedSubtotal + tax

  const formatCurrency = (amount: number) =>
    amount.toLocaleString('zh-TW')

  // ── Line item handlers ───────────────────────────────────

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: Date.now(), name: '', description: '', quantity: 1, unit: '式', unitPrice: 0, amount: 0 },
    ])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = updated.quantity * updated.unitPrice
        }
        return updated
      })
    )
  }

  // ── Save / version log ───────────────────────────────────

  const buildChangeSummary = (): string[] => {
    const changes: string[] = []
    const customerName = mockCustomers.find((c) => c.id === selectedCustomer)?.name
    if (customerName) changes.push(`客戶：${customerName}`)
    if (projectName) changes.push(`案件：${projectName}`)
    const filledItems = lineItems.filter((i) => i.name)
    if (filledItems.length) changes.push(`報價項目：${filledItems.map((i) => i.name).join('、')}`)
    if (showDiscount && discount > 0) changes.push(`議價優惠(9折)：-NT$${formatCurrency(discount)}`)
    changes.push(`含稅總計：NT$${formatCurrency(totalWithTax)}`)
    return changes.length ? changes : ['建立新報價單草稿']
  }

  const logVersion = () => {
    const entry: VersionEntry = {
      version: versionHistory.length + 1,
      timestamp: new Date().toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      user: '王小明',
      changes: buildChangeSummary(),
    }
    setVersionHistory((prev) => [entry, ...prev])
  }

  const handleSave = () => {
    logVersion()
    setHistoryExpanded(true)
    router.push('/quotations/QUO-2025-0046')
  }

  const handleSaveAs = () => {
    logVersion()
    setShowSaveAsDialog(false)
    router.push('/quotations/QUO-2025-0046')
  }

  const toggleNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        breadcrumbs={[
          { label: '報價與合約', href: '/quotations' },
          { label: '新增報價' },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">新增報價</h1>
            <p className="text-sm text-muted-foreground mt-1">
              報價單號與版本將由系統自動產生
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowLeaveWarning(true)}>
              取消
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowSaveAsDialog(true)}
            >
              <FilePlus className="h-4 w-4" />
              另存新版
            </Button>
            <Button variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              匯出 PDF
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              儲存草稿
            </Button>
          </div>
        </div>

        {/* Leave Warning */}
        <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確定要離開嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                您填寫的資料尚未儲存，離開後將會遺失所有內容。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>繼續編輯</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => router.push('/quotations')}
              >
                確定離開
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save As Dialog */}
        <AlertDialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>另存新版本</AlertDialogTitle>
              <AlertDialogDescription>
                這將建立一個新版本的報價單，原有版本將被保留以供回溯比較。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                className="bg-primary hover:bg-primary/90"
                onClick={handleSaveAs}
              >
                確認另存
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Basic Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              基本資訊
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  客戶 <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇客戶" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>報價聯絡人</Label>
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger>
                    <SelectValue placeholder="請選擇聯絡人" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockContacts
                      .filter((c) => c.customerId === selectedCustomer)
                      .map((contact) => (
                        <SelectItem key={contact.id} value={String(contact.id)}>
                          {contact.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  案件名稱 <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="請輸入案件名稱"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>有效期限（天）</Label>
                  <Input
                    type="number"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    到期日：{expiryDate}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>預計時程</Label>
                  <Input
                    placeholder="如：8 週"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground">
              報價明細
            </CardTitle>
            <Alert className="w-auto bg-warning-subtle border-warning/40 p-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-sm text-warning ml-2">
                拖拉項目可調整順序
              </AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 border-border">
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead className="text-muted-foreground w-[50px]">編號</TableHead>
                    <TableHead className="text-muted-foreground min-w-[150px]">項目名稱</TableHead>
                    <TableHead className="text-muted-foreground min-w-[200px]">說明</TableHead>
                    <TableHead className="text-muted-foreground w-[80px]">數量</TableHead>
                    <TableHead className="text-muted-foreground w-[80px]">單位</TableHead>
                    <TableHead className="text-muted-foreground w-[120px]">單價(元)</TableHead>
                    <TableHead className="text-muted-foreground w-[130px] text-right">金額(元)</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item, index) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell>
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="項目名稱"
                          value={item.name}
                          onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                          className="min-w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="說明"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="min-w-[150px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(item.id, 'quantity', Number(e.target.value))
                          }
                          className="w-[70px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.unit}
                          onValueChange={(value) => updateLineItem(item.id, 'unit', value)}
                        >
                          <SelectTrigger className="w-[70px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="式">式</SelectItem>
                            <SelectItem value="個">個</SelectItem>
                            <SelectItem value="頁">頁</SelectItem>
                            <SelectItem value="小時">小時</SelectItem>
                            <SelectItem value="天">天</SelectItem>
                            <SelectItem value="月">月</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice || ''}
                          onChange={(e) =>
                            updateLineItem(item.id, 'unitPrice', Number(e.target.value))
                          }
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive/90"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter className="bg-muted/30">
                  {/* 套用議價優惠 checkbox — 在計算結果上方 */}
                  <TableRow className="border-border">
                    <TableCell colSpan={9} className="py-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="showDiscount"
                          checked={showDiscount}
                          onCheckedChange={(checked) => setShowDiscount(!!checked)}
                        />
                        <Label htmlFor="showDiscount" className="text-sm cursor-pointer font-normal">
                          套用議價優惠（9 折）
                        </Label>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* 小計 */}
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="text-right text-muted-foreground">
                      小計
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </TableCell>
                    <TableCell />
                  </TableRow>

                  {/* 議價優惠 — 勾選後才顯示，純顯示系統計算值 */}
                  {showDiscount && (
                    <TableRow className="border-border">
                      <TableCell colSpan={7} className="text-right text-muted-foreground">
                        議價優惠（9 折）
                      </TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {discount > 0 ? `−${formatCurrency(discount)}` : '0'}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  )}

                  {/* 稅額 5% */}
                  <TableRow className="border-border">
                    <TableCell colSpan={7} className="text-right text-muted-foreground">
                      稅額（5%）
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(tax)}
                    </TableCell>
                    <TableCell />
                  </TableRow>

                  {/* 含稅總計 */}
                  <TableRow className="bg-primary/5">
                    <TableCell colSpan={7} className="text-right font-semibold text-foreground">
                      含稅總計
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary text-lg">
                      NT${formatCurrency(totalWithTax)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="gap-2" onClick={addLineItem}>
                <Plus className="h-4 w-4" />
                新增項目
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terms & Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* 付款條件 */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                付款條件
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentTermsSelector
                value={paymentTermId}
                customNote={customPaymentNote}
                onChange={setPaymentTermId}
                onCustomNoteChange={setCustomPaymentNote}
              />
            </CardContent>
          </Card>

          {/* 備註 */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-foreground">
                備註
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotesSelector
                selectedIds={selectedNoteIds}
                customNote={customNote}
                onToggle={toggleNote}
                onCustomNoteChange={setCustomNote}
              />
            </CardContent>
          </Card>
        </div>

        {/* 版本歷程 */}
        <Card className="border-border">
          <CardHeader
            className="flex flex-row items-center justify-between pb-3 cursor-pointer select-none"
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold text-foreground">
                版本歷程
              </CardTitle>
              {versionHistory.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {versionHistory.length} 個版本
                </Badge>
              )}
            </div>
            {historyExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>

          {historyExpanded && (
            <CardContent>
              {versionHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  尚無版本紀錄。儲存草稿後將自動建立第一個版本快照。
                </p>
              ) : (
                <div className="space-y-4">
                  {versionHistory.map((entry) => (
                    <div
                      key={entry.version}
                      className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      {/* 版本徽章 */}
                      <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono px-2"
                        >
                          v{entry.version}
                        </Badge>
                        <div className="w-px flex-1 bg-border" />
                      </div>

                      {/* 內容 */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            {entry.user}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {entry.timestamp}
                          </span>
                        </div>
                        <ul className="space-y-0.5">
                          {entry.changes.map((change, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-1.5">
                              <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40 shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </main>
    </div>
  )
}
