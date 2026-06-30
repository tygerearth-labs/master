'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { StatusBadge } from './StatusBadge'
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
import { Plus, Search, Eye, KeyRound, CreditCard, Power, PowerOff } from 'lucide-react'

interface Owner {
  id: string
  name: string
  email: string
  phone: string | null
  planName: string | null
  subscriptionStatus: string | null
  outletsCount: number
  crewCount: number
  isActive: boolean
  createdAt: string
}

interface Plan {
  id: string
  name: string
  price: number
  durationDays: number
}

export function OwnerView() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Add dialog
  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', email: '', phone: '' })

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailOwner, setDetailOwner] = useState<Owner | null>(null)

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false)
  const [resetId, setResetId] = useState('')
  const [resetName, setResetName] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Change plan dialog
  const [planOpen, setPlanOpen] = useState(false)
  const [planOwnerId, setPlanOwnerId] = useState('')
  const [planOwnerName, setPlanOwnerName] = useState('')
  const [selectedPlan, setSelectedPlan] = useState('')
  const [durationDays, setDurationDays] = useState('30')

  const fetchOwners = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(search ? { search } : {})
      const res = await fetch(`/api/owners?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOwners(data)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [search])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(data)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchOwners() }, [fetchOwners])
  useEffect(() => { fetchPlans() }, [fetchPlans])

  const handleAdd = async () => {
    if (!addForm.name || !addForm.email) {
      toast.error('Name and email are required')
      return
    }
    try {
      const res = await fetch('/api/owners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      if (res.ok) {
        toast.success('Owner added successfully')
        setAddOpen(false)
        setAddForm({ name: '', email: '', phone: '' })
        fetchOwners()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add owner')
      }
    } catch {
      toast.error('Failed to add owner')
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    try {
      const res = await fetch(`/api/owners/${resetId}/reset-password`, {
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

  const handleChangePlan = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan')
      return
    }
    try {
      const res = await fetch(`/api/owners/${planOwnerId}/change-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selectedPlan, durationDays: Number(durationDays) }),
      })
      if (res.ok) {
        toast.success(`Plan updated for ${planOwnerName}`)
        setPlanOpen(false)
        fetchOwners()
      } else {
        toast.error('Failed to change plan')
      }
    } catch {
      toast.error('Failed to change plan')
    }
  }

  const handleToggleActive = async (owner: Owner) => {
    try {
      const res = await fetch(`/api/owners/${owner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !owner.isActive }),
      })
      if (res.ok) {
        toast.success(`${owner.name} ${owner.isActive ? 'deactivated' : 'activated'}`)
        fetchOwners()
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
          <h2 className="text-2xl font-bold tracking-tight">Owner</h2>
          <p className="text-muted-foreground">Manage all platform owners.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Owner
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search owners..."
          className="pl-8 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto custom-scrollbar rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead className="text-right">Outlets</TableHead>
                  <TableHead className="text-right">Crew</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : owners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No owners found
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => (
                    <TableRow key={owner.id}>
                      <TableCell className="font-medium">{owner.name}</TableCell>
                      <TableCell className="text-sm">{owner.email}</TableCell>
                      <TableCell className="text-sm">{owner.phone || '—'}</TableCell>
                      <TableCell><span className="text-sm">{owner.planName || '—'}</span></TableCell>
                      <TableCell>
                        {owner.subscriptionStatus ? <StatusBadge status={owner.subscriptionStatus as any} /> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">{owner.outletsCount}</TableCell>
                      <TableCell className="text-right">{owner.crewCount}</TableCell>
                      <TableCell><StatusBadge status={owner.isActive ? 'active' : 'inactive'} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Detail" onClick={() => { setDetailOwner(owner); setDetailOpen(true) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Reset Password" onClick={() => { setResetId(owner.id); setResetName(owner.name); setResetOpen(true) }}>
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Change Plan" onClick={() => { setPlanOwnerId(owner.id); setPlanOwnerName(owner.name); setSelectedPlan(''); setDurationDays('30'); setPlanOpen(true) }}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={owner.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(owner)}>
                            {owner.isActive ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-emerald-500" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Owner Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Owner</DialogTitle>
            <DialogDescription>Create a new owner account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Owner name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="owner@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} placeholder="+62..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">Add Owner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Owner Detail</DialogTitle>
          </DialogHeader>
          {detailOwner && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-muted-foreground">Name</div><div className="font-medium">{detailOwner.name}</div>
                <div className="text-muted-foreground">Email</div><div className="font-medium">{detailOwner.email}</div>
                <div className="text-muted-foreground">Phone</div><div>{detailOwner.phone || '—'}</div>
                <div className="text-muted-foreground">Plan</div><div>{detailOwner.planName || '—'}</div>
                <div className="text-muted-foreground">Subscription</div>
                <div>{detailOwner.subscriptionStatus ? <StatusBadge status={detailOwner.subscriptionStatus as any} /> : '—'}</div>
                <div className="text-muted-foreground">Outlets</div><div>{detailOwner.outletsCount}</div>
                <div className="text-muted-foreground">Crew</div><div>{detailOwner.crewCount}</div>
                <div className="text-muted-foreground">Status</div><div><StatusBadge status={detailOwner.isActive ? 'active' : 'inactive'} /></div>
                <div className="text-muted-foreground">Created</div><div>{new Date(detailOwner.createdAt).toLocaleDateString('id-ID')}</div>
              </div>
            </div>
          )}
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

      {/* Change Plan Dialog */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>Update plan for {planOwnerName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration (days)</Label>
              <Input type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} min="1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePlan} className="bg-emerald-600 hover:bg-emerald-700">Update Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}