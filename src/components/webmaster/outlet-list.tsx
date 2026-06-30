'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, Search, RefreshCw, Store, Eye,
  Building2, Crown, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Users, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { ViewState } from './webmaster-app'

/* ─── helpers ─── */
function formatDate(val: string): string {
  try { return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) } catch { return val }
}

function getPlanExpiryInfo(planExpiresAt: string | null, accountType: string) {
  if (accountType === 'free' && !planExpiresAt) return { label: 'Selamanya', color: 'text-muted-foreground', expired: false }
  if (!planExpiresAt) return { label: '-', color: 'text-muted-foreground', expired: false }
  const now = new Date()
  const exp = new Date(planExpiresAt)
  const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return { label: 'Expired', color: 'text-destructive font-semibold', expired: true }
  if (diff <= 7) return { label: `${diff} hari lagi`, color: 'text-amber-600 font-medium', expired: false }
  if (diff <= 30) return { label: `${diff} hari lagi`, color: 'text-emerald-600', expired: false }
  return { label: formatDate(planExpiresAt), color: 'text-muted-foreground', expired: false }
}

const planConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; dot: string }> = {
  free: { label: 'Free', variant: 'secondary', dot: 'bg-zinc-400' },
  pro: { label: 'Pro', variant: 'default', dot: 'bg-emerald-500' },
  enterprise: { label: 'Enterprise', variant: 'outline', dot: 'bg-amber-500' },
}

/* ─── types ─── */
interface OutletRow {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  accountType: string
  isMain: boolean
  groupId?: string | null
  planExpiresAt?: string | null
  createdAt: string
  _count: { users: number }
  group?: { id: string; name: string } | null
}

interface GroupedOutlets {
  groupId: string
  groupName: string
  mainOutlet: OutletRow | null
  branches: OutletRow[]
}

