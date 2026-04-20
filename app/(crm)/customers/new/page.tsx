'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'

import { TopBar } from '@/components/crm/top-bar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

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

interface Contact {
  id: number
  name: string
  title: string
  department: string
  isPrimary: boolean
  phones: { type: string; number: string; ext?: string }[]
  emails: { type: string; email: string }[]
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false)
  const [showLeaveWarning, setShowLeaveWarning] = useState(false)

  // Form state
  const [companyName, setCompanyName] = useState('')
  const [taxId, setTaxId] = useState('')
  const [customerType, setCustomerType] = useState('')
  const [customerSource, setCustomerSource] = useState('')
  const [salesPerson, setSalesPerson] = useState('')
  const [note, setNote] = useState('')

  // Address state
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [address, setAddress] = useState('')

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: '',
      title: '',
      department: '',
      isPrimary: true,
      phones: [{ type: '手機', number: '' }],
      emails: [{ type: '公務', email: '' }],
    },
  ])

  const handleTaxIdChange = (value: string) => {
    setTaxId(value)
    // Simulate duplicate detection
    if (value === '12345678') {
      setShowDuplicateWarning(true)
    }
  }

  const addContact = () => {
    setContacts([
      ...contacts,
      {
        id: Date.now(),
        name: '',
        title: '',
        department: '',
        isPrimary: false,
        phones: [{ type: '手機', number: '' }],
        emails: [{ type: '公務', email: '' }],
      },
    ])
  }

  const removeContact = (id: number) => {
    setContacts(contacts.filter((c) => c.id !== id))
  }

  const addPhone = (contactId: number) => {
    setContacts(
      contacts.map((c) =>
        c.id === contactId
          ? { ...c, phones: [...c.phones, { type: '辦公室', number: '' }] }
          : c
      )
    )
  }

  const addEmail = (contactId: number) => {
    setContacts(
      contacts.map((c) =>
        c.id === contactId
          ? { ...c, emails: [...c.emails, { type: '個人', email: '' }] }
          : c
      )
    )
  }

  const handleSave = () => {
    // Simulate saving
    router.push('/customers/CUS-2025-0025')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        breadcrumbs={[
          { label: '客戶管理', href: '/customers' },
          { label: '新增客戶' },
        ]}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">新增客戶</h1>
            <p className="text-sm text-muted-foreground mt-1">
              流水編號將由系統自動產生
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLeaveWarning(true)}
            >
              取消
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSave}
            >
              儲存
            </Button>
          </div>
        </div>

        {/* Duplicate Warning */}
        <AlertDialog open={showDuplicateWarning} onOpenChange={setShowDuplicateWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" />
                偵測到可能重複的客戶
              </AlertDialogTitle>
              <AlertDialogDescription>
                <div className="mt-4 p-4 bg-warning-subtle rounded-lg">
                  <p className="font-medium text-warning mb-2">
                    統一編號 12345678 已存在於系統中：
                  </p>
                  <div className="text-sm text-warning space-y-1">
                    <p>客戶名稱：台灣數位科技股份有限公司</p>
                    <p>流水編號：CUS-2025-0024</p>
                    <p>負責業務：王小明</p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                className="bg-primary hover:bg-primary/90"
                onClick={() => router.push('/customers/CUS-2025-0024')}
              >
                前往已有客戶
              </AlertDialogAction>
              <AlertDialogCancel>仍要建立新客戶</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Leave Warning */}
        <AlertDialog open={showLeaveWarning} onOpenChange={setShowLeaveWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確定要離開嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                您填寫的資料尚未儲存，離開後將會遺失所有內容。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>繼續編輯</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => router.push('/customers')}
              >
                確定離開
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="basic">基本資料</TabsTrigger>
            <TabsTrigger value="contacts">聯絡人</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="mt-6 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  公司資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">
                      公司名稱 <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      placeholder="請輸入公司名稱"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">統一編號</Label>
                    <Input
                      id="taxId"
                      placeholder="請輸入統一編號"
                      value={taxId}
                      onChange={(e) => handleTaxIdChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>客戶類別</Label>
                    <Select value={customerType} onValueChange={setCustomerType}>
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇客戶類別" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>客戶來源</Label>
                    <Select value={customerSource} onValueChange={setCustomerSource}>
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇客戶來源" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>負責業務</Label>
                  <Select value={salesPerson} onValueChange={setSalesPerson}>
                    <SelectTrigger className="md:w-1/2">
                      <SelectValue placeholder="請選擇負責業務" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesPeople.map((person) => (
                        <SelectItem key={person} value={person}>
                          {person}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  地址資訊
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>縣市</Label>
                    <Select
                      value={selectedCity}
                      onValueChange={(value) => {
                        setSelectedCity(value)
                        setSelectedDistrict('')
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇縣市" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>鄉鎮市區</Label>
                    <Select
                      value={selectedDistrict}
                      onValueChange={setSelectedDistrict}
                      disabled={!selectedCity}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇鄉鎮市區" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCity &&
                          districts[selectedCity]?.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>郵遞區號</Label>
                    <Input
                      placeholder="自動帶入"
                      disabled
                      value={selectedDistrict ? '110' : ''}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>詳細地址</Label>
                  <Input
                    placeholder="請輸入詳細地址"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  新增其他地址
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-foreground">
                  備註
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="請輸入備註..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6 space-y-4">
            <Alert className="bg-primary/5 border-primary/20">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary">提示</AlertTitle>
              <AlertDescription className="text-primary">
                請至少新增一位聯絡人，並指定主要聯絡人。
              </AlertDescription>
            </Alert>

            {contacts.map((contact, index) => (
              <Card key={contact.id} className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-foreground">
                    聯絡人 {index + 1}
                  </CardTitle>
                  {contacts.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => removeContact(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`primary-${contact.id}`}
                      checked={contact.isPrimary}
                      onCheckedChange={(checked) => {
                        setContacts(
                          contacts.map((c) => ({
                            ...c,
                            isPrimary: c.id === contact.id ? !!checked : false,
                          }))
                        )
                      }}
                    />
                    <Label htmlFor={`primary-${contact.id}`} className="text-sm">
                      設為主要聯絡人
                    </Label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>姓名</Label>
                      <Input placeholder="請輸入姓名" />
                    </div>
                    <div className="space-y-2">
                      <Label>職稱</Label>
                      <Input placeholder="請輸入職稱" />
                    </div>
                    <div className="space-y-2">
                      <Label>部門</Label>
                      <Input placeholder="請輸入部門" />
                    </div>
                  </div>

                  {/* Phones */}
                  <div className="space-y-2">
                    <Label>電話</Label>
                    {contact.phones.map((phone, phoneIndex) => (
                      <div key={phoneIndex} className="flex items-center gap-2">
                        <Select defaultValue={phone.type}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="手機">手機</SelectItem>
                            <SelectItem value="辦公室">辦公室</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="電話號碼" className="flex-1" />
                        <Input placeholder="分機" className="w-[80px]" />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => addPhone(contact.id)}
                    >
                      <Plus className="h-4 w-4" />
                      新增電話
                    </Button>
                  </div>

                  {/* Emails */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    {contact.emails.map((email, emailIndex) => (
                      <div key={emailIndex} className="flex items-center gap-2">
                        <Select defaultValue={email.type}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="公務">公務</SelectItem>
                            <SelectItem value="個人">個人</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input placeholder="Email 地址" className="flex-1" />
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => addEmail(contact.id)}
                    >
                      <Plus className="h-4 w-4" />
                      新增 Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full gap-2" onClick={addContact}>
              <Plus className="h-4 w-4" />
              新增聯絡人
            </Button>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
