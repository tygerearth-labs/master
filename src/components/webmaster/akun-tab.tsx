'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Save, Crown, Eye, EyeOff, Mail, Lock, CheckCircle2,
  Clock, AlertTriangle, Zap, CalendarDays, Sparkles, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface Plan {
  id: string
  name: string
  slug: string
  price: number
  duration: number
  description?: string | null
  features: string
  active: boolean
  sortOrder: number
}

function formatCurrency(val: number): string {
  if (val === 0) return 'Gratis'
  return 'Rp ' + val.toLocaleString('id-ID')
}

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return val }
}

function getPlanStatus(planExpiresAt: string | null) {
  if (!planExpiresAt) return { label: 'Free (selamanya)', variant: 'secondary' as const, expired: false }
  const now = new Date()
  const exp = new Date(planExpiresAt)
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return { label: 'Expired', variant: 'destructive' as const, expired: true }
  if (diffDays <= 7) return { label: `Sisa ${diffDays} hari`, variant: 'outline' as const, expired: false }
  return { label: `Aktif s/d ${formatDate(planExpiresAt)}`, variant: 'default' as const, expired: false }
}

function parseFeatures(featuresJson: string): Record<string, boolean | number> {
  try { return JSON.parse(featuresJson) } catch { return {} }
}

const planColorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  free: { bg: 'bg-zinc-100 dark:bg-zinc-900', border: 'border-zinc-200 dark:border-zinc-800', icon: 'text-zinc-500', badge: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
  pro: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', icon: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  enterprise: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', icon: 'text-amber-600', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
}

function getPlanColor(slug: string) {
  if (slug.includes('enterprise')) return planColorMap.enterprise
  if (slug.includes('pro')) return planColorMap.pro
  return planColorMap.free
}

export function AkunTab({
  outletId,
  outlet,
  onRefresh,
}: {
  outletId: string
  outlet: Record<string, unknown>
  onRefresh: () => void
}) {
  const [owner, setOwner] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingPlan, setSavingPlan] = useState(false)
  const [savingAkun, setSavingAkun] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])

  // Form states
  const [plan, setPlan] = useState(String(outlet.accountType || 'free'))
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')

  const fetchOwner = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/webmaster/crew?outletId=${encodeURIComponent(outletId)}`)
      if (res.ok) {
        const json = await res.json()
        const users = json.records || []
        const ownerUser = users.find((u: Record<string, unknown>) => u.role === 'OWNER')
        if (ownerUser) {
          setOwner(ownerUser)
          setOwnerEmail(String(ownerUser.email || ''))
          setOwnerPassword(String(ownerUser.password || ''))
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [outletId])

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/webmaster/plans')
      if (res.ok) {
        const json = await res.json()
        setPlans(json)
      }
    } catch {
      // silent
    }
  }, [])

  useEffect(() => { fetchOwner(); fetchPlans() }, [fetchOwner, fetchPlans])

  const handleSavePlan = async () => {
    setSavingPlan(true)
    try {
      const res = await fetch(`/api/webmaster/outlets/${outletId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: plan }),
      })
      if (res.ok) {
        toast.success('Plan berhasil diubah')
        onRefresh()
      } else {
        const e = await res.json()
        toast.error(e.error || 'Gagal mengubah plan')
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSavingPlan(false) }
  }

  const handleActivatePlan = async (planItem: Plan) => {
    setActivatingPlanId(planItem.id)
    try {
      const res = await fetch(`/api/webmaster/outlet/${outletId}/activate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: planItem.id }),
      })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Plan ${planItem.name} berhasil diaktifkan! Berlaku s/d ${data.expiresAt ? formatDate(data.expiresAt) : 'selamanya'}`)
        onRefresh()
        // Refresh outlet data
        const outletRes = await fetch(`/api/webmaster/outlets/${outletId}`)
        if (outletRes.ok) {
          const outletData = await outletRes.json()
          setPlan(outletData.accountType)
        }
      } else {
        const e = await res.json()
        toast.error(e.error || 'Gagal mengaktifkan plan')
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setActivatingPlanId(null) }
  }

  const handleSaveAkun = async () => {
    if (!ownerEmail) { toast.error('Email wajib diisi'); return }
    setSavingAkun(true)
    try {
      if (owner) {
        const payload: Record<string, unknown> = { email: ownerEmail }
        if (ownerPassword) payload.password = ownerPassword
        const res = await fetch(`/api/webmaster/crew/${owner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) { toast.success('Akun berhasil diperbarui'); fetchOwner() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal memperbarui') }
      } else {
        if (!ownerPassword) { toast.error('Password wajib diisi untuk akun baru'); setSavingAkun(false); return }
        const res = await fetch('/api/webmaster/crew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Owner', email: ownerEmail, password: ownerPassword, role: 'OWNER', outletId }),
        })
        if (res.ok) { toast.success('Akun owner berhasil dibuat'); fetchOwner(); onRefresh() }
        else { const e = await res.json(); toast.error(e.error || 'Gagal membuat akun') }
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSavingAkun(false) }
  }

  const currentStatus = getPlanStatus(outlet.planExpiresAt as string | null)
  const currentAccountType = String(outlet.accountType || 'free')

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-amber-500" />
            Status Plan Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
            <div className={`h-12 w-12 rounded-xl ${getPlanColor(currentAccountType).bg} border ${getPlanColor(currentAccountType).border} flex items-center justify-center flex-shrink-0`}>
              <Crown className={`h-6 w-6 ${getPlanColor(currentAccountType).icon}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg capitalize">{currentAccountType}</span>
                <Badge variant={currentStatus.variant} className="text-xs">
                  {currentStatus.expired ? (
                    <><AlertTriangle className="h-3 w-3 mr-1" />{currentStatus.label}</>
                  ) : (
                    <><CheckCircle2 className="h-3 w-3 mr-1" />{currentStatus.label}</>
                  )}
                </Badge>
              </div>
              {outlet.planExpiresAt && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  <CalendarDays className="h-3.5 w-3.5 inline mr-1" />
                  Berlaku hingga {formatDate(String(outlet.planExpiresAt))}
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Label className="text-sm">Ubah Plan Manual</Label>
            <Select value={plan} onValueChange={setPlan} className="w-40">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSavePlan} disabled={savingPlan} size="sm" variant="outline">
              <Save className="h-4 w-4 mr-1" />
              {savingPlan ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plan Activation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-emerald-500" />
            Aktivasi Plan
          </CardTitle>
          <CardDescription>
            Pilih plan untuk mengaktifkan subscription outlet. Masa berlaku akan dihitung otomatis berdasarkan durasi plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((p) => {
              const color = getPlanColor(p.slug)
              const features = parseFeatures(p.features)
              const isCurrentPlan = p.slug === 'free' && currentAccountType === 'free' ||
                p.slug === 'pro' && currentAccountType === 'pro' ||
                p.slug === 'enterprise' && currentAccountType === 'enterprise' ||
                (p.slug === 'pro-tahunan' && currentAccountType === 'pro') ||
                (p.slug === 'enterprise-tahunan' && currentAccountType === 'enterprise')

              return (
                <div
                  key={p.id}
                  className={`relative rounded-xl border-2 p-4 transition-all hover:shadow-md ${color.border} ${color.bg} ${
                    isCurrentPlan ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-2.5 -right-2.5">
                      <Badge className="bg-primary text-primary-foreground shadow-sm text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Aktif
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-sm">{p.name}</h3>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                      )}
                    </div>
                    <Crown className={`h-5 w-5 ${color.icon} flex-shrink-0 ml-2`} />
                  </div>

                  <div className="mb-3">
                    <span className="text-xl font-bold">{formatCurrency(p.price)}</span>
                    {p.duration > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        / {p.duration === 1 ? 'bulan' : `${p.duration} bulan`}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 mb-4">
                    {Object.entries(features).slice(0, 5).map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2 text-xs">
                        {val ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <span className="capitalize text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                          {typeof val === 'number' && val > 1 ? ` (maks ${val})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="sm"
                    variant={isCurrentPlan ? 'outline' : 'default'}
                    className="w-full"
                    disabled={activatingPlanId === p.id || isCurrentPlan}
                    onClick={() => handleActivatePlan(p)}
                  >
                    {activatingPlanId === p.id ? (
                      <>Mengaktifkan...</>
                    ) : isCurrentPlan ? (
                      <>Plan Saat Ini</>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Aktifkan
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Akun Login */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-emerald-600" />
            Akun Login
          </CardTitle>
          <CardDescription>
            {owner
              ? 'Kelola email dan password akun owner outlet ini.'
              : 'Belum ada akun owner. Buat akun login untuk outlet ini.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/50">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={owner ? 'default' : 'outline'}>
              {owner ? 'Akun aktif' : 'Belum ada akun'}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email
            </Label>
            <Input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              placeholder="owner@contoh.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder={owner ? 'Kosongkan jika tidak diubah' : 'Password untuk akun baru'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {owner ? `Owner ID: ${String(owner.id).slice(0, 12)}...` : 'Akan membuat akun OWNER baru'}
            </p>
            <Button onClick={handleSaveAkun} disabled={savingAkun} size="sm">
              <Save className="h-4 w-4 mr-1" />
              {savingAkun ? 'Menyimpan...' : owner ? 'Update Akun' : 'Buat Akun Owner'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}