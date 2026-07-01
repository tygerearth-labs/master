'use client'

import React, { useState, useCallback } from 'react'
import {
  Store, Users, UserCheck, Building2, Ban, AlertTriangle,
  Search, ChevronLeft, ChevronRight, Clock, Shield, Eye,
  KeyRound, Loader2, Plus, Pencil, Trash2, Check, X,
  ExternalLink, TrendingUp, DollarSign, Calendar, Save, XCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  VALID_ACCOUNT_TYPES, FEATURE_ROWS,
  getPlanLabel, getPlanBadgeClasses, isSuspended,
  formatLimit, formatPrice, PLANS, type AccountType, type PlanFeatures
} from '@/lib/plan-config'
import type { Outlet, User as TUser, Plan, Stats, AuditLog } from '@/components/admin/types'
import { StatCard } from '@/components/admin/shared'

// ===================== HELPERS (local) =====================
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function getDaysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function getExpiryBadge(expiresAt: string | null, accountType: string) {
  if (accountType === 'free' || accountType.startsWith('suspended:free')) return null
  if (!expiresAt) return <Badge variant="outline" className="text-[10px] font-mono border-white/10">NO EXPIRY</Badge>
  const days = getDaysRemaining(expiresAt)
  if (days === null) return null
  if (days <= 0) return <Badge variant="destructive" className="text-[10px] font-mono">EXPIRED</Badge>
  if (days <= 7) return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] font-mono">{days}d</Badge>
  if (days <= 30) return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] font-mono">{days}d</Badge>
  return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">{days}d</Badge>
}

// Parse plan.features JSON safely
function parseFeatures(featuresJson: string): Partial<PlanFeatures> {
  try {
    return JSON.parse(featuresJson || '{}')
  } catch {
    return {}
  }
}

// ===================== EMPTY STATE =====================
export function EmptyState({ onSeed, loading }: { onSeed: () => void; loading: boolean }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 px-4">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
          <Store className="h-8 w-8 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">No Data Yet</h3>
          <p className="text-sm text-muted-foreground mt-1">Seed the database with demo data to explore the admin panel.</p>
        </div>
        <Button onClick={onSeed} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Seed Demo Data
        </Button>
      </div>
    </div>
  )
}

