'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Check, X, Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const roles = ['管理員', '主管', '業務', 'AM/HR', '訪客']

const permissions = [
  {
    category: '客戶管理',
    items: [
      { name: '查看客戶列表', key: 'customers.list', access: [true, true, true, true, true] },
      { name: '查看客戶詳情', key: 'customers.view', access: [true, true, true, true, true] },
      { name: '新增客戶', key: 'customers.create', access: [true, true, true, false, false] },
      { name: '編輯客戶', key: 'customers.edit', access: [true, true, true, false, false] },
      { name: '封存客戶', key: 'customers.archive', access: [true, true, false, false, false] },
      { name: '刪除客戶', key: 'customers.delete', access: [true, false, false, false, false] },
    ],
  },
  {
    category: '報價與合約',
    items: [
      { name: '查看報價單', key: 'quotations.view', access: [true, true, true, true, true] },
      { name: '新增報價單', key: 'quotations.create', access: [true, true, true, false, false] },
      { name: '編輯報價單', key: 'quotations.edit', access: [true, true, true, false, false] },
      { name: '作廢報價單', key: 'quotations.void', access: [true, true, false, false, false] },
      { name: 'Inline 狀態更新', key: 'quotations.inline_status', access: [true, false, false, true, false], note: '僅 AM/HR 可直接更新狀態' },
    ],
  },
  {
    category: '訂單管理',
    items: [
      { name: '查看訂單', key: 'orders.view', access: [true, true, true, true, false] },
      { name: '更新訂單狀態', key: 'orders.status', access: [true, true, false, true, false] },
      { name: '下載合約', key: 'orders.download', access: [true, true, true, true, false] },
    ],
  },
  {
    category: '系統設定',
    items: [
      { name: '使用者管理', key: 'settings.users', access: [true, false, false, false, false] },
      { name: '角色權限設定', key: 'settings.roles', access: [true, false, false, false, false] },
      { name: '負責業務轉移', key: 'settings.transfer', access: [true, true, false, false, false] },
      { name: '查看系統日誌', key: 'settings.logs', access: [true, false, false, false, false] },
    ],
  },
]

const CheckIcon = () => <Check className="h-4 w-4 text-green-600 mx-auto" />
const XIcon = () => <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />

export default function RolesSettingsPage() {
  return (
    <TooltipProvider>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">角色與權限</h2>
            <p className="text-sm text-muted-foreground mt-1">各角色的功能存取權限總覽</p>
          </div>
          <Button variant="outline" disabled>
            申請調整權限
          </Button>
        </div>

        {/* Role badges */}
        <div className="flex items-center gap-2 mb-6">
          {roles.map((role) => (
            <Badge key={role} variant="outline" className="px-3 py-1">
              {role}
            </Badge>
          ))}
        </div>

        {/* Permissions table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-52">功能項目</TableHead>
                {roles.map((role) => (
                  <TableHead key={role} className="text-center w-24">
                    {role}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((category) => (
                <React.Fragment key={category.category}>
                  <TableRow className="bg-muted/50">
                    <TableCell
                      colSpan={roles.length + 1}
                      className="font-semibold text-sm py-2"
                    >
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.items.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5">
                          {item.name}
                          {item.note && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm max-w-48">{item.note}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      {item.access.map((allowed, i) => (
                        <TableCell key={i} className="text-center">
                          {allowed ? <CheckIcon /> : <XIcon />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}
