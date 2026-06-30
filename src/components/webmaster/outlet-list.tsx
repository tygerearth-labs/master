'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, Store, Eye, Building2 } from 'lucide-react'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import type { ViewState } from './webmaster-app'

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  } catch { return val }
}

const planLabel: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  enterprise: 'Enterprise',
}

const planVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  free: 'default',
  pro: 'secondary',
  enterprise: 'outline',
}

export function OutletListView({
  onNavigate,
  onRefreshSidebar,
}: {
  onNavigate: (view: ViewState) => void
  onRefreshSidebar: () => void
}) {
  const [outlets, setOutlets] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<Record<string, unknown> | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  const limit = 10

  const fetchOutlets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      const res = await fetch(`/api/webmaster/outlets?${params}`)
      if (res.ok) {
        const json = await res.json()
        setOutlets(json.records || [])
        setTotal(json.total || 0)
        setTotalPages(json.totalPages || 1)
      }
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchOutlets() }, [fetchOutlets])

  const handleSearch = () => { setSearch(searchInput); setPage(1) }

  const openCreate = () => {
    setEditRecord(null)
    setFormValues({ name: '', address: '', phone: '', accountType: 'free' })
    setDialogOpen(true)
  }

  const openEdit = (r: Record<string, unknown>) => {
    setEditRecord(r)
    setFormValues({ ...r })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formValues.name) { toast.error('Nama outlet wajib diisi'); return }
    setSaving(true)
    try {
      const payload = {
        name: formValues.name,
        address: formValues.address || null,
        phone: formValues.phone || null,
        accountType: formValues.accountType || 'free',
      }
      if (editRecord) {
        const res = await fetch(`/api/webmaster/outlets/${editRecord.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) { toast.success('Outlet berhasil diperbarui'); setDialogOpen(false); fetchOutlets(); onRefreshSidebar() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      } else {
        const res = await fetch('/api/webmaster/outlets', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) { toast.success('Outlet berhasil dibuat'); setDialogOpen(false); fetchOutlets(); onRefreshSidebar() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      const res = await fetch(`/api/webmaster/outlets/${deleteRecord.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Outlet berhasil dihapus'); setDeleteRecord(null); fetchOutlets(); onRefreshSidebar() }
      else { const e = await res.json(); toast.error(e.error || 'Gagal menghapus') }
    } catch { toast.error('Terjadi kesalahan') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outlet</h1>
          <p className="text-muted-foreground text-sm mt-1">{total} outlet terdaftar</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Tambah Outlet
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari outlet..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-8" />
        </div>
        <Button variant="outline" size="sm" onClick={handleSearch}>Cari</Button>
        <Button variant="outline" size="icon" onClick={fetchOutlets} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama Outlet</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Grup</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Alamat</TableHead>
                <TableHead className="text-xs">Plan</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Dibuat</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : outlets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Belum ada outlet. Klik &quot;Tambah Outlet&quot; untuk memulai.
                  </TableCell>
                </TableRow>
              ) : (
                outlets.map((outlet) => (
                  <TableRow key={String(outlet.id)} className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onNavigate({ type: 'detail', outletId: String(outlet.id) })}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                          <Store className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium text-sm">{String(outlet.name)}</span>
                          {outlet.isMain && (
                            <Badge variant="outline" className="text-[10px] ml-1.5 px-1 py-0">Pusat</Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {outlet.group ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-amber-500" />
                          <span>{String((outlet.group as Record<string, unknown>).name)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60">Standalone</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {String(outlet.address || '-')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={planVariant[String(outlet.accountType)] || 'default'}>
                        {planLabel[String(outlet.accountType)] || String(outlet.accountType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {outlet.createdAt ? formatDate(String(outlet.createdAt)) : '-'}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => onNavigate({ type: 'detail', outletId: String(outlet.id) })} title="Detail">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(outlet)} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteRecord(outlet)} title="Hapus">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Halaman {page} dari {totalPages} ({total} total)</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">{page}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRecord ? 'Edit Outlet' : 'Tambah Outlet Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Nama Outlet <span className="text-destructive">*</span></Label>
              <Input value={(formValues.name as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))} placeholder="Contoh: Kopi Kenangan Senayan" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Alamat</Label>
              <Input value={(formValues.address as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, address: e.target.value }))} placeholder="Jl. Sudirman No. 42, Jakarta" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Telepon</Label>
              <Input value={(formValues.phone as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, phone: e.target.value }))} placeholder="08123456789" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Plan</Label>
              <Select value={(formValues.accountType as string) || 'free'} onValueChange={(v) => setFormValues((p) => ({ ...p, accountType: v }))}>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecord} onOpenChange={(o) => !o && setDeleteRecord(null)}>
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