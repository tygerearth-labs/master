'use client'

import React from 'react'
import {
  Shield, CalendarDays, KeyRound, UserCheck, Ban, Loader2, Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  VALID_ACCOUNT_TYPES, PLAN_DURATIONS,
  getPlanLabel, getPlanBadgeClasses, isSuspended,
  formatLimit, PLANS
} from '@/lib/plan-config'
import type { Outlet, User, Plan } from '@/components/admin/types'
import { DetailField } from '@/components/admin/shared'

// ===================== HELPERS (local) =====================
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ===================== PLAN CHANGE DIALOG =====================
export function PlanChangeDialog({ outlet, selectedPlan, onPlanChange, applyToGroup, onApplyToGroup, onConfirm, onCancel, loading }: {
  outlet: Outlet | null; selectedPlan: string; onPlanChange: (v: string) => void
  applyToGroup: boolean; onApplyToGroup: (v: boolean) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-400" /> Change Plan</DialogTitle>
          <DialogDescription>
            Change plan for <strong>{outlet?.name}</strong>
            {outlet?.accountType && <span className="ml-1">(current: <span className={`inline-flex items-center rounded px-1 text-[10px] font-mono border ${getPlanBadgeClasses(outlet.accountType)}`}>{getPlanLabel(outlet.accountType)}</span>)</span>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">New Plan</Label>
            <Select value={selectedPlan} onValueChange={onPlanChange}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {VALID_ACCOUNT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">{getPlanLabel(t)} <span className="text-[10px] text-muted-foreground font-mono">({formatLimit(PLANS[t].maxProducts)} products, {formatLimit(PLANS[t].maxOutlets)} outlets)</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {outlet?.groupId && (
            <div className="flex items-center gap-2">
              <Switch checked={applyToGroup} onCheckedChange={onApplyToGroup} id="apply-group-plan" />
              <Label htmlFor="apply-group-plan" className="text-xs">Apply to all outlets in group</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Change Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== DURATION CHANGE DIALOG =====================
export function DurationChangeDialog({ outlet, selectedDuration, onDurationChange, customDays, onCustomDays, customExpiryDate, onCustomExpiryDate, applyToGroup, onApplyToGroup, onConfirm, onCancel, loading }: {
  outlet: Outlet | null; selectedDuration: string; onDurationChange: (v: string) => void
  customDays: string; onCustomDays: (v: string) => void; customExpiryDate: string; onCustomExpiryDate: (v: string) => void
  applyToGroup: boolean; onApplyToGroup: (v: boolean) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-400" /> Change Duration</DialogTitle>
          <DialogDescription>Set plan duration for <strong>{outlet?.name}</strong>{outlet?.planExpiresAt && <span className="ml-1">(current: {formatDate(outlet.planExpiresAt)})</span>}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Duration</Label>
            <Select value={selectedDuration} onValueChange={onDurationChange}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLAN_DURATIONS.map(d => <SelectItem key={d.days} value={String(d.days)}>{d.label}</SelectItem>)}
                <SelectItem value="custom_date">Specific Date</SelectItem>
                <SelectItem value="0">No Expiry (Lifetime)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedDuration === '-1' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Custom Duration (days)</Label>
              <Input type="number" value={customDays} onChange={(e) => onCustomDays(e.target.value)} min={1} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
          )}
          {selectedDuration === 'custom_date' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry Date</Label>
              <Input type="datetime-local" value={customExpiryDate} onChange={(e) => onCustomExpiryDate(e.target.value)} className="bg-white/[0.04] border-white/[0.08]" />
            </div>
          )}
          {outlet?.groupId && (
            <div className="flex items-center gap-2">
              <Switch checked={applyToGroup} onCheckedChange={onApplyToGroup} id="apply-group-dur" />
              <Label htmlFor="apply-group-dur" className="text-xs">Apply to all outlets in group</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Update Duration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== RESET PASSWORD DIALOG =====================
export function ResetPasswordDialog({ user, newPassword, onPasswordChange, onConfirm, onCancel, loading }: {
  user: User | null; newPassword: string; onPasswordChange: (v: string) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-amber-400" /> Reset Password</DialogTitle>
          <DialogDescription>Set a new password for <strong>{user?.name}</strong> ({user?.email})</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">New Password</Label>
            <Input type="text" placeholder="Min 6 characters" value={newPassword} onChange={(e) => onPasswordChange(e.target.value)} className="bg-white/[0.04] border-white/[0.08] font-mono" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || newPassword.length < 6} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Reset Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== SUSPEND OWNER DIALOG =====================
export function SuspendOwnerDialog({ user, suspendGroup, onSuspendGroup, onConfirm, onCancel, loading }: {
  user: User | null; suspendGroup: boolean; onSuspendGroup: (v: boolean) => void
  onConfirm: (suspend: boolean) => void; onCancel: () => void; loading: boolean
}) {
  if (!user) return null
  const suspended = isSuspended(user.outlet.accountType)
  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-white/[0.06]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base flex items-center gap-2">
            {suspended ? <><UserCheck className="h-4 w-4 text-emerald-400" /> Unsuspend Owner</> : <><Ban className="h-4 w-4 text-red-400" /> Suspend Owner</>}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {suspended ? <>Restore <strong>{user?.name}</strong>&apos;s outlet. The owner and crew will be able to log in again.</>
              : <>Suspend <strong>{user?.name}</strong>&apos;s outlet. The owner and all crew will be locked out.</>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {!suspended && (
          <div className="flex items-center gap-2">
            <Switch checked={suspendGroup} onCheckedChange={onSuspendGroup} id="suspend-group" />
            <Label htmlFor="suspend-group" className="text-xs">Suspend all outlets in group</Label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm(!suspended)} disabled={loading} className={`${!suspended ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} text-xs`}>
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}{suspended ? 'Unsuspend' : 'Suspend'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ===================== PLAN FORM DIALOG =====================
export interface PlanFormData {
  name: string; slug: string; price: number; duration: number
  paymentLink: string; description: string; active: boolean; sortOrder: number; features: string
}

export function PlanFormDialog({
  open, isEdit, plan, planForm, onFormChange, onConfirm, onCancel, loading
}: {
  open: boolean; isEdit: boolean; plan: Plan | null
  planForm: PlanFormData; onFormChange: (form: PlanFormData) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base">{isEdit ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update plan details and pricing' : 'Add a new plan to your pricing page'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input value={planForm.name} onChange={(e) => onFormChange({ ...planForm, name: e.target.value })} className="bg-white/[0.04] border-white/[0.08]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Slug</Label>
              <Input value={planForm.slug} onChange={(e) => onFormChange({ ...planForm, slug: e.target.value })} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Price (IDR)</Label>
              <Input type="number" value={planForm.price} onChange={(e) => onFormChange({ ...planForm, price: parseFloat(e.target.value) || 0 })} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Duration (days)</Label>
              <Input type="number" value={planForm.duration} onChange={(e) => onFormChange({ ...planForm, duration: parseInt(e.target.value) || 30 })} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sort Order</Label>
              <Input type="number" value={planForm.sortOrder} onChange={(e) => onFormChange({ ...planForm, sortOrder: parseInt(e.target.value) || 0 })} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Payment Link</Label>
            <Input value={planForm.paymentLink} onChange={(e) => onFormChange({ ...planForm, paymentLink: e.target.value })} placeholder="https://..." className="bg-white/[0.04] border-white/[0.08] font-mono text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea value={planForm.description} onChange={(e) => onFormChange({ ...planForm, description: e.target.value })} className="bg-white/[0.04] border-white/[0.08] text-xs min-h-[60px]" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={planForm.active} onCheckedChange={(v) => onFormChange({ ...planForm, active: v })} id="plan-active" />
            <Label htmlFor="plan-active" className="text-xs">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || !planForm.name || !planForm.slug} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== DELETE PLAN DIALOG =====================
export function DeletePlanDialog({ plan, onConfirm, onCancel, loading }: {
  plan: Plan | null; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <AlertDialog open={!!plan} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-white/[0.06]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">Delete Plan</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the <strong>{plan?.name}</strong> plan. Outlets currently on this plan will not be affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ===================== OUTLET DETAIL DIALOG =====================
export function OutletDetailDialog({ outlet, onClose }: { outlet: Outlet | null; onClose: () => void }) {
  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-white/[0.06]">
        <DialogHeader><DialogTitle className="text-base">Outlet Details</DialogTitle></DialogHeader>
        {outlet && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailField label="Name" value={outlet.name} />
              <DetailField label="Plan" value={getPlanLabel(outlet.accountType)} />
              <DetailField label="Address" value={outlet.address || '—'} />
              <DetailField label="Phone" value={outlet.phone || '—'} />
              <DetailField label="Main Outlet" value={outlet.isMain ? 'Yes' : 'No'} />
              <DetailField label="Group" value={outlet.group?.name || 'Standalone'} />
              <DetailField label="Plan Expires" value={outlet.planExpiresAt ? formatDate(outlet.planExpiresAt) : 'No Expiry'} />
              <DetailField label="Created" value={formatDate(outlet.createdAt)} />
            </div>
            <Separator className="bg-white/[0.06]" />
            <div>
              <h4 className="text-xs font-medium mb-2">Users ({outlet.users.length})</h4>
              <div className="space-y-1.5">
                {outlet.users.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                    <div><p className="text-xs font-medium">{u.name}</p><p className="text-[10px] text-muted-foreground font-mono">{u.email}</p></div>
                    <Badge variant={u.role === 'OWNER' ? 'default' : 'secondary'} className={`text-[9px] font-mono ${u.role === 'OWNER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}`}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
