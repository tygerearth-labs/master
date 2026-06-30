'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './StatusBadge'
import { ConfirmDialog } from './ConfirmDialog'
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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

interface Outlet {
  id: string
  name: string
  branchName: string
  branchId: string
  ownerName: string
  address: string | null
  status: string
}

interface Branch {
  id: string
  name: string
  ownerId: string
  ownerName: string
}

interface Owner {
  id: string
  name: string
}

const ITEMS_PER_PAGE = 10

export function OutletView() {
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Add/Edit dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', branchId: '', address: '', status: 'active' })
  const [formOwnerId, setFormOwnerId] = useState('')

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  const fetchOutlets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        ...(search && { search }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })
      const res = await fetch(`/api/outlets?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOutlets(data.data || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  const fetchLookups = useCallback(async () => {
    try {
      const [bRes, oRes] = await Promise.all([fetch('/api/branches?limit=999'), fetch('/api/owners')])
      if (bRes.ok) {
        const bData = await bRes.json()
        setBranches(bData.data || bData || [])
      }
      if (oRes.ok) {
        const oData = await oRes.json()
        setOwners(oData.data || oData || [])
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchOutlets() }, [fetchOutlets])
  useEffect(() => { fetchLookups() }, [fetchLookups])

  const filteredBranches = formOwnerId
    ? branches.filter((b) => b.ownerId === formOwnerId)
    : branches

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', branchId: '', address: '', status: 'active' })
    setFormOwnerId('')
    setFormOpen(true)
  }

  const openEdit = (outlet: Outlet) => {
    setEditId(outlet.id)
    setForm({ name: outlet.name, branchId: outlet.branchId, address: outlet.address || '', status: outlet.status })
    const branch = branches.find((b) => b.id === outlet.branchId)
    setFormOwnerId(branch?.ownerId || '')
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.branchId) {
      toast.error('Name and Branch are required')
      return
    }
    try {
      const url = editId ? `/api/outlets/${editId}` : '/api/outlets'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editId ? 'Outlet updated' : 'Outlet added')
        setFormOpen(false)
        fetchOutlets()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/outlets/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Outlet deleted')
        setDeleteOpen(false)
        fetchOutlets()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Outlet</h2>
          <p className="text-muted-foreground">Manage all outlets.</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Outlet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search outlets..." className="pl-8 h-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : outlets.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No outlets found</TableCell></TableRow>
                ) : (
                  outlets.map((outlet) => (
                    <TableRow key={outlet.id}>
                      <TableCell className="font-medium">{outlet.name}</TableCell>
                      <TableCell>{outlet.branchName}</TableCell>
                      <TableCell>{outlet.ownerName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{outlet.address || '—'}</TableCell>
                      <TableCell><StatusBadge status={outlet.status} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(outlet)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDeleteId(outlet.id); setDeleteName(outlet.name); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <DialogTitle>{editId ? 'Edit Outlet' : 'Add Outlet'}</DialogTitle>
            <DialogDescription>{editId ? 'Update outlet information.' : 'Create a new outlet.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Outlet name" />
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={formOwnerId} onValueChange={(v) => { setFormOwnerId(v); setForm({ ...form, branchId: '' }) }}>
                <SelectTrigger><SelectValue placeholder="Select owner first" /></SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={form.branchId} onValueChange={(v) => setForm({ ...form, branchId: v })}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
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

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Outlet"
        description={`Are you sure you want to delete "${deleteName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  )
}