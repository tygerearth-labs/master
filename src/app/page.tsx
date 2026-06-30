'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Receipt,
  Store,
  Users,
  CreditCard,
  Menu,
  X,
  TrendingUp,
  Activity,
  Building2,
  UserCheck,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

// ==================== TYPES ====================
type TabId = 'overview' | 'pipeline' | 'transactions' | 'outlets' | 'users' | 'plans'

interface NavItem {
  id: TabId
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'pipeline', label: 'Pipeline', icon: <ArrowLeftRight size={18} /> },
  { id: 'transactions', label: 'Transactions', icon: <Receipt size={18} /> },
  { id: 'outlets', label: 'Outlets', icon: <Store size={18} /> },
  { id: 'users', label: 'Users', icon: <Users size={18} /> },
  { id: 'plans', label: 'Plans & Pricing', icon: <CreditCard size={18} /> },
]

// ==================== STATUS BADGE ====================
function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'RECEIVED'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
      : status === 'IN_TRANSIT'
        ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
        : status === 'CANCELLED'
          ? 'bg-red-500/15 text-red-400 border-red-500/20'
          : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        variant
      )}
    >
      {status}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const isOwner = role === 'OWNER'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        isOwner
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
          : 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
      )}
    >
      {role}
    </span>
  )
}

// ==================== SKELETON LOADERS ====================
function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <Skeleton className="mb-2 h-4 w-24" />
      <Skeleton className="h-7 w-32" />
    </div>
  )
}

