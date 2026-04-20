'use client'

export const dynamic = 'force-dynamic'

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
  Archive,
  Download,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  SlidersHorizontal,
  X,
  ArrowDownUp,
  CalendarIcon,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

// ── Constants ─────────────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 10

// ── Types ─────────────────────────────────────────────────────────────────────

type ColSortKey = 'name' | 'createdAt' | 'lastContact'
type ColSortDir = 'asc' | 'desc'
type ColSort = { key: ColSortKey | null; dir: ColSortDir | null }
type SortKey = 'newest' | 'updated' | 'name_az' | 'oldest'

// ── Mock data ──────────────────────────────────────────────────────────────────

const mockCustomers = [
  {
    id: 'CUS-2025-0024',
    name: '台灣數位科技股份有限公司',
    shortName: '台數科',
    taxId: '12345678',
    contact: '陳小華',
    phone: '02-2345-6789',
    email: 'chen@taiwan-digital.com',
    sales: '王小明',
    type: '企業',
    createdAt: '2025-04-10',
    updatedAt: '2025-04-15',
    lastContact: '2025-04-14',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0023',
    name: '創新軟體開發有限公司',
    shortName: '創新軟體',
    taxId: '23456789',
    contact: '林大偉',
    phone: '02-8765-4321',
    email: 'lin@innovate-soft.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2025-04-08',
    updatedAt: '2025-04-12',
    lastContact: '2025-04-09',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0022',
    name: '智慧製造科技股份有限公司',
    shortName: '智慧製造',
    taxId: '34567890',
    contact: '張志明',
    phone: '04-2234-5678',
    email: 'chang@smart-mfg.com',
    sales: '王小明',
    type: '企業',
    createdAt: '2025-04-05',
    updatedAt: '2025-04-11',
    lastContact: '2025-04-06',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0021',
    name: '東方貿易有限公司',
    shortName: '東方貿易',
    taxId: '45678901',
    contact: '黃董事長',
    phone: '07-3456-7890',
    email: 'huang@east-trade.com',
    sales: '陳志偉',
    type: '企業',
    createdAt: '2025-04-01',
    updatedAt: '2025-04-08',
    lastContact: '2025-04-02',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0020',
    name: '台北金融科技公司',
    shortName: '台北金科',
    taxId: '56789012',
    contact: '吳經理',
    phone: '02-5678-1234',
    email: 'wu@taipei-fintech.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2025-03-28',
    updatedAt: '2025-04-01',
    lastContact: '2025-03-30',
    status: '已流失',
  },
  {
    id: 'CUS-2025-0019',
    name: '台北市政府資訊局',
    shortName: '北市資訊局',
    taxId: '67890123',
    contact: '林科長',
    phone: '02-2720-8889',
    email: 'lin@taipei.gov.tw',
    sales: '陳志偉',
    type: '政府機關',
    createdAt: '2025-03-20',
    updatedAt: '2025-04-10',
    lastContact: '2025-04-10',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0018',
    name: '台灣社會福利基金會',
    shortName: '社福基金會',
    taxId: '78901234',
    contact: '謝秘書長',
    phone: '02-2361-5995',
    email: 'hsieh@welfare.org.tw',
    sales: '王小明',
    type: '非營利組織',
    createdAt: '2025-03-15',
    updatedAt: '2025-03-20',
    lastContact: '2025-03-18',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0017',
    name: '南台灣物流股份有限公司',
    shortName: '南台物流',
    taxId: '89012345',
    contact: '蘇副總',
    phone: '07-2234-5678',
    email: 'su@south-logistics.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2025-03-10',
    updatedAt: '2025-03-22',
    lastContact: '2025-03-20',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0016',
    name: '新竹科技園區管理局',
    shortName: '竹科管理局',
    taxId: '90123456',
    contact: '鄭局長',
    phone: '03-577-2311',
    email: 'cheng@sipa.gov.tw',
    sales: '陳志偉',
    type: '政府機關',
    createdAt: '2025-03-05',
    updatedAt: '2025-03-18',
    lastContact: '2025-03-15',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0015',
    name: '遠東航空科技有限公司',
    shortName: '遠東航科',
    taxId: '01234567',
    contact: '江技術長',
    phone: '03-3982-5566',
    email: 'chiang@feaero.com',
    sales: '王小明',
    type: '企業',
    createdAt: '2025-02-28',
    updatedAt: '2025-03-10',
    lastContact: '2025-03-08',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0014',
    name: '台中醫療器材股份有限公司',
    shortName: '台中醫材',
    taxId: '11223344',
    contact: '楊執行長',
    phone: '04-2258-9988',
    email: 'yang@tc-medical.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2025-02-20',
    updatedAt: '2025-03-05',
    lastContact: '2025-03-01',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0013',
    name: '桃園國際機場股份有限公司',
    shortName: '桃機公司',
    taxId: '22334455',
    contact: '林副總經理',
    phone: '03-2735-081',
    email: 'lin@taoyuan-airport.com',
    sales: '陳志偉',
    type: '政府機關',
    createdAt: '2025-02-15',
    updatedAt: '2025-03-01',
    lastContact: '2025-02-28',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0012',
    name: '高雄港務局資訊部',
    shortName: '高港資訊',
    taxId: '33445566',
    contact: '陳組長',
    phone: '07-561-2345',
    email: 'chen@khb.gov.tw',
    sales: '王小明',
    type: '政府機關',
    createdAt: '2025-02-08',
    updatedAt: '2025-02-20',
    lastContact: '2025-02-18',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0011',
    name: '台南創新研發中心',
    shortName: '台南創研',
    taxId: '44556677',
    contact: '黃主任',
    phone: '06-2345-6789',
    email: 'huang@tainan-innov.org.tw',
    sales: '李美麗',
    type: '非營利組織',
    createdAt: '2025-02-01',
    updatedAt: '2025-02-15',
    lastContact: '2025-02-12',
    status: '已流失',
  },
  {
    id: 'CUS-2025-0010',
    name: '彰化彰銀資訊服務公司',
    shortName: '彰銀資服',
    taxId: '55667788',
    contact: '游副理',
    phone: '04-7238-3456',
    email: 'yu@chb-service.com',
    sales: '陳志偉',
    type: '企業',
    createdAt: '2025-01-25',
    updatedAt: '2025-02-10',
    lastContact: '2025-02-08',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0009',
    name: '花蓮縣政府農業處',
    shortName: '花蓮農業',
    taxId: '66778899',
    contact: '徐處長',
    phone: '03-822-7171',
    email: 'hsu@hualien.gov.tw',
    sales: '王小明',
    type: '政府機關',
    createdAt: '2025-01-18',
    updatedAt: '2025-02-02',
    lastContact: '2025-01-30',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2025-0008',
    name: '宜蘭生技農業股份有限公司',
    shortName: '宜蘭生技',
    taxId: '77889900',
    contact: '廖總監',
    phone: '03-9312-5678',
    email: 'liao@yilan-biotech.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2025-01-10',
    updatedAt: '2025-01-25',
    lastContact: '2025-01-22',
    status: '合作中',
  },
  {
    id: 'CUS-2025-0007',
    name: '基隆港貨運管理系統公司',
    shortName: '基隆貨運',
    taxId: '88990011',
    contact: '許協理',
    phone: '02-2420-8888',
    email: 'hsu@keelung-cargo.com',
    sales: '陳志偉',
    type: '企業',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-20',
    lastContact: '2025-01-18',
    status: '已流失',
  },
  {
    id: 'CUS-2024-0098',
    name: '澎湖縣觀光旅遊局',
    shortName: '澎湖觀光',
    taxId: '99001122',
    contact: '王科長',
    phone: '06-927-4400',
    email: 'wang@penghu-tourism.gov.tw',
    sales: '王小明',
    type: '政府機關',
    createdAt: '2024-12-20',
    updatedAt: '2025-01-08',
    lastContact: '2025-01-05',
    status: '合作中',
  },
  {
    id: 'CUS-2024-0097',
    name: '金門縣政府建設局',
    shortName: '金門建設',
    taxId: '00112233',
    contact: '林局長',
    phone: '082-324-147',
    email: 'lin@kinmen.gov.tw',
    sales: '李美麗',
    type: '政府機關',
    createdAt: '2024-12-10',
    updatedAt: '2024-12-28',
    lastContact: '2024-12-25',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2024-0096',
    name: '屏東農業生技股份有限公司',
    shortName: '屏東農科',
    taxId: '11223355',
    contact: '張董事長',
    phone: '08-7324-5678',
    email: 'chang@pingtung-agro.com',
    sales: '陳志偉',
    type: '企業',
    createdAt: '2024-12-01',
    updatedAt: '2024-12-18',
    lastContact: '2024-12-15',
    status: '合作中',
  },
  {
    id: 'CUS-2024-0095',
    name: '台東原住民文化基金會',
    shortName: '台東原文',
    taxId: '22334466',
    contact: '高執行長',
    phone: '089-351-123',
    email: 'kao@taitung-culture.org.tw',
    sales: '王小明',
    type: '非營利組織',
    createdAt: '2024-11-20',
    updatedAt: '2024-12-05',
    lastContact: '2024-12-02',
    status: '潛在客戶',
  },
  {
    id: 'CUS-2024-0094',
    name: '嘉義市智慧城市發展公司',
    shortName: '嘉義智城',
    taxId: '33445577',
    contact: '吳專案經理',
    phone: '05-225-6789',
    email: 'wu@chiayi-smart.com',
    sales: '李美麗',
    type: '企業',
    createdAt: '2024-11-10',
    updatedAt: '2024-11-28',
    lastContact: '2024-11-25',
    status: '已流失',
  },
  {
    id: 'CUS-2024-0093',
    name: '雲林縣農業改良場',
    shortName: '雲林農改',
    taxId: '44556688',
    contact: '蔡場長',
    phone: '05-5523-2058',
    email: 'tsai@yunlin-agri.gov.tw',
    sales: '陳志偉',
    type: '政府機關',
    createdAt: '2024-11-01',
    updatedAt: '2024-11-20',
    lastContact: '2024-11-18',
    status: '合作中',
  },
]

