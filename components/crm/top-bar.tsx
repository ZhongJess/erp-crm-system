'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Bell, ChevronRight, X } from 'lucide-react'
import { ThemeToggle } from '@/components/crm/theme-toggle'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface TopBarProps {
  breadcrumbs?: BreadcrumbItem[]
}

const mockNotifications = [
  {
    id: 1,
    title: '報價單 QUO-2025-0042 即將到期',
    description: '請於 3 天內跟進',
    time: '10 分鐘前',
    unread: true,
  },
  {
    id: 2,
    title: '客戶 台灣數位科技 已更新聯絡資訊',
    description: '負責業務：王小明',
    time: '1 小時前',
    unread: true,
  },
  {
    id: 3,
    title: '報價單 QUO-2025-0038 已成案',
    description: '恭喜！請準備轉為訂單',
    time: '昨天',
    unread: false,
  },
]

export function TopBar({ breadcrumbs = [] }: TopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const unreadCount = mockNotifications.filter(n => n.unread).length

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
      <SidebarTrigger />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5 min-w-0">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-semibold tracking-tight truncate">{item.label}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
        {/* Global Search */}
        <div className="relative hidden md:block min-w-0 shrink">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder="搜尋"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 w-32 xl:w-56 pl-8 text-sm bg-transparent border-border/60 focus:border-border focus:bg-card placeholder:text-muted-foreground/50 transition-colors"
          />
        </div>

        {/* Mobile Search */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Quick Add */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-sm font-medium shrink-0">
              新增
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/customers/new">新增客戶</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/quotations/new">新增報價</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader className="px-6 pt-6">
              <SheetTitle>通知中心</SheetTitle>
              <SheetDescription>
                您有 {unreadCount} 則未讀通知
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-2 px-6 pb-6">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-1 rounded-lg p-3 cursor-pointer transition-colors ${
                    notification.unread
                      ? 'bg-info-subtle hover:bg-info-subtle/80'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex-1 min-w-0 text-sm font-medium text-foreground">
                      {notification.title}
                    </span>
                    {notification.unread && (
                      <Badge variant="info" className="shrink-0">
                        新
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {notification.description}
                  </span>
                  <span className="text-sm text-muted-foreground/70">
                    {notification.time}
                  </span>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 md:hidden">
          <div className="w-full max-w-md rounded-lg bg-card p-4 shadow-xl border border-border">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜尋"
                autoFocus
                className="flex-1 border-0 focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
