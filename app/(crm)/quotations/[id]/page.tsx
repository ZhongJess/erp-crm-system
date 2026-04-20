'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Edit,
  Download,
  Check,
  X,
  Clock,
  FileText,
  ArrowRight,
  GitCompare,
  ChevronRight,
  ShoppingCart,
  Send,
  Mail,
  AlertCircle,
  Paperclip,
  UploadCloud,
  Trash2,
} from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

type QuotationStatus = 'draft' | 'pending_review' | 'quoted' | 'negotiating' | 'won' | 'lost' | 'void'
type UserRole = '特助' | '經理' | 'AM'

// ── Static Data ────────────────────────────────────────────────────────────────

const lineItems = [
  { id: 1, name: '首頁設計', description: 'RWD 響應式設計，包含 Banner、服務項目、最新消息等區塊', quantity: 1, unit: '式', unitPrice: 80000, amount: 80000 },
  { id: 2, name: '內頁設計', description: '關於我們、服務介紹、聯絡我們等 5 個內頁', quantity: 5, unit: '頁', unitPrice: 20000, amount: 100000 },
  { id: 3, name: '後台管理系統', description: '內容管理、最新消息管理、聯絡表單管理', quantity: 1, unit: '式', unitPrice: 120000, amount: 120000 },
  { id: 4, name: '主機與網域設定', description: 'AWS 主機設定、SSL 憑證、DNS 設定', quantity: 1, unit: '式', unitPrice: 16667, amount: 16667 },
]

const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
const tax = Math.round(subtotal * 0.05)
const total = subtotal + tax

const versions = [
  { version: 'V2', date: '2025-04-12', user: '特助 林雅婷', changes: '調整後台系統報價，降低主機費用' },
  { version: 'V1', date: '2025-04-08', user: '特助 林雅婷', changes: '初始報價' },
]

const statusBadgeStyles: Record<string, string> = {
  draft:          'bg-draft-bg text-draft-text border-draft-border',
  pending_review: 'bg-pending-review-bg text-pending-review-text border-pending-review-border',
  quoted:         'bg-quoted-bg text-quoted-text border-quoted-border',
  negotiating:    'bg-negotiating-bg text-negotiating-text border-negotiating-border',
  won:            'bg-won-bg text-won-text border-won-border',
  lost:           'bg-lost-bg text-lost-text border-lost-border',
  void:           'bg-void-bg text-void-text border-void-border',
}

