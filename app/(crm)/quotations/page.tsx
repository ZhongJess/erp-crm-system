'use client'

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { type DateRange } from 'react-day-picker'
import { zhTW } from 'date-fns/locale'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  FileX,
  Download,
  Trash2,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  SlidersHorizontal,
  ArrowDownUp,
  CalendarIcon,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

type ColSortKey = 'id' | 'date' | 'amount'
type ColSortDir = 'asc' | 'desc'
type ColSort = { key: ColSortKey | null; dir: ColSortDir | null }
type SortKey = 'newest' | 'updated' | 'amount_desc' | 'amount_asc' | 'oldest'

// ── Mock data ──────────────────────────────────────────────────────────────────

const mockQuotations = [
  {
    id: 'QUO-2025-0046',
    customer: '台灣數位科技',
    project: '行動 APP 開發',
    amount: 'NT$ 420,000',
    amountNum: 420000,
    sales: '特助 林雅婷',
    date: '2025-04-13',
    updatedAt: '2025-04-14',
    version: 'V1',
    status: 'pending_review',
  },
  {
    id: 'QUO-2025-0045',
    customer: '台灣數位科技',
    project: '官網改版專案',
    amount: 'NT$ 350,000',
    amountNum: 350000,
    sales: '王小明',
    date: '2025-04-12',
    updatedAt: '2025-04-13',
    version: 'V2',
    status: 'negotiating',
  },
  {
    id: 'QUO-2025-0044',
    customer: '創新軟體開發',
    project: '雲端遷移服務',
    amount: 'NT$ 280,000',
    amountNum: 280000,
    sales: '李美麗',
    date: '2025-04-10',
    updatedAt: '2025-04-10',
    version: 'V1',
    status: 'quoted',
  },
  {
    id: 'QUO-2025-0043',
    customer: '智慧製造公司',
    project: 'IoT 感測器整合',
    amount: 'NT$ 520,000',
    amountNum: 520000,
    sales: '王小明',
    date: '2025-04-08',
    updatedAt: '2025-04-09',
    version: 'V1',
    status: 'draft',
  },
  {
    id: 'QUO-2025-0042',
    customer: '東方貿易公司',
    project: '進銷存系統',
    amount: 'NT$ 680,000',
    amountNum: 680000,
    sales: '陳志偉',
    date: '2025-04-05',
    updatedAt: '2025-04-07',
    version: 'V3',
    status: 'won',
  },
  {
    id: 'QUO-2025-0041',
    customer: '台北金融科技',
    project: '資安檢測服務',
    amount: 'NT$ 150,000',
    amountNum: 150000,
    sales: '李美麗',
    date: '2025-04-01',
    updatedAt: '2025-04-03',
    version: 'V1',
    status: 'lost',
  },
  {
    id: 'QUO-2025-0040',
    customer: '南部製造公司',
    project: '舊系統維護',
    amount: 'NT$ 80,000',
    amountNum: 80000,
    sales: '張小芬',
    date: '2025-03-28',
    updatedAt: '2025-03-30',
    version: 'V1',
    status: 'void',
  },
]

const statusTabs = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending_review', label: '待審核' },
  { value: 'quoted', label: '已報價' },
  { value: 'negotiating', label: '議價中' },
  { value: 'won', label: '已成案' },
  { value: 'lost', label: '未成案' },
  { value: 'void', label: '作廢' },
]

const statusBadgeStyles: Record<string, string> = {
  draft: 'bg-draft-bg text-draft-text border-draft-border',
  pending_review: 'bg-pending-review-bg text-pending-review-text border-pending-review-border',
  quoted: 'bg-quoted-bg text-quoted-text border-quoted-border',
  negotiating: 'bg-negotiating-bg text-negotiating-text border-negotiating-border',
  won: 'bg-won-bg text-won-text border-won-border',
  lost: 'bg-lost-bg text-lost-text border-lost-border',
  void: 'bg-void-bg text-void-text border-void-border',
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  pending_review: '待審核',
  quoted: '已報價',
  negotiating: '議價中',
  won: '已成案',
  lost: '未成案',
  void: '作廢',
}