// ===================== DASHBOARD PAGE =====================
export function DashboardPage({ stats, outlets }: { stats: Stats | null; outlets: Outlet[] }) {
  if (!stats) return null

  const revenueEntries = Object.entries(stats.planRevenue || {})
  const topRevenuePlan = revenueEntries.sort((a, b) => b[1].revenue - a[1].revenue)[0]

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={<Store className="h-4 w-4" />} label="Outlets" value={stats.totalOutlets} color="text-emerald-400" bg="bg-emerald-500/10" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Users" value={stats.totalUsers} color="text-blue-400" bg="bg-blue-500/10" />
        <StatCard icon={<UserCheck className="h-4 w-4" />} label="Owners" value={stats.totalOwners} color="text-violet-400" bg="bg-violet-500/10" />
        <StatCard icon={<Building2 className="h-4 w-4" />} label="Groups" value={stats.totalGroups} color="text-cyan-400" bg="bg-cyan-500/10" />
        <StatCard icon={<Ban className="h-4 w-4" />} label="Suspended" value={stats.suspendedOutlets} color="text-red-400" bg="bg-red-500/10" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Expiring" value={stats.expiringOutlets} color="text-orange-400" bg="bg-orange-500/10" />
      </div>

      {/* Revenue Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-card border-white/[0.06] sm:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">{formatPrice(stats.totalMRR)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Annual Projection</p>
                <p className="text-lg font-bold font-mono text-violet-400">{formatPrice(stats.totalARR)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-white/[0.06]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Top Revenue Plan</p>
                <p className="text-lg font-bold font-mono text-cyan-400">{topRevenuePlan ? getPlanLabel(topRevenuePlan[0]) : '—'}</p>
                {topRevenuePlan && <p className="text-[10px] text-muted-foreground font-mono">{formatPrice(topRevenuePlan[1].revenue)}/mo</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue by Plan */}
        <Card className="bg-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {revenueEntries.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No revenue data</p>
            )}
            {revenueEntries.map(([slug, data]) => {
              const pct = stats.totalMRR > 0 ? (data.revenue / stats.totalMRR) * 100 : 0
              return (
                <div key={slug} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border shrink-0 ${getPlanBadgeClasses(slug)}`}>
                        {getPlanLabel(slug)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">{data.outlets} outlet{data.outlets !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400">{formatPrice(data.revenue)}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">/mo</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400/80 transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>{formatPrice(data.price)}/outlet/mo</span>
                    <span>{pct.toFixed(1)}% of MRR</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Plan Distribution */}
        <Card className="bg-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {Object.entries(stats.planBreakdown).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between gap-3">
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-medium border ${getPlanBadgeClasses(plan)}`}>
                  {getPlanLabel(plan)}
                </span>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="w-16 sm:w-24 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500/60 transition-all" style={{ width: `${Math.min(100, (count / (stats.totalOutlets || 1)) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-mono w-6 text-right">{count}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Outlets + Expiring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Outlets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.recentOutlets.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-2 rounded-md hover:bg-white/[0.03] transition-colors gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{o.name}</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{o.owner?.email || 'No owner'}</p>
                </div>
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border shrink-0 ${getPlanBadgeClasses(o.accountType)}`}>
                  {getPlanLabel(o.accountType)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Feature Matrix */}
        <Card className="bg-card border-white/[0.06]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Feature Matrix</CardTitle>
            <CardDescription className="text-xs">Plan capability comparison</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs min-w-[400px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-4 pl-4 sm:pl-0 font-medium text-muted-foreground">Feature</th>
                  {VALID_ACCOUNT_TYPES.map(t => (
                    <th key={t} className="text-center py-2 px-2 sm:px-3 font-medium min-w-[80px]">
                      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(t)}`}>{getPlanLabel(t)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_ROWS.slice(0, 6).map(({ key, label, type }) => (
                  <tr key={key} className="border-b border-white/[0.04]">
                    <td className="py-1.5 pr-4 pl-4 sm:pl-0 text-muted-foreground">{label}</td>
                    {VALID_ACCOUNT_TYPES.map(t => (
                      <td key={t} className="text-center py-1.5 px-2 sm:px-3 font-mono">
                        {type === 'boolean'
                          ? PLANS[t][key] ? <Check className="h-3.5 w-3.5 text-emerald-400 mx-auto" /> : <X className="h-3.5 w-3.5 text-zinc-600 mx-auto" />
                          : <span className={PLANS[t][key] === -1 ? 'text-emerald-400' : ''}>{formatLimit(PLANS[t][key] as number)}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ===================== OUTLETS PAGE =====================
export function OutletsPage({ outlets, total, page, search, filterPlan, onSearch, onFilter, onPageChange, onPlanChange, onDurationChange, onViewDetail }: {
  outlets: Outlet[]; total: number; page: number; search: string; filterPlan: string
  onSearch: (v: string) => void; onFilter: (v: string) => void; onPageChange: (p: number) => void
  onPlanChange: (o: Outlet) => void; onDurationChange: (o: Outlet) => void; onViewDetail: (o: Outlet) => void
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search outlets..." className="pl-9 bg-white/[0.04] border-white/[0.08] text-sm h-9" value={search} onChange={(e) => onSearch(e.target.value)} />
        </div>
        <Select value={filterPlan} onValueChange={onFilter}>
          <SelectTrigger className="w-full sm:w-[140px] bg-white/[0.04] border-white/[0.08] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop Table */}
      <Card className="bg-card border-white/[0.06] hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Outlet</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Owner</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Expiry</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {outlets.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No outlets found</td></tr>
                )}
                {outlets.map((outlet) => {
                  const owner = outlet.users.find(u => u.role === 'OWNER')
                  const suspended = isSuspended(outlet.accountType)
                  const days = getDaysRemaining(outlet.planExpiresAt)
                  return (
                    <tr key={outlet.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${suspended ? 'opacity-50' : ''}`}>
                      <td className="py-2.5 px-4">
                        <p className="font-medium flex items-center gap-1.5">
                          {outlet.name}
                          {outlet.isMain && <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono border-white/[0.1]">MAIN</Badge>}
                          {outlet.groupId && <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono border-white/[0.1]">GROUP</Badge>}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{outlet.address || outlet.phone || '—'}</p>
                      </td>
                      <td className="py-2.5 px-4">
                        {owner ? <><p className="text-xs">{owner.name}</p><p className="text-[10px] text-muted-foreground font-mono">{owner.email}</p></> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(outlet.accountType)}`}>{getPlanLabel(outlet.accountType)}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">{getExpiryBadge(outlet.planExpiresAt, outlet.accountType)}</td>
                      <td className="py-2.5 px-4 text-center">
                        {suspended ? <Badge variant="destructive" className="text-[9px] font-mono">SUSPENDED</Badge>
                          : days !== null && days <= 0 && outlet.accountType !== 'free' ? <Badge variant="destructive" className="text-[9px] font-mono">EXPIRED</Badge>
                          : <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">ACTIVE</Badge>
                        }
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Change Plan" onClick={() => onPlanChange(outlet)}><Shield className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Change Duration" onClick={() => onDurationChange(outlet)}><Clock className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Details" onClick={() => onViewDetail(outlet)}><Eye className="h-3.5 w-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {outlets.length === 0 && (
          <Card className="bg-card border-white/[0.06]">
            <CardContent className="py-12 text-center text-muted-foreground text-xs">No outlets found</CardContent>
          </Card>
        )}
        {outlets.map((outlet) => {
          const owner = outlet.users.find(u => u.role === 'OWNER')
          const suspended = isSuspended(outlet.accountType)
          const days = getDaysRemaining(outlet.planExpiresAt)
          return (
            <Card key={outlet.id} className={`bg-card border-white/[0.06] ${suspended ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm flex items-center gap-1.5 flex-wrap">
                      {outlet.name}
                      {outlet.isMain && <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono border-white/[0.1]">MAIN</Badge>}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{outlet.address || outlet.phone || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border shrink-0 ${getPlanBadgeClasses(outlet.accountType)}`}>
                    {getPlanLabel(outlet.accountType)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {owner && <div><p className="text-[10px] text-muted-foreground font-mono">Owner</p><p className="font-medium truncate">{owner.name}</p></div>}
                  <div><p className="text-[10px] text-muted-foreground font-mono">Expiry</p><div className="mt-0.5">{getExpiryBadge(outlet.planExpiresAt, outlet.accountType) || <span className="text-[10px]">—</span>}</div></div>
                  <div><p className="text-[10px] text-muted-foreground font-mono">Status</p><div className="mt-0.5">
                    {suspended ? <Badge variant="destructive" className="text-[9px] font-mono">SUSPENDED</Badge>
                      : days !== null && days <= 0 && outlet.accountType !== 'free' ? <Badge variant="destructive" className="text-[9px] font-mono">EXPIRED</Badge>
                      : <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">ACTIVE</Badge>}
                  </div></div>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => onPlanChange(outlet)}><Shield className="h-3 w-3" /> Plan</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => onDurationChange(outlet)}><Clock className="h-3 w-3" /> Duration</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => onViewDetail(outlet)}><Eye className="h-3 w-3" /> Detail</Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-mono">{outlets.length} of {total} outlets</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-7 w-7 p-0"><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="text-xs font-mono px-2">{page}</span>
          <Button variant="ghost" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => onPageChange(page + 1)} className="h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  )
}

// ===================== USERS PAGE =====================
export function UsersPage({ users, total, page, search, onSearch, onPageChange, onResetPw, onSuspend }: {
  users: TUser[]; total: number; page: number; search: string
  onSearch: (v: string) => void; onPageChange: (p: number) => void
  onResetPw: (u: TUser) => void; onSuspend: (u: TUser) => void
}) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search users..." className="pl-9 bg-white/[0.04] border-white/[0.08] text-sm h-9" value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>

      {/* Desktop Table */}
      <Card className="bg-card border-white/[0.06] hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-2.5 px-4 font-medium text-muted-foreground">Outlet</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Plan</th>
                  <th className="text-center py-2.5 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-2.5 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No users found</td></tr>}
                {users.map((user) => {
                  const suspended = isSuspended(user.outlet.accountType)
                  return (
                    <tr key={user.id} className={`border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${suspended && user.role === 'OWNER' ? 'opacity-50' : ''}`}>
                      <td className="py-2.5 px-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge variant={user.role === 'OWNER' ? 'default' : 'secondary'} className={`text-[9px] font-mono ${user.role === 'OWNER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}`}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4"><p className="text-xs">{user.outlet.name}</p></td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(user.outlet.accountType)}`}>{getPlanLabel(user.outlet.accountType)}</span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {suspended ? <Badge variant="destructive" className="text-[9px] font-mono">SUSPENDED</Badge>
                          : <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">ACTIVE</Badge>
                        }
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Reset Password" onClick={() => onResetPw(user)}><KeyRound className="h-3.5 w-3.5" /></Button>
                          {user.role === 'OWNER' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title={suspended ? 'Unsuspend' : 'Suspend'} onClick={() => onSuspend(user)}>
                              {suspended ? <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Ban className="h-3.5 w-3.5 text-red-400" />}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && (
          <Card className="bg-card border-white/[0.06]"><CardContent className="py-12 text-center text-muted-foreground text-xs">No users found</CardContent></Card>
        )}
        {users.map((user) => {
          const suspended = isSuspended(user.outlet.accountType)
          return (
            <Card key={user.id} className={`bg-card border-white/[0.06] ${suspended && user.role === 'OWNER' ? 'opacity-50' : ''}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant={user.role === 'OWNER' ? 'default' : 'secondary'} className={`text-[9px] font-mono ${user.role === 'OWNER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}`}>{user.role}</Badge>
                    {suspended ? <Badge variant="destructive" className="text-[9px] font-mono">SUSPENDED</Badge>
                      : <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">ACTIVE</Badge>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-[10px] text-muted-foreground font-mono">Outlet</p><p className="font-medium truncate">{user.outlet.name}</p></div>
                  <div><p className="text-[10px] text-muted-foreground font-mono">Plan</p>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(user.outlet.accountType)}`}>{getPlanLabel(user.outlet.accountType)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5" onClick={() => onResetPw(user)}><KeyRound className="h-3 w-3" /> Reset PW</Button>
                  {user.role === 'OWNER' && (
                    <Button variant="ghost" size="sm" className={`h-7 text-[11px] gap-1.5 ${suspended ? 'text-emerald-400' : 'text-red-400'}`} onClick={() => onSuspend(user)}>
                      {suspended ? <><UserCheck className="h-3 w-3" /> Unsuspend</> : <><Ban className="h-3 w-3" /> Suspend</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground font-mono">{users.length} of {total} users</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-7 w-7 p-0"><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <span className="text-xs font-mono px-2">{page}</span>
          <Button variant="ghost" size="sm" disabled={page >= Math.ceil(total / 10)} onClick={() => onPageChange(page + 1)} className="h-7 w-7 p-0"><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  )
}

// ===================== PLANS PAGE (with editable features) ====================
export function PlansPage({ plans, onEdit, onCreate, onDelete }: {
  plans: Plan[]; onEdit: (p: Plan) => void; onCreate: () => void; onDelete: (p: Plan) => void
}) {
  const [editMode, setEditMode] = useState(false)
  const [editingCell, setEditingCell] = useState<{ planId: string; featureKey: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [localPlans, setLocalPlans] = useState<Plan[]>(plans)

  // Sync local plans when props change
  React.useEffect(() => { setLocalPlans(plans) }, [plans])

  // Save a single feature value
  const saveFeature = useCallback(async (planId: string, featureKey: string, value: number | boolean) => {
    setSaving(true)
    try {
      const plan = localPlans.find(p => p.id === planId)
      if (!plan) return
      const features = parseFeatures(plan.features)
      const updated = { ...features, [featureKey]: value }
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features: JSON.stringify(updated) }),
      })
      if (res.ok) {
        const data = await res.json()
        setLocalPlans(prev => prev.map(p => p.id === planId ? data.plan : p))
      }
    } catch (err) {
      console.error('Failed to save feature:', err)
    }
    setSaving(false)
    setEditingCell(null)
  }, [localPlans])

  const handleCellClick = (planId: string, featureKey: string, currentValue: number | boolean, type: 'number' | 'boolean') => {
    if (!editMode) return
    if (type === 'boolean') {
      // Toggle immediately
      saveFeature(planId, featureKey, !currentValue)
    } else {
      // Open inline editor
      setEditingCell({ planId, featureKey })
      setEditValue(String(currentValue))
    }
  }

  const handleSaveInline = () => {
    if (!editingCell) return
    const numVal = parseInt(editValue)
    if (isNaN(numVal)) return
    saveFeature(editingCell.planId, editingCell.featureKey, numVal)
  }

  const handleInlineKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveInline()
    if (e.key === 'Escape') setEditingCell(null)
  }

  return (
    <div className="space-y-6">
      {/* Pricing Cards */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium">Pricing Table</h3>
          <p className="text-xs text-muted-foreground">Manage plan pricing and features</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={editMode ? 'default' : 'outline'}
            size="sm"
            className={`h-8 text-xs ${editMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'border-white/[0.1]'}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? <><Save className="h-3.5 w-3.5 mr-1.5" /> Editing</> : <><Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit Features</>}
          </Button>
          <Button onClick={onCreate} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localPlans.map((plan) => {
          const slug = plan.slug as AccountType
          const features = PLANS[slug] || null
          return (
            <Card key={plan.id} className={`bg-card border-white/[0.06] relative overflow-hidden ${!plan.active ? 'opacity-50' : ''} ${slug === 'pro' ? 'glow-emerald' : ''}`}>
              {slug === 'pro' && <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />}
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(slug)}`}>{plan.name}</span>
                    {!plan.active && <Badge variant="destructive" className="text-[9px]">INACTIVE</Badge>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(plan)}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => onDelete(plan)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-2xl font-bold font-mono">
                    {formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-xs font-normal text-muted-foreground">/{plan.duration}d</span>}
                  </p>
                  {plan.description && <p className="text-[10px] text-muted-foreground mt-1">{plan.description}</p>}
                </div>
              </CardHeader>
              <CardContent>
                {plan.paymentLink && (
                  <a href={plan.paymentLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 mb-3 font-mono">
                    <ExternalLink className="h-3 w-3" /> Payment Link
                  </a>
                )}
                {features && (
                  <div className="space-y-1.5">
                    {FEATURE_ROWS.slice(0, 8).map(({ key, label, type }) => {
                      const val = features[key]
                      return (
                        <div key={key} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{label}</span>
                          {type === 'boolean'
                            ? val ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-zinc-600" />
                            : <span className={`font-mono ${val === -1 ? 'text-emerald-400' : ''}`}>{formatLimit(val as number)}</span>
                          }
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Editable Feature Comparison Table */}
      <Card className="bg-card border-white/[0.06]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-medium">Feature Comparison</CardTitle>
              <CardDescription className="text-xs">
                {editMode ? 'Click any cell to edit. Boolean cells toggle instantly, number cells open inline editor.' : 'Toggle "Edit Features" to modify plan capabilities'}
              </CardDescription>
            </div>
            {editMode && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono animate-pulse shrink-0">
                EDIT MODE
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-xs min-w-[420px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 pr-4 pl-4 sm:pl-0 font-medium text-muted-foreground min-w-[120px] sm:min-w-[140px]">Feature</th>
                {localPlans.map(p => (
                  <th key={p.id} className="text-center py-2 px-2 sm:px-3 font-medium min-w-[80px] sm:min-w-[100px]">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono border ${getPlanBadgeClasses(p.slug)}`}>{p.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map(({ key, label, type }) => (
                <tr key={key} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-1.5 pr-4 pl-4 sm:pl-0 text-muted-foreground">{label}</td>
                  {localPlans.map(p => {
                    const dbFeatures = parseFeatures(p.features)
                    const slug = p.slug as AccountType
                    const staticFeatures = PLANS[slug] || null
                    // Merge: DB features override static defaults, static fills in missing keys
                    const features = staticFeatures ? { ...staticFeatures, ...dbFeatures } : dbFeatures
                    const val = features[key as keyof typeof features]
                    const isEditing = editingCell?.planId === p.id && editingCell?.featureKey === key

                    return (
                      <td
                        key={p.id}
                        className={`text-center py-1.5 px-2 sm:px-3 font-mono ${editMode ? 'cursor-pointer hover:bg-emerald-500/5 transition-colors rounded' : ''}`}
                        onClick={() => {
                          if (editMode) handleCellClick(p.id, key, (val ?? (type === 'boolean' ? false : 0)) as number | boolean, type)
                        }}
                      >
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleInlineKeyDown}
                              onBlur={handleSaveInline}
                              className="h-6 w-16 text-xs text-center bg-white/[0.08] border-emerald-500/30 font-mono p-1"
                              autoFocus
                            />
                          </div>
                        ) : type === 'boolean' ? (
                          val ? <Check className={`h-3.5 w-3.5 mx-auto ${editMode ? 'text-emerald-400' : 'text-emerald-400'}`} /> 
                               : <X className={`h-3.5 w-3.5 mx-auto ${editMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-600'}`} />
                        ) : (
                          <span className={val === -1 ? 'text-emerald-400' : ''}>
                            {val !== undefined ? formatLimit(val as number) : '—'}
                          </span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Pricing row */}
              <tr className="border-t border-white/[0.08] bg-white/[0.02]">
                <td className="py-2.5 pr-4 pl-4 sm:pl-0 font-medium">Price</td>
                {localPlans.map(p => (
                  <td key={p.id} className="text-center py-2.5 px-2 sm:px-3 font-mono font-bold">
                    {formatPrice(p.price)}
                    {p.price > 0 && <span className="text-[10px] font-normal text-muted-foreground">/{p.duration}d</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

// ===================== AUDIT PAGE =====================
export function AuditPage({ logs }: { logs: AuditLog[] }) {
  return (
    <Card className="bg-card border-white/[0.06]">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Activity Log</CardTitle>
        <CardDescription className="text-xs">Recent admin actions</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">No actions logged yet</p>
        ) : (
          <ScrollArea className="max-h-[500px] custom-scrollbar">
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-md hover:bg-white/[0.03] transition-colors">
                  <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${
                    log.action.includes('SUSPEND') ? 'bg-red-400'
                    : log.action.includes('UNSUSPEND') ? 'bg-emerald-400'
                    : log.action.includes('RESET') ? 'bg-amber-400'
                    : log.action.includes('CHANGE_PLAN') ? 'bg-violet-400'
                    : log.action.includes('CHANGE_DURATION') ? 'bg-cyan-400'
                    : 'bg-blue-400'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium font-mono">{log.action.replace(/_/g, ' ')}</span>
                      <Badge variant="outline" className="text-[9px] font-mono border-white/[0.1]">{log.targetType}</Badge>
                    </div>
                    {log.details && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono truncate">{log.details}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{formatDateTime(log.createdAt)} · {log.performedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