const statusLabels: Record<string, string> = {
  draft:          '草稿',
  pending_review: '待審核',
  quoted:         '已報價',
  negotiating:    '議價中',
  won:            '已成案',
  lost:           '未成案',
  void:           '作廢',
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('detail')
  const [rejectNote, setRejectNote] = useState('')

  // Simulated status & role (for prototype demo)
  const [status, setStatus] = useState<QuotationStatus>('draft')
  const [role, setRole] = useState<UserRole>('特助')
  const [sentAt, setSentAt] = useState<string | null>(null)

  // Approval history (mutable for demo)
  const [approvalHistory, setApprovalHistory] = useState([
    { id: 1, action: '建立草稿', actor: '特助 林雅婷', time: '2025/04/12 15:00', note: '', dotColor: 'bg-muted-foreground' },
  ])

  // File upload state
  const MAX_FILE_MB = 10
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg']
  const ALLOWED_EXT = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg']

  type Attachment = { id: number; name: string; size: string; type: string; uploadedAt: string }
  const [attachments, setAttachments] = useState<Attachment[]>([
    { id: 1, name: '合約草稿_v1.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: '2025/04/12 15:30' },
  ])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File) => {
    setUploadError(null)
    // Validate size
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setUploadError(`檔案過大：${(file.size / 1024 / 1024).toFixed(1)} MB，上限為 ${MAX_FILE_MB} MB`)
      return
    }
    // Validate type
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
      setUploadError(`不支援的格式：${ext}，允許格式：${ALLOWED_EXT.join('、')}`)
      return
    }
    // Simulate upload progress
    setUploadProgress(0)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 25
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadProgress(null)
        const sizeMB = (file.size / 1024 / 1024).toFixed(1)
        setAttachments(prev => [
          ...prev,
          {
            id: Date.now(),
            name: file.name,
            size: `${sizeMB} MB`,
            type: file.type,
            uploadedAt: now(),
          },
        ])
        toast.success(`${file.name} 上傳成功`)
      } else {
        setUploadProgress(Math.round(progress))
      }
    }, 200)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const removeAttachment = (id: number) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
    toast.success('附件已移除')
  }

  const quotationData = {
    id: 'QUO-2025-0045',
    customer: '台灣數位科技',
    customerId: 'CUS-2025-0024',
    project: '官網改版專案',
    contact: '陳小華',
    version: 'V2',
    date: '2025-04-12',
    validUntil: '2025-05-12',
    paymentTerms: '簽約後 30 天內支付 50%，驗收後支付餘款',
    schedule: '預計 8 週完成',
    notes: '含一年免費維護服務',
  }

  const formatCurrency = (amount: number) => `NT$ ${amount.toLocaleString()}`

  const now = () => {
    const d = new Date()
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleSubmitReview = () => {
    setStatus('pending_review')
    setApprovalHistory(prev => [
      ...prev,
      { id: prev.length + 1, action: '送審', actor: '特助 林雅婷', time: now(), note: '已通知經理審核', dotColor: 'bg-[#F59E0B]' },
    ])
  }

  const handleApprove = () => {
    setStatus('quoted')
    setApprovalHistory(prev => [
      ...prev,
      { id: prev.length + 1, action: '核准', actor: '張經理', time: now(), note: '報價合理，同意送出', dotColor: 'bg-success' },
    ])
  }

  const handleReject = () => {
    setStatus('draft')
    setApprovalHistory(prev => [
      ...prev,
      { id: prev.length + 1, action: '退回', actor: '張經理', time: now(), note: rejectNote || '（未填退回備註）', dotColor: 'bg-destructive' },
    ])
    setRejectNote('')
  }

  const handleSendToCustomer = () => {
    const t = now()
    setSentAt(t)
    setApprovalHistory(prev => [
      ...prev,
      { id: prev.length + 1, action: '寄送給客戶', actor: '特助 林雅婷', time: t, note: '', dotColor: 'bg-primary' },
    ])
  }

  const handleConvertToOrder = () => {
    const actor = role === '特助' ? '特助 林雅婷' : role === '經理' ? '張經理' : 'AM 王小明'
    setStatus('void')
    setApprovalHistory(prev => [
      ...prev,
      { id: prev.length + 1, action: '轉為訂單', actor, time: now(), note: '已成立訂單 ORD-2025-0013', dotColor: 'bg-success' },
    ])
    router.push('/orders/ORD-2025-0013')
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        breadcrumbs={[
          { label: '報價與合約', href: '/quotations' },
          { label: quotationData.id },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">

        {/* Demo role switcher */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-warning-subtle border border-warning/30 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-warning flex-shrink-0" />
          <span className="text-warning">原型示範模式：目前以</span>
          <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
            <SelectTrigger className="h-7 w-24 bg-card border-warning/40 text-warning font-semibold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="特助">特助</SelectItem>
              <SelectItem value="經理">經理</SelectItem>
              <SelectItem value="AM">AM</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-warning">身分查看，狀態：</span>
          <Select value={status} onValueChange={(v) => setStatus(v as QuotationStatus)}>
            <SelectTrigger className="h-7 w-28 bg-card border-warning/40 text-warning font-semibold text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-muted-foreground">{quotationData.id}</span>
              <Badge variant="outline">{quotationData.version}</Badge>
              <Badge data-testid="quotation-status-badge" className={`border ${statusBadgeStyles[status]}`}>
                {statusLabels[status]}
              </Badge>
              {sentAt && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  已於 {sentAt} 寄出
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{quotationData.project}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/customers/${quotationData.customerId}`} className="text-primary hover:underline">
                {quotationData.customer}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>聯絡人：{quotationData.contact}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            {/* 特助：草稿 → 送審 */}
            {role === '特助' && status === 'draft' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button data-testid="btn-submit-review" className="bg-primary hover:bg-primary/90 gap-2">
                    <Send className="h-4 w-4" />
                    送審
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確認送審？</AlertDialogTitle>
                    <AlertDialogDescription>
                      送審後，報價單將變更為「待審核」狀態，並通知經理審核。在核准前無法編輯。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      data-testid="btn-confirm-submit-review"
                      className="bg-primary hover:bg-primary/90"
                      onClick={handleSubmitReview}
                    >
                      確認送審
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* 特助：待審核 → 送審中（disabled） */}
            {role === '特助' && status === 'pending_review' && (
              <Button disabled className="gap-2 cursor-not-allowed opacity-60">
                <Clock className="h-4 w-4" />
                審核中
              </Button>
            )}

            {/* 特助：已報價 → 寄送給客戶 */}
            {role === '特助' && status === 'quoted' && !sentAt && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-success hover:bg-success/90 gap-2">
                    <Mail className="h-4 w-4" />
                    寄送給客戶
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確認寄送報價給客戶？</AlertDialogTitle>
                    <AlertDialogDescription>
                      將以 Email 寄送報價單 PDF 給 {quotationData.customer}（{quotationData.contact}）。
                      寄出後將記錄寄送時間。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-success hover:bg-success/90"
                      onClick={handleSendToCustomer}
                    >
                      確認寄送
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* 特助/經理：已成案 → 轉為訂單 */}
            {(role === '特助' || role === '經理') && status === 'won' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-success hover:bg-success/90 gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    轉為訂單
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>確認轉為訂單？</AlertDialogTitle>
                    <AlertDialogDescription>
                      將依此報價單建立正式訂單，轉換後報價單狀態不變。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-success hover:bg-success/90"
                      onClick={handleConvertToOrder}
                    >
                      確認轉換
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* 經理：待審核 → 核准 / 退回 */}
            {role === '經理' && status === 'pending_review' && (
              <>
                <Button
                  data-testid="btn-approve"
                  className="bg-success hover:bg-success/90 gap-2"
                  onClick={handleApprove}
                >
                  <Check className="h-4 w-4" />
                  核准
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive/90 gap-2">
                      <X className="h-4 w-4" />
                      退回
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>退回報價單</AlertDialogTitle>
                      <AlertDialogDescription>
                        請輸入退回原因，報價單將退回至草稿狀態供特助修改。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-4">
                      <Label>退回備註 <span className="text-destructive">*</span></Label>
                      <Textarea
                        placeholder="請輸入退回原因..."
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={!rejectNote.trim()}
                        onClick={handleReject}
                      >
                        確認退回
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {/* All: 共用操作 */}
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              匯出 PDF
            </Button>
            {status === 'draft' && (
              <Button variant="outline" asChild>
                <Link href={`/quotations/${params.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  編輯
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="detail">報價明細</TabsTrigger>
            <TabsTrigger value="versions">版本歷程</TabsTrigger>
            <TabsTrigger value="approval">核准記錄</TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="h-3.5 w-3.5 mr-1.5" />
              附件
              {attachments.length > 0 && (
                <span className="ml-1.5 text-sm bg-border text-muted-foreground rounded-full px-1.5 py-0.5">
                  {attachments.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Detail Tab */}
          <TabsContent value="detail" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">報價日期</div>
                  <div className="text-lg font-medium text-foreground mt-1">{quotationData.date}</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">有效期限</div>
                  <div className="text-lg font-medium text-foreground mt-1">{quotationData.validUntil}</div>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">預計時程</div>
                  <div className="text-lg font-medium text-foreground mt-1">{quotationData.schedule}</div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="text-sm text-primary">總金額</div>
                  <div className="text-xl font-semibold text-primary mt-1">{formatCurrency(total)}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">報價明細</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-border">
                      <TableHead className="text-muted-foreground w-[50px]">編號</TableHead>
                      <TableHead className="text-muted-foreground">項目名稱</TableHead>
                      <TableHead className="text-muted-foreground">說明</TableHead>
                      <TableHead className="text-muted-foreground text-right w-[80px]">數量</TableHead>
                      <TableHead className="text-muted-foreground w-[60px]">單位</TableHead>
                      <TableHead className="text-muted-foreground text-right w-[120px]">單價(元)</TableHead>
                      <TableHead className="text-muted-foreground text-right w-[120px]">金額(元)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={item.id} className="border-border">
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.description}</TableCell>
                        <TableCell className="text-right text-foreground">{item.quantity}</TableCell>
                        <TableCell className="text-muted-foreground">{item.unit}</TableCell>
                        <TableCell className="text-right text-foreground">{item.unitPrice.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium text-foreground">{item.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-muted/30">
                    <TableRow className="border-border">
                      <TableCell colSpan={6} className="text-right text-muted-foreground">小計</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{subtotal.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow className="border-border">
                      <TableCell colSpan={6} className="text-right text-muted-foreground">稅額 (5%)</TableCell>
                      <TableCell className="text-right font-medium text-foreground">{tax.toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} className="text-right font-semibold text-foreground">總金額</TableCell>
                      <TableCell className="text-right font-semibold text-primary text-lg">{total.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">付款條件</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{quotationData.paymentTerms}</p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-foreground">條款與備註</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground">{quotationData.notes}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions" className="mt-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-semibold text-foreground">版本歷程</CardTitle>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <GitCompare className="h-4 w-4" />
                  新建版本
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.version}
                      className={`flex items-start gap-4 p-4 rounded-lg ${
                        index === 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={index === 0 ? 'default' : 'outline'} className={index === 0 ? 'bg-primary' : ''}>
                            {version.version}
                          </Badge>
                          {index === 0 && <span className="text-sm text-primary">目前版本</span>}
                        </div>
                        <p className="text-sm text-foreground mt-1">{version.changes}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <span>{version.user}</span>
                          <span>|</span>
                          <Clock className="h-3 w-3" />
                          <span>{version.date}</span>
                        </div>
                      </div>
                      {index > 0 && (
                        <Button variant="outline" size="sm">從此版本建立</Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Approval Tab */}
          <TabsContent value="approval" className="mt-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">核准記錄</CardTitle>
              </CardHeader>
              <CardContent>
                {/* State Machine Diagram */}
                <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">報價單狀態流程</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'draft', label: '草稿' },
                      { key: 'pending_review', label: '待審核' },
                      { key: 'quoted', label: '已報價' },
                      { key: 'negotiating', label: '議價中' },
                    ].map((s, i) => (
                      <div key={s.key} className="flex items-center gap-2">
                        <Badge
                          className={`border ${statusBadgeStyles[s.key]} ${status === s.key ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                        >
                          {s.label}
                        </Badge>
                        {i < 3 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    ))}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <Badge className={`border ${statusBadgeStyles.won} ${status === 'won' ? 'ring-2 ring-offset-1 ring-primary' : ''}`}>已成案</Badge>
                      <Badge className={`border ${statusBadgeStyles.lost} ${status === 'lost' ? 'ring-2 ring-offset-1 ring-primary' : ''}`}>未成案</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">目前高亮狀態即為此報價單現況</p>
                </div>

                {/* Timeline */}
                <div data-testid="approval-timeline" className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-6">
                    {approvalHistory.map((record) => (
                      <div key={record.id} data-testid="timeline-entry" className="relative pl-10">
                        <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full ${record.dotColor} border-2 border-white`} />
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{record.action}</span>
                            <span className="text-sm text-muted-foreground">by {record.actor}</span>
                          </div>
                          {record.note && (
                            <p className="text-sm text-foreground bg-muted/30 p-2 rounded">{record.note}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{record.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="mt-6 space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">附件管理</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Error alert */}
                {uploadError && (
                  <Alert data-testid="upload-error-alert" variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {/* Progress bar */}
                {uploadProgress !== null && (
                  <div data-testid="upload-progress" className="space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>上傳中...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Drop zone */}
                <div
                  data-testid="file-drop-zone"
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors cursor-pointer
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted'}`}
                  onClick={() => document.getElementById('file-input-hidden')?.click()}
                >
                  <UploadCloud className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">拖放檔案至此，或點擊選擇檔案</p>
                    <p className="text-sm text-muted-foreground mt-1">支援 PDF、DOCX、XLSX、PNG、JPG，單檔上限 10 MB</p>
                  </div>
                  <input
                    id="file-input-hidden"
                    data-testid="file-input"
                    type="file"
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                    className="sr-only"
                    onChange={handleFileInput}
                  />
                </div>

                {/* Attachment list */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">已上傳附件</p>
                    {attachments.map((a) => (
                      <div
                        key={a.id}
                        data-testid="attachment-item"
                        className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{a.name}</p>
                            <p className="text-sm text-muted-foreground">{a.size} · {a.uploadedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                            onClick={() => removeAttachment(a.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
