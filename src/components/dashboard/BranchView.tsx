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

interface Branch {
  id: string
  name: string
  address: string | null
  phone: string | null
  ownerId: string
  ownerName: string
  isActive: boolean
  outletCount: number
}

interface Owner {
  id: string
  name: string
}

const ITEMS_PER_PAGE = 10

export function BranchView() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Add/Edit dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', ownerId: '', address: '', phone: '', isActive: 'true' })

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  const fetchBranches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
        ...(search && { search }),
      })
      const res = await fetch(`/api/branches?${params}`)
      if (res.ok) {
        const data = await res.json()
        setBranches(data.data || [])
        setTotalPages(data.totalPages || 1)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [page, search])

  const fetchOwners = useCallback(async () => {
    try {
      const res = await fetch('/api/owners')
      if (res.ok) setOwners(await res.json())
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchBranches() }, [fetchBranches])
  useEffect(() => { fetchOwners() }, [fetchOwners])

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', ownerId: '', address: '', phone: '', isActive: 'true' })
    setFormOpen(true)
  }

  const openEdit = (branch: Branch) => {
    setEditId(branch.id)
    setForm({
      name: branch.name,
      ownerId: branch.ownerId,
      address: branch.address || '',
      phone: branch.phone || '',
      isActive: String(branch.isActive),
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.ownerId) {
      toast.error('Name and Owner are required')
      return
    }
    try {
      const url = editId ? `/api/branches/${editId}` : '/api/branches'
      const method = editId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, isActive: form.isActive === 'true' }),
      })
      if (res.ok) {
        toast.success(editId ? 'Branch updated' : 'Branch added')
        setFormOpen(false)
        fetchBranches()
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
      const res = await fetch(`/api/branches/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Branch deleted')
        setDeleteOpen(false)
        fetchBranches()
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
          <h2 className="text-2xl font-bold tracking-tight">Branch</h2>
          <p className="text-muted-foreground">Manage all branches.</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Branch
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search branches..." className="pl-8 h-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
      </div>

      <Card className="p-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Outlets</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  ))
                ) : branches.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No branches found</TableCell></TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{branch.address || '—'}</TableCell>
                      <TableCell>{branch.phone || '—'}</TableCell>
                      <TableCell>{branch.ownerName}</TableCell>
                      <TableCell><StatusBadge status={branch.isActive ? 'active' : 'inactive'} /></TableCell>
                      <TableCell className="text-right">{branch.outletCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(branch)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDeleteId(branch.id); setDeleteName(branch.name); setDeleteOpen(true) }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <DialogTitle>{editId ? 'Edit Branch' : 'Add Branch'}</DialogTitle>
            <DialogDescription>{editId ? 'Update branch information.' : 'Create a new branch.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Branch name" />
            </div>
            <div className="space-y-2">
              <Label>Owner</Label>
              <Select value={form.ownerId} onValueChange={(v) => setForm({ ...form, ownerId: v })}>
                <SelectTrigger><SelectValue placeholder="Select owner" /></SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (<SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62..." />
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

      <ConfirmDialog
        open={deleteOpen} onOpenChange={setDeleteOpen}
        title="Delete Branch"
        description={`Are you sure you want to delete "${deleteName}"? All outlets in this branch will be affected.`}
        confirmLabel="Delete" onConfirm={handleDelete} variant="destructive"
      />
    </div>
  )
}