'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  type ProgressStatus,
  progressStatusConfig,
  progressStatusFlow,
} from '@/lib/order-progress'

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockOrder = {
  id: 'ORD-2026-0012',
  quotationId: 'QUO-2026-0045',
  customer: '遠東數位科技股份有限公司',
  customerId: 'CUS-2026-0024',
  project: '官網改版專案',
  sales: '王美玲',
  signedAt: '2026/04/10',
  deliveryAt: '2026/06/30',
  progressStatus: 'in_delivery' as ProgressStatus,
  progressPercent: 40 as 0 | 25 | 50 | 75 | 100,
  scheduledOwner: '林設計師',
  scheduledStartAt: '2026/04/15',
  totalAmount: 350000,
  items: [
    { name: 'UI/UX 設計服務', qty: 1, unit: '式', unitPrice: 120000, total: 120000 },
    { name: '前端開發', qty: 1, unit: '式', unitPrice: 150000, total: 150000 },
    { name: '後端 API 串接', qty: 1, unit: '式', unitPrice: 60000, total: 60000 },
    { name: '教育訓練', qty: 2, unit: '場', unitPrice: 10000, total: 20000 },
  ],
  milestones: [
    { name: '合約簽署', date: '2026/04/10', done: true },
    { name: '設計稿交付', date: '2026/05/10', done: true },
    { name: '前端開發完成', date: '2026/06/01', done: false },
    { name: '測試驗收', date: '2026/06/20', done: false },
    { name: '正式上線', date: '2026/06/30', done: false },
  ],
  logs: [
    {
      date: '2026/04/20 11:10',
      user: '特助 林靜宜',
      action: '更新進度狀態：排程中 → 交付中（進度 40%）',
    },
    {
      date: '2026/04/12 09:30',
      user: '特助 林靜宜',
      action: '指派負責人：林設計師，預計開工 2026/04/15',
    },
    {
      date: '2026/04/10 14:22',
      user: '系統',
      action: '訂單由報價單 QUO-2026-0045 成案建立，進入「待排程」狀態',
    },
  ],
}

// ── Status badge ──────────────────────────────────────────────────────────────

function ProgressStatusBadge({ status }: { status: ProgressStatus }) {
  const cfg = progressStatusConfig[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

// ── State machine stepper ─────────────────────────────────────────────────────

function StateMachineStepper({
  current,
}: {
  current: ProgressStatus
}) {
  const steps = progressStatusFlow
  const currentIdx = steps.indexOf(current)

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isActive = step === current
        const isDone = i < currentIdx
        const cfg = progressStatusConfig[step]

        return (
          <div key={step} className="flex items-center">
            <div
              className={`flex flex-col items-center min-w-[72px] px-1 ${
                isActive ? 'opacity-100' : isDone ? 'opacity-70' : 'opacity-40'
              }`}
            >
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isDone
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30 bg-background text-muted-foreground'
                }`}
              >
                {isDone ? '✓' : i + 1}
              </div>
              <span
                className={`mt-1 text-center text-[10px] leading-tight ${
                  isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-6 shrink-0 transition-colors ${
                  i < currentIdx ? 'bg-green-500' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>(
    mockOrder.progressStatus
  )
  const [progressPercent, setProgressPercent] = useState<
    0 | 25 | 50 | 75 | 100
  >(mockOrder.progressPercent)

  const subtotal = mockOrder.items.reduce((sum, item) => sum + item.total, 0)
  const cfg = progressStatusConfig[progressStatus]

  const handleStatusChange = (next: ProgressStatus) => {
    setProgressStatus(next)
  }

  const isTerminal =
    progressStatus === 'closed' || progressStatus === 'cancelled'

  return (
    <div className="flex flex-col h-full">
      <TopBar
        breadcrumbs={[
          { label: '訂單管理', href: '/orders' },
          { label: mockOrder.id },
        ]}
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/orders">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{mockOrder.id}</h1>
                <ProgressStatusBadge status={progressStatus} />
                {progressStatus === 'in_delivery' && (
                  <span className="text-sm text-muted-foreground">
                    進度 {progressPercent}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {mockOrder.project}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/quotations/${mockOrder.quotationId}`}>
                <FileText className="h-4 w-4 mr-2" />
                查看原始報價單
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              下載合約
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">總覽</TabsTrigger>
            <TabsTrigger value="items">報價明細</TabsTrigger>
            <TabsTrigger value="milestones">里程碑</TabsTrigger>
            <TabsTrigger value="logs">異動歷史</TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: 總覽 ─── */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {/* Summary cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-muted-foreground">合約金額</p>
                      <p className="text-xl font-bold mt-1 sm:text-2xl">
                        NT$ {subtotal.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-muted-foreground">成案日期</p>
                      <p className="text-lg font-bold mt-1 sm:text-xl">
                        {mockOrder.signedAt}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2 sm:col-span-1">
                    <CardContent className="pt-5">
                      <p className="text-sm text-muted-foreground">預計交付</p>
                      <p className="text-lg font-bold mt-1 sm:text-xl">
                        {mockOrder.deliveryAt}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* State machine */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">專案進度狀態</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Stepper */}
                    <StateMachineStepper current={progressStatus} />

                    {/* Current status info */}
                    <div
                      className={`rounded-lg border p-4 ${cfg.className} bg-opacity-30`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {progressStatus === 'uat' ||
                          progressStatus === 'delivered' ? (
                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold">
                            目前狀態：{cfg.label}
                          </p>
                          {progressStatus === 'scheduling' && (
                            <p className="text-sm">
                              負責人：{mockOrder.scheduledOwner} · 預計開工：
                              {mockOrder.scheduledStartAt}
                            </p>
                          )}
                          {progressStatus === 'in_delivery' && (
                            <div className="space-y-1">
                              <p className="text-sm">
                                負責人：{mockOrder.scheduledOwner} · 開工：
                                {mockOrder.scheduledStartAt}
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/60">
                                  <div
                                    className="h-full rounded-full bg-blue-500 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {progressPercent}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Update controls */}
                    {!isTerminal && (
                      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 p-4">
                        <span className="text-sm font-medium">更新狀態：</span>

                        {/* Progress percent (only in_delivery) */}
                        {progressStatus === 'in_delivery' && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              進度
                            </span>
                            <Select
                              value={String(progressPercent)}
                              onValueChange={(v) =>
                                setProgressPercent(
                                  Number(v) as 0 | 25 | 50 | 75 | 100
                                )
                              }
                            >
                              <SelectTrigger className="h-8 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[0, 25, 50, 75, 100].map((p) => (
                                  <SelectItem key={p} value={String(p)}>
                                    {p}%
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Next state buttons */}
                        <div className="flex flex-wrap gap-2">
                          {cfg.nextStates.map((next) => {
                            const nextCfg = progressStatusConfig[next]
                            return (
                              <Button
                                key={next}
                                size="sm"
                                variant={
                                  next === 'cancelled'
                                    ? 'destructive'
                                    : 'outline'
                                }
                                className="h-8 text-xs"
                                onClick={() => handleStatusChange(next)}
                              >
                                → {nextCfg.label}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {isTerminal && (
                      <p className="text-sm text-muted-foreground">
                        此訂單已達終態（{cfg.label}），無法再變更狀態。
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Milestone progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">里程碑進度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockOrder.milestones.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {m.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${!m.done ? 'text-muted-foreground' : ''}`}
                            >
                              {m.name}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {m.date}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">客戶資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">客戶名稱</p>
                      <Link
                        href={`/customers/${mockOrder.customerId}`}
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        {mockOrder.customer}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">客戶編號</p>
                      <p className="font-mono font-medium mt-0.5">
                        {mockOrder.customerId}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground">負責業務</p>
                      <p className="font-medium mt-0.5">{mockOrder.sales}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">來源報價單</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={`/quotations/${mockOrder.quotationId}`}
                      className="text-sm font-mono text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {mockOrder.quotationId}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>

                {/* Status reference */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">狀態說明</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {progressStatusFlow.map((s) => {
                      const c = progressStatusConfig[s]
                      return (
                        <div key={s} className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.className} ${s === progressStatus ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                          >
                            {c.label}
                          </span>
                          {s === progressStatus && (
                            <span className="text-xs text-primary font-medium">
                              ← 目前
                            </span>
                          )}
                        </div>
                      )
                    })}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        已取消
                      </span>
                      <span className="text-xs text-muted-foreground">
                        任一階段可轉
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 2: 報價明細 ─── */}
          <TabsContent value="items">
            <Card>
              <CardContent className="pt-6 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>項目名稱</TableHead>
                      <TableHead className="text-right">數量</TableHead>
                      <TableHead>單位</TableHead>
                      <TableHead className="text-right">單價</TableHead>
                      <TableHead className="text-right">小計</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrder.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right">{item.qty}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell className="text-right font-mono">
                          NT$ {item.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium">
                          NT$ {item.total.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Separator className="my-4" />
                <div className="flex justify-end">
                  <div className="space-y-1 text-sm text-right">
                    <div className="flex justify-between gap-12">
                      <span className="text-muted-foreground">小計</span>
                      <span className="font-mono">
                        NT$ {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between gap-12">
                      <span className="text-muted-foreground">稅金 (5%)</span>
                      <span className="font-mono">
                        NT$ {Math.round(subtotal * 0.05).toLocaleString()}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between gap-12 text-base font-bold">
                      <span>合計</span>
                      <span className="font-mono">
                        NT$ {Math.round(subtotal * 1.05).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 3: 里程碑 ─── */}
          <TabsContent value="milestones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">里程碑管理</CardTitle>
                <Button size="sm">新增里程碑</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrder.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <div className="mt-0.5">
                        {m.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <p className="font-medium">{m.name}</p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                              m.done
                                ? 'border-green-200 bg-green-50 text-green-700'
                                : 'border-gray-200 bg-gray-100 text-gray-600'
                            }`}
                          >
                            {m.done ? '已完成' : '待完成'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          預計日期：{m.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 4: 異動歷史 ─── */}
          <TabsContent value="logs">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {mockOrder.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {log.date} · {log.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
