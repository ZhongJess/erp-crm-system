'use client'

export const dynamic = 'force-dynamic'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { PaymentTermsSelector } from '@/components/crm/payment-terms-selector'
import { NotesSelector } from '@/components/crm/notes-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
import { NOTES_OPTIONS } from '@/app/(crm)/quotations/new/terms'

interface LineItem {
  id: number
  name: string
  spec: string
  qty: number
  unit: string
  unitPrice: number
  discount: number
}

// Pre-filled with existing quotation data
const initialItems: LineItem[] = [
  { id: 1, name: 'UI/UX 設計服務', spec: '', qty: 1, unit: '式', unitPrice: 120000, discount: 0 },
  { id: 2, name: '前端開發', spec: 'React / Next.js', qty: 1, unit: '式', unitPrice: 150000, discount: 0 },
  { id: 3, name: '後端 API 串接', spec: '', qty: 1, unit: '式', unitPrice: 60000, discount: 0 },
  { id: 4, name: '教育訓練', spec: '2 場 x 半天', qty: 2, unit: '場', unitPrice: 10000, discount: 0 },
]

export default function EditQuotationPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [projectName, setProjectName] = useState('官網改版專案')
  const [validDays, setValidDays] = useState('30')
  const [paymentTermId, setPaymentTermId] = useState<string | null>(null)
  const [customPaymentNote, setCustomPaymentNote] = useState('')
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>(
    NOTES_OPTIONS.filter((o) => o.defaultChecked).map((o) => o.id)
  )
  const [customNote, setCustomNote] = useState('')
  const [items, setItems] = useState<LineItem[]>(initialItems)

  const toggleNote = (id: string) => {
    setSelectedNoteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: '', spec: '', qty: 1, unit: '式', unitPrice: 0, discount: 0 },
    ])
  }

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  const subtotal = items.reduce((sum, item) => {
    const discounted = item.unitPrice * (1 - item.discount / 100)
    return sum + item.qty * discounted
  }, 0)

  const handleSave = async (draft = false) => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsSaving(false)
    router.push(`/quotations/${params.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        breadcrumbs={[
          { label: '報價與合約', href: '/quotations' },
          { label: params.id, href: `/quotations/${params.id}` },
          { label: '編輯報價單' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowLeaveDialog(true)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">編輯報價單</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                {params.id}
                <Badge variant="outline">議價中</Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowLeaveDialog(true)}>
              取消
            </Button>
            <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
              儲存草稿
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '儲存中...' : '儲存並送出'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">報價單基本資訊</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>客戶</Label>
                  <div className="mt-1 p-2 border rounded-md bg-muted/50 text-sm">
                    台灣數位科技股份有限公司
                    <span className="text-muted-foreground ml-2 text-sm">(不可修改)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="projectName">
                      案件名稱 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>有效期限（天）</Label>
                    <Input
                      type="number"
                      min="1"
                      value={validDays}
                      onChange={(e) => setValidDays(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">報價明細</CardTitle>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  新增項目
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Column headers */}
                  <div className="grid grid-cols-[24px_1fr_80px_80px_80px_100px_32px] gap-2 text-sm text-muted-foreground px-1">
                    <span />
                    <span>項目名稱 / 規格</span>
                    <span className="text-right">數量</span>
                    <span>單位</span>
                    <span className="text-right">折扣%</span>
                    <span className="text-right">單價</span>
                    <span />
                  </div>
                  <Separator />

                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[24px_1fr_80px_80px_80px_100px_32px] gap-2 items-start"
                    >
                      <div className="flex items-center h-9 text-muted-foreground/50">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          placeholder="項目名稱"
                          className="h-8 text-sm"
                        />
                        <Input
                          value={item.spec}
                          onChange={(e) => updateItem(item.id, 'spec', e.target.value)}
                          placeholder="規格說明（選填）"
                          className="h-7 text-xs text-muted-foreground"
                        />
                      </div>
                      <Input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                        className="h-8 text-sm text-right"
                      />
                      <Input
                        value={item.unit}
                        onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                        className="h-8 text-sm"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                        className="h-8 text-sm text-right"
                      />
                      <Input
                        type="number"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="h-8 text-sm text-right font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />
                <div className="flex justify-end">
                  <div className="space-y-1.5 text-sm text-right min-w-52">
                    <div className="flex justify-between gap-8">
                      <span className="text-muted-foreground">小計（未稅）</span>
                      <span className="font-mono">NT$ {Math.round(subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-8">
                      <span className="text-muted-foreground">稅金（5%）</span>
                      <span className="font-mono">NT$ {Math.round(subtotal * 0.05).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between gap-8 font-bold text-base">
                      <span>總計</span>
                      <span className="font-mono">NT$ {Math.round(subtotal * 1.05).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            {/* 付款條件 & 備註 — 與新增頁相同元件 */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">付款條件</CardTitle>
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

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-foreground">備註</CardTitle>
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
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">報價摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">有效天數</span>
                  <span>{validDays} 天</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">項目數</span>
                  <span>{items.length} 項</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>未稅總額</span>
                  <span className="font-mono">NT$ {Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>含稅總額</span>
                  <span className="font-mono">NT$ {Math.round(subtotal * 1.05).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Leave Warning */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要離開嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              你有未儲存的變更，離開後將會遺失。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>繼續編輯</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/quotations/${params.id}`)}>
              離開不儲存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
