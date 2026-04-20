'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function AccountSettingsPage() {
  const [name, setName] = useState('王小明')
  const [email, setEmail] = useState('wang@erp.com')
  const [phone, setPhone] = useState('0912-345-678')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setIsSaving(false)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">帳號設定</h2>
        <p className="text-sm text-muted-foreground mt-1">管理你的個人資料與登入資訊</p>
      </div>

      {/* Profile */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">個人資料</CardTitle>
          <CardDescription>更新你的姓名、電子郵件與電話號碼</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">王</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">更換頭貼</Button>
              <p className="text-sm text-muted-foreground mt-1">支援 JPG、PNG，最大 2MB</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>角色</Label>
              <div className="mt-1 flex items-center h-10">
                <Badge variant="secondary">業務</Badge>
              </div>
            </div>
            <div>
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">電話號碼</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '儲存中...' : '儲存變更'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">變更密碼</CardTitle>
          <CardDescription>定期更新密碼以確保帳號安全</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPw">目前密碼</Label>
            <div className="relative mt-1">
              <Input
                id="currentPw"
                type={showCurrentPw ? 'text' : 'password'}
                placeholder="輸入目前密碼"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowCurrentPw((v) => !v)}
              >
                {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="newPw">新密碼</Label>
            <div className="relative mt-1">
              <Input
                id="newPw"
                type={showNewPw ? 'text' : 'password'}
                placeholder="至少 8 個字元"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowNewPw((v) => !v)}
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="confirmPw">確認新密碼</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPw"
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="再次輸入新密碼"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowConfirmPw((v) => !v)}
              >
                {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline">變更密碼</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
