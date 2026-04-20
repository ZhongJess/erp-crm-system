export type ProgressStatus =
  | 'pending_schedule'
  | 'scheduling'
  | 'in_delivery'
  | 'delivered'
  | 'uat'
  | 'closed'
  | 'cancelled'

export const progressStatusConfig: Record<
  ProgressStatus,
  { label: string; className: string; nextStates: ProgressStatus[] }
> = {
  pending_schedule: {
    label: '待排程',
    className: 'bg-gray-100 text-gray-600 border border-gray-300',
    nextStates: ['scheduling', 'cancelled'],
  },
  scheduling: {
    label: '排程中',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
    nextStates: ['in_delivery', 'cancelled'],
  },
  in_delivery: {
    label: '交付中',
    className: 'bg-blue-100 text-blue-800 border border-blue-300',
    nextStates: ['delivered', 'cancelled'],
  },
  delivered: {
    label: '已交付',
    className: 'bg-orange-50 text-orange-700 border border-orange-200',
    nextStates: ['uat', 'in_delivery', 'cancelled'],
  },
  uat: {
    label: '驗收中',
    className: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    nextStates: ['closed', 'in_delivery', 'cancelled'],
  },
  closed: {
    label: '已結案',
    className: 'bg-green-50 text-green-700 border border-green-200',
    nextStates: [],
  },
  cancelled: {
    label: '已取消',
    className: 'bg-red-50 text-red-700 border border-red-200',
    nextStates: [],
  },
}

export const progressStatusFlow: ProgressStatus[] = [
  'pending_schedule',
  'scheduling',
  'in_delivery',
  'delivered',
  'uat',
  'closed',
]