// ==================== OVERVIEW ====================
function OverviewSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetch('/api/dashboard').then((r) => r.json()),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  const stats = data?.stats ?? { revenue: 0, transactions: 0, outlets: 0, users: 0 }
  const recentTransfers = Array.isArray(data?.recentTransfers) ? data.recentTransfers : []
  const recentTransactions = Array.isArray(data?.recentTransactions) ? data.recentTransactions : []

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.revenue),
      icon: <TrendingUp size={16} />,
      color: 'text-emerald-400',
    },
    {
      label: 'Total Transactions',
      value: stats.transactions.toLocaleString('id-ID'),
      icon: <Activity size={16} />,
      color: 'text-zinc-300',
    },
    {
      label: 'Active Outlets',
      value: stats.outlets.toLocaleString('id-ID'),
      icon: <Building2 size={16} />,
      color: 'text-zinc-300',
    },
    {
      label: 'Active Users',
      value: stats.users.toLocaleString('id-ID'),
      icon: <UserCheck size={16} />,
      color: 'text-zinc-300',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              {card.icon}
              {card.label}
            </div>
            <div className={cn('mt-2 text-2xl font-semibold tracking-tight', card.color)}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h3 className="text-sm font-medium text-zinc-300">Recent Transfers</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Transfer #</TableHead>
                <TableHead className="text-zinc-500">From</TableHead>
                <TableHead className="text-zinc-500">To</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransfers.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                recentTransfers.map((t: Record<string, unknown>) => (
                  <TableRow
                    key={t.id as string}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {t.transferNumber as string}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(t.fromOutlet as Record<string, string>)?.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(t.toOutlet as Record<string, string>)?.name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={t.status as string} />
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDateTime(t.createdAt as string)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-4 py-3">
          <h3 className="text-sm font-medium text-zinc-300">Recent Transactions</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Invoice #</TableHead>
                <TableHead className="text-zinc-500">Outlet</TableHead>
                <TableHead className="text-zinc-500">Cashier</TableHead>
                <TableHead className="text-zinc-500">Total</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                recentTransactions.map((t: Record<string, unknown>) => (
                  <TableRow
                    key={t.id as string}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {t.invoiceNumber as string}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(t.outlet as Record<string, string>)?.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {(t.user as Record<string, string>)?.name}
                    </TableCell>
                    <TableCell className="text-sm text-emerald-400">
                      {formatCurrency(t.total as number)}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDateTime(t.createdAt as string)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ==================== PIPELINE ====================
function PipelineSection() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const { data: rawTransfers, isLoading } = useQuery({
    queryKey: ['pipeline', statusFilter],
    queryFn: () =>
      fetch(`/api/pipeline?status=${statusFilter}`).then((r) => r.json()),
  })
  const transfers = Array.isArray(rawTransfers) ? rawTransfers : []

  const statuses = ['ALL', 'DRAFT', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED']

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 text-xs',
              statusFilter === s
                ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            )}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'ALL' ? 'All Status' : s.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Transfer #</TableHead>
                <TableHead className="text-zinc-500">From Outlet</TableHead>
                <TableHead className="text-zinc-500">To Outlet</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Items</TableHead>
                <TableHead className="text-zinc-500">Created</TableHead>
                <TableHead className="text-zinc-500">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={8} cols={7} />
              ) : transfers.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={7} className="py-8 text-center text-sm text-zinc-500">
                    No transfers found
                  </TableCell>
                </TableRow>
              ) : (
                transfers.map((t: Record<string, unknown>) => (
                  <TableRow
                    key={t.id as string}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {t.transferNumber as string}
                    </TableCell>
                    <TableCell className="text-sm">{t.fromOutlet as string}</TableCell>
                    <TableCell className="text-sm">{t.toOutlet as string}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status as string} />
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {t.itemsCount as number}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDateTime(t.createdAt as string)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-zinc-500">
                      {(t.notes as string) || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ==================== TRANSACTIONS ====================
function TransactionsSection() {
  const [filter, setFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const queryParams = new URLSearchParams()
  if (startDate && endDate) {
    queryParams.set('startDate', startDate.toISOString())
    queryParams.set('endDate', endDate.toISOString())
  } else if (filter !== 'all') {
    queryParams.set('filter', filter)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', filter, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => fetch(`/api/transactions?${queryParams.toString()}`).then((r) => r.json()),
  })

  const transactions = Array.isArray(data?.transactions) ? data.transactions : []
  const summary = data?.summary ?? { totalRevenue: 0, transactionCount: 0, avgTransaction: 0 }

  const filterButtons = [
    { key: 'all', label: 'Semua' },
    { key: 'today', label: 'Hari Ini' },
    { key: '7d', label: '7 Hari' },
    { key: '30d', label: '30 Hari' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'year', label: 'Tahun Ini' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filterButtons.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key && !startDate ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-8 text-xs',
              filter === f.key && !startDate
                ? 'bg-emerald-600 text-white hover:bg-emerald-600/90'
                : 'border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            )}
            onClick={() => {
              setFilter(f.key)
              setStartDate(undefined)
              setEndDate(undefined)
            }}
          >
            {f.label}
          </Button>
        ))}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'h-8 text-xs border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
                startDate && 'border-emerald-600/50 text-emerald-400'
              )}
            >
              {startDate && endDate
                ? `${format(startDate, 'dd/MM/yy')} - ${format(endDate, 'dd/MM/yy')}`
                : 'Custom'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto border-zinc-800 bg-zinc-900 p-0" align="start">
            <div className="flex gap-2 p-2">
              <div className="flex-1">
                <Label className="mb-1 block text-xs text-zinc-500">Start</Label>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => setStartDate(d)}
                  locale={idLocale}
                  className="rounded-md border border-zinc-800 bg-zinc-900 p-2"
                />
              </div>
              <div className="flex-1">
                <Label className="mb-1 block text-xs text-zinc-500">End</Label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => setEndDate(d)}
                  locale={idLocale}
                  className="rounded-md border border-zinc-800 bg-zinc-900 p-2"
                />
              </div>
            </div>
            <div className="flex justify-end border-t border-zinc-800 p-2">
              <Button
                size="sm"
                className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                onClick={() => {
                  if (startDate && endDate) {
                    setFilter('all')
                  }
                  setCalendarOpen(false)
                }}
                disabled={!startDate || !endDate}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-500">Total Revenue</div>
          <div className="mt-1 text-xl font-semibold text-emerald-400">
            {formatCurrency(summary.totalRevenue)}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-500">Transactions</div>
          <div className="mt-1 text-xl font-semibold text-zinc-200">
            {summary.transactionCount.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="text-xs text-zinc-500">Average Transaction</div>
          <div className="mt-1 text-xl font-semibold text-zinc-200">
            {formatCurrency(summary.avgTransaction)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Invoice #</TableHead>
                <TableHead className="text-zinc-500">Outlet</TableHead>
                <TableHead className="text-zinc-500">Cashier</TableHead>
                <TableHead className="text-zinc-500">Payment</TableHead>
                <TableHead className="text-right text-zinc-500">Total</TableHead>
                <TableHead className="text-zinc-500">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={10} cols={6} />
              ) : transactions.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t: Record<string, unknown>) => (
                  <TableRow
                    key={t.id as string}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {t.invoiceNumber as string}
                    </TableCell>
                    <TableCell className="text-sm">{t.outlet as string}</TableCell>
                    <TableCell className="text-sm">{t.cashier as string}</TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {t.paymentMethod as string}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium text-emerald-400">
                      {formatCurrency(t.total as number)}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDateTime(t.createdAt as string)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

// ==================== OUTLETS ====================
interface OutletRow {
  id: string
  name: string
  address: string | null
  phone: string | null
  accountType: string
  planExpiresAt: string | null
  crewCount: number
  group: string | null
}

function OutletsSection() {
  const { data: rawOutlets, isLoading } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => fetch('/api/outlets').then((r) => r.json()),
  })
  const outlets = Array.isArray(rawOutlets) ? rawOutlets : []

  const { data: rawPlansA } = useQuery({
    queryKey: ['plans-list'],
    queryFn: () => fetch('/api/plans').then((r) => r.json()),
  })
  const plans = Array.isArray(rawPlansA) ? rawPlansA : []

  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRow | null>(null)
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [durationMonths, setDurationMonths] = useState(1)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const changePlanMutation = useMutation({
    mutationFn: ({ id, planId, durationMonths }: { id: string; planId: string; durationMonths: number }) =>
      fetch(`/api/outlets/${id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, durationMonths }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outlets'] })
      setPlanDialogOpen(false)
      toast({ title: 'Plan updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update plan', variant: 'destructive' })
    },
  })

  const openPlanDialog = (outlet: OutletRow) => {
    setSelectedOutlet(outlet)
    setSelectedPlanId(outlet.accountType || '')
    setDurationMonths(1)
    setPlanDialogOpen(true)
  }

  const isExpired = (date: string | null) => {
    if (!date) return true
    return new Date(date) < new Date()
  }

  return (
    <>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Name</TableHead>
                <TableHead className="text-zinc-500">Address</TableHead>
                <TableHead className="text-zinc-500">Phone</TableHead>
                <TableHead className="text-zinc-500">Plan</TableHead>
                <TableHead className="text-zinc-500">Type</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Crew</TableHead>
                <TableHead className="text-zinc-500">Group</TableHead>
                <TableHead className="text-zinc-500"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={6} cols={9} />
              ) : outlets.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={9} className="py-8 text-center text-sm text-zinc-500">
                    No outlets found
                  </TableCell>
                </TableRow>
              ) : (
                outlets.map((o: OutletRow) => (
                  <TableRow
                    key={o.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="text-sm font-medium">{o.name}</TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-zinc-400">
                      {o.address || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">{o.phone || '—'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {o.accountType || 'free'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                        {o.accountType || 'free'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {isExpired(o.planExpiresAt) ? (
                        <span className="inline-flex items-center rounded-md border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                          Active
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">{o.crewCount}</TableCell>
                    <TableCell className="text-sm text-zinc-400">{o.group || '—'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => openPlanDialog(o)}
                      >
                        Change Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Change Plan</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Update plan for {selectedOutlet?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-200">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900">
                  {plans.map((p: Record<string, unknown>) => (
                    <SelectItem key={p.id as string} value={p.id as string}>
                      {p.name as string} — {formatCurrency(p.price as number)}/
                      {p.duration as number}mo
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Duration (months)</Label>
              <Input
                type="number"
                min={1}
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:text-zinc-200"
              onClick={() => setPlanDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={() =>
                selectedOutlet &&
                changePlanMutation.mutate({
                  id: selectedOutlet.id,
                  planId: selectedPlanId,
                  durationMonths,
                })
              }
              disabled={changePlanMutation.isPending || !selectedPlanId}
            >
              {changePlanMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ==================== USERS ====================
interface UserRow {
  id: string
  name: string
  email: string
  role: string
  outlet: string
  outletId: string
  createdAt: string
}

function UsersSection() {
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [outletFilter, setOutletFilter] = useState('')

  const queryParams = new URLSearchParams()
  if (roleFilter !== 'ALL') queryParams.set('role', roleFilter)
  if (outletFilter) queryParams.set('outletId', outletFilter)

  const { data: rawUsers, isLoading } = useQuery({
    queryKey: ['users', roleFilter, outletFilter],
    queryFn: () => fetch(`/api/users?${queryParams.toString()}`).then((r) => r.json()),
  })
  const users = Array.isArray(rawUsers) ? rawUsers : []

  const { data: rawOutletsB } = useQuery({
    queryKey: ['outlets-list'],
    queryFn: () => fetch('/api/outlets').then((r) => r.json()),
  })
  const outlets = Array.isArray(rawOutletsB) ? rawOutletsB : []

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      fetch(`/api/users/${id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setPasswordDialogOpen(false)
      setNewPassword('')
      toast({ title: 'Password reset successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to reset password', variant: 'destructive' })
    },
  })

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-8 w-[130px] border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="OWNER">Owner</SelectItem>
            <SelectItem value="CREW">Crew</SelectItem>
          </SelectContent>
        </Select>
        <Select value={outletFilter} onValueChange={(v) => setOutletFilter(v === '__all__' ? '' : v)}>
          <SelectTrigger className="h-8 w-[160px] border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400">
            <SelectValue placeholder="All Outlets" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900">
            <SelectItem value="__all__">All Outlets</SelectItem>
            {outlets.map((o: Record<string, unknown>) => (
              <SelectItem key={o.id as string} value={o.id as string}>
                {o.name as string}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Name</TableHead>
                <TableHead className="text-zinc-500">Email</TableHead>
                <TableHead className="text-zinc-500">Role</TableHead>
                <TableHead className="text-zinc-500">Outlet</TableHead>
                <TableHead className="text-zinc-500">Created</TableHead>
                <TableHead className="text-zinc-500"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={8} cols={6} />
              ) : users.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u: UserRow) => (
                  <TableRow
                    key={u.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="text-sm font-medium">{u.name}</TableCell>
                    <TableCell className="text-sm text-zinc-400">{u.email}</TableCell>
                    <TableCell>
                      <RoleBadge role={u.role} />
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">{u.outlet}</TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => {
                          setSelectedUser(u)
                          setNewPassword('')
                          setPasswordDialogOpen(true)
                        }}
                      >
                        Reset Password
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Reset Password</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Set new password for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:text-zinc-200"
              onClick={() => setPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={() =>
                selectedUser &&
                resetPasswordMutation.mutate({
                  id: selectedUser.id,
                  password: newPassword,
                })
              }
              disabled={resetPasswordMutation.isPending || newPassword.length < 6}
            >
              {resetPasswordMutation.isPending ? 'Saving...' : 'Reset'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ==================== PLANS & PRICING ====================
interface PlanRow {
  id: string
  name: string
  slug: string
  price: number
  duration: number
  features: string
  active: boolean
  sortOrder: number
  description: string | null
}

function PlansSection() {
  const { data: rawPlans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => fetch('/api/plans').then((r) => r.json()),
  })
  const plans = Array.isArray(rawPlans) ? rawPlans : []

  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Partial<PlanRow> | null>(null)
  const [isNewPlan, setIsNewPlan] = useState(false)

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setEditDialogOpen(false)
      toast({ title: 'Plan updated' })
    },
    onError: () => {
      toast({ title: 'Failed to update plan', variant: 'destructive' })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
      setEditDialogOpen(false)
      toast({ title: 'Plan created' })
    },
    onError: () => {
      toast({ title: 'Failed to create plan', variant: 'destructive' })
    },
  })

  const openEditDialog = (plan: PlanRow) => {
    setEditingPlan({ ...plan })
    setIsNewPlan(false)
    setEditDialogOpen(true)
  }

  const openNewDialog = () => {
    setEditingPlan({
      name: '',
      slug: '',
      price: 0,
      duration: 1,
      features: '{}',
      active: true,
      sortOrder: 0,
      description: '',
    })
    setIsNewPlan(true)
    setEditDialogOpen(true)
  }

  const savePlan = () => {
    if (!editingPlan) return
    if (isNewPlan) {
      createMutation.mutate(editingPlan as Record<string, unknown>)
    } else {
      editMutation.mutate({
        id: editingPlan.id!,
        data: editingPlan as Record<string, unknown>,
      })
    }
  }

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      fetch(`/api/plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] })
    },
  })

  let parsedFeatures: string[] = []
  try {
    parsedFeatures = editingPlan?.features
      ? JSON.parse(editingPlan.features)
      : []
  } catch {
    parsedFeatures = []
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">Manage subscription plans and pricing</p>
        <Button
          size="sm"
          className="bg-emerald-600 text-white hover:bg-emerald-600/90"
          onClick={openNewDialog}
        >
          <span className="mr-1">+</span> New Plan
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="max-h-[70vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500">Name</TableHead>
                <TableHead className="text-zinc-500">Slug</TableHead>
                <TableHead className="text-right text-zinc-500">Price</TableHead>
                <TableHead className="text-zinc-500">Duration</TableHead>
                <TableHead className="text-zinc-500">Status</TableHead>
                <TableHead className="text-zinc-500">Features</TableHead>
                <TableHead className="text-zinc-500">Description</TableHead>
                <TableHead className="text-zinc-500"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeleton rows={5} cols={8} />
              ) : plans.length === 0 ? (
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-zinc-500">
                    No plans found
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan: PlanRow) => (
                  <TableRow
                    key={plan.id}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="text-sm font-medium">{plan.name}</TableCell>
                    <TableCell className="font-mono text-xs text-zinc-400">
                      {plan.slug}
                    </TableCell>
                    <TableCell className="text-right text-sm text-emerald-400">
                      {formatCurrency(plan.price)}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-400">
                      {plan.duration} mo
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: plan.id,
                            active: !plan.active,
                          })
                        }
                      >
                        <Switch
                          checked={plan.active}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </button>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {(() => {
                        try {
                          const f = JSON.parse(plan.features)
                          if (typeof f === 'object' && !Array.isArray(f)) {
                            const labels: Record<string, string> = {
                              maxOutlets: 'Max Outlets',
                              maxProducts: 'Max Products',
                              maxCrew: 'Max Crew',
                              maxTransactions: 'Max TX',
                              loyalty: 'Loyalty',
                              telegramNotif: 'Telegram',
                              outletTransfer: 'Transfer',
                              promo: 'Promo',
                              multiOutlet: 'Multi Outlet',
                              prioritySupport: 'Priority',
                              customBranding: 'Branding',
                              apiAccess: 'API',
                            }
                            return Object.entries(f)
                              .filter(([k, v]) => v === true || v === -1)
                              .slice(0, 3)
                              .map(([k]) => labels[k] || k)
                              .join(', ') + (Object.keys(f).length > 3 ? '…' : '')
                          }
                          return plan.features
                        } catch {
                          return plan.features
                        }
                      })()}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-zinc-500">
                      {plan.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() => openEditDialog(plan)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">
              {isNewPlan ? 'Create Plan' : 'Edit Plan'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {isNewPlan ? 'Add a new subscription plan' : `Editing ${editingPlan?.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Name</Label>
                <Input
                  value={editingPlan?.name || ''}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan!, name: e.target.value })
                  }
                  className="border-zinc-800 bg-zinc-900 text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Slug</Label>
                <Input
                  value={editingPlan?.slug || ''}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan!, slug: e.target.value })
                  }
                  className="border-zinc-800 bg-zinc-900 text-zinc-200"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Price (IDR)</Label>
                <Input
                  type="number"
                  value={editingPlan?.price || 0}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan!,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="border-zinc-800 bg-zinc-900 text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-zinc-400">Duration (months)</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingPlan?.duration || 1}
                  onChange={(e) =>
                    setEditingPlan({
                      ...editingPlan!,
                      duration: parseInt(e.target.value) || 1,
                    })
                  }
                  className="border-zinc-800 bg-zinc-900 text-zinc-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Description</Label>
              <Input
                value={editingPlan?.description || ''}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan!, description: e.target.value })
                }
                className="border-zinc-800 bg-zinc-900 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Features (JSON array)</Label>
              <Textarea
                value={editingPlan?.features || '[]'}
                onChange={(e) =>
                  setEditingPlan({ ...editingPlan!, features: e.target.value })
                }
                rows={4}
                className="border-zinc-800 bg-zinc-900 font-mono text-xs text-zinc-200"
              />
              {parsedFeatures.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {parsedFeatures.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-zinc-800 text-zinc-400 hover:text-zinc-200"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-600/90"
              onClick={savePlan}
              disabled={editMutation.isPending || createMutation.isPending}
            >
              {editMutation.isPending || createMutation.isPending
                ? 'Saving...'
                : isNewPlan
                  ? 'Create'
                  : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ==================== MAIN PAGE ====================
export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewSection />
      case 'pipeline':
        return <PipelineSection />
      case 'transactions':
        return <TransactionsSection />
      case 'outlets':
        return <OutletsSection />
      case 'users':
        return <UsersSection />
      case 'plans':
        return <PlansSection />
      default:
        return <OverviewSection />
    }
  }

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? 'Overview'

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-zinc-800 bg-[#09090b] transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center gap-2 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-xs font-bold text-white">
            A
          </div>
          <div>
            <span className="text-sm font-semibold text-zinc-100">AetherPOS</span>
            <span className="ml-1.5 text-xs text-zinc-600">Webmaster</span>
          </div>
          <button
            className="ml-auto rounded-md p-1 text-zinc-500 hover:text-zinc-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={16} />
          </button>
        </div>

        <Separator className="bg-zinc-800" />

        <nav className="flex-1 space-y-1 px-3 py-3" role="navigation" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                activeTab === item.id
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300'
              )}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
              {activeTab === item.id && (
                <ChevronRight size={14} className="ml-auto opacity-50" />
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-zinc-800 px-4 py-3">
          <p className="text-[11px] text-zinc-600">AetherPOS Webmaster v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-800 px-4 lg:px-6">
          <button
            className="rounded-md p-1.5 text-zinc-500 hover:text-zinc-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-medium text-zinc-300">{activeLabel}</h1>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">{renderContent()}</div>

        {/* Footer */}
        <footer className="shrink-0 border-t border-zinc-800 px-4 py-3 lg:px-6">
          <p className="text-center text-xs text-zinc-600">
            AetherPOS Webmaster Dashboard &middot; {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </div>
  )
}