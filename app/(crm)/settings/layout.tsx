'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { TopBar } from '@/components/crm/top-bar'
import { cn } from '@/lib/utils'

const settingsNav = [
  { href: '/settings/account',       label: '帳號設定' },
  { href: '/settings/users',         label: '使用者管理',  adminOnly: true },
  { href: '/settings/roles',         label: '角色與權限',  adminOnly: true },
  { href: '/settings/transfer',      label: '業務轉移' },
  { href: '/settings/notifications', label: '通知偏好' },
  { href: '/settings/logs',          label: '系統日誌',    adminOnly: true },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      <TopBar breadcrumbs={[{ label: '系統設定' }]} />

      {/* Tab nav */}
      <div className="border-b border-border px-6">
        <nav className="flex items-center gap-1 -mb-px">
          {settingsNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-3 text-sm border-b-2 transition-colors whitespace-nowrap',
                  active
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                {item.label}
                {item.adminOnly && (
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
