'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { PaginationControls } from './PaginationControls'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, CalendarDays, Calendar } from 'lucide-react'
import { format, startOfDay, startOfMonth, startOfYear, subDays } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarUI } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Transaction {
  id: string
  invoiceNo: string
  outletName: string
  ownerName: string
  items: number
  total: number
  paymentMethod: string
  status: string
  createdAt: string
}

interface FilterOption {
  id: string
  name: string
}

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

type DateFilter = 'today' | 'month' | 'year' | 'custom'

export function TransactionView() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('month')
  const [customFrom, setCustomFrom] = useState<Date | undefined>()
  const [customTo, setCustomTo] = useState<Date | undefined>()
  const [outletFilter, setOutletFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [outlets, setOutlets] = useState<FilterOption[]>([])
  const [owners, setOwners] = useState<FilterOption[]>([])
  const [calendarOpen, setCalendarOpen] = useState(false)

  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch('/api/transactions/filters')
      if (res.ok) {
        const data = await res.json()
        setOutlets(data.outlets || [])
        setOwners(data.owners || [])
      }
    } catch {
      // silent
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      let startDate: string | undefined
      let endDate: string | undefined

      if (dateFilter === 'today') {
        startDate = startOfDay(new Date()).toISOString()
      } else if (dateFilter === 'month') {
        startDate = startOfMonth(new Date()).toISOString()
      } else if (dateFilter === 'year') {
        startDate = startOfYear(new Date()).toISOString()
      } else if (dateFilter === 'custom' && customFrom) {
        startDate = customFrom.toISOString()
        endDate = customTo ? customTo.toISOString() : undefined
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        ...(search && { search }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(outletFilter !== 'all' && { outletId: outletFilter }),
        ...(ownerFilter !== 'all' && { ownerId: ownerFilter }),
      })

      const res = await fetch(`/api/transactions?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data.data || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, search, dateFilter, customFrom, customTo, outletFilter, ownerFilter])

  useEffect(() => {
    fetchFilters()
  }, [fetchFilters])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleDateFilterChange = (value: DateFilter) => {
    setDateFilter(value)
    setPage(1)
    if (value !== 'custom') {
      setCustomFrom(undefined)
      setCustomTo(undefined)
    }
  }

  const dateButtons: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'month', label: 'Bulan Ini' },
    { key: 'year', label: 'Tahun Ini' },
    { key: 'custom', label: 'Custom' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transaksi</h2>
        <p className="text-muted-foreground">Manage and view all transactions.</p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {dateButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={dateFilter === btn.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateFilterChange(btn.key)}
                className={dateFilter === btn.key ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                {btn.key === 'custom' ? <Calendar className="h-4 w-4 mr-1" /> : <CalendarDays className="h-4 w-4 mr-1" />}
                {btn.label}
              </Button>
            ))}
            {dateFilter === 'custom' && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    {customFrom
                      ? `${format(customFrom, 'dd MMM yyyy')}${customTo ? ` - ${format(customTo, 'dd MMM yyyy')}` : ''}`
                      : 'Pick dates'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarUI
                    mode="range"
                    selected={customFrom && customTo ? { from: customFrom, to: customTo } : undefined}
                    onSelect={(range) => {
                      setCustomFrom(range?.from)
                      setCustomTo(range?.to)
                      if (range?.to) {
                        setCalendarOpen(false)
                        setPage(1)
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice..."
                className="pl-8 h-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <Select value={outletFilter} onValueChange={(v) => { setOutletFilter(v); setPage(1) }}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="All Outlet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outlet</SelectItem>
                {outlets.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ownerFilter} onValueChange={(v) => { setOwnerFilter(v); setPage(1) }}>
              <SelectTrigger className="w-48 h-9">
                <SelectValue placeholder="All Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Owner</SelectItem>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-mono text-xs">{tx.invoiceNo}</TableCell>
                      <TableCell>{tx.outletName}</TableCell>
                      <TableCell>{tx.ownerName}</TableCell>
                      <TableCell className="text-right">{tx.items}</TableCell>
                      <TableCell className="text-right font-medium">{formatRp(tx.total)}</TableCell>
                      <TableCell><StatusBadge status={tx.paymentMethod} /></TableCell>
                      <TableCell><StatusBadge status={tx.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <PaginationControls currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  )
}