'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { ArrowRight, Search, AlertTriangle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

const salesPeople = ['王小明', '李美麗', '陳志偉', '張小芬']

const mockCustomersForSales: Record<string, { id: string; name: string; quotations: number }[]> = {
  王小明: [
    { id: 'CUS-2025-0024', name: '台灣數位科技股份有限公司', quotations: 3 },
    { id: 'CUS-2025-0021', name: '全球運籌有限公司', quotations: 1 },
    { id: 'CUS-2025-0015', name: '新創育成中心', quotations: 2 },
  ],
  李美麗: [
    { id: 'CUS-2025-0023', name: '創新軟體開發有限公司', quotations: 2 },
    { id: 'CUS-2025-0019', name: '美好生活股份有限公司', quotations: 1 },
  ],
  陳志偉: [
    { id: 'CUS-2025-0018', name: '台灣大學', quotations: 1 },
    { id: 'CUS-2025-0011', name: '安心保險代理有限公司', quotations: 2 },
  ],
  張小芬: [
    { id: 'CUS-2025-0016', name: '台北市政府', quotations: 4 },
  ],
}

export default function TransferSettingsPage() {
  const [fromSales, setFromSales] = useState('')
  const [toSales, setToSales] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [transferNote, setTransferNote] = useState('')

  const customers = fromSales ? (mockCustomersForSales[fromSales] ?? []) : []
  const filtered = customers.filter(
    (c) => c.name.includes(search) || c.id.includes(search)
  )

  const toggleCustomer = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedCustomers.length === filtered.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filtered.map((c) => c.id))
    }
  }

  const canTransfer = fromSales && toSales && fromSales !== toSales && selectedCustomers.length > 0

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">負責業務轉移</h2>
        <p className="text-sm text-muted-foreground mt-1">
          將客戶的負責業務從一位業務員轉移給另一位（主管 / 管理員限定）
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">選擇轉移方向</CardTitle>
          <CardDescription>選擇來源業務與目標業務</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label>來源業務</Label>
              <Select
                value={fromSales}
                onValueChange={(v) => {
                  setFromSales(v)
                  setSelectedCustomers([])
                  if (v === toSales) setToSales('')
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="選擇來源業務" />
                </SelectTrigger>
                <SelectContent>
                  {salesPeople.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mt-5 shrink-0" />
            <div className="flex-1">
              <Label>目標業務</Label>
              <Select
                value={toSales}
                onValueChange={setToSales}
                disabled={!fromSales}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="選擇目標業務" />
                </SelectTrigger>
                <SelectContent>
                  {salesPeople
                    .filter((s) => s !== fromSales)
                    .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {fromSales && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              選擇要轉移的客戶
              {selectedCustomers.length > 0 && (
                <Badge className="ml-2">{selectedCustomers.length} 已選</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-sm mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋客戶..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="space-y-2">
              {filtered.length > 0 && (
                <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30 mb-2">
                  <Checkbox
                    checked={selectedCustomers.length === filtered.length && filtered.length > 0}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm font-medium">全選</span>
                </div>
              )}
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer"
                  onClick={() => toggleCustomer(customer.id)}
                >
                  <Checkbox
                    checked={selectedCustomers.includes(customer.id)}
                    onCheckedChange={() => toggleCustomer(customer.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.id} · {customer.quotations} 張報價單
                    </p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  沒有符合條件的客戶
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {canTransfer && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            將轉移 {selectedCustomers.length} 位客戶（含其所有報價單）的負責業務：
            <strong> {fromSales}</strong> → <strong>{toSales}</strong>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!canTransfer}
          onClick={() => setShowConfirm(true)}
        >
          執行轉移
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認執行業務轉移？</AlertDialogTitle>
            <AlertDialogDescription>
              將 {selectedCustomers.length} 位客戶的負責業務從{' '}
              <strong>{fromSales}</strong> 轉移給 <strong>{toSales}</strong>。
              此操作將記錄於系統日誌，且無法自動還原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => setShowConfirm(false)}>
              確認轉移
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
