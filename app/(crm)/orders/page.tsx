'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  PackageCheck,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

import {
  type ProgressStatus,
  progressStatusConfig,
} from '@/lib/order-progress'

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockOrders = [
  {
    id: 'ORD-2026-0012',
    quotationId: 'QUO-2026-0045',
    customer: '遠東數位科技股份有限公司',
    project: '官網改版專案',
    amount: 'NT$ 350,000',
    sales: '王美玲',
    signedAt: '2026/04/10',
    deliveryAt: '2026/06/30',
    progressStatus: 'in_delivery' as ProgressStatus,
    progressPercent: 40,
  },
  {
    id: 'ORD-2026-0011',
    quotationId: 'QUO-2026-0041',
    customer: '新創智能開發有限公司',
    project: 'ERP 導入顧問服務',
    amount: 'NT$ 1,200,000',
    sales: '李大華',
    signedAt: '2026/04/05',
    deliveryAt: '2026/09/30',
    progressStatus: 'scheduling' as ProgressStatus,
    progressPercent: undefined,
  },
  {
    id: 'ORD-2026-0010',
    quotationId: 'QUO-2026-0038',
    customer: '宏安生醫科技有限公司',
    project: '患者管理系統',
    amount: 'NT$ 580,000',
    sales: '張小明',
    signedAt: '2026/03/20',
    deliveryAt: '2026/07/31',
    progressStatus: 'in_delivery' as ProgressStatus,
    progressPercent: 25,
  },
  {
    id: 'ORD-2026-0009',
    quotationId: 'QUO-2026-0033',
    customer: '承泰物流集團',
    project: '倉儲調度平台 Phase 1',
    amount: 'NT$ 3,200,000',
    sales: '王美玲',
    signedAt: '2026/03/01',
    deliveryAt: '2026/12/31',
    progressStatus: 'scheduling' as ProgressStatus,
    progressPercent: undefined,
  },
  {
    id: 'ORD-2026-0008',
    quotationId: 'QUO-2026-0029',
    customer: '瑞豐製造有限公司',
    project: '自動化報工系統',
    amount: 'NT$ 420,000',
    sales: '李大華',
    signedAt: '2026/02/15',
    deliveryAt: '2026/04/15',
    progressStatus: 'uat' as ProgressStatus,
    progressPercent: undefined,
  },
  {
    id: 'ORD-2026-0007',
    quotationId: 'QUO-2026-0025',
    customer: '天成光電股份有限公司',
    project: '品管追溯系統',
    amount: 'NT$ 280,000',
    sales: '張小明',
    signedAt: '2026/02/01',
    deliveryAt: '2026/04/12',
    progressStatus: 'delivered' as ProgressStatus,
    progressPercent: undefined,
  },
  {
    id: 'ORD-2026-0006',
    quotationId: 'QUO-2026-0021',
    customer: '永昌食品股份有限公司',
    project: '原物料採購模組',
    amount: 'NT$ 150,000',
    sales: '王美玲',
    signedAt: '2026/01/20',
    deliveryAt: '2026/03/31',
    progressStatus: 'closed' as ProgressStatus,
    progressPercent: undefined,
  },
  {
    id: 'ORD-2026-0005',
    quotationId: 'QUO-2026-0018',
    customer: '協賀電商平台有限公司',
    project: '商品庫存介接',
    amount: 'NT$ 95,000',
    sales: '李大華',
    signedAt: '2026/01/10',
    deliveryAt: '2026/02/28',
    progressStatus: 'pending_schedule' as ProgressStatus,
    progressPercent: undefined,
  },
]

// ── Progress status badge ─────────────────────────────────────────────────────

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

// ── Filter tabs config ─────────────────────────────────────────────────────────

const progressTabs: { value: string; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending_schedule', label: '待排程' },
  { value: 'scheduling', label: '排程中' },
  { value: 'in_delivery', label: '交付中' },
  { value: 'delivered', label: '已交付' },
  { value: 'uat', label: '驗收中' },
  { value: 'closed', label: '已結案' },
  { value: 'cancelled', label: '已取消' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [salesFilter, setSalesFilter] = useState('all')

  const filtered = mockOrders.filter((o) => {
    const matchTab =
      activeTab === 'all' || o.progressStatus === activeTab
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.project.toLowerCase().includes(search.toLowerCase())
    const matchSales = salesFilter === 'all' || o.sales === salesFilter
    return matchTab && matchSearch && matchSales
  })

  return (
    <div className="flex flex-col h-full">
      <TopBar breadcrumbs={[{ label: '訂單管理' }]} />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">訂單管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              共 {mockOrders.length} 筆訂單
            </p>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <PackageCheck className="h-4 w-4 mr-2" />
            匯出訂單
          </Button>
        </div>

        {/* Progress Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <div className="overflow-x-auto pb-1">
            <TabsList className="w-max">
              {progressTabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {t.value === 'all'
                      ? mockOrders.length
                      : mockOrders.filter(
                          (o) => o.progressStatus === t.value
                        ).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋訂單編號、客戶、專案..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={salesFilter} onValueChange={setSalesFilter}>
              <SelectTrigger className="flex-1 sm:w-36">
                <SelectValue placeholder="負責業務" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部業務</SelectItem>
                {['王美玲', '李大華', '張小明'].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden flex flex-col gap-3 mb-4">
          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              沒有符合條件的訂單
            </div>
          ) : (
            filtered.map((order) => (
              <div key={order.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm font-semibold text-primary hover:underline block"
                    >
                      {order.id}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      來自 {order.quotationId}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ProgressStatusBadge status={order.progressStatus} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/quotations/${order.quotationId}`}>
                            查看原始報價單
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          下載合約
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="font-medium text-foreground text-sm mb-1">
                  {order.customer}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {order.project}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-muted-foreground">金額</div>
                  <div className="font-medium text-foreground">{order.amount}</div>
                  <div className="text-muted-foreground">負責業務</div>
                  <div className="text-foreground">{order.sales}</div>
                  <div className="text-muted-foreground">成案日期</div>
                  <div className="text-foreground">{order.signedAt}</div>
                  <div className="text-muted-foreground">預計交付</div>
                  <div className="text-foreground">{order.deliveryAt}</div>
                  {order.progressPercent !== undefined && (
                    <>
                      <div className="text-muted-foreground">交付進度</div>
                      <div className="text-foreground">
                        {order.progressPercent}%
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單編號</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>專案名稱</TableHead>
                  <TableHead>金額</TableHead>
                  <TableHead>負責業務</TableHead>
                  <TableHead>成案日期</TableHead>
                  <TableHead>預計交付</TableHead>
                  <TableHead>進度狀態</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-12 text-muted-foreground"
                    >
                      沒有符合條件的訂單
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-mono text-sm font-medium text-blue-600 hover:underline"
                        >
                          {order.id}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          來自 {order.quotationId}
                        </p>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.customer}
                      </TableCell>
                      <TableCell className="text-sm">{order.project}</TableCell>
                      <TableCell className="font-medium">{order.amount}</TableCell>
                      <TableCell>{order.sales}</TableCell>
                      <TableCell className="text-sm">{order.signedAt}</TableCell>
                      <TableCell className="text-sm">{order.deliveryAt}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <ProgressStatusBadge status={order.progressStatus} />
                          {order.progressPercent !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{
                                    width: `${order.progressPercent}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {order.progressPercent}%
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/orders/${order.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看詳情
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/quotations/${order.quotationId}`}
                              >
                                查看原始報價單
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              下載合約
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <p>
            顯示 {filtered.length} / {mockOrders.length} 筆
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}
