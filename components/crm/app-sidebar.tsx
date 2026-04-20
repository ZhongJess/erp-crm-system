'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Bell,
  Settings,
  ChevronDown,
  Building2,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const mainNavItems = [
  { title: '客戶概覽',   url: '/dashboard',     icon: LayoutDashboard },
  { title: '客戶管理',   url: '/customers',     icon: Users },
  { title: '報價與合約', url: '/quotations',    icon: FileText },
  { title: '訂單管理',   url: '/orders',        icon: ShoppingCart },
]

const systemNavItems = [
  { title: '通知中心', url: '/notifications', icon: Bell,     badge: 3 },
  { title: '系統設定', url: '/settings',      icon: Settings, badge: 0 },
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(url)
  }

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-sidebar-foreground tracking-wide">
            ERP CRM
          </span>
        </Link>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="px-2 pt-3">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className="h-9 gap-3">
                <Link href={item.url}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="my-3 border-t border-sidebar-border/60 mx-1" />

        <SidebarMenu>
          {systemNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className="h-9 gap-3">
                <Link href={item.url}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.badge > 0 && (
                <SidebarMenuBadge className="bg-destructive text-destructive-foreground text-xs font-medium min-w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      {/* User */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-sidebar-accent transition-colors text-left">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  王
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate">王小明</span>
                <span className="text-sm text-sidebar-foreground/50 truncate">業務主管</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem asChild>
              <Link href="/settings/account">帳號設定</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login" className="text-destructive focus:text-destructive">登出</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
