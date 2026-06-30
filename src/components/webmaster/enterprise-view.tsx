'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Building2, Store, Users, Receipt, Package, AlertTriangle,
  CheckCircle2, Clock, ChevronDown, ChevronUp, Crown, RefreshCw, Search,
  MapPin, Phone, CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface OutletInfo {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  accountType: string
  isMain: boolean
  planExpiresAt?: string | null
  createdAt: string
  _count: { users: number; products: number; transactions: number; customers: number }
}

interface EnterpriseGroup {
  id: string
  name: string
  createdAt: string
  totalOutlets: number
  totalUsers: number
  totalProducts: number
  totalTransactions: number
  planExpiresAt: string | null
  hasExpired: boolean
  status: string
  owner: { id: string; name: string; email: string }
  outlets: OutletInfo[]
  _count: { outlets: number; transfers: number }
}

interface SummaryData {
  totalGroups: number
  totalEnterpriseOutlets: number
}

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return val }
}

function formatCurrency(val: number): string {
  return 'Rp ' + val.toLocaleString('id-ID')
}

function getDaysRemaining(planExpiresAt: string | null): number | null {
  if (!planExpiresAt) return null
  const now = new Date()
  const exp = new Date(planExpiresAt)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle2 }> = {
  active: { label: 'Aktif', variant: 'default', icon: CheckCircle2 },
  expired: { label: 'Expired', variant: 'destructive', icon: AlertTriangle },
  free: { label: 'Free', variant: 'secondary', icon: Clock },
}

export function EnterpriseView() {
  const [groups, setGroups] = useState<EnterpriseGroup[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/webmaster/enterprise-groups')
      if (res.ok) {
        const json = await res.json()
        setGroups(json.groups || [])
        setSummary(json.summary || null)
      }
    } catch {
      toast.error('Gagal memuat data enterprise')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchGroups() }, [fetchGroups])

  const handleSearch = () => { setSearch(searchInput) }

  const filteredGroups = search
    ? groups.filter((g) =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.owner.name.toLowerCase().includes(search.toLowerCase()) ||
        g.owner.email.toLowerCase().includes(search.toLowerCase())
      )
    : groups

  const totalOutletsAll = groups.reduce((s, g) => s + g.totalOutlets, 0)
  const totalUsersAll = groups.reduce((s, g) => s + g.totalUsers, 0)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-52" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-amber-500" />
            Akun Enterprise
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Daftar akun enterprise dengan multi-outlet
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGroups}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Grup Enterprise</p>
              <p className="text-lg font-bold">{summary?.totalGroups ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Outlet Enterprise</p>
              <p className="text-lg font-bold">{summary?.totalEnterpriseOutlets ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total User Enterprise</p>
              <p className="text-lg font-bold">{totalUsersAll}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari grup atau owner..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>Cari</Button>
      </div>

      {/* Enterprise Groups */}
      {filteredGroups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mb-3 opacity-40" />
          <p>Belum ada akun enterprise dengan multi-outlet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => {
            const isExpanded = expandedId === group.id
            const status = statusConfig[group.status] || statusConfig.free
            const StatusIcon = status.icon
            const daysRemaining = getDaysRemaining(group.planExpiresAt)
            const mainOutlet = group.outlets.find((o) => o.isMain) || group.outlets[0]

            return (
              <Card key={group.id} className="overflow-hidden">
                {/* Group Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : group.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{group.name}</h3>
                        <Badge variant={status.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Store className="h-3 w-3 mr-1" />
                          {group.totalOutlets} outlet
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {group.owner.name} ({group.owner.email})
                        </span>
                        {mainOutlet?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {mainOutlet.phone}
                          </span>
                        )}
                      </div>
                      {group.planExpiresAt && (
                        <div className={`text-xs mt-1 ${daysRemaining !== null && daysRemaining <= 0 ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {daysRemaining !== null && daysRemaining <= 0
                            ? `Expired ${formatDate(group.planExpiresAt)}`
                            : `Berlaku hingga ${formatDate(group.planExpiresAt)}${daysRemaining !== null ? ` (${daysRemaining} hari lagi)` : ''}`
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Quick stats row */}
                  <div className="flex items-center gap-4 mt-3 ml-14">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Package className="h-3.5 w-3.5" />
                      {group.totalProducts} produk
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Receipt className="h-3.5 w-3.5" />
                      {group.totalTransactions} transaksi
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {group.totalUsers} user
                    </div>
                  </div>
                </div>

                {/* Expanded: Outlet list */}
                {isExpanded && (
                  <div className="border-t bg-muted/20">
                    <div className="p-4 pt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Daftar Outlet ({group.outlets.length})
                      </p>
                      <div className="space-y-2">
                        {group.outlets.map((outlet) => {
                          const outletDays = getDaysRemaining(outlet.planExpiresAt || null)
                          return (
                            <div
                              key={outlet.id}
                              className="flex items-center gap-3 rounded-lg border bg-card p-3"
                            >
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                outlet.isMain
                                  ? 'bg-amber-100 dark:bg-amber-950'
                                  : 'bg-zinc-100 dark:bg-zinc-900'
                              }`}>
                                <Store className={`h-4 w-4 ${outlet.isMain ? 'text-amber-600' : 'text-zinc-500'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm truncate">{outlet.name}</span>
                                  {outlet.isMain && (
                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                      <Crown className="h-2.5 w-2.5 mr-0.5" />Pusat
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                  {outlet.address && (
                                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                                      <MapPin className="h-3 w-3 flex-shrink-0" />
                                      {outlet.address}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0 text-xs text-muted-foreground">
                                <div className="text-center hidden sm:block">
                                  <p className="font-semibold text-foreground">{outlet._count.users}</p>
                                  <p>User</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <p className="font-semibold text-foreground">{outlet._count.products}</p>
                                  <p>Produk</p>
                                </div>
                                <div className="text-center hidden md:block">
                                  <p className="font-semibold text-foreground">{outlet._count.transactions}</p>
                                  <p>Transaksi</p>
                                </div>
                                {outlet.planExpiresAt && (
                                  <Badge
                                    variant={outletDays !== null && outletDays <= 0 ? 'destructive' : 'outline'}
                                    className="text-[10px] whitespace-nowrap"
                                  >
                                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                                    {outletDays !== null && outletDays <= 0
                                      ? 'Expired'
                                      : `${outletDays} hari`
                                    }
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}