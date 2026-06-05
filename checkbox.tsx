'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Crown, Eye, EyeOff, Mail, Lock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

const planLabel: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }

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

  // Form states
  const [plan, setPlan] = useState(String(outlet.accountType || 'free'))
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')

  const fetchOwner = useCallback(async () => {
    setLoading(true)
    try {
      // Find the OWNER user for this outlet
      const res = await fetch(`/api/webmaster/User?limit=100`)
      if (res.ok) {
        const json = await res.json()
        const users = json.data || []
        const ownerUser = users.find((u: Record<string, unknown>) =>
          u.outletId === outletId && u.role === 'OWNER'
        )
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

  useEffect(() => { fetchOwner() }, [fetchOwner])

  const handleSavePlan = async () => {
    setSavingPlan(true)
    try {
      const res = await fetch(`/api/webmaster/Outlet/${outletId}`, {
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

  const handleSaveAkun = async () => {
    if (!ownerEmail) { toast.error('Email wajib diisi'); return }
    setSavingAkun(true)
    try {
      if (owner) {
        // Update existing owner
        const payload: Record<string, unknown> = { email: ownerEmail }
        if (ownerPassword) payload.password = ownerPassword
        const res = await fetch(`/api/webmaster/User/${owner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          toast.success('Akun berhasil diperbarui')
          fetchOwner()
        } else {
          const e = await res.json()
          toast.error(e.error || 'Gagal memperbarui')
        }
      } else {
        // Create owner
        if (!ownerPassword) { toast.error('Password wajib diisi untuk akun baru'); setSavingAkun(false); return }
        const res = await fetch('/api/webmaster/User', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Owner',
            email: ownerEmail,
            password: ownerPassword,
            role: 'OWNER',
            outletId,
          }),
        })
        if (res.ok) {
          toast.success('Akun owner berhasil dibuat')
          fetchOwner()
          onRefresh()
        } else {
          const e = await res.json()
          toast.error(e.error || 'Gagal membuat akun')
        }
      }
    } catch { toast.error('Terjadi kesalahan') } finally { setSavingAkun(false) }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Plan Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-amber-500" />
            Plan Subscription
          </CardTitle>
          <CardDescription>
            Kelola plan akun outlet. Free untuk 1 outlet, Pro untuk fitur lengkap, Enterprise untuk multi-outlet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border p-3 bg-muted/50">
            <span className="text-sm font-medium">Plan saat ini:</span>
            <Badge variant="secondary">{planLabel[plan] || plan}</Badge>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Ubah Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSavePlan} disabled={savingPlan} size="sm">
            <Save className="h-4 w-4 mr-1" />
            {savingPlan ? 'Menyimpan...' : 'Simpan Plan'}
          </Button>
        </CardContent>
      </Card>

      {/* Akun Credentials */}
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
              {owner
                ? `Owner ID: ${String(owner.id).slice(0, 12)}...`
                : 'Akan membuat akun OWNER baru'}
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
