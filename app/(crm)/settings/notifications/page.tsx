'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NotificationSetting {
  key: string
  label: string
  description: string
  inApp: boolean
  email: boolean
}

export default function NotificationPreferencesPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      key: 'quotation_expiry',
      label: '報價單即將到期',
      description: '報價有效期限即將到達時通知',
      inApp: true,
      email: true,
    },
    {
      key: 'quotation_expired',
      label: '報價單已過期',
      description: '報價單有效期限已過時通知',
      inApp: true,
      email: false,
    },
    {
      key: 'order_status',
      label: '訂單狀態變更',
      description: '訂單狀態被更新時通知',
      inApp: true,
      email: true,
    },
    {
      key: 'customer_update',
      label: '客戶資料更新',
      description: '負責客戶資料被修改時通知',
      inApp: true,
      email: false,
    },
    {
      key: 'transfer',
      label: '業務轉移',
      description: '有客戶轉移給你或從你轉出時通知',
      inApp: true,
      email: true,
    },
    {
      key: 'system',
      label: '系統通知',
      description: '維護公告、版本更新等系統訊息',
      inApp: true,
      email: false,
    },
  ])

  const [expiryAdvance, setExpiryAdvance] = useState('7')

  const toggle = (key: string, channel: 'inApp' | 'email') => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [channel]: !s[channel] } : s))
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">通知偏好</h2>
        <p className="text-sm text-muted-foreground mt-1">設定哪些事件要通知你，以及通知方式</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">報價到期提醒</CardTitle>
          <CardDescription>系統將在報價到期前提前通知你</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label>提前幾天通知</Label>
            <Select value={expiryAdvance} onValueChange={setExpiryAdvance}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['3', '5', '7', '14', '30'].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d} 天前
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">通知項目設定</CardTitle>
          <CardDescription>選擇要接收哪種通知，以及透過哪個管道接收</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_80px_80px] gap-4 mb-3 px-0">
            <span />
            <span className="text-sm font-medium text-muted-foreground text-center">系統內</span>
            <span className="text-sm font-medium text-muted-foreground text-center">Email</span>
          </div>

          <div className="space-y-1">
            {settings.map((s, i) => (
              <div key={s.key}>
                {i > 0 && <Separator className="my-3" />}
                <div className="grid grid-cols-[1fr_80px_80px] gap-4 items-center">
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={s.inApp}
                      onCheckedChange={() => toggle(s.key, 'inApp')}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={s.email}
                      onCheckedChange={() => toggle(s.key, 'email')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              儲存設定
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
