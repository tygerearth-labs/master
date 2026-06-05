'use client'

import { useState, useEffect, useCallback } from 'react'
import { Receipt, TrendingUp, TrendingDown, Minus, BarChart3, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface MonthlyData {
  month: string
  label: string
  count: number
  total: number
  subtotal: number
  discount: number
  tax: number
}

interface SummaryData {
  totalRevenue: number
  totalTransactions: number
  averagePerTransaction: number
  paymentBreakdown: Record<string, { count: number; total: number }>
}

interface RecentTx {
  id: string
  invoiceNumber: string
  total: number
  paymentMethod: string
  createdAt: string
}

function formatCurrency(val: number): string {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return val }
}

const payColor: Record<string, string> = {
  CASH: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  QRIS: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  DEBIT: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

export function TransaksiTab({ outletId }: { outletId: string }) {
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [recent, setRecent] = useState<RecentTx[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/webmaster/outlet/${outletId}/transactions-summary`)
      if (res.ok) {
        const json = await res.json()
        setMonthly(json.monthly || [])
        setSummary(json.summary || null)
        setRecent(json.recentTransactions || [])
      }
    } catch {
      toast.error('Gagal memuat data transaksi')
    } finally {
      setLoading(false)
    }
  }, [outletId])

  useEffect(() => { fetchData() }, [fetchData])

  // Chart data (reverse to show oldest first for the bar chart)
  const chartData = [...monthly].reverse()
  const maxTotal = Math.max(...chartData.map((m) => m.total), 1)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              <p className="text-lg font-bold">{summary ? formatCurrency(summary.totalRevenue) : 'Rp 0'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Transaksi</p>
              <p className="text-lg font-bold">{summary?.totalTransactions ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rata-rata / Transaksi</p>
              <p className="text-lg font-bold">{summary ? formatCurrency(summary.averagePerTransaction) : 'Rp 0'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      {summary && summary.paymentBreakdown && Object.keys(summary.paymentBreakdown).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Metode Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.paymentBreakdown).map(([method, data]) => (
                <div key={method} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <Badge className={payColor[method] || ''}>{method}</Badge>
                  <span className="text-sm font-medium">{data.count}x</span>
                  <span className="text-xs text-muted-foreground">{formatCurrency(data.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Bar Chart */}
      {monthly.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Transaksi per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {chartData.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">{m.label}</span>
                  <div className="flex-1 h-7 bg-muted rounded-md overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500 rounded-md transition-all duration-500"
                      style={{ width: `${Math.max((m.total / maxTotal) * 100, 2)}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-xs font-medium">
                      {formatCurrency(m.total)}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right flex-shrink-0">
                    {m.count} tx
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Table */}
      {monthly.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Bulan</TableHead>
                  <TableHead className="text-xs text-right">Jumlah Transaksi</TableHead>
                  <TableHead className="text-xs text-right">Subtotal</TableHead>
                  <TableHead className="text-xs text-right hidden sm:table-cell">Diskon</TableHead>
                  <TableHead className="text-xs text-right hidden sm:table-cell">Pajak</TableHead>
                  <TableHead className="text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell className="text-sm font-medium">{m.label}</TableCell>
                    <TableCell className="text-sm text-right">{m.count}</TableCell>
                    <TableCell className="text-sm text-right">{formatCurrency(m.subtotal)}</TableCell>
                    <TableCell className="text-sm text-right hidden sm:table-cell text-destructive">-{formatCurrency(m.discount)}</TableCell>
                    <TableCell className="text-sm text-right hidden sm:table-cell">{formatCurrency(m.tax)}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{formatCurrency(m.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {monthly.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Receipt className="h-10 w-10 mb-3 opacity-40" />
          <p>Belum ada transaksi untuk outlet ini</p>
        </div>
      )}
    </div>
  )
}
