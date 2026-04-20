'use client'

export const dynamic = 'force-dynamic'

import React, { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save, Trash2 } from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const customerTypes = ['企業', '政府機關', '學校', '財團法人', '合作夥伴']
const customerSources = ['官網詢問', '電話', '轉介紹', '展覽活動', '廣告', '其他']
const salesPeople = ['王小明', '李美麗', '陳志偉', '張小芬']
const cities = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市']
const districts: Record<string, string[]> = {
  台北市: ['中正區', '大同區', '中山區', '松山區', '大安區', '萬華區', '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'],
  新北市: ['板橋區', '三重區', '中和區', '永和區', '新莊區', '新店區', '土城區', '蘆洲區', '汐止區', '樹林區'],
  桃園市: ['桃園區', '中壢區', '平鎮區', '八德區', '楊梅區', '蘆竹區', '龜山區'],
  台中市: ['中區', '東區', '南區', '西區', '北區', '西屯區', '南屯區', '北屯區'],
  台南市: ['中西區', '東區', '南區', '北區', '安平區', '安南區'],
  高雄市: ['新興區', '前金區', '苓雅區', '鹽埕區', '鼓山區', '旗津區', '前鎮區', '三民區', '左營區', '楠梓區'],
}

// Mock existing customer data for editing
const mockCustomer = {
  id: 'CUS-2025-0024',
  companyName: '台灣數位科技股份有限公司',
  taxId: '12345678',
  customerType: '企業',
  customerSource: '官網詢問',
  salesPerson: '王小明',
  city: '台北市',
  district: '信義區',
  address: '信義路五段7號',
  website: 'https://taiwan-digital.com',
  note: '重要客戶，請優先跟進。',
  status: 'active',
}

export default function EditCustomerPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state pre-filled with existing data
  const [companyName, setCompanyName] = useState(mockCustomer.companyName)
  const [taxId, setTaxId] = useState(mockCustomer.taxId)
  const [customerType, setCustomerType] = useState(mockCustomer.customerType)
  const [customerSource, setCustomerSource] = useState(mockCustomer.customerSource)
  const [salesPerson, setSalesPerson] = useState(mockCustomer.salesPerson)
  const [selectedCity, setSelectedCity] = useState(mockCustomer.city)
  const [selectedDistrict, setSelectedDistrict] = useState(mockCustomer.district)
  const [address, setAddress] = useState(mockCustomer.address)
  const [website, setWebsite] = useState(mockCustomer.website)
  const [note, setNote] = useState(mockCustomer.note)

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 800))
    setIsSaving(false)
    router.push(`/customers/${params.id}`)
  }

  const handleCancel = () => {
    setShowLeaveDialog(true)
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        breadcrumbs={[
          { label: '客戶管理', href: '/customers' },
          { label: mockCustomer.companyName, href: `/customers/${params.id}` },
          { label: '編輯資料' },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">編輯客戶資料</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                {mockCustomer.id}
                <Badge variant="outline" className="text-xs">
                  {mockCustomer.status === 'active' ? '有效' : '已封存'}
                </Badge>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowArchiveDialog(true)}
            >
              封存客戶
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? '儲存中...' : '儲存變更'}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="basic">基本資料</TabsTrigger>
            <TabsTrigger value="contacts">聯絡人</TabsTrigger>
            <TabsTrigger value="assets">資產</TabsTrigger>
          </TabsList>

          {/* ─── Tab 1: 基本資料 ─── */}
          <TabsContent value="basic">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">公司資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="companyName">
                          公司全名 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="taxId">統一編號</Label>
                        <Input
                          id="taxId"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          maxLength={8}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">公司網站</Label>
                        <Input
                          id="website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>客戶類型</Label>
                        <Select value={customerType} onValueChange={setCustomerType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {customerTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>客戶來源</Label>
                        <Select value={customerSource} onValueChange={setCustomerSource}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {customerSources.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">地址</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>縣市</Label>
                        <Select
                          value={selectedCity}
                          onValueChange={(v) => {
                            setSelectedCity(v)
                            setSelectedDistrict('')
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選擇縣市" />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>行政區</Label>
                        <Select
                          value={selectedDistrict}
                          onValueChange={setSelectedDistrict}
                          disabled={!selectedCity}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="選擇行政區" />
                          </SelectTrigger>
                          <SelectContent>
                            {(districts[selectedCity] ?? []).map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="address">街道地址</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">備註</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={4}
                      placeholder="輸入客戶備註..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">負責業務</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={salesPerson} onValueChange={setSalesPerson}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {salesPeople.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">異動記錄</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="text-muted-foreground">
                      <p>建立時間</p>
                      <p className="font-medium text-foreground">2025-04-10 09:32</p>
                    </div>
                    <Separator />
                    <div className="text-muted-foreground">
                      <p>最後異動</p>
                      <p className="font-medium text-foreground">2025-04-12 14:18</p>
                    </div>
                    <Separator />
                    <div className="text-muted-foreground">
                      <p>異動人員</p>
                      <p className="font-medium text-foreground">王小明</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─── Tab 2: 聯絡人 ─── */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">聯絡人管理</CardTitle>
                <Button size="sm">新增聯絡人</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: '陳小華', title: '採購經理', primary: true },
                  { name: '林大偉', title: 'IT 主管', primary: false },
                ].map((c, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.primary && <Badge className="text-xs">主要聯絡人</Badge>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          編輯
                        </Button>
                        {!c.primary && (
                          <Button size="sm" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.title}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Tab 3: 資產 ─── */}
          <TabsContent value="assets">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">資產清單</CardTitle>
                <Button size="sm">新增資產</Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: '官方網站', url: 'https://taiwan-digital.com', type: '網站' },
                  { name: '電商平台', url: 'https://shop.taiwan-digital.com', type: '電商' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <p className="font-medium text-sm">{a.name}</p>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {a.url}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{a.type}</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Warning Dialog */}
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要離開嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              你有未儲存的變更，離開後將會遺失。是否確定要離開？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>繼續編輯</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(`/customers/${params.id}`)}>
              離開不儲存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>封存此客戶？</AlertDialogTitle>
            <AlertDialogDescription>
              封存後，此客戶將不會出現在預設列表中，但仍可透過篩選器搜尋。
              相關報價單與訂單不受影響。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              確認封存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
