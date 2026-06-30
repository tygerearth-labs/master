'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from './ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Check, X, Store, Users } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  durationDays: number
  maxOutlets: number
  maxCrew: number
  features: string[]
  isActive: boolean
}

function formatRp(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`
}

export function PlanPricingView() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  // Form dialog
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    price: '',
    durationDays: '',
    maxOutlets: '',
    maxCrew: '',
    features: '',
    isActive: true,
  })

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteName, setDeleteName] = useState('')

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plans')
      if (res.ok) {
        const data = await res.json()
        setPlans(
          (data || []).map((p: Plan) => ({
            ...p,
            features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
          }))
        )
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const openAdd = () => {
    setEditId(null)
    setForm({ name: '', price: '', durationDays: '', maxOutlets: '', maxCrew: '', features: '', isActive: true })
    setFormOpen(true)
  }

  const openEdit = (plan: Plan) => {
    setEditId(plan.id)
    setForm({
      name: plan.name,
      price: String(plan.price),
      durationDays: String(plan.durationDays),
      maxOutlets: String(plan.maxOutlets),
      maxCrew: String(plan.maxCrew),
      features: (plan.features || []).join('\n'),
      isActive: plan.isActive,
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.durationDays) {
      toast.error('Name, price, and duration are required')
      return
    }
    try {
      const url = editId ? `/api/plans/${editId}` : '/api/plans'
      const method = editId ? 'PUT' : 'POST'
      const payload = {
        name: form.name,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        maxOutlets: Number(form.maxOutlets) || 0,
        maxCrew: Number(form.maxCrew) || 0,
        features: form.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: form.isActive,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        toast.success(editId ? 'Plan updated' : 'Plan added')
        setFormOpen(false)
        fetchPlans()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Operation failed')
      }
    } catch {
      toast.error('Operation failed')
    }
  }

  const handleToggleActive = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      })
      if (res.ok) {
        toast.success(`${plan.name} ${plan.isActive ? 'deactivated' : 'activated'}`)
        fetchPlans()
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/plans/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plan deleted')
        setDeleteOpen(false)
        fetchPlans()
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
          <h2 className="text-2xl font-bold tracking-tight">Plan & Pricing</h2>
          <p className="text-muted-foreground">Manage subscription plans.</p>
        </div>
        <Button onClick={openAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" /> Add Plan
        </Button>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No plans yet. Create your first plan.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative flex flex-col p-6 transition-shadow hover:shadow-lg ${
                !plan.isActive ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRp(plan.price)}
                    </span>
                    <span className="text-sm text-muted-foreground"> / {plan.durationDays} hari</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plan)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setDeleteId(plan.id); setDeleteName(plan.name); setDeleteOpen(true) }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Store className="h-4 w-4" />
                  <span>Max {plan.maxOutlets} Outlets</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Max {plan.maxCrew} Crew</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 mb-6">
                {(plan.features || []).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <Label htmlFor={`active-${plan.id}`} className="text-sm">Active</Label>
                <Switch
                  id={`active-${plan.id}`}
                  checked={plan.isActive}
                  onCheckedChange={() => handleToggleActive(plan)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Plan' : 'Add Plan'}</DialogTitle>
            <DialogDescription>{editId ? 'Update plan details.' : 'Create a new subscription plan.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Basic, Pro, Enterprise" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (Rp)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} placeholder="30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Outlets</Label>
                <Input type="number" value={form.maxOutlets} onChange={(e) => setForm({ ...form, maxOutlets: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Max Crew</Label>
                <Input type="number" value={form.maxCrew} onChange={(e) => setForm({ ...form, maxCrew: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                value={form.features}
                onChange={(e) => setForm({ ...form, features: e.target.value })}
                placeholder={"Unlimited transactions\nPriority support\nAdvanced analytics"}
                rows={5}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label>Active</Label>
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
        title="Delete Plan"
        description={`Are you sure you want to delete "${deleteName}"? This cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDelete} variant="destructive"
      />
    </div>
  )
}