'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from './StatusBadge'
import { Users, Store, Receipt, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface KPIData {
  totalOwners: number
  totalOutlets: number
  totalTransactions: number
  totalRevenue: number
  ownerTrend: number
  outletTrend: number
  transactionTrend: number
  revenueTrend: number
}

interface OutletPipeline {
  id: string
  name: string
  ownerName: string
  branchName: string
  status: string
  totalTransactions: number
  totalRevenue: number
  lastTransaction: string | null
}

interface RevenueChart {
  date: string
  revenue: number
}

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

function TrendIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">—</span>
  const isUp = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value)}%
    </span>
  )
}

export function DashboardView() {
  const [kpi, setKpi] = useState<KPIData | null>(null)
  const [outlets, setOutlets] = useState<OutletPipeline[]>([])
  const [chartData, setChartData] = useState<RevenueChart[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const data = await res.json()
          setKpi(data.kpi)
          setOutlets(data.outlets)
          setChartData(data.revenueChart)
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const kpiCards = [
    { title: 'Total Owner', value: kpi?.totalOwners ?? 0, icon: Users, trend: kpi?.ownerTrend ?? 0, color: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Total Outlet', value: kpi?.totalOutlets ?? 0, icon: Store, trend: kpi?.outletTrend ?? 0, color: 'text-teal-600 dark:text-teal-400' },
    { title: 'Total Transaksi', value: kpi?.totalTransactions ?? 0, icon: Receipt, trend: kpi?.transactionTrend ?? 0, color: 'text-amber-600 dark:text-amber-400' },
    { title: 'Total Revenue', value: kpi ? formatRp(kpi.totalRevenue) : 'Rp 0', icon: TrendingUp, trend: kpi?.revenueTrend ?? 0, color: 'text-rose-600 dark:text-rose-400' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your AetherPOS platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{card.value}</div>
              <TrendIndicator value={card.trend} />
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-semibold">Revenue - Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" />
                <YAxis fontSize={12} tickLine={false} axisLine={false} className="fill-muted-foreground" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                <Tooltip
                  formatter={(value: number) => [formatRp(value), 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Multi Outlet Pipeline */}
      <Card className="p-4">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-semibold">Multi Outlet Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Outlet Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total Transaksi</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead>Last Transaction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No outlet data available
                    </TableCell>
                  </TableRow>
                ) : (
                  outlets.map((outlet) => (
                    <TableRow key={outlet.id}>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>{outlet.ownerName}</TableCell>
                      <TableCell>{outlet.branchName}</TableCell>
                      <TableCell><StatusBadge status={outlet.status} /></TableCell>
                      <TableCell className="text-right">{outlet.totalTransactions}</TableCell>
                      <TableCell className="text-right">{formatRp(outlet.totalRevenue)}</TableCell>
                      <TableCell>
                        {outlet.lastTransaction
                          ? format(new Date(outlet.lastTransaction), 'dd MMM yyyy, HH:mm')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}