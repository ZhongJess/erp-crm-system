'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  UserX,
  KeyRound,
  Mail,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const mockUsers = [
  { id: 1, name: '王小明', email: 'wang@erp.com', role: '業務', status: 'active', lastLogin: '2025-04-13 09:22' },
  { id: 2, name: '李美麗', email: 'lee@erp.com', role: '業務', status: 'active', lastLogin: '2025-04-12 17:45' },
  { id: 3, name: '陳志偉', email: 'chen@erp.com', role: '業務', status: 'active', lastLogin: '2025-04-13 08:15' },
  { id: 4, name: '張小芬', email: 'chang@erp.com', role: '主管', status: 'active', lastLogin: '2025-04-13 10:02' },
  { id: 5, name: '林大偉', email: 'lin@erp.com', role: '管理員', status: 'active', lastLogin: '2025-04-11 14:30' },
  { id: 6, name: '吳雅婷', email: 'wu@erp.com', role: 'AM/HR', status: 'active', lastLogin: '2025-04-10 11:00' },
  { id: 7, name: '黃建國', email: 'huang@erp.com', role: '訪客', status: 'inactive', lastLogin: '2025-03-01 09:00' },
]

const roleColors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  管理員: 'default',
  主管: 'secondary',
  業務: 'outline',
  'AM/HR': 'secondary',
  訪客: 'outline',
}

export default function UsersSettingsPage() {
  const [search, setSearch] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('')

  const filtered = mockUsers.filter(
    (u) =>
      u.name.includes(search) ||
      u.email.includes(search) ||
      u.role.includes(search)
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">使用者管理</h2>
          <p className="text-sm text-muted-foreground mt-1">共 {mockUsers.length} 位使用者</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              邀請使用者
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>邀請新使用者</DialogTitle>
              <DialogDescription>
                對方將收到一封電子郵件邀請，完成設定後即可登入系統。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="inviteEmail">電子郵件</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>角色</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="選擇角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {['管理員', '主管', '業務', 'AM/HR', '訪客'].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>
                取消
              </Button>
              <Button onClick={() => setInviteOpen(false)}>
                <Mail className="h-4 w-4 mr-2" />
                發送邀請
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜尋姓名、信箱、角色..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>使用者</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>最後登入</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={roleColors[user.role] ?? 'outline'}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                    {user.status === 'active' ? '啟用' : '停用'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>編輯角色</DropdownMenuItem>
                      <DropdownMenuItem>
                        <KeyRound className="h-4 w-4 mr-2" />
                        重設密碼
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserX className="h-4 w-4 mr-2" />
                        {user.status === 'active' ? '停用帳號' : '啟用帳號'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