const salesPeople = ['全部業務', '王小明', '李美麗', '陳志偉', '張小芬', '特助 林雅婷']

const DATE_PRESETS = ['今天', '本週', '本月', '上個月', '本季', '今年'] as const

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (d: Date) => d.toISOString().slice(0, 10)

function getDatePreset(preset: string): { from: string; to: string } {
  const now = new Date()
  switch (preset) {
    case '今天': return { from: fmt(now), to: fmt(now) }
    case '本週': {
      const mon = new Date(now)
      mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      return { from: fmt(mon), to: fmt(now) }
    }
    case '本月':
      return {
        from: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        to: fmt(now),
      }
    case '上個月': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: fmt(start), to: fmt(end) }
    }
    case '本季': {
      const q = Math.floor(now.getMonth() / 3)
      const start = new Date(now.getFullYear(), q * 3, 1)
      return { from: fmt(start), to: fmt(now) }
    }
    case '今年':
      return { from: `${now.getFullYear()}-01-01`, to: fmt(now) }
    default:
      return { from: '', to: '' }
  }
}

// ── Sort indicator component ───────────────────────────────────────────────────

function SortIcon({ col, colSort }: { col: ColSortKey; colSort: ColSort }) {
  if (colSort.key !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-30 inline" />
  if (colSort.dir === 'asc') return <ChevronUp className="h-3 w-3 ml-1 text-primary inline" />
  return <ChevronDown className="h-3 w-3 ml-1 text-primary inline" />
}

// ── Page ───────────────────────────────────────────────────────────────────────

function QuotationsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State (initialised from URL params) ───────────────────────────────────────
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('q') ?? '')
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? 'all')
  const [salesFilter, setSalesFilter] = useState(() => searchParams.get('sales') ?? '全部業務')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (!from) return undefined
    return {
      from: new Date(from + 'T00:00:00'),
      to: to ? new Date(to + 'T00:00:00') : undefined,
    }
  })
  const [sortKey, setSortKey] = useState<SortKey>(() => (searchParams.get('sort') as SortKey) ?? 'newest')
  const [colSort, setColSort] = useState<ColSort>({ key: null, dir: null })
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [quotations, setQuotations] = useState(mockQuotations)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

  // ── 300 ms debounce ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Sync state → URL ──────────────────────────────────────────────────────────
  const fmt = (d: Date) => d.toISOString().slice(0, 10)

  const syncUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (salesFilter !== '全部業務') params.set('sales', salesFilter)
    if (dateRange?.from) params.set('from', fmt(dateRange.from))
    if (dateRange?.to) params.set('to', fmt(dateRange.to))
    if (sortKey !== 'newest') params.set('sort', sortKey)
    const str = params.toString()
    router.replace(str ? `?${str}` : '?', { scroll: false })
  }, [debouncedSearch, statusFilter, salesFilter, dateRange, sortKey, router])

  useEffect(() => { syncUrl() }, [syncUrl])

  // ── Active filter count ────────────────────────────────────────────────────────
  const activeFilterCount = [
    !!debouncedSearch,
    statusFilter !== 'all',
    salesFilter !== '全部業務',
    !!dateRange,
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0 || sortKey !== 'newest'

  // ── Clear filters ──────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearchInput('')
    setStatusFilter('all')
    setSalesFilter('全部業務')
    setDateRange(undefined)
    setSortKey('newest')
    setColSort({ key: null, dir: null })
    setActivePreset(null)
  }

  // ── Date preset ────────────────────────────────────────────────────────────────
  const applyDatePreset = (preset: string) => {
    if (activePreset === preset) {
      setDateRange(undefined)
      setActivePreset(null)
    } else {
      const { from, to } = getDatePreset(preset)
      setDateRange({
        from: from ? new Date(from + 'T00:00:00') : undefined,
        to: to ? new Date(to + 'T00:00:00') : undefined,
      })
      setActivePreset(preset)
    }
  }

  // ── Column sort (3-state) ──────────────────────────────────────────────────────
  const toggleColSort = (col: ColSortKey) => {
    setColSort((prev) => {
      if (prev.key !== col) return { key: col, dir: 'asc' }
      if (prev.dir === 'asc') return { key: col, dir: 'desc' }
      return { key: null, dir: null }
    })
  }

  // ── Filter + sort ──────────────────────────────────────────────────────────────
  const fromStr = dateRange?.from ? fmt(dateRange.from) : ''
  const toStr = dateRange?.to ? fmt(dateRange.to) : ''

  const fmtDisplay = (d: Date) => fmt(d).replace(/-/g, '.')

  const dateBtnLabel = (() => {
    if (activePreset) return activePreset
    if (!dateRange?.from) return '全部日期'
    if (!dateRange.to) return fmtDisplay(dateRange.from)
    return `${fmtDisplay(dateRange.from)} - ${fmtDisplay(dateRange.to)}`
  })()

  const processedQuotations = quotations
    .filter((q) => {
      const query = debouncedSearch.toLowerCase()
      return (
        (!query || q.id.toLowerCase().includes(query) || q.customer.toLowerCase().includes(query) || q.project.toLowerCase().includes(query)) &&
        (statusFilter === 'all' || q.status === statusFilter) &&
        (salesFilter === '全部業務' || q.sales === salesFilter) &&
        (!fromStr || q.date >= fromStr) &&
        (!toStr || q.date <= toStr)
      )
    })
    .sort((a, b) => {
      if (colSort.key && colSort.dir) {
        let cmp = 0
        if (colSort.key === 'id') cmp = a.id.localeCompare(b.id)
        else if (colSort.key === 'date') cmp = a.date.localeCompare(b.date)
        else if (colSort.key === 'amount') cmp = a.amountNum - b.amountNum
        return colSort.dir === 'asc' ? cmp : -cmp
      }
      switch (sortKey) {
        case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'updated': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'amount_desc': return b.amountNum - a.amountNum
        case 'amount_asc': return a.amountNum - b.amountNum
        default: return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

  const allFilteredSelected =
    processedQuotations.length > 0 &&
    processedQuotations.every((q) => selectedIds.has(q.id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(processedQuotations.map((q) => q.id)))
    }
  }

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleBulkDelete = () => {
    const count = selectedIds.size
    setQuotations((prev) => prev.filter((q) => !selectedIds.has(q.id)))
    setSelectedIds(new Set())
    setShowDeleteDialog(false)
    setDeleteConfirmInput('')
    toast.success(`已刪除 ${count} 筆報價單`)
  }

  const handleOpenDeleteDialog = () => {
    setDeleteConfirmInput('')
    setShowDeleteDialog(true)
  }

  // ── Filter controls (shared between inline and Sheet) ──────────────────────────
  const PresetChips = ({ onSelect }: { onSelect?: () => void }) => (
    <div className="flex flex-wrap gap-1.5">
      {DATE_PRESETS.map((p) => (
        <button
          key={p}
          onClick={() => { applyDatePreset(p); onSelect?.() }}
          className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
            activePreset === p
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )

  const FilterControls = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className="flex flex-col gap-2 xl:flex-row xl:flex-nowrap xl:items-center">
      {/* Search — flex-1 */}
      <div className="relative w-full xl:flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-testid="search-input"
          placeholder="搜尋報價單號、客戶、案件..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 h-9 text-sm w-full"
        />
      </div>

      {/* Dropdowns row */}
      <div className="flex gap-2 shrink-0">
        <Select value={salesFilter} onValueChange={setSalesFilter}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="全部業務" />
          </SelectTrigger>
          <SelectContent>
            {salesPeople.map((person) => (
              <SelectItem key={person} value={person}>
                {person}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date */}
      <div className="shrink-0">
        {inSheet ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">日期區間</p>
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => { setDateRange(range); setActivePreset(null) }}
              numberOfMonths={1}
              locale={zhTW}
              className="mx-auto"
            />
            <PresetChips />
            {dateRange?.from && (
              <p className="text-xs text-center text-muted-foreground">{dateBtnLabel}</p>
            )}
          </div>
        ) : (
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full md:w-[236px] h-9 text-sm justify-start gap-2 font-normal ${
                  dateRange ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{dateBtnLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => { setDateRange(range); setActivePreset(null) }}
                numberOfMonths={2}
                locale={zhTW}
              />
              <div className="border-t p-3">
                <PresetChips onSelect={() => setDatePickerOpen(false)} />
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Clear — far right on xl */}
      {!inSheet && (
        <button
          onClick={clearFilters}
          className="hidden xl:flex xl:ml-auto items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 whitespace-nowrap"
        >
          <X className="h-3 w-3" />
          清除重選
        </button>
      )}

      {/* Clear — below filter rows on md–xl */}
      {!inSheet && (
        <button
          onClick={clearFilters}
          className="hidden md:flex xl:hidden items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
          清除重選
        </button>
      )}
    </div>
  )

  const SortBar = () => (
    <div className="flex items-center justify-between">
      <span data-testid="result-count" className="text-sm text-muted-foreground">
        顯示 {processedQuotations.length} 筆，共 {quotations.length} 筆
      </span>
      <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
        <SelectTrigger className="w-auto h-8 text-sm border-0 shadow-none bg-transparent gap-1.5 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:ring-0">
          <ArrowDownUp className="h-3.5 w-3.5 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="newest">最新建立</SelectItem>
          <SelectItem value="updated">最近更新</SelectItem>
          <SelectItem value="amount_desc">金額高 → 低</SelectItem>
          <SelectItem value="amount_asc">金額低 → 高</SelectItem>
          <SelectItem value="oldest">建立時間最舊</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        breadcrumbs={[
          { label: '報價與合約', href: '/quotations' },
          { label: '報價單列表' },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">報價與合約</h1>
            <p className="text-sm text-muted-foreground mt-1">管理所有報價單與合約文件</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              匯出
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/quotations/new">
                <Plus className="h-4 w-4" />
                新增報價
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 bg-card rounded-lg border border-border p-3">
          {/* Status tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-muted flex-wrap h-auto gap-1 p-1">
              {statusTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-card"
                >
                  {tab.label}
                  {tab.value !== 'all' && (
                    <span className="ml-1.5 text-sm text-muted-foreground">
                      {mockQuotations.filter((q) => q.status === tab.value).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Mobile (<768): search + Sheet trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                  篩選
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
                <SheetHeader className="mb-4">
                  <SheetTitle>篩選條件</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 pb-4">
                  <FilterControls inSheet />
                  {hasActiveFilters && (
                    <button
                      onClick={() => { clearFilters(); setMobileSheetOpen(false) }}
                      className="text-sm text-destructive hover:underline text-left"
                    >
                      清除所有篩選
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Tablet (768–1279): flex-wrap / Desktop (≥1280): single row */}
          <div className="hidden md:block">
            <FilterControls />
          </div>
        </div>

        {/* Sort bar — between filter card and results */}
        <SortBar />

        {/* Bulk Action Bar */}
        {someSelected && (
          <div
            data-testid="bulk-action-bar"
            className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-2.5"
          >
            <span className="text-sm font-medium text-primary">
              已選取 {selectedIds.size} 項
            </span>
            <div className="flex items-center gap-2">
              <Button
                data-testid="btn-bulk-delete"
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleOpenDeleteDialog}
              >
                <Trash2 className="h-3.5 w-3.5" />
                刪除選取
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setSelectedIds(new Set())}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Card List */}
        <div className="md:hidden flex flex-col gap-3">
          {processedQuotations.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
              沒有符合條件的報價單
            </div>
          ) : (
            processedQuotations.map((quotation) => (
              <div
                key={quotation.id}
                className={`bg-card rounded-lg border border-border p-4 ${selectedIds.has(quotation.id) ? 'border-primary/40 bg-primary/5' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <Checkbox
                      checked={selectedIds.has(quotation.id)}
                      onCheckedChange={() => toggleRow(quotation.id)}
                      className="mt-0.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/quotations/${quotation.id}`}
                        className="text-primary hover:underline font-medium text-sm block"
                      >
                        {quotation.id}
                      </Link>
                      <p className="font-semibold text-foreground truncate">{quotation.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`border ${statusBadgeStyles[quotation.status]}`}>
                      {statusLabels[quotation.status]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/quotations/${quotation.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        {quotation.status === 'draft' && (
                          <DropdownMenuItem asChild>
                            <Link href={`/quotations/${quotation.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              編輯
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <FileX className="h-4 w-4 mr-2" />
                          作廢
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 ml-6">{quotation.project}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm ml-6">
                  <div className="text-muted-foreground">總金額</div>
                  <div className="font-medium text-foreground">{quotation.amount}</div>
                  <div className="text-muted-foreground">負責業務</div>
                  <div className="text-foreground">{quotation.sales}</div>
                  <div className="text-muted-foreground">報價日期</div>
                  <div className="text-foreground">{quotation.date}</div>
                  <div className="text-muted-foreground">版本</div>
                  <div><Badge variant="outline" className="font-normal">{quotation.version}</Badge></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-border">
                  <TableHead className="w-10 pl-4">
                    <Checkbox
                      data-testid="select-all-checkbox"
                      checked={allFilteredSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="全選"
                    />
                  </TableHead>
                  <TableHead
                    className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleColSort('id')}
                  >
                    <span className="inline-flex items-center">
                      報價單號
                      <SortIcon col="id" colSort={colSort} />
                    </span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">客戶名稱</TableHead>
                  <TableHead className="text-muted-foreground font-medium">案件名稱</TableHead>
                  <TableHead
                    className="text-muted-foreground font-medium text-right cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleColSort('amount')}
                  >
                    <span className="inline-flex items-center justify-end">
                      總金額
                      <SortIcon col="amount" colSort={colSort} />
                    </span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">負責業務</TableHead>
                  <TableHead
                    className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleColSort('date')}
                  >
                    <span className="inline-flex items-center">
                      報價日期
                      <SortIcon col="date" colSort={colSort} />
                    </span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">版本</TableHead>
                  <TableHead className="text-muted-foreground font-medium">狀態</TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedQuotations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      沒有符合條件的報價單
                    </TableCell>
                  </TableRow>
                ) : (
                  processedQuotations.map((quotation) => (
                    <TableRow
                      key={quotation.id}
                      data-testid="quotation-row"
                      className={`border-border hover:bg-muted/30 ${selectedIds.has(quotation.id) ? 'bg-primary/5' : ''}`}
                    >
                      <TableCell className="pl-4">
                        <Checkbox
                          data-testid="row-checkbox"
                          checked={selectedIds.has(quotation.id)}
                          onCheckedChange={() => toggleRow(quotation.id)}
                          aria-label={`選取 ${quotation.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {quotation.id}
                        </Link>
                      </TableCell>
                      <TableCell className="text-foreground">{quotation.customer}</TableCell>
                      <TableCell className="text-foreground">{quotation.project}</TableCell>
                      <TableCell className="text-right text-foreground font-medium">
                        {quotation.amount}
                      </TableCell>
                      <TableCell className="text-foreground">{quotation.sales}</TableCell>
                      <TableCell className="text-muted-foreground">{quotation.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {quotation.version}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge data-testid="status-badge" className={`border ${statusBadgeStyles[quotation.status]}`}>
                          {statusLabels[quotation.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/quotations/${quotation.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                查看詳情
                              </Link>
                            </DropdownMenuItem>
                            {quotation.status === 'draft' && (
                              <DropdownMenuItem asChild>
                                <Link href={`/quotations/${quotation.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  編輯
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <FileX className="h-4 w-4 mr-2" />
                              作廢
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

      </main>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => { setShowDeleteDialog(open); if (!open) setDeleteConfirmInput('') }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              確認刪除 {selectedIds.size} 筆報價單？
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原，選取的報價單將被永久刪除。請在下方輸入 <span className="font-semibold text-destructive">DELETE</span> 以確認。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2 space-y-1.5">
            <Label htmlFor="delete-confirm">確認刪除</Label>
            <Input
              id="delete-confirm"
              placeholder="請輸入 DELETE"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              className="border-destructive/40 focus-visible:ring-destructive/30"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={deleteConfirmInput !== 'DELETE'}
              onClick={handleBulkDelete}
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function QuotationsPage() {
  return (
    <Suspense>
      <QuotationsPageContent />
    </Suspense>
  )
}