const uniqueSales = ['全部', ...Array.from(new Set(mockCustomers.map((c) => c.sales)))]

const statusVariantMap: Record<string, string> = {
  合作中: 'bg-won-bg text-won-text border-won-border',
  潛在客戶: 'bg-info-subtle text-info border border-info/30',
  已流失: 'bg-void-bg text-void-text border-void-border',
}

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

// ── Sort indicator component ──────────────────────────────────────────────────

function SortIcon({ col, colSort }: { col: ColSortKey; colSort: ColSort }) {
  if (colSort.key !== col) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-30 inline" />
  if (colSort.dir === 'asc') return <ChevronUp className="h-3 w-3 ml-1 text-primary inline" />
  return <ChevronDown className="h-3 w-3 ml-1 text-primary inline" />
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ── State (initialised from URL params) ──────────────────────────────────────
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get('q') ?? '')
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get('type') ?? '全部')
  const [salesFilter, setSalesFilter] = useState(() => searchParams.get('sales') ?? '全部')
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') ?? '全部')
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
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // ── 300 ms debounce ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Sync state → URL ─────────────────────────────────────────────────────────
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('q', debouncedSearch)
    if (typeFilter !== '全部') params.set('type', typeFilter)
    if (salesFilter !== '全部') params.set('sales', salesFilter)
    if (statusFilter !== '全部') params.set('status', statusFilter)
    if (dateRange?.from) params.set('from', fmt(dateRange.from))
    if (dateRange?.to) params.set('to', fmt(dateRange.to))
    if (sortKey !== 'newest') params.set('sort', sortKey)
    const str = params.toString()
    router.replace(str ? `?${str}` : '?', { scroll: false })
  }, [debouncedSearch, typeFilter, salesFilter, statusFilter, dateRange, sortKey, router])

  useEffect(() => { syncUrl() }, [syncUrl])

  // Reset to page 1 whenever filters change
  useEffect(() => { setCurrentPage(1) }, [debouncedSearch, typeFilter, salesFilter, statusFilter, dateRange, sortKey, colSort])

  // ── Active filter count ───────────────────────────────────────────────────────
  const activeFilterCount = [
    !!debouncedSearch,
    typeFilter !== '全部',
    salesFilter !== '全部',
    statusFilter !== '全部',
    !!dateRange,
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0 || sortKey !== 'newest'

  // ── Clear filters ─────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearchInput('')
    setTypeFilter('全部')
    setSalesFilter('全部')
    setStatusFilter('全部')
    setDateRange(undefined)
    setSortKey('newest')
    setColSort({ key: null, dir: null })
    setActivePreset(null)
  }

  // ── Date preset ───────────────────────────────────────────────────────────────
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

  // ── Column sort (3-state) ─────────────────────────────────────────────────────
  const toggleColSort = (col: ColSortKey) => {
    setColSort((prev) => {
      if (prev.key !== col) return { key: col, dir: 'asc' }
      if (prev.dir === 'asc') return { key: col, dir: 'desc' }
      return { key: null, dir: null }
    })
  }

  // ── Filter + sort ─────────────────────────────────────────────────────────────
  const fromStr = dateRange?.from ? fmt(dateRange.from) : ''
  const toStr = dateRange?.to ? fmt(dateRange.to) : ''

  const processedCustomers = mockCustomers
    .filter((c) => {
      const q = debouncedSearch.toLowerCase()
      return (
        (!q || c.name.toLowerCase().includes(q) || c.shortName.toLowerCase().includes(q) || c.taxId.includes(q)) &&
        (typeFilter === '全部' || c.type === typeFilter) &&
        (salesFilter === '全部' || c.sales === salesFilter) &&
        (statusFilter === '全部' || c.status === statusFilter) &&
        (!fromStr || c.createdAt >= fromStr) &&
        (!toStr || c.createdAt <= toStr)
      )
    })
    .sort((a, b) => {
      if (colSort.key && colSort.dir) {
        const aVal = colSort.key === 'name' ? a.name : colSort.key === 'createdAt' ? a.createdAt : a.lastContact
        const bVal = colSort.key === 'name' ? b.name : colSort.key === 'createdAt' ? b.createdAt : b.lastContact
        const cmp = aVal.localeCompare(bVal, 'zh-TW')
        return colSort.dir === 'asc' ? cmp : -cmp
      }
      switch (sortKey) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'updated': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'name_az': return a.name.localeCompare(b.name, 'zh-TW')
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

  // ── Pagination ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(processedCustomers.length / ROWS_PER_PAGE))
  const pagedCustomers = processedCustomers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE,
  )
  const emptyRows = Math.max(0, ROWS_PER_PAGE - pagedCustomers.length)

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  // ── Date display format (dots) ────────────────────────────────────────────────
  const fmtDisplay = (d: Date) => fmt(d).replace(/-/g, '.')

  const dateBtnLabel = (() => {
    if (activePreset) return activePreset
    if (!dateRange?.from) return '全部日期'
    if (!dateRange.to) return fmtDisplay(dateRange.from)
    return `${fmtDisplay(dateRange.from)} - ${fmtDisplay(dateRange.to)}`
  })()

  // ── Preset chips ──────────────────────────────────────────────────────────────
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

  // ── Filter controls ────────────────────────────────────────────────────────────
  // inSheet=true → date shows as inline calendar (mobile Sheet)
  const FilterControls = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className="flex flex-col gap-2 xl:flex-row xl:flex-nowrap xl:items-center xl:gap-2">
      {/* Row 1: Search — full width on tablet, flex-1 on desktop */}
      <div className="relative w-full xl:flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="搜尋客戶名稱、統編..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9 h-9 text-sm w-full"
        />
      </div>

      {/* Row 2: 3 dropdowns — equal-width grid on tablet, auto-width inline on desktop */}
      <div className="grid grid-cols-3 gap-2 xl:contents">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full xl:w-auto h-9 text-sm">
            <SelectValue placeholder="全部類型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部類型</SelectItem>
            <SelectItem value="企業">企業</SelectItem>
            <SelectItem value="政府機關">政府機關</SelectItem>
            <SelectItem value="非營利組織">非營利組織</SelectItem>
          </SelectContent>
        </Select>

        <Select value={salesFilter} onValueChange={setSalesFilter}>
          <SelectTrigger className="w-full xl:w-auto h-9 text-sm">
            <SelectValue placeholder="全部業務" />
          </SelectTrigger>
          <SelectContent>
            {uniqueSales.map((p) => (
              <SelectItem key={p} value={p}>
                {p === '全部' ? '全部業務' : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full xl:w-auto h-9 text-sm">
            <SelectValue placeholder="全部狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="全部">全部狀態</SelectItem>
            <SelectItem value="潛在客戶">潛在客戶</SelectItem>
            <SelectItem value="合作中">合作中</SelectItem>
            <SelectItem value="已流失">已流失</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Row 3: Date (fills row) + Clear (right, tablet only) */}
      <div className="flex items-center gap-2 xl:contents">
        <div className="flex-1 xl:flex-none xl:shrink-0">
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
                  className={`w-full xl:w-[236px] h-9 text-sm justify-start gap-2 font-normal ${
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

        {/* Clear — right side of row 3 on tablet */}
        {!inSheet && (
          <button
            onClick={clearFilters}
            className="hidden sm:flex xl:hidden items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 whitespace-nowrap"
          >
            <X className="h-3 w-3" />
            清除重選
          </button>
        )}
      </div>

      {/* Clear — far right on desktop */}
      {!inSheet && (
        <button
          onClick={clearFilters}
          className="hidden xl:flex xl:ml-auto items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors shrink-0 whitespace-nowrap"
        >
          <X className="h-3 w-3" />
          清除重選
        </button>
      )}
    </div>
  )

  // ── Sort bar (between filter card and table) ──────────────────────────────────
  const SortBar = () => (
    <div className="flex items-center justify-between shrink-0 py-0.5">
      <span className="text-xs text-muted-foreground">
        共 {processedCustomers.length} 筆
        {processedCustomers.length > 0 && (
          <span>（第 {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, processedCustomers.length)} 筆）</span>
        )}
      </span>
      <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
        <SelectTrigger className="w-auto h-6 text-xs border-0 shadow-none bg-transparent gap-1 px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:ring-0">
          <ArrowDownUp className="h-3 w-3 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="newest">最新建立</SelectItem>
          <SelectItem value="updated">最近更新</SelectItem>
          <SelectItem value="name_az">公司名稱 A-Z</SelectItem>
          <SelectItem value="oldest">建立時間最舊</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar
        breadcrumbs={[
          { label: '客戶管理', href: '/customers' },
          { label: '客戶列表' },
        ]}
      />

      <main className="flex-1 overflow-auto flex flex-col gap-3 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">客戶管理</h1>
            <p className="text-sm text-muted-foreground mt-1">管理所有客戶資料與聯絡資訊</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              匯出
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/customers/new">
                <Plus className="h-4 w-4" />
                新增客戶
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border p-3 shrink-0">
          {/* Mobile (≤640px): Sheet trigger */}
          <div className="flex items-center gap-2 sm:hidden">
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

          {/* Desktop (≥640px) */}
          <div className="hidden sm:block">
            <FilterControls />
          </div>
        </div>

        {/* Sort bar — between filter card and results */}
        <SortBar />

        {/* Mobile Card List (≤640px) */}
        <div className="sm:hidden flex flex-col gap-3">
          {processedCustomers.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
              沒有符合條件的客戶
            </div>
          ) : (
            processedCustomers.map((customer) => (
              <div key={customer.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="font-semibold text-foreground hover:text-primary truncate block"
                    >
                      {customer.name}
                    </Link>
                    <span className="text-xs text-primary">{customer.id}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={statusVariantMap[customer.status] ?? ''}>
                      {customer.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/customers/${customer.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            查看詳情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Archive className="h-4 w-4 mr-2" />
                          封存客戶
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="text-muted-foreground">聯絡人</div>
                  <div className="text-foreground">{customer.contact}</div>
                  <div className="text-muted-foreground">電話</div>
                  <div className="text-foreground">{customer.phone}</div>
                  <div className="text-muted-foreground">負責業務</div>
                  <div className="text-foreground">{customer.sales}</div>
                  <div className="text-muted-foreground">建立日期</div>
                  <div className="text-foreground">{customer.createdAt}</div>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <span className="text-muted-foreground truncate">{customer.email}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyEmail(customer.email)}>
                    {copiedEmail === customer.email
                      ? <Check className="h-3.5 w-3.5 text-success" />
                      : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (≥640px) */}
        <div className="hidden sm:block shrink-0 bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow className="bg-muted/30 border-border">
                  <TableHead className="text-muted-foreground font-medium">流水編號</TableHead>
                  <TableHead
                    className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleColSort('name')}
                  >
                    <span className="inline-flex items-center">
                      客戶名稱
                      <SortIcon col="name" colSort={colSort} />
                    </span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium">主要聯絡人</TableHead>
                  <TableHead className="text-muted-foreground font-medium">負責業務</TableHead>
                  <TableHead className="text-muted-foreground font-medium">狀態</TableHead>
                  <TableHead
                    className="text-muted-foreground font-medium cursor-pointer select-none hover:text-foreground"
                    onClick={() => toggleColSort('lastContact')}
                  >
                    <span className="inline-flex items-center">
                      最後接觸
                      <SortIcon col="lastContact" colSort={colSort} />
                    </span>
                  </TableHead>
                  <TableHead className="text-muted-foreground font-medium w-[80px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedCustomers.length === 0 ? (
                  <>
                    <TableRow className="h-[50px] pointer-events-none">
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        沒有符合條件的客戶
                      </TableCell>
                    </TableRow>
                    {Array.from({ length: ROWS_PER_PAGE - 1 }).map((_, i) => (
                      <TableRow key={`empty-${i}`} className="h-[50px] pointer-events-none border-border">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <>
                    {pagedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="border-border hover:bg-muted/30 h-[50px]">
                        <TableCell>
                          <Link href={`/customers/${customer.id}`} className="text-primary hover:underline font-medium">
                            {customer.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground font-medium">{customer.name}</span>
                        </TableCell>
                        <TableCell className="text-foreground">{customer.contact}</TableCell>
                        <TableCell className="text-foreground">{customer.sales}</TableCell>
                        <TableCell>
                          <Badge className={statusVariantMap[customer.status] ?? ''}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{customer.lastContact}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  查看詳情
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Archive className="h-4 w-4 mr-2" />
                                封存客戶
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                    {Array.from({ length: emptyRows }).map((_, i) => (
                      <TableRow key={`empty-${i}`} className="h-[50px] pointer-events-none border-border">
                        <TableCell colSpan={7} />
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="border-t border-border px-4 py-2.5 flex items-center justify-between shrink-0 bg-card">
            <span className="text-sm text-muted-foreground">
              第 {currentPage} / {totalPages} 頁
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <ChevronLeft className="h-3.5 w-3.5 -ml-2.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(p)
                  return acc
                }, [])
                .map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                  ) : (
                    <Button
                      key={item}
                      variant={currentPage === item ? 'default' : 'ghost'}
                      size="icon"
                      className={`h-8 w-8 text-sm ${currentPage === item ? 'bg-primary text-primary-foreground' : ''}`}
                      onClick={() => setCurrentPage(item as number)}
                    >
                      {item}
                    </Button>
                  )
                )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
                <ChevronRight className="h-3.5 w-3.5 -ml-2.5" />
              </Button>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
