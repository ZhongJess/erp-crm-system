'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  BellOff,
  CheckCheck,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  Filter,
  FileCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface Notification {
  id: number
  type: 'quotation_expiry' | 'customer_update' | 'order_update' | 'system' | 'transfer' | 'quotation_review_request' | 'quotation_review_result'
  title: string
  description: string
  link?: string
  time: string
  date: string
  unread: boolean
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'quotation_review_request',
    title: '報價單待審核',
    description: 'QUO-2025-0045《台灣數位科技 — 官網改版》已由特助送出，請審核。',
    link: '/quotations/QUO-2025-0045',
    time: '5 分鐘前',
    date: '今天',
    unread: true,
  },
  {
    id: 2,
    type: 'quotation_review_result',
    title: '報價單已核准',
    description: 'QUO-2025-0044《創新軟體 — 雲端遷移》已由張經理核准，可寄送給客戶。',
    link: '/quotations/QUO-2025-0044',
    time: '30 分鐘前',
    date: '今天',
    unread: true,
  },
  {
    id: 3,
    type: 'quotation_review_result',
    title: '報價單已退回',
    description: 'QUO-2025-0043《智慧製造 — IoT 感測器》已由張經理退回，請修改後重新送審。退回備註：單價偏高，請重新評估主機費用。',
    link: '/quotations/QUO-2025-0043',
    time: '2 小時前',
    date: '今天',
    unread: true,
  },
  {
    id: 4,
    type: 'quotation_expiry',
    title: '報價單即將到期',
    description: 'QUO-2025-0042《台灣數位科技 — 官網改版》將於 3 天後到期，請盡速跟進。',
    link: '/quotations/QUO-2025-0042',
    time: '3 小時前',
    date: '今天',
    unread: false,
  },
  {
    id: 5,
    type: 'customer_update',
    title: '客戶資料已更新',
    description: '台灣大學 (CUS-2025-0018) 的聯絡人資訊已由陳志偉更新。',
    link: '/customers/CUS-2025-0018',
    time: '5 小時前',
    date: '今天',
    unread: false,
  },
  {
    id: 6,
    type: 'order_update',
    title: '訂單狀態更新',
    description: 'ORD-2025-0008《全球運籌 — 倉儲管理系統》已更新為「已交付」。',
    link: '/orders/ORD-2025-0008',
    time: '昨天 14:32',
    date: '昨天',
    unread: false,
  },
  {
    id: 7,
    type: 'transfer',
    title: '負責業務轉移',
    description: '客戶「安心保險代理有限公司」的負責業務已由張小芬轉移給李美麗。',
    link: '/customers/CUS-2025-0011',
    time: '昨天 10:05',
    date: '昨天',
    unread: false,
  },
  {
    id: 8,
    type: 'system',
    title: '系統維護通知',
    description: '系統將於 2025-04-15 02:00~04:00 進行例行維護，請提前儲存工作。',
    time: '2025-04-12',
    date: '2025-04-12',
    unread: false,
  },
  {
    id: 9,
    type: 'quotation_expiry',
    title: '報價單已過期',
    description: 'QUO-2025-0035《美好生活 — 品牌設計》已超過有效期限，請確認是否需要重新報價。',
    link: '/quotations/QUO-2025-0035',
    time: '2025-04-11',
    date: '2025-04-11',
    unread: false,
  },
]

const typeConfig: Record<
  Notification['type'],
  { icon: React.ReactNode; color: string; label: string }
> = {
  quotation_expiry: {
    icon: <Clock className="h-4 w-4" />,
    color: 'text-amber-500 bg-amber-50',
    label: '報價到期',
  },
  customer_update: {
    icon: <UserCheck className="h-4 w-4" />,
    color: 'text-blue-500 bg-blue-50',
    label: '客戶更新',
  },
  order_update: {
    icon: <FileText className="h-4 w-4" />,
    color: 'text-green-500 bg-green-50',
    label: '訂單更新',
  },
  transfer: {
    icon: <UserCheck className="h-4 w-4" />,
    color: 'text-purple-500 bg-purple-50',
    label: '業務轉移',
  },
  system: {
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-gray-500 bg-gray-100',
    label: '系統通知',
  },
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
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const filtered = notifications.filter((n) => {
    const matchTab = activeTab === 'all' || (activeTab === 'unread' && n.unread)
    const matchType = typeFilter === 'all' || n.type === typeFilter
    return matchTab && matchType
  })

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    )
  }

  // Group by date
  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.date]) acc[n.date] = []
    acc[n.date].push(n)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full">
      <TopBar breadcrumbs={[{ label: '通知中心' }]} />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-semibold">通知中心</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {unreadCount} 則未讀通知
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={markAllRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  全部標為已讀
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">
                  全部
                  <Badge variant="secondary" className="ml-2 text-xs h-5 px-1.5">
                    {notifications.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="unread">
                  未讀
                  {unreadCount > 0 && (
                    <Badge className="ml-2 text-xs h-5 px-1.5">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部類型</SelectItem>
                <SelectItem value="quotation_review_request">待審核</SelectItem>
                <SelectItem value="quotation_review_result">審核結果</SelectItem>
                <SelectItem value="quotation_expiry">報價到期</SelectItem>
                <SelectItem value="customer_update">客戶更新</SelectItem>
                <SelectItem value="order_update">訂單更新</SelectItem>
                <SelectItem value="transfer">業務轉移</SelectItem>
                <SelectItem value="system">系統通知</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification list grouped by date */}
          {Object.keys(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <BellOff className="h-10 w-10 mb-4 opacity-40" />
              <p>沒有通知</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                    {date}
                  </h2>
                  <div className="space-y-2">
                    {items.map((n) => {
                      const isRejectResult = n.type === 'quotation_review_result' && n.title.includes('退回')
                      const config = isRejectResult
                        ? { icon: <XCircle className="h-4 w-4" />, color: 'text-red-500 bg-red-50', label: '審核退回' }
                        : typeConfig[n.type]
                      return (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50',
                            n.unread ? 'bg-blue-50/30 border-blue-100' : 'bg-card'
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                              config.color
                            )}
                          >
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={cn('text-sm font-medium', n.unread && 'font-semibold')}>
                                  {n.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                                  {n.description}
                                </p>
                                {n.link && (
                                  <Link
                                    href={n.link}
                                    className="text-sm text-blue-600 hover:underline mt-1 block"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    查看詳情 →
                                  </Link>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {n.unread && (
                                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                )}
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {n.time}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