/* ─── component ─── */
export function OutletListView({
  onNavigate,
  onRefreshSidebar,
}: {
  onNavigate: (view: ViewState) => void
  onRefreshSidebar: () => void
}) {
  const [outlets, setOutlets] = useState<OutletRow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<Record<string, unknown> | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const fetchOutlets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/webmaster/outlets?${params}`)
      if (res.ok) {
        const json = await res.json()
        setOutlets((json.records || []) as OutletRow[])
      }
    } catch { toast.error('Gagal memuat data') } finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchOutlets() }, [fetchOutlets])
  useEffect(() => {
    // Auto-expand all groups
    const ids = new Set(outlets.filter(o => o.groupId).map(o => o.groupId!))
    setExpandedGroups(ids)
  }, [outlets])

  const handleSearch = () => { setSearch(searchInput) }

  const openCreate = () => {
    setEditRecord(null)
    setFormValues({ name: '', address: '', phone: '', accountType: 'free' })
    setDialogOpen(true)
  }
  const openEdit = (r: Record<string, unknown>) => { setEditRecord(r); setFormValues({ ...r }); setDialogOpen(true) }

  const handleSave = async () => {
    if (!formValues.name) { toast.error('Nama outlet wajib diisi'); return }
    setSaving(true)
    try {
      const payload = { name: formValues.name, address: formValues.address || null, phone: formValues.phone || null, accountType: formValues.accountType || 'free' }
      if (editRecord) {
        const res = await fetch(`/api/webmaster/outlets/${editRecord.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { toast.success('Outlet diperbarui'); setDialogOpen(false); fetchOutlets(); onRefreshSidebar() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      } else {
        const res = await fetch('/api/webmaster/outlets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (res.ok) { toast.success('Outlet dibuat'); setDialogOpen(false); fetchOutlets(); onRefreshSidebar() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      const res = await fetch(`/api/webmaster/outlets/${deleteRecord.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Outlet dihapus'); setDeleteRecord(null); fetchOutlets(); onRefreshSidebar() }
      else { const e = await res.json(); toast.error(e.error || 'Gagal menghapus') }
    } catch { toast.error('Terjadi kesalahan') }
  }

  /* ─── grouping logic ─── */
  const { grouped, standalone } = useMemo(() => {
    const groupMap = new Map<string, GroupedOutlets>()
    const standaloneList: OutletRow[] = []

    for (const o of outlets) {
      if (o.groupId) {
        const existing = groupMap.get(o.groupId)
        if (existing) {
          if (o.isMain) { existing.mainOutlet = o } else { existing.branches.push(o) }
        } else {
          groupMap.set(o.groupId, {
            groupId: o.groupId,
            groupName: o.group?.name || 'Tanpa Nama',
            mainOutlet: o.isMain ? o : null,
            branches: o.isMain ? [] : [o],
          })
        }
      } else {
        standaloneList.push(o)
      }
    }

    // If a group has no explicit main, use first branch as main
    for (const g of groupMap.values()) {
      if (!g.mainOutlet && g.branches.length > 0) { g.mainOutlet = g.branches.shift()! }
    }

    return { grouped: Array.from(groupMap.values()), standalone: standaloneList }
  }, [outlets])

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  const totalOutlets = outlets.length
  const totalGroups = grouped.length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outlet</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalOutlets} outlet &middot; {totalGroups} grup enterprise
          </p>
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4 mr-1" /> Tambah Outlet</Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari outlet..." value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()} className="pl-8" />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>Cari</Button>
        <Button variant="outline" size="icon" onClick={fetchOutlets} title="Refresh"><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <div className="grid gap-3 sm:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
        </div>
      ) : totalOutlets === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Store className="h-12 w-12 mb-3 opacity-30" />
          <p>Belum ada outlet. Klik &quot;Tambah Outlet&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ─── Enterprise Groups (Pipeline) ─── */}
          {grouped.map((group) => {
            const isExpanded = expandedGroups.has(group.groupId)
            const allOutlets = group.mainOutlet ? [group.mainOutlet, ...group.branches] : group.branches
            const groupExpiry = getPlanExpiryInfo(
              group.mainOutlet?.planExpiresAt || null,
              group.mainOutlet?.accountType || 'free'
            )
            const totalUsers = allOutlets.reduce((s, o) => s + (o._count?.users || 0), 0)

            return (
              <Card key={group.groupId} className="overflow-hidden">
                {/* Group Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleGroup(group.groupId)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm">{group.groupName}</h3>
                        <Badge variant="outline" className="text-xs">{allOutlets.length} outlet</Badge>
                        <Badge variant={planConfig[group.mainOutlet?.accountType || 'free']?.variant} className="text-xs">
                          {planConfig[group.mainOutlet?.accountType || 'free']?.label}
                        </Badge>
                        {groupExpiry.label !== 'Selamanya' && (
                          <Badge variant={groupExpiry.expired ? 'destructive' : 'outline'} className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />{groupExpiry.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{totalUsers} user</span>
                        {group.mainOutlet?.phone && (
                          <span className="flex items-center gap-1">{group.mainOutlet.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Pipeline: Outlet nodes */}
                {isExpanded && (
                  <div className="border-t bg-muted/20 px-4 py-4">
                    <div className="relative ml-5.5 pl-6">
                      {/* Vertical pipeline line */}
                      {allOutlets.length > 1 && (
                        <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-amber-300/60 dark:bg-amber-700/40" />
                      )}

                      <div className="space-y-1">
                        {allOutlets.map((outlet, idx) => {
                          const isMain = outlet.isMain || idx === 0
                          const expiry = getPlanExpiryInfo(outlet.planExpiresAt || null, outlet.accountType)
                          const isLast = idx === allOutlets.length - 1

                          return (
                            <div key={outlet.id} className="relative">
                              {/* Pipeline dot */}
                              <div className={`absolute -left-6 top-3.5 h-[22px] w-[22px] rounded-full border-[3px] flex items-center justify-center ${
                                isMain
                                  ? 'border-amber-500 bg-amber-100 dark:bg-amber-950 dark:border-amber-400'
                                  : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-900'
                              }`}>
                                <div className={`h-2 w-2 rounded-full ${
                                  isMain ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-500'
                                }`} />
                              </div>

                              {/* Outlet card node */}
                              <div
                                className="group relative flex items-center gap-3 rounded-lg border bg-card p-3 mb-2 cursor-pointer hover:shadow-md hover:border-amber-300/60 dark:hover:border-amber-700/60 transition-all"
                                onClick={() => onNavigate({ type: 'detail', outletId: outlet.id })}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-sm truncate">{outlet.name}</span>
                                    {isMain && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400">
                                        <Crown className="h-2.5 w-2.5 mr-0.5" />Pusat
                                      </Badge>
                                    )}
                                    <Badge variant={planConfig[outlet.accountType]?.variant} className="text-[10px] px-1.5 py-0">
                                      {planConfig[outlet.accountType]?.label}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                    {outlet.address && (
                                      <span className="flex items-center gap-1 truncate max-w-[220px]">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />{outlet.address}
                                      </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />{outlet._count?.users || 0} user
                                    </span>
                                  </div>
                                  {expiry.label !== 'Selamanya' && expiry.label !== '-' && (
                                    <div className={`flex items-center gap-1 text-xs mt-1 ${expiry.color}`}>
                                      <Clock className="h-3 w-3" />
                                      {expiry.label}
                                    </div>
                                  )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  onClick={e => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7"
                                    onClick={() => onNavigate({ type: 'detail', outletId: outlet.id })} title="Detail">
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(outlet)} title="Edit">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteRecord(outlet)} title="Hapus">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Connector to next node */}
                              {!isLast && (
                                <div className="flex justify-start -mt-1 mb-1">
                                  <div className="w-0.5 h-3 bg-amber-200/80 dark:bg-amber-800/50 -ml-6" />
                                </div>
                              )}
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

          {/* ─── Standalone Outlets ─── */}
          {standalone.length > 0 && (
            <div>
              {grouped.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Separator className="flex-1" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                    Standalone ({standalone.length})
                  </span>
                  <Separator className="flex-1" />
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {standalone.map((outlet) => {
                  const expiry = getPlanExpiryInfo(outlet.planExpiresAt || null, outlet.accountType)
                  return (
                    <Card
                      key={outlet.id}
                      className="group cursor-pointer hover:shadow-md transition-all"
                      onClick={() => onNavigate({ type: 'detail', outletId: outlet.id })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                              <Store className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{outlet.name}</p>
                              {outlet.address && (
                                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{outlet.address}</p>
                              )}
                            </div>
                          </div>
                          <Badge variant={planConfig[outlet.accountType]?.variant} className="text-[10px] flex-shrink-0">
                            {planConfig[outlet.accountType]?.label}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{outlet._count?.users || 0}</span>
                            {expiry.label !== 'Selamanya' && expiry.label !== '-' && (
                              <span className={`flex items-center gap-1 ${expiry.color}`}>
                                <Clock className="h-3 w-3" />{expiry.label}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7"
                              onClick={() => onNavigate({ type: 'detail', outletId: outlet.id })}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(outlet)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteRecord(outlet)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Create / Edit Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRecord ? 'Edit Outlet' : 'Tambah Outlet Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Nama Outlet <span className="text-destructive">*</span></Label>
              <Input value={(formValues.name as string) || ''} onChange={e => setFormValues(p => ({ ...p, name: e.target.value }))} placeholder="Contoh: Kopi Kenangan Senayan" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alamat</Label>
              <Input value={(formValues.address as string) || ''} onChange={e => setFormValues(p => ({ ...p, address: e.target.value }))} placeholder="Jl. Sudirman No. 42, Jakarta" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Telepon</Label>
              <Input value={(formValues.phone as string) || ''} onChange={e => setFormValues(p => ({ ...p, phone: e.target.value }))} placeholder="08123456789" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Plan</Label>
              <Select value={(formValues.accountType as string) || 'free'} onValueChange={v => setFormValues(p => ({ ...p, accountType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : editRecord ? 'Simpan' : 'Buat'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <AlertDialog open={!!deleteRecord} onOpenChange={o => !o && setDeleteRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Outlet?</AlertDialogTitle>
            <AlertDialogDescription>
              Outlet <strong>{String(deleteRecord?.name || '')}</strong> dan semua data terkait akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}