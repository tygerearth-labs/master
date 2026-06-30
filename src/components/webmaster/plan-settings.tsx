'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Save, X, ExternalLink,
  Crown, Zap, Clock, CheckCircle2, Circle, RefreshCw,
  Tag, DollarSign, CalendarDays, Link2, ToggleLeft, ToggleRight,
  GripVertical, ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  duration: number
  paymentLink: string | null
  features: string
  active: boolean
  sortOrder: number
  description: string | null
  createdAt: string
  updatedAt: string
}

function formatCurrency(val: number): string {
  if (val === 0) return 'Gratis'
  return 'Rp ' + val.toLocaleString('id-ID')
}

function parseFeatures(featuresJson: string): Record<string, boolean | number> {
  try { return JSON.parse(featuresJson) } catch { return {} }
}

const featureLabels: Record<string, string> = {
  maxOutlets: 'Maks Outlet',
  maxProducts: 'Maks Produk',
  maxCrew: 'Maks Crew',
  multiOutlet: 'Multi-Outlet',
  loyalty: 'Program Loyalitas',
  promo: 'Promo & Diskon',
  transfer: 'Transfer Antar Outlet',
  telegramNotif: 'Notif Telegram',
}

const planColorMap: Record<string, { card: string; header: string; icon: string; text: string; border: string }> = {
  free:       { card: 'bg-zinc-50 dark:bg-zinc-950/30', header: 'bg-zinc-100 dark:bg-zinc-900', icon: 'text-zinc-500', text: 'text-zinc-600 dark:text-zinc-400', border: 'border-zinc-200 dark:border-zinc-800' },
  pro:        { card: 'bg-emerald-50/50 dark:bg-emerald-950/20', header: 'bg-emerald-100 dark:bg-emerald-900/50', icon: 'text-emerald-600', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
  enterprise: { card: 'bg-amber-50/50 dark:bg-amber-950/20', header: 'bg-amber-100 dark:bg-amber-900/50', icon: 'text-amber-600', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
}

function getPlanColor(slug: string) {
  if (slug.includes('enterprise')) return planColorMap.enterprise
  if (slug.includes('pro')) return planColorMap.pro
  return planColorMap.free
}

function getPlanIcon(slug: string) {
  if (slug.includes('enterprise')) return Crown
  if (slug.includes('pro')) return Zap
  return Clock
}

const defaultFeatures = {
  maxOutlets: 1, maxProducts: 50, maxCrew: 3,
  multiOutlet: false, loyalty: false, promo: false, transfer: false, telegramNotif: false,
}

export function PlanSettingsView() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPlan, setEditPlan] = useState<Plan | null>(null)
  const [deletePlan, setDeletePlan] = useState<Plan | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formPrice, setFormPrice] = useState('0')
  const [formDuration, setFormDuration] = useState('1')
  const [formPaymentLink, setFormPaymentLink] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formSortOrder, setFormSortOrder] = useState('0')
  const [formDescription, setFormDescription] = useState('')
  const [formFeatures, setFormFeatures] = useState<Record<string, boolean | number>>({ ...defaultFeatures })

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/webmaster/plans')
      if (res.ok) {
        const json = await res.json()
        setPlans(json)
      }
    } catch {
      toast.error('Gagal memuat data plan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlans() }, [fetchPlans])

  const resetForm = () => {
    setFormName('')
    setFormSlug('')
    setFormPrice('0')
    setFormDuration('1')
    setFormPaymentLink('')
    setFormActive(true)
    setFormSortOrder('0')
    setFormDescription('')
    setFormFeatures({ ...defaultFeatures })
  }

  const openCreate = () => {
    setEditPlan(null)
    resetForm()
    setFormSortOrder(String(plans.length))
    setDialogOpen(true)
  }

  const openEdit = (p: Plan) => {
    setEditPlan(p)
    setFormName(p.name)
    setFormSlug(p.slug)
    setFormPrice(String(p.price))
    setFormDuration(String(p.duration))
    setFormPaymentLink(p.paymentLink || '')
    setFormActive(p.active)
    setFormSortOrder(String(p.sortOrder))
    setFormDescription(p.description || '')
    setFormFeatures(parseFeatures(p.features))
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formName || !formSlug) {
      toast.error('Nama dan slug wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: formName,
        slug: formSlug,
        price: Number(formPrice),
        duration: Number(formDuration),
        paymentLink: formPaymentLink || null,
        features: formFeatures,
        active: formActive,
        sortOrder: Number(formSortOrder),
        description: formDescription || null,
      }

      if (editPlan) {
        const res = await fetch(`/api/webmaster/plans/${editPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast.success('Plan berhasil diperbarui')
          setDialogOpen(false)
          fetchPlans()
        } else {
          const e = await res.json()
          toast.error(e.error || 'Gagal memperbarui')
        }
      } else {
        const res = await fetch('/api/webmaster/plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast.success('Plan berhasil dibuat')
          setDialogOpen(false)
          fetchPlans()
        } else {
          const e = await res.json()
          toast.error(e.error || 'Gagal membuat')
        }
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePlan) return
    try {
      const res = await fetch(`/api/webmaster/plans/${deletePlan.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Plan berhasil dihapus')
        setDeletePlan(null)
        fetchPlans()
      } else {
        const e = await res.json()
        toast.error(e.error || 'Gagal menghapus')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    }
  }

  const handleToggle = async (plan: Plan) => {
    setTogglingId(plan.id)
    try {
      const res = await fetch(`/api/webmaster/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !plan.active }),
      })
      if (res.ok) {
        toast.success(`Plan ${plan.name} ${!plan.active ? 'diaktifkan' : 'dinonaktifkan'}`)
        fetchPlans()
      }
    } catch {
      toast.error('Gagal mengubah status')
    } finally {
      setTogglingId(null)
    }
  }

  const toggleFeature = (key: string, value: boolean | number) => {
    setFormFeatures((prev) => ({ ...prev, [key]: typeof value === 'boolean' ? !value : value }))
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="h-6 w-6 text-emerald-500" />
            Plan & Pricing
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola subscription plan, harga, durasi, dan link order
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPlans}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> Tambah Plan
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <Tag className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Plan</p>
              <p className="text-lg font-bold">{plans.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Plan Aktif</p>
              <p className="text-lg font-bold">{plans.filter(p => p.active).length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Harga Mulai</p>
              <p className="text-lg font-bold">{plans.length > 0 ? formatCurrency(Math.min(...plans.filter(p => p.price > 0).map(p => p.price))) : '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Tag className="h-10 w-10 mb-3 opacity-40" />
          <p>Belum ada plan. Klik &quot;Tambah Plan&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const color = getPlanColor(plan.slug)
            const PlanIcon = getPlanIcon(plan.slug)
            const features = parseFeatures(plan.features)
            const isActive = plan.active

            return (
              <Card
                key={plan.id}
                className={`overflow-hidden border-2 transition-all ${color.border} ${color.card} ${!isActive ? 'opacity-60' : ''}`}
              >
                {/* Card Header */}
                <div className={`p-4 pb-3 ${color.header}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <PlanIcon className={`h-5 w-5 ${color.icon}`} />
                      <h3 className="font-bold text-sm">{plan.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <Badge variant="default" className="text-[10px] bg-emerald-600 hover:bg-emerald-700">Aktif</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>
                      )}
                    </div>
                  </div>
                  {plan.description && (
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  )}
                </div>

                {/* Price */}
                <div className="px-4 pt-2 pb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{formatCurrency(plan.price)}</span>
                    {plan.duration > 0 && (
                      <span className={`text-xs ${color.text}`}>/ {plan.duration === 1 ? 'bulan' : `${plan.duration} bln`}</span>
                    )}
                  </div>
                  {plan.duration === 0 && (
                    <p className="text-xs text-muted-foreground">Selamanya gratis</p>
                  )}
                </div>

                <Separator />

                {/* Features */}
                <div className="p-4 pb-2 space-y-2">
                  {Object.entries(features).slice(0, 6).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 text-xs">
                      {val ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                      )}
                      <span className="text-muted-foreground">
                        {featureLabels[key] || key}
                        {typeof val === 'number' && val > 1 && val !== true ? ` (maks ${val})` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Payment Link */}
                {plan.paymentLink && (
                  <div className="px-4 pb-2">
                    <a
                      href={plan.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Link Order / Pembayaran
                    </a>
                  </div>
                )}

                <Separator />

                {/* Actions */}
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`toggle-${plan.id}`} className="text-xs text-muted-foreground cursor-pointer">
                      Aktif
                    </Label>
                    <Switch
                      id={`toggle-${plan.id}`}
                      checked={isActive}
                      onCheckedChange={() => handleToggle(plan)}
                      disabled={togglingId === plan.id}
                      className="scale-75"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(plan)} title="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletePlan(plan)}
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Slug & Sort footer */}
                <div className="px-4 pb-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>slug: <code className="bg-muted px-1 rounded">{plan.slug}</code></span>
                  <span>order: {plan.sortOrder}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlan ? 'Edit Plan' : 'Tambah Plan Baru'}</DialogTitle>
            <DialogDescription>
              {editPlan ? 'Ubah detail plan subscription.' : 'Buat plan subscription baru dengan harga, durasi, dan fitur.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Row: Name & Slug */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Nama Plan <span className="text-destructive">*</span></Label>
                <Input value={formName} onChange={(e) => {
                  setFormName(e.target.value)
                  if (!editPlan) setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))
                }} placeholder="Pro" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Slug <span className="text-destructive">*</span></Label>
                <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="pro" />
              </div>
            </div>

            {/* Row: Price & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Harga (IDR)
                </Label>
                <Input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="149000" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Durasi (bulan)
                </Label>
                <Input type="number" min="0" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} placeholder="1" />
                <p className="text-[10px] text-muted-foreground">0 = gratis selamanya</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm">Deskripsi Singkat</Label>
              <Input value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Fitur lengkap untuk usaha berkembang" />
            </div>

            {/* Payment Link */}
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Link Order / Pembayaran
              </Label>
              <Input value={formPaymentLink} onChange={(e) => setFormPaymentLink(e.target.value)} placeholder="https://payment.example.com/order/pro" />
              <p className="text-[10px] text-muted-foreground">URL untuk customer melakukan pembayaran / order plan</p>
            </div>

            {/* Sort Order & Active */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Urutan Tampil
                </Label>
                <Input type="number" min="0" value={formSortOrder} onChange={(e) => setFormSortOrder(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1.5 flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={formActive} onCheckedChange={setFormActive} />
                  <Label className="text-sm">{formActive ? 'Aktif' : 'Nonaktif'}</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fitur & Limit</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formFeatures).map(([key, val]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">
                      {featureLabels[key] || key}
                    </span>
                    {typeof val === 'boolean' ? (
                      <button
                        type="button"
                        onClick={() => toggleFeature(key, val)}
                        className="focus:outline-none"
                      >
                        {val ? (
                          <ToggleRight className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={val}
                        onChange={(e) => setFormFeatures((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                        className="w-16 h-7 text-xs text-right"
                      />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Features disimpan sebagai JSON. Toggle untuk boolean, input angka untuk limit.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="h-4 w-4 mr-1" /> Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Menyimpan...' : editPlan ? 'Simpan' : 'Buat Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePlan} onOpenChange={(o) => !o && setDeletePlan(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Plan <strong>{deletePlan?.name}</strong> akan dihapus permanen. Outlet yang sudah menggunakan plan ini tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}