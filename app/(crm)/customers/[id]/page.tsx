'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Edit,
  Archive,
  Star,
  Phone,
  Mail,
  Copy,
  Check,
  Plus,
  ExternalLink,
  Globe,
  Clock,
  User,
  Building2,
  MapPin,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Types ────────────────────────────────────────────────────────────────────

type RecordType = 'visit' | 'call' | 'todo'

interface VisitRecord {
  id: number
  type: 'visit'
  datetime: string
  location: string
  attendees: string
  summary: string
  nextAction: string
  createdBy: { role: string; name: string }
}

interface CallRecord {
  id: number
  type: 'call'
  datetime: string
  contactPerson: string
  duration: string
  summary: string
  createdBy: { role: string; name: string }
}

interface TodoRecord {
  id: number
  type: 'todo'
  title: string
  dueDateTime: string
  assignedTo: string
  status: 'pending' | 'done'
  note: string
  createdBy: { role: string; name: string }
}

type ContactRecord = VisitRecord | CallRecord | TodoRecord

interface AuditLog {
  id: number
  field: string
  before: string
  after: string
  operator: string
  time: string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const customerData = {
  id: 'CUS-2025-0024',
  name: '台灣數位科技股份有限公司',
  taxId: '12345678',
  type: '企業',
  source: '官網詢問',
  sales: '王小明',
  status: 'active',
  createdAt: '2025-04-10',
  addresses: [
    {
      type: '總公司',
      city: '台北市',
      district: '信義區',
      zipCode: '110',
      address: '信義路五段100號12樓',
    },
    {
      type: '分公司',
      city: '台中市',
      district: '西屯區',
      zipCode: '407',
      address: '台灣大道三段500號8樓',
    },
  ],
  note: '重要客戶，優先處理',
}

const contacts = [
  {
    id: 1,
    name: '陳小華',
    title: '專案經理',
    department: '資訊部',
    isPrimary: true,
    phones: [
      { type: '手機', number: '0912-345-678' },
      { type: '辦公室', number: '02-2345-6789', ext: '101' },
    ],
    emails: [
      { type: '公務', email: 'chen@taiwan-digital.com' },
      { type: '個人', email: 'chen.personal@gmail.com' },
    ],
  },
  {
    id: 2,
    name: '林大偉',
    title: '技術總監',
    department: '研發部',
    isPrimary: false,
    phones: [{ type: '手機', number: '0923-456-789' }],
    emails: [{ type: '公務', email: 'lin@taiwan-digital.com' }],
  },
]

const assets = [
  {
    id: 1,
    name: '官方網站',
    url: 'https://www.taiwan-digital.com',
    contact: '陳小華',
    note: '主要對外網站',
  },
  {
    id: 2,
    name: '客服系統',
    url: 'https://support.taiwan-digital.com',
    contact: '林大偉',
    note: '客戶支援平台',
  },
]

const quotations = [
  {
    id: 'QUO-2025-0045',
    project: '官網改版專案',
    amount: 'NT$ 350,000',
    status: 'negotiating',
    date: '2025-04-12',
    version: 'V2',
  },
  {
    id: 'QUO-2025-0038',
    project: '年度維護合約',
    amount: 'NT$ 180,000',
    status: 'won',
    date: '2025-03-20',
    version: 'V1',
  },
  {
    id: 'QUO-2025-0025',
    project: 'APP 開發專案',
    amount: 'NT$ 580,000',
    status: 'quoted',
    date: '2025-02-15',
    version: 'V3',
  },
]

const initialContactRecords: ContactRecord[] = [
  {
    id: 1,
    type: 'visit',
    datetime: '2026/04/14 10:00',
    location: '台北市信義區信義路五段100號12樓（客戶辦公室）',
    attendees: '陳小華（專案經理）、林大偉（技術總監）',
    summary: '討論官網改版需求，客戶希望新版首頁強調行動裝置體驗，並整合線上預約功能。',
    nextAction: '請特助準備改版報價單（V2），預算上限 NT$400,000。',
    createdBy: { role: 'AM', name: '王小明' },
  },
  {
    id: 2,
    type: 'call',
    datetime: '2026/04/10 14:32',
    contactPerson: '陳小華',
    duration: '15 分鐘',
    summary: '客戶詢問 QUO-2025-0045 進度，表示對現有報價有議價意願，希望能在本月底前確認。',
    createdBy: { role: 'AM', name: '王小明' },
  },
  {
    id: 3,
    type: 'todo',
    title: '請特助準備官網改版 V2 報價單',
    dueDateTime: '2026/04/20 17:00',
    assignedTo: '特助 林雅婷',
    status: 'pending',
    note: '客戶預算上限 NT$400,000，請注意品項拆分方式。',
    createdBy: { role: 'AM', name: '王小明' },
  },
  {
    id: 4,
    type: 'call',
    datetime: '2026/04/08 09:15',
    contactPerson: '林大偉',
    duration: '20 分鐘',
    summary: '確認技術規格，客戶需要 API 串接既有 CRM 系統，技術評估複雜度中等。',
    createdBy: { role: 'PM', name: '張美麗' },
  },
]

const initialAuditLog: AuditLog[] = [
  {
    id: 1,
    field: '負責業務',
    before: '李美麗',
    after: '王小明',
    operator: 'AM 王小明',
    time: '2025/04/05 10:30',
  },
  {
    id: 2,
    field: '客戶狀態',
    before: '新建',
    after: '活躍',
    operator: '系統',
    time: '2025/04/01 09:00',
  },
]

const statusBadgeStyles: Record<string, string> = {
  draft: 'bg-draft-bg text-draft-text border-draft-border',
  quoted: 'bg-quoted-bg text-quoted-text border-quoted-border',
  negotiating: 'bg-negotiating-bg text-negotiating-text border-negotiating-border',
  won: 'bg-won-bg text-won-text border-won-border',
  lost: 'bg-lost-bg text-lost-text border-lost-border',
}

const statusLabels: Record<string, string> = {
  draft: '草稿',
  quoted: '已報價',
  negotiating: '議價中',
  won: '已成案',
  lost: '未成案',
}

// ── Helper: type config ───────────────────────────────────────────────────────

const typeConfig = {
  visit: {
    label: '拜訪紀錄',
    icon: MapPin,
    dotColor: 'bg-primary',
    badgeClass: 'bg-draft-bg text-draft-text border-draft-border',
  },
  call: {
    label: '通話備忘錄',
    icon: Phone,
    dotColor: 'bg-success',
    badgeClass: 'bg-won-bg text-won-text border-won-border',
  },
  todo: {
    label: '待辦追蹤',
    icon: CheckSquare,
    dotColor: 'bg-[#F59E0B]',
    badgeClass: 'bg-negotiating-bg text-negotiating-text border-negotiating-border',
  },
}

function getRecordTime(r: ContactRecord): string {
  if (r.type === 'todo') return r.dueDateTime
  return r.datetime
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function CustomerDetailPage() {
  const params = useParams()
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')

  // Activity state
  const [contactRecords, setContactRecords] = useState<ContactRecord[]>(initialContactRecords)
  const [auditLog, setAuditLog] = useState<AuditLog[]>(initialAuditLog)
  const [activityFilter, setActivityFilter] = useState<RecordType | 'all'>('all')

  // New record dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogStep, setDialogStep] = useState<'select-type' | 'fill-form'>('select-type')
  const [selectedType, setSelectedType] = useState<RecordType>('visit')

  // Form fields
  const [form, setForm] = useState({
    datetime: '',
    location: '',
    attendees: '',
    summary: '',
    nextAction: '',
    contactPerson: '',
    duration: '',
    title: '',
    dueDateTime: '',
    assignedTo: '',
    note: '',
  })

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const openDialog = () => {
    setDialogStep('select-type')
    setSelectedType('visit')
    setForm({
      datetime: '', location: '', attendees: '', summary: '',
      nextAction: '', contactPerson: '', duration: '',
      title: '', dueDateTime: '', assignedTo: '', note: '',
    })
    setDialogOpen(true)
  }

  const handleSubmitRecord = () => {
    const now = new Date()
    const nowStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    const creator = { role: 'AM', name: '王小明' }
    const newId = contactRecords.length + 1

    let newRecord: ContactRecord

    if (selectedType === 'visit') {
      newRecord = {
        id: newId, type: 'visit',
        datetime: form.datetime.replace('T', ' ').slice(0, 16).replace(/-/g, '/') || nowStr,
        location: form.location || '（未填寫）',
        attendees: form.attendees || '（未填寫）',
        summary: form.summary || '（未填寫）',
        nextAction: form.nextAction || '（未填寫）',
        createdBy: creator,
      }
    } else if (selectedType === 'call') {
      newRecord = {
        id: newId, type: 'call',
        datetime: form.datetime.replace('T', ' ').slice(0, 16).replace(/-/g, '/') || nowStr,
        contactPerson: form.contactPerson || '（未填寫）',
        duration: form.duration || '（未填寫）',
        summary: form.summary || '（未填寫）',
        createdBy: creator,
      }
    } else {
      newRecord = {
        id: newId, type: 'todo',
        title: form.title || '（未填寫）',
        dueDateTime: form.dueDateTime.replace('T', ' ').slice(0, 16).replace(/-/g, '/') || nowStr,
        assignedTo: form.assignedTo || '（未填寫）',
        status: 'pending',
        note: form.note || '',
        createdBy: creator,
      }
    }

    setContactRecords(prev => [newRecord, ...prev])

    // Append to audit log
    const logEntry: AuditLog = {
      id: auditLog.length + 1,
      field: '聯絡紀錄',
      before: '—',
      after: `新增${typeConfig[selectedType].label}`,
      operator: `${creator.role} ${creator.name}`,
      time: nowStr,
    }
    setAuditLog(prev => [logEntry, ...prev])
    setDialogOpen(false)
  }

  const toggleTodoDone = (id: number) => {
    const d = new Date()
    const nowStr = `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
    const original = contactRecords.find(r => r.id === id && r.type === 'todo') as TodoRecord | undefined
    if (!original) return
    const fromStatus = original.status
    const toStatus: 'pending' | 'done' = fromStatus === 'done' ? 'pending' : 'done'
    setContactRecords(prev =>
      prev.map(r =>
        r.id === id && r.type === 'todo' ? { ...r, status: toStatus } : r
      )
    )
    setAuditLog(prev => [
      {
        id: prev.length + 1,
        field: '待辦狀態',
        before: fromStatus === 'pending' ? '待處理' : '已完成',
        after: toStatus === 'done' ? '已完成' : '待處理',
        operator: 'AM 王小明',
        time: nowStr,
      },
      ...prev,
    ])
  }

  const filteredRecords = activityFilter === 'all'
    ? contactRecords
    : contactRecords.filter(r => r.type === activityFilter)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        breadcrumbs={[
          { label: '客戶管理', href: '/customers' },
          { label: customerData.name },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{customerData.id}</span>
              <Badge
                className={
                  customerData.status === 'active'
                    ? 'bg-won-bg text-won-text border-won-border'
                    : 'bg-void-bg text-void-text border-void-border'
                }
              >
                {customerData.status === 'active' ? '活躍' : '封存'}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              {customerData.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/customers/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                編輯
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive/90">
                  <Archive className="h-4 w-4 mr-2" />
                  封存
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>確定要封存此客戶嗎？</AlertDialogTitle>
                  <AlertDialogDescription>
                    封存後，此客戶將從主列表中隱藏，但相關的報價單和訂單資料仍會保留。
                    您可以隨時透過篩選器查看封存客戶並解除封存。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                    確認封存
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="basic">基本資料</TabsTrigger>
            <TabsTrigger value="contacts">聯絡人</TabsTrigger>
            <TabsTrigger value="assets">資產</TabsTrigger>
            <TabsTrigger value="quotations">報價單</TabsTrigger>
            <TabsTrigger value="activity">
              活動紀錄
              {contactRecords.filter(r => r.type === 'todo' && r.status === 'pending').length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-destructive text-white text-xs font-semibold px-1">
                  {contactRecords.filter(r => r.type === 'todo' && r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">異動歷史</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    公司資訊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">統一編號</span>
                    <span className="text-sm text-foreground font-medium">{customerData.taxId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">客戶類別</span>
                    <span className="text-sm text-foreground">{customerData.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">客戶來源</span>
                    <span className="text-sm text-foreground">{customerData.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">負責業務</span>
                    <span className="text-sm text-foreground">{customerData.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">建立日期</span>
                    <span className="text-sm text-foreground">{customerData.createdAt}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    地址資訊
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerData.addresses.map((addr, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground uppercase">{addr.type}</span>
                      <span className="text-sm text-foreground">
                        {addr.zipCode} {addr.city}{addr.district}{addr.address}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{customerData.note}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6">
            <div className="flex justify-end mb-4">
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" />
                新增聯絡人
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {contacts.map((contact) => (
                <Card key={contact.id} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{contact.name}</span>
                            {contact.isPrimary && (
                              <Star className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {contact.department} / {contact.title}
                          </span>
                        </div>
                      </div>
                      {contact.isPrimary && (
                        <Badge className="bg-negotiating-bg text-negotiating-text border-negotiating-border">
                          主要聯絡人
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      {contact.phones.map((phone, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground w-16">{phone.type}</span>
                          <span className="text-foreground">
                            {phone.number}{phone.ext && ` 分機 ${phone.ext}`}
                          </span>
                        </div>
                      ))}
                      {contact.emails.map((email, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground w-16">{email.type}</span>
                          <span className="text-foreground">{email.email}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyEmail(email.email)}
                          >
                            {copiedEmail === email.email ? (
                              <Check className="h-3.5 w-3.5 text-success" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Assets Tab */}
          <TabsContent value="assets" className="mt-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">
                  網站 / 子站台清單
                </CardTitle>
                <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5">
                  <Plus className="h-4 w-4" />
                  新增資產
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">站台名稱</TableHead>
                      <TableHead className="text-muted-foreground">URL</TableHead>
                      <TableHead className="text-muted-foreground">對應聯絡人</TableHead>
                      <TableHead className="text-muted-foreground">備註</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assets.map((asset) => (
                      <TableRow key={asset.id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {asset.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={asset.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {asset.url}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </TableCell>
                        <TableCell className="text-foreground">{asset.contact}</TableCell>
                        <TableCell className="text-muted-foreground">{asset.note}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations" className="mt-6 space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-primary">
                    最新已承接報價
                  </CardTitle>
                  <Badge className="bg-won-bg text-won-text border-won-border">已成案</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href="/quotations/QUO-2025-0038"
                      className="text-lg font-medium text-foreground hover:text-primary"
                    >
                      QUO-2025-0038 - 年度維護合約
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      報價日期：2025-03-20 | 版本：V1
                    </p>
                  </div>
                  <span className="text-xl font-semibold text-foreground">NT$ 180,000</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">全部報價單</CardTitle>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90 gap-1.5">
                  <Link href="/quotations/new">
                    <Plus className="h-4 w-4" />
                    新增報價
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">報價單號</TableHead>
                      <TableHead className="text-muted-foreground">案件名稱</TableHead>
                      <TableHead className="text-muted-foreground">總金額</TableHead>
                      <TableHead className="text-muted-foreground">版本</TableHead>
                      <TableHead className="text-muted-foreground">狀態</TableHead>
                      <TableHead className="text-muted-foreground">報價日期</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotations.map((quo) => (
                      <TableRow key={quo.id} className="border-border">
                        <TableCell>
                          <Link
                            href={`/quotations/${quo.id}`}
                            className="text-primary hover:underline font-medium"
                          >
                            {quo.id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-foreground">{quo.project}</TableCell>
                        <TableCell className="text-foreground font-medium">{quo.amount}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{quo.version}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`border ${statusBadgeStyles[quo.status]}`}>
                            {statusLabels[quo.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{quo.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Activity Tab ── */}
          <TabsContent value="activity" className="mt-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base font-semibold text-foreground">活動紀錄</CardTitle>
                {/* Type filter chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  {(['all', 'visit', 'call', 'todo'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setActivityFilter(f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        activityFilter === f
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {f === 'all' ? '全部' : typeConfig[f].label}
                      {f !== 'all' && (
                        <span className="ml-1 opacity-70">
                          ({contactRecords.filter(r => r.type === f).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5" onClick={openDialog}>
                  <Plus className="h-4 w-4" />
                  新增紀錄
                </Button>
              </CardHeader>

              <CardContent>
                {filteredRecords.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">目前沒有相關紀錄</p>
                ) : (
                  <div className="relative">
                    {/* Timeline vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-6">
                      {filteredRecords.map((record) => {
                        const cfg = typeConfig[record.type]
                        const Icon = cfg.icon

                        return (
                          <div key={record.id} className="relative pl-10">
                            {/* Dot */}
                            <div className={`absolute left-2 top-1 h-4 w-4 rounded-full ${cfg.dotColor} border-2 border-white flex items-center justify-center`}>
                              <Icon className="h-2.5 w-2.5 text-white" />
                            </div>

                            <div className="flex flex-col gap-2">
                              {/* Header row */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={`border text-xs ${cfg.badgeClass}`}>
                                  {cfg.label}
                                </Badge>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {getRecordTime(record)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  · {record.createdBy.role} {record.createdBy.name}
                                </span>
                              </div>

                              {/* Content by type */}
                              {record.type === 'visit' && (
                                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                                  <div className="flex gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-muted-foreground">地點：</span>
                                      <span className="text-foreground">{record.location}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-muted-foreground">與會人員：</span>
                                      <span className="text-foreground">{record.attendees}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="text-muted-foreground">拜訪摘要：</span>
                                      <span className="text-foreground">{record.summary}</span>
                                    </div>
                                  </div>
                                  {record.nextAction && (
                                    <div className="mt-2 pt-2 border-t border-border">
                                      <span className="text-sm font-semibold text-primary">後續行動：</span>
                                      <span className="text-sm text-foreground ml-1">{record.nextAction}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {record.type === 'call' && (
                                <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
                                  <div className="flex gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">通話對象：</span>
                                      <span className="text-foreground font-medium">{record.contactPerson}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">時長：</span>
                                      <span className="text-foreground">{record.duration}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-foreground">{record.summary}</p>
                                </div>
                              )}

                              {record.type === 'todo' && (
                                <div className={`border rounded-lg p-4 ${
                                  record.status === 'done'
                                    ? 'bg-success-subtle border-success/20'
                                    : 'bg-warning-subtle border-warning/30'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    <button
                                      onClick={() => toggleTodoDone(record.id)}
                                      className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-success transition-colors"
                                    >
                                      {record.status === 'done'
                                        ? <CheckSquare className="h-5 w-5 text-success" />
                                        : <Square className="h-5 w-5" />
                                      }
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${
                                        record.status === 'done'
                                          ? 'line-through text-muted-foreground'
                                          : 'text-foreground'
                                      }`}>
                                        {record.title}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                                        <span>截止：{record.dueDateTime}</span>
                                        <span>指派：{record.assignedTo}</span>
                                        {record.status === 'done' && (
                                          <Badge className="bg-won-bg text-won-text border-won-border text-xs">
                                            已完成
                                          </Badge>
                                        )}
                                      </div>
                                      {record.note && (
                                        <p className="text-sm text-muted-foreground mt-1">{record.note}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  異動歷史 (Audit Log)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground">欄位</TableHead>
                      <TableHead className="text-muted-foreground">操作</TableHead>
                      <TableHead className="text-muted-foreground">操作人</TableHead>
                      <TableHead className="text-muted-foreground">時間</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLog.map((log) => (
                      <TableRow key={log.id} className="border-border">
                        <TableCell className="font-medium text-foreground">{log.field}</TableCell>
                        <TableCell className="text-foreground">
                          {log.before === '—'
                            ? log.after
                            : <span>{log.before} <span className="text-muted-foreground">→</span> {log.after}</span>
                          }
                        </TableCell>
                        <TableCell className="text-foreground">{log.operator}</TableCell>
                        <TableCell className="text-muted-foreground">{log.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── New Record Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新增聯絡紀錄</DialogTitle>
          </DialogHeader>

          {dialogStep === 'select-type' ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">請選擇紀錄類型：</p>
              <div className="grid grid-cols-3 gap-3">
                {(['visit', 'call', 'todo'] as RecordType[]).map(t => {
                  const cfg = typeConfig[t]
                  const Icon = cfg.icon
                  return (
                    <button
                      key={t}
                      onClick={() => setSelectedType(t)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedType === t
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary hover:bg-muted/30'
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${selectedType === t ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-medium ${selectedType === t ? 'text-primary' : 'text-foreground'}`}>
                        {cfg.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setDialogStep('fill-form')}
                >
                  下一步
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {/* Visit form */}
              {selectedType === 'visit' && (
                <>
                  <div className="space-y-1.5">
                    <Label>拜訪時間</Label>
                    <Input
                      type="datetime-local"
                      value={form.datetime}
                      onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>拜訪地點</Label>
                    <Input
                      placeholder="例：客戶辦公室 / 台北市信義區..."
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>與會人員（客戶側）</Label>
                    <Input
                      placeholder="例：陳小華（專案經理）、林大偉（技術總監）"
                      value={form.attendees}
                      onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>拜訪摘要</Label>
                    <textarea
                      rows={3}
                      placeholder="本次拜訪重點..."
                      value={form.summary}
                      onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>後續行動</Label>
                    <Input
                      placeholder="例：請特助準備報價單"
                      value={form.nextAction}
                      onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))}
                    />
                  </div>
                </>
              )}

              {/* Call form */}
              {selectedType === 'call' && (
                <>
                  <div className="space-y-1.5">
                    <Label>通話時間</Label>
                    <Input
                      type="datetime-local"
                      value={form.datetime}
                      onChange={e => setForm(f => ({ ...f, datetime: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>通話對象</Label>
                      <Input
                        placeholder="例：陳小華"
                        value={form.contactPerson}
                        onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>通話時長</Label>
                      <Input
                        placeholder="例：15 分鐘"
                        value={form.duration}
                        onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>通話重點</Label>
                    <textarea
                      rows={3}
                      placeholder="本次通話討論重點..."
                      value={form.summary}
                      onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </>
              )}

              {/* Todo form */}
              {selectedType === 'todo' && (
                <>
                  <div className="space-y-1.5">
                    <Label>待辦標題</Label>
                    <Input
                      placeholder="例：請特助準備報價單 V2"
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>截止時間</Label>
                    <Input
                      type="datetime-local"
                      value={form.dueDateTime}
                      onChange={e => setForm(f => ({ ...f, dueDateTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>指派給</Label>
                    <Input
                      placeholder="例：特助 林雅婷"
                      value={form.assignedTo}
                      onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>備註</Label>
                    <Input
                      placeholder="補充說明（選填）"
                      value={form.note}
                      onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogStep('select-type')}>
                  上一步
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSubmitRecord}
                >
                  儲存紀錄
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
