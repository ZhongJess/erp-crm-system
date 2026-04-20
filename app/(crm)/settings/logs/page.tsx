'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Search, Download, Filter } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface LogEntry {
  id: number
  timestamp: string
  user: string
  role: string
  action: string
  module: string
  target: string
  ip: string
  result: 'success' | 'failed'
}

const mockLogs: LogEntry[] = [
  { id: 1, timestamp: '2025-04-13 10:32:05', user: '林大偉', role: '管理員', action: '邀請使用者', module: '使用者管理', target: 'new@company.com', ip: '192.168.1.101', result: 'success' },
  { id: 2, timestamp: '2025-04-13 10:15:22', user: '張小芬', role: '主管', action: '業務轉移', module: '業務轉移', target: 'CUS-2025-0011 → 李美麗', ip: '192.168.1.105', result: 'success' },
  { id: 3, timestamp: '2025-04-13 09:58:10', user: '王小明', role: '業務', action: '建立報價單', module: '報價與合約', target: 'QUO-2025-0046', ip: '192.168.1.102', result: 'success' },
  { id: 4, timestamp: '2025-04-13 09:44:33', user: '陳志偉', role: '業務', action: '編輯客戶', module: '客戶管理', target: 'CUS-2025-0018', ip: '192.168.1.103', result: 'success' },
  { id: 5, timestamp: '2025-04-13 09:30:01', user: '未知', role: '—', action: '登入失敗', module: '認證', target: 'admin@erp.com', ip: '203.65.12.44', result: 'failed' },
  { id: 6, timestamp: '2025-04-12 17:45:20', user: '李美麗', role: '業務', action: '登入', module: '認證', target: '—', ip: '192.168.1.104', result: 'success' },
  { id: 7, timestamp: '2025-04-12 16:20:44', user: '林大偉', role: '管理員', action: '匯出報表', module: '訂單管理', target: 'orders-2025-04.xlsx', ip: '192.168.1.101', result: 'success' },
  { id: 8, timestamp: '2025-04-12 15:05:13', user: '王小明', role: '業務', action: '封存客戶', module: '客戶管理', target: 'CUS-2025-0009', ip: '192.168.1.102', result: 'success' },
  { id: 9, timestamp: '2025-04-12 14:30:50', user: '張小芬', role: '主管', action: '更新訂單狀態', module: '訂單管理', target: 'ORD-2025-0008 → 已交付', ip: '192.168.1.105', result: 'success' },
  { id: 10, timestamp: '2025-04-12 13:15:29', user: '吳雅婷', role: 'AM/HR', action: 'Inline 狀態更新', module: '報價與合約', target: 'QUO-2025-0040 → 已成案', ip: '192.168.1.106', result: 'success' },
]

const moduleOptions = ['全部模組', '認證', '客戶管理', '報價與合約', '訂單管理', '使用者管理', '業務轉移']

export default function SystemLogsPage() {
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('全部模組')
  const [resultFilter, setResultFilter] = useState('all')

  const filtered = mockLogs.filter((log) => {
    const matchSearch =
      log.user.includes(search) ||
      log.action.includes(search) ||
      log.target.includes(search)
    const matchModule = moduleFilter === '全部模組' || log.module === moduleFilter
    const matchResult = resultFilter === 'all' || log.result === resultFilter
    return matchSearch && matchModule && matchResult
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">系統日誌</h2>
          <p className="text-sm text-muted-foreground mt-1">所有使用者操作記錄（Audit Log）</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          匯出日誌
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋使用者、操作、目標..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={moduleFilter} onValueChange={setModuleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {moduleOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resultFilter} onValueChange={setResultFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="結果" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部結果</SelectItem>
            <SelectItem value="success">成功</SelectItem>
            <SelectItem value="failed">失敗</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>時間</TableHead>
              <TableHead>使用者</TableHead>
              <TableHead>操作</TableHead>
              <TableHead>模組</TableHead>
              <TableHead>目標</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>結果</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {log.timestamp}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">{log.user}</p>
                    <p className="text-xs text-muted-foreground">{log.role}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{log.action}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {log.module}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-mono">{log.target}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">{log.ip}</TableCell>
                <TableCell>
                  <Badge variant={log.result === 'success' ? 'outline' : 'destructive'}>
                    {log.result === 'success' ? '成功' : '失敗'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <p>顯示 {filtered.length} / {mockLogs.length} 筆</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
