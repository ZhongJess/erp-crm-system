export interface PaymentTerm {
  id: string
  label: string
  text: string
}

export interface NoteOption {
  id: string
  label: string
  text: string
  defaultChecked?: boolean
}

export const PAYMENT_TERMS: PaymentTerm[] = [
  {
    id: 'two-stage',
    label: '兩期付款（簽約 50% + 驗收 50%）',
    text: '簽約後 30 日內支付總價 50%，驗收完成後 14 日內支付餘款 50%。',
  },
  {
    id: 'three-stage',
    label: '三期付款（簽約 30% + 期中 50% + 驗收 20%）',
    text: '簽約時支付 30%，開發完成時支付 50%，驗收通過後支付餘款 20%。',
  },
  {
    id: 'one-time',
    label: '一次付清（驗收後 30 日內）',
    text: '驗收完成後 30 日內一次付清。',
  },
  {
    id: 'monthly',
    label: '月結 30 天',
    text: '月結 30 天，每月 25 日前開立發票，次月 10 日前付款。',
  },
  {
    id: 'gov',
    label: '政府 / 大企業核銷流程',
    text: '收到統一發票後 30 日內，依核銷流程撥款。',
  },
]

export const NOTES_OPTIONS: NoteOption[] = [
  {
    id: 'validity',
    label: '報價有效期（30 日）',
    text: '本報價單自開立日起 30 日內有效。',
    defaultChecked: true,
  },
  {
    id: 'tax',
    label: '未稅報價，另加 5% 營業稅',
    text: '本報價金額為未稅，另加 5% 營業稅。',
    defaultChecked: true,
  },
  {
    id: 'warranty',
    label: '90 天免費保固',
    text: '本公司保證交付之成果物無重大瑕疵，驗收後提供 90 天免費修補服務。',
  },
  {
    id: 'penalty',
    label: '逾期違約金',
    text: '如乙方未依約定時程交付，每逾期一日按合約總金額之 0.1% 計罰違約金，最高不超過 10%。',
  },
  {
    id: 'change',
    label: '變更須書面確認',
    text: '本報價內容如有變更，以雙方書面確認為準。',
  },
  {
    id: 'ip',
    label: '智財權驗收後歸甲方',
    text: '驗收完成並支付餘款後，成果物著作財產權歸甲方所有。',
  },
  {
    id: 'thirdparty',
    label: '第三方授權費另計',
    text: '本報價未包含第三方授權費（如字型、素材、SaaS 訂閱），實際發生時另計。',
  },
]
