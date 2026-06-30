'use client'

import { Badge } from '@/components/ui/badge'

type StatusType = 
  | 'active' | 'inactive' | 'suspended'
  | 'completed' | 'void' | 'refund'
  | 'staff' | 'manager' | 'admin'
  | 'cash' | 'qris' | 'transfer' | 'card'
  | 'expired' | 'cancelled'

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  void: { label: 'Void', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
  refund: { label: 'Refund', className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  staff: { label: 'Staff', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700' },
  manager: { label: 'Manager', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' },
  cash: { label: 'Cash', className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  qris: { label: 'QRIS', className: 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800' },
  transfer: { label: 'Transfer', className: 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800' },
  card: { label: 'Card', className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] || {
    label: status,
    className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400',
  }

  return (
    <Badge variant="outline" className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  )
}