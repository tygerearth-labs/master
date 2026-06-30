'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './StatusBadge'
import { PaginationControls } from './PaginationControls'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Plus, Search, Pencil, KeyRound, Power, PowerOff } from 'lucide-react'

interface Crew {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  outletId: string
  outletName: string
  isActive: boolean
}

interface Outlet {
  id: string
  name: string
  branchId: string
  ownerId: string
  ownerName: string
  branchName: string
}

const ITEMS_PER_PAGE = 10

export function CrewView() {
  const [crew, setCrew] = useState<Crew[]>([])
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Add/Edit dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'staff', outletId: '', isActive: 'true' })

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false)
  const [resetId, setResetId] = useState('')
  const [resetName, setResetName] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const fetchCrew = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        ...(search && { search }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
      })
      const res = await fetch(`/api/crew?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCrew(data.data || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  const fetchOutlets = useCallback(async () => {
    try {
      const res = await fetch('/api/outlets?limit=999')
      if (res.ok) {
        const data = await res.json()
        setOutlets(data.data || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchCrew() }, [fetchCrew])
  useEffect(() => { fetchOutlets() }, [fetchOutlets])

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', email: '', phone: '', role: 'staff', outletId: '', isActive: 'true' })
    setFormOpen(true)
  }

  const openEdit = (c: Crew) => {
    setEditId(c.id)
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      role: c.role,
      outletId: c.outletId,
      isActive: String(c.isActive),
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.outletId) {
      toast.error('Name, email, and outlet are required')
      return
    }
    try {
      const url = editId ? `/api/crew/${editId}` : '/api/crew'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isActive: form.isActive === 'true' }),
      })
      if (res.ok) {
        toast.success(editId ? 'Crew updated' : 'Crew added')
        setFormOpen(false)
        fetchCrew()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      const res = await fetch(`/api/crew/${resetId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      if (res.ok) {
        toast.success(`Password reset for ${resetName}`)
        setResetOpen(false)
        setNewPassword('')
      } else {
        toast.error('Failed to reset password')
      }
    } catch {
      toast.error('Failed to reset password')
    }
  }

  const handleToggleActive = async (c: Crew) => {
    try {
      const res = await fetch(`/api/crew/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !c.isActive }),
      })
      if (res.ok) {
        toast.success(`${c.name} ${c.isActive ? 'deactivated' : 'activated'}`)
        fetchCrew()
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Crew</h2>
          <p className="text-muted-foreground">Manage all crew members.</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Crew
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search crew..." className="pl-8 h-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Outlet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : crew.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No crew found</TableCell></TableRow>
                ) : (
                  crew.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm">{c.email}</TableCell>
                      <TableCell>{c.phone || '—'}</TableCell>
                      <TableCell><StatusBadge status={c.role as any} /></TableCell>
                      <TableCell>{c.outletName}</TableCell>
                      <TableCell><StatusBadge status={c.isActive ? 'active' : 'inactive'} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Reset Password" onClick={() => { setResetId(c.id); setResetName(c.name); setResetOpen(true) }}><KeyRound className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(c)}>
                            {c.isActive ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-emerald-500" />}
                          </Button>
                        </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Crew' : 'Add Crew'}</DialogTitle>
            <DialogDescription>{editId ? 'Update crew information.' : 'Create a new crew member.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Crew name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="crew@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62..." />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outlet</Label>
              <Select value={form.outletId} onValueChange={(v) => setForm({ ...form, outletId: v })}>
                <SelectTrigger><SelectValue placeholder="Select outlet" /></SelectTrigger>
                <SelectContent>
                  {outlets.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name} — {o.ownerName} / {o.branchName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.isActive} onValueChange={(v) => setForm({ ...form, isActive: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">{editId ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for {resetName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} className="bg-emerald-600 hover:bg-emerald-700">Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}