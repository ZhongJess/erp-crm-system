'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  Clock,
  Users,
  FileText,
  Send,
  ClipboardList,
  Bell,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'


// ── Types ─────────────────────────────────────────────────────────────────────

type Role = 'manager' | 'am'
type TimePeriod = '今日' | '本週' | '本月' | '本季' | '本年'

// ── Shared helpers ────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  unit?: string
  sub?: string
  progress?: number
  priority?: 'red' | 'orange'
  priorityLabel?: string
}

function KpiCard({
  label,
  value,
  unit,
  sub,
  progress,
  priority,
  priorityLabel,
}: KpiCardProps) {
  const borderCls =
    priority === 'red'
      ? 'border-2 border-red-400 bg-red-50/40'
      : priority === 'orange'
        ? 'border-2 border-orange-400 bg-orange-50/40'
        : ''

  return (
    <Card className={`relative ${borderCls}`}>
      {priorityLabel && (
        <span
          className={`absolute -top-2.5 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
            priority === 'orange' ? 'bg-orange-500' : 'bg-red-500'
          }`}
        >
          {priorityLabel}
        </span>
      )}
      <CardContent className="pb-4 pt-5">
        <p className="mb-2 text-sm text-muted-foreground">{label}</p>
        <div className="mb-1 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-foreground sm:text-3xl">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-medium text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        {progress !== undefined && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TimeFilter({
  options,
  active,
  onSelect,
}: {
  options: TimePeriod[]
  active: TimePeriod
  onSelect: (v: TimePeriod) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            opt === active
              ? 'bg-foreground text-background'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Mock data: Manager ────────────────────────────────────────────────────────

const managerPendingReviews = [
  {
    id: 'Q-20260420-003',
    customer: '遠東數位科技股份有限公司',
    amount: 450000,
    am: '王美玲',
    sentAt: '2026/04/20 10:22',
    waitDays: 0,
    alert: false,
  },
  {
    id: 'Q-20260419-007',
    customer: '宏安生醫有限公司',
    amount: 280000,
    am: '李大華',
    sentAt: '2026/04/19 16:40',
    waitDays: 1,
    alert: false,
  },
  {
    id: 'Q-20260418-012',
    customer: '承泰物流集團',
    amount: 1200000,
    am: '王美玲',
    sentAt: '2026/04/18 09:15',
    waitDays: 2,
    alert: true,
  },
  {
    id: 'Q-20260419-010',
    customer: '天成光電股份有限公司',
    amount: 75000,
    am: '張小明',
    sentAt: '2026/04/19 14:02',
    waitDays: 1,
    alert: false,
  },
  {
    id: 'Q-20260420-001',
    customer: '遠東數位科技股份有限公司',
    amount: 95000,
    am: '李大華',
    sentAt: '2026/04/20 09:08',
    waitDays: 0,
    alert: false,
  },
]

const managerFunnel = [
  { stage: '草稿', count: 12, amountWan: 180, pct: 100, color: 'bg-gray-300' },
  { stage: '待審核', count: 5, amountWan: 210, pct: 85, color: 'bg-blue-300' },
  {
    stage: '已報價',
    count: 18,
    amountWan: 420,
    pct: 70,
    color: 'bg-blue-400',
  },
  {
    stage: '議價中',
    count: 28,
    amountWan: 892,
    pct: 55,
    color: 'bg-amber-400',
  },
  {
    stage: '已成案',
    count: 17,
    amountWan: 167,
    pct: 30,
    color: 'bg-green-500',
  },
  { stage: '未成案', count: 8, amountWan: 62, pct: 15, color: 'bg-gray-400' },
]

const amRanking = [
  { name: '王美玲', role: 'AM', amountWan: 78, pct: 100 },
  { name: '李大華', role: 'AM', amountWan: 56, pct: 72 },
  { name: '張小明', role: 'PM', amountWan: 33, pct: 42 },
]

const bigDeals = [
  {
    customer: '承泰物流集團',
    amountWan: 320,
    am: '王美玲',
    lastContact: '2026/04/18',
    alert: false,
    alertText: '',
  },
  {
    customer: '瑞豐製造有限公司',
    amountWan: 180,
    am: '李大華',
    lastContact: '2026/04/17',
    alert: false,
    alertText: '',
  },
  {
    customer: '遠東數位科技',
    amountWan: 145,
    am: '王美玲',
    lastContact: '2026/04/15',
    alert: false,
    alertText: '',
  },
  {
    customer: '協賀電商平台',
    amountWan: 98,
    am: '張小明',
    lastContact: '2026/04/12',
    alert: true,
    alertText: '8 天未聯絡',
  },
  {
    customer: '新創智能開發',
    amountWan: 86,
    am: '李大華',
    lastContact: '2026/04/19',
    alert: false,
    alertText: '',
  },
]

// ── Mock data: AM ─────────────────────────────────────────────────────────────

const amTodos = [
  {
    type: 'call',
    title: '追 Q-20260418-012 報價回覆',
    customer: '承泰物流集團 · 林經理',
    time: '10:30',
    done: false,
  },
  {
    type: 'visit',
    title: 'Q2 新案訪談',
    customer: '遠東數位科技 · 陳協理',
    time: '14:00',
    done: false,
  },
  {
    type: 'followup',
    title: '請特助開報價單',
    customer: '瑞豐製造有限公司 · 新詢價 180 萬',
    time: '15:00',
    done: false,
  },
  {
    type: 'call',
    title: '議價條件回覆',
    customer: '新創智能開發 · 黃總',
    time: '16:30',
    done: false,
  },
  {
    type: 'visit',
    title: '合約簽署',
    customer: '宏安生醫 · 張總',
    time: '17:00',
    done: false,
  },
]

const contactReminders = [
  { customer: '協賀電商平台', daysAgo: 12, alert: true },
  { customer: '盛泰印刷有限公司', daysAgo: 18, alert: true },
  { customer: '慧聯顧問有限公司', daysAgo: 45, alert: false },
]

const amQuotes = [
  {
    id: 'Q-20260418-012',
    customer: '承泰物流集團',
    amountWan: 320,
    status: '議價中',
    statusOk: false,
  },
  {
    id: 'Q-20260415-005',
    customer: '遠東數位科技',
    amountWan: 145,
    status: '議價中',
    statusOk: false,
  },
  {
    id: 'Q-20260419-010',
    customer: '天成光電',
    amountWan: 7.5,
    status: '待審核',
    statusOk: false,
  },
  {
    id: 'Q-20260417-003',
    customer: '瑞豐製造',
    amountWan: 180,
    status: '已報價',
    statusOk: true,
  },
]

// ── Mock data: Assistant ──────────────────────────────────────────────────────

const pendingSendQuotes = [
  {
    id: 'Q-20260420-003',
    customer: '遠東數位科技股份有限公司',
    amount: 450000,
    am: '王美玲',
    approvedAt: '2026/04/20 11:05',
    contact: '陳協理',
  },
  {
    id: 'Q-20260419-007',
    customer: '宏安生醫有限公司',
    amount: 280000,
    am: '李大華',
    approvedAt: '2026/04/20 09:42',
    contact: '張總',
  },
  {
    id: 'Q-20260419-008',
    customer: '永昌食品股份有限公司',
    amount: 156000,
    am: '王美玲',
    approvedAt: '2026/04/19 17:20',
    contact: '吳經理',
  },
]

const noReply = [
  {
    customer: '承泰物流集團',
    quoteId: 'Q-20260412-012',
    days: 8,
    am: '王美玲',
    alert: true,
  },
  {
    customer: '盛泰印刷有限公司',
    quoteId: 'Q-20260414-009',
    days: 6,
    am: '張小明',
    alert: true,
  },
  {
    customer: '永昌食品股份有限公司',
    quoteId: 'Q-20260415-004',
    days: 5,
    am: '李大華',
    alert: false,
  },
]


// ── Manager Dashboard ─────────────────────────────────────────────────────────

function ManagerDashboard() {
  const [period, setPeriod] = useState<TimePeriod>('本月')
  const closedPct = Math.round((167 / 200) * 100)

  const todoType = (type: string) => {
    if (type === 'call')
      return 'border-blue-300 bg-blue-50/60 text-blue-700'
    if (type === 'visit')
      return 'border-purple-300 bg-purple-50/60 text-purple-700'
    return 'border-orange-300 bg-orange-50/60 text-orange-700'
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            早安，陳經理 — 最重要動作：<strong>審核報價單</strong>
          </p>
        </div>
        <TimeFilter
          options={['今日', '本週', '本月', '本季', '本年']}
          active={period}
          onSelect={setPeriod}
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="待我審核報價單"
          value="5"
          unit="件"
          sub="最久已等待 2 天 · 點擊進入審核列表"
          priority="red"
          priorityLabel="最優先"
        />
        <KpiCard
          label="本月成案金額"
          value="NT$ 167"
          unit="萬"
          sub={`達成率 ${closedPct}%（目標 200 萬）`}
          progress={closedPct}
        />
        <KpiCard
          label="Pipeline 總金額"
          value="NT$ 892"
          unit="萬"
          sub="議價中 28 件 · ↑ vs 上月 +12%"
        />
        <KpiCard
          label="本月新增客戶"
          value="24"
          unit="家"
          sub="較上月 +3 位"
        />
      </div>

      {/* 待審核 + 漏斗 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* 待審核列表 */}
        <Card className="border-2 border-primary/40 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              待我審核的報價單
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                5
              </span>
            </CardTitle>
            <Link
              href="/quotations"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              全部審核
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {/* Mobile cards */}
            <div className="space-y-3 sm:hidden">
              {managerPendingReviews.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-lg border p-3 ${q.alert ? 'border-red-300 bg-red-50/30' : 'border-border'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-medium text-primary">
                        {q.id}
                      </p>
                      <p className="mt-0.5 text-sm font-medium truncate">
                        {q.customer}
                      </p>
                    </div>
                    <Button size="sm" className="h-7 shrink-0 text-xs" asChild>
                      <Link href={`/quotations/${q.id}`}>審核</Link>
                    </Button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-muted-foreground">金額</span>
                    <span>NT$ {q.amount.toLocaleString()}</span>
                    <span className="text-muted-foreground">負責 AM</span>
                    <span>{q.am}</span>
                    <span className="text-muted-foreground">送審時間</span>
                    <span>{q.sentAt}</span>
                    <span className="text-muted-foreground">等待</span>
                    <span
                      className={
                        q.alert ? 'font-medium text-red-600' : ''
                      }
                    >
                      {q.waitDays === 0 ? '今日' : `${q.waitDays} 天`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>編號</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>負責 AM</TableHead>
                    <TableHead>送審時間</TableHead>
                    <TableHead>等待</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managerPendingReviews.map((q) => (
                    <TableRow
                      key={q.id}
                      className={q.alert ? 'bg-red-50/30' : ''}
                    >
                      <TableCell className="font-mono text-xs text-primary">
                        {q.id}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate font-medium">
                        {q.customer}
                      </TableCell>
                      <TableCell className="text-right">
                        NT$ {q.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{q.am}</TableCell>
                      <TableCell className="text-sm">{q.sentAt}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                            q.alert
                              ? 'border-red-200 bg-red-50 text-red-600'
                              : 'border-gray-200 bg-gray-100 text-gray-600'
                          }`}
                        >
                          {q.waitDays === 0 ? '今日' : `${q.waitDays} 天`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          asChild
                        >
                          <Link href={`/quotations/${q.id}`}>審核</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 報價單漏斗 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">報價單漏斗</CardTitle>
            <Link
              href="/quotations"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              詳細報表
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {managerFunnel.map((item) => (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-xs text-muted-foreground">
                      NT$ {item.amountWan} 萬
                    </span>
                  </div>
                </div>
                <div className="h-5 overflow-hidden rounded-sm bg-muted">
                  <div
                    className={`h-full rounded-sm ${item.color} transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AM 排行 + 大額案件 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* AM 排行 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-muted-foreground" />
              AM / PM 本月業績排行
            </CardTitle>
            <Link
              href="/quotations"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              完整報表
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {amRanking.map((person) => (
              <div key={person.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {person.name[0]}
                    </div>
                    <span className="font-medium">{person.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {person.role}
                    </span>
                  </div>
                  <span className="font-semibold">
                    NT$ {person.amountWan} 萬
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${person.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 大額議價中 Top 5 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">大額議價中案件 Top 5</CardTitle>
            <Link
              href="/quotations"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              全部查看
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-2 sm:hidden">
              {bigDeals.map((deal) => (
                <div
                  key={deal.customer}
                  className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                >
                  <div>
                    <p className="font-medium">{deal.customer}</p>
                    <p className="text-xs text-muted-foreground">
                      AM {deal.am}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">NT$ {deal.amountWan} 萬</p>
                    {deal.alert ? (
                      <span className="text-xs font-medium text-orange-600">
                        {deal.alertText}
                      </span>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {deal.lastContact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>AM</TableHead>
                    <TableHead>最近聯絡</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bigDeals.map((deal) => (
                    <TableRow key={deal.customer}>
                      <TableCell className="font-medium">
                        {deal.customer}
                      </TableCell>
                      <TableCell className="text-right">
                        NT$ {deal.amountWan} 萬
                      </TableCell>
                      <TableCell>{deal.am}</TableCell>
                      <TableCell>
                        <span className="text-sm">{deal.lastContact}</span>
                        {deal.alert && (
                          <span className="ml-2 rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-xs font-medium text-orange-600">
                            {deal.alertText}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 客戶集中度/風險警示 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">客戶集中度 / 風險警示</CardTitle>
          <Link
            href="/customers"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            查看完整風險報告
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">[ 圓餅圖 ] 客戶佔營收比例</p>
              <p className="mt-1 text-xs">
                單一客戶佔營收 &gt; 30% 警示 · 近 90 天無互動大客戶清單
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── AM / PM Dashboard ─────────────────────────────────────────────────────────

function AmDashboard() {
  const [period, setPeriod] = useState<TimePeriod>('今日')
  const [todoStates, setTodoStates] = useState(amTodos.map(() => false))

  const toggleTodo = (i: number) =>
    setTodoStates((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  const todoTypeCls = (type: string) => {
    if (type === 'call') return 'border-blue-300 bg-blue-50/70 text-blue-700'
    if (type === 'visit') return 'border-purple-300 bg-purple-50/70 text-purple-700'
    return 'border-orange-300 bg-orange-50/70 text-orange-700'
  }
  const todoTypeLabel = (type: string) =>
    type === 'call' ? '通話' : type === 'visit' ? '拜訪' : '追蹤'

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            早安，王美玲 — 最重要動作：<strong>處理今日待辦、追客戶</strong>
          </p>
        </div>
        <TimeFilter
          options={['今日', '本週', '本月', '本季']}
          active={period}
          onSelect={setPeriod}
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="今日待辦"
          value={String(amTodos.length)}
          unit="件"
          sub="3 通話 · 2 拜訪 · 2 追蹤"
          priority="red"
          priorityLabel="待辦"
        />
        <KpiCard
          label="經理已審核報價單"
          value={String(pendingSendQuotes.length)}
          unit="件"
          sub="待寄送給客戶"
          priority="orange"
          priorityLabel="待寄送"
        />
        <KpiCard
          label="待客戶回覆報價單"
          value={String(noReply.length)}
          unit="件"
          sub="平均寄送後 4.2 天"
        />
        <KpiCard
          label="進行中的報價單"
          value={String(amQuotes.length)}
          unit="件"
          sub="草稿 2 · 待審 1 · 議價中 6"
        />
      </div>

      {/* 今日待辦 + 客戶互動紀錄提醒 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* 今日待辦 */}
        <Card className="border-2 border-primary/40 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              今日待辦
              <span className="rounded-full bg-gray-600 px-2 py-0.5 text-xs font-semibold text-white">
                {amTodos.length}
              </span>
            </CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              新增 +
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {amTodos.map((todo, i) => (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <button
                    onClick={() => toggleTodo(i)}
                    className={`h-4 w-4 shrink-0 rounded border-2 transition-colors ${
                      todoStates[i] ? 'border-primary bg-primary' : 'border-muted-foreground/50'
                    }`}
                  />
                  <span className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium ${todoTypeCls(todo.type)}`}>
                    {todoTypeLabel(todo.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${todoStates[i] ? 'line-through text-muted-foreground' : ''}`}>
                      {todo.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{todo.customer}</p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-muted-foreground">{todo.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 客戶互動紀錄提醒 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-muted-foreground" />
              客戶互動紀錄提醒
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                {contactReminders.filter((r) => r.alert).length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {contactReminders.map((r) => (
                <div key={r.customer} className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.customer}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                      r.alert ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-100 text-gray-600'
                    }`}>
                      {r.daysAgo} 天前
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="h-7 shrink-0 text-xs">
                    登錄聯絡
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 經理已審核報價單 (全寬，高亮) */}
      <Card className="border-2 border-primary/40">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-muted-foreground" />
            經理已審核報價單 · 待寄送給客戶
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {pendingSendQuotes.length}
            </span>
          </CardTitle>
          <Link href="/quotations" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            報價管理
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {/* Mobile */}
          <div className="space-y-3 sm:hidden">
            {pendingSendQuotes.map((q) => (
              <div key={q.id} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-primary">{q.id}</p>
                    <p className="mt-0.5 text-sm font-medium truncate">{q.customer}</p>
                  </div>
                  <Button size="sm" className="h-7 shrink-0 text-xs">寄送</Button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-muted-foreground">金額</span>
                  <span>NT$ {q.amount.toLocaleString()}</span>
                  <span className="text-muted-foreground">負責 AM</span>
                  <span>{q.am}</span>
                  <span className="text-muted-foreground">核准時間</span>
                  <span>{q.approvedAt}</span>
                  <span className="text-muted-foreground">聯絡窗口</span>
                  <span>{q.contact}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Desktop */}
          <div className="hidden overflow-x-auto sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>編號</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>負責 AM</TableHead>
                  <TableHead>核准時間</TableHead>
                  <TableHead>聯絡窗口</TableHead>
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingSendQuotes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs text-primary">{q.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">{q.customer}</TableCell>
                    <TableCell className="text-right">NT$ {q.amount.toLocaleString()}</TableCell>
                    <TableCell>{q.am}</TableCell>
                    <TableCell className="text-sm">{q.approvedAt}</TableCell>
                    <TableCell className="text-sm">{q.contact}</TableCell>
                    <TableCell>
                      <Button size="sm" className="h-7 text-xs">寄送</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 待客戶回覆 + 進行中報價 */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 待客戶回覆報價單 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              待客戶回覆報價單
            </CardTitle>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              提醒 AM
            </Button>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-2 sm:hidden">
              {noReply.map((item) => (
                <div key={item.customer} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                  <div>
                    <p className="font-medium">{item.customer}</p>
                    <p className="text-xs text-muted-foreground">AM {item.am}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    item.alert ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-100 text-gray-600'
                  }`}>
                    {item.days} 天
                  </span>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>客戶</TableHead>
                    <TableHead>報價單</TableHead>
                    <TableHead>已寄送</TableHead>
                    <TableHead>AM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noReply.map((item) => (
                    <TableRow key={item.customer}>
                      <TableCell className="font-medium">{item.customer}</TableCell>
                      <TableCell className="font-mono text-xs">{item.quoteId}</TableCell>
                      <TableCell>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          item.alert ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-100 text-gray-600'
                        }`}>
                          {item.days} 天
                        </span>
                      </TableCell>
                      <TableCell>{item.am}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 進行中的報價單 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" />
              進行中的報價單
            </CardTitle>
            <Link href="/quotations" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              全部
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {/* Mobile */}
            <div className="space-y-2 sm:hidden">
              {amQuotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-primary">{q.id}</p>
                    <p className="font-medium truncate">{q.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">NT$ {q.amountWan} 萬</p>
                    <span className={`text-xs font-medium ${q.statusOk ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop */}
            <div className="hidden overflow-x-auto sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>編號</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead className="text-right">金額</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amQuotes.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-xs text-primary">{q.id}</TableCell>
                      <TableCell className="font-medium">{q.customer}</TableCell>
                      <TableCell className="text-right">NT$ {q.amountWan} 萬</TableCell>
                      <TableCell>
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          q.statusOk ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'
                        }`}>
                          {q.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [role, setRole] = useState<Role>('manager')

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar breadcrumbs={[{ label: '客戶總覽' }]} />

      <main className="flex-1 p-4 md:p-6 xl:p-8 space-y-6">
        {/* Role switcher (mock / dev) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">客戶總覽</h1>
            <p className="text-sm text-muted-foreground">2026/04/20 — 週一</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-yellow-200 bg-yellow-50 px-2 py-0.5 text-xs text-yellow-700">
              Dev 模式：切換角色預覽
            </span>
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as Role)}
            >
              <TabsList>
                <TabsTrigger value="manager">經理</TabsTrigger>
                <TabsTrigger value="am">AM · PM · 特助</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {role === 'manager' && <ManagerDashboard />}
        {role === 'am' && <AmDashboard />}
      </main>
    </div>
  )
}
