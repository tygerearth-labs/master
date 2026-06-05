'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Search, Users, Shield, ShieldCheck } from 'lucide-react'
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

interface CrewMember {
  id: string
  name: string
  email: string
  password: string
  role: string
  createdAt: string
  crewPermission?: { pages: string } | null
}

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return val }
}

export function CrewTab({
  outletId,
  onRefresh,
}: {
  outletId: string
  onRefresh: () => void
}) {
  const [crew, setCrew] = useState<CrewMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<CrewMember | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<CrewMember | null>(null)
  const [formValues, setFormValues] = useState<Record<string, unknown>>({})
  const [saving, setSaving] = useState(false)

  const fetchCrew = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/webmaster/User?limit=100&search=${encodeURIComponent(outletId)}`)
      if (res.ok) {
        const json = await res.json()
        // Filter users belonging to this outlet
        const users = (json.data || []).filter((u: Record<string, unknown>) => u.outletId === outletId) as unknown as CrewMember[]
        setCrew(users)
      }
    } catch {
      toast.error('Gagal memuat crew')
    } finally {
      setLoading(false)
    }
  }, [outletId])

  useEffect(() => { fetchCrew() }, [fetchCrew])

  const filteredCrew = search
    ? crew.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    : crew

  const ownerCount = crew.filter((c) => c.role === 'OWNER').length
  const crewCount = crew.filter((c) => c.role === 'CREW').length

  const openCreate = () => {
    setEditRecord(null)
    setFormValues({ name: '', email: '', password: '', role: 'CREW' })
    setDialogOpen(true)
  }

  const openEdit = (r: CrewMember) => {
    setEditRecord(r)
    setFormValues({ name: r.name, email: r.email, password: r.password, role: r.role })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formValues.name || !formValues.email) {
      toast.error('Nama dan email wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        name: formValues.name,
        email: formValues.email,
        role: formValues.role || 'CREW',
        outletId,
      }
      // Include password if provided
      if (formValues.password) {
        payload.password = formValues.password
      }

      if (editRecord) {
        const res = await fetch(`/api/webmaster/User/${editRecord.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) { toast.success('Crew berhasil diperbarui'); setDialogOpen(false); fetchCrew() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      } else {
        if (!formValues.password) { toast.error('Password wajib diisi untuk crew baru'); setSaving(false); return }
        const res = await fetch('/api/webmaster/User', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        })
        if (res.ok) { toast.success('Crew berhasil ditambahkan'); setDialogOpen(false); fetchCrew(); onRefresh() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal') }
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    if (deleteRecord.role === 'OWNER') {
      toast.error('Owner tidak bisa dihapus dari sini. Gunakan tab Akun.')
      setDeleteRecord(null)
      return
    }
    try {
      const res = await fetch(`/api/webmaster/User/${deleteRecord.id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Crew berhasil dihapus'); setDeleteRecord(null); fetchCrew(); onRefresh() }
      else { const e = await res.json(); toast.error(e.error || 'Gagal') }
    } catch { toast.error('Terjadi kesalahan') }
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="text-lg font-bold">{ownerCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Crew</p>
              <p className="text-lg font-bold">{crewCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Cari crew..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)} className="pl-8" />
          </div>
        </div>
        <Button onClick={openCreate} size="sm" className="ml-2">
          <Plus className="h-4 w-4 mr-1" /> Tambah Crew
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Nama</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Email</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Dibuat</TableHead>
                <TableHead className="text-xs text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredCrew.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {crew.length === 0 ? 'Belum ada crew' : 'Tidak ditemukan'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCrew.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(member)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteRecord(member)}>
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRecord ? 'Edit Crew' : 'Tambah Crew Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-sm">Nama <span className="text-destructive">*</span></Label>
              <Input value={(formValues.name as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, name: e.target.value }))} placeholder="Nama lengkap" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email <span className="text-destructive">*</span></Label>
              <Input type="email" value={(formValues.email as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, email: e.target.value }))} placeholder="email@contoh.com" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">{editRecord ? 'Password (kosongkan jika tidak diubah)' : 'Password <span className="text-destructive">*</span>'}</Label>
              <Input type="password" value={(formValues.password as string) || ''} onChange={(e) => setFormValues((p) => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Role</Label>
              <Select value={(formValues.role as string) || 'CREW'} onValueChange={(v) => setFormValues((p) => ({ ...p, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">OWNER</SelectItem>
                  <SelectItem value="CREW">CREW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Separator />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : editRecord ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRecord} onOpenChange={(o) => !o && setDeleteRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Crew?</AlertDialogTitle>
            <AlertDialogDescription>
              Crew <strong>{deleteRecord?.name}</strong> akan dihapus permanen.
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
