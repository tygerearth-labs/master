'use client'

import React from 'react'
import {
  Shield, CalendarDays, KeyRound, UserCheck, Ban, Loader2, Save,
  ArrowRightLeft, Store, Trash2, UserPlus, Settings, Lock, CreditCard,
  Receipt, Bell, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  VALID_ACCOUNT_TYPES, PLAN_DURATIONS, CREW_PAGES, THEME_COLORS,
  getPlanLabel, getPlanBadgeClasses, isSuspended,
  formatLimit, PLANS
} from '@/lib/plan-config'
import type {
  Outlet, User, Plan, OutletOwner,
  OutletSetting, OutletGroup,
  OutletFormData, UserFormData, SettingFormData, CrewPermissionData
} from '@/components/admin/types'
import { DetailField } from '@/components/admin/shared'

// ===================== HELPERS (local) =====================
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}

// ===================== 1. PLAN CHANGE DIALOG =====================
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

// ===================== 2. DURATION CHANGE DIALOG =====================
export function DurationChangeDialog({ outlet, selectedDuration, onDurationChange, customMonths, onCustomMonths, customExpiryDate, onCustomExpiryDate, applyToGroup, onApplyToGroup, onConfirm, onCancel, loading }: {
  outlet: Outlet | null; selectedDuration: string; onDurationChange: (v: string) => void
  customMonths: string; onCustomMonths: (v: string) => void; customExpiryDate: string; onCustomExpiryDate: (v: string) => void
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
                {PLAN_DURATIONS.map(d => <SelectItem key={d.months} value={String(d.months)}>{d.label}</SelectItem>)}
                <SelectItem value="custom_date">Specific Date</SelectItem>
                <SelectItem value="0">No Expiry (Lifetime)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {selectedDuration === '-1' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Custom Duration (months)</Label>
              <Input type="number" value={customMonths} onChange={(e) => onCustomMonths(e.target.value)} min={1} className="bg-white/[0.04] border-white/[0.08] font-mono" />
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

// ===================== 3. RESET PASSWORD DIALOG =====================
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

// ===================== 4. SUSPEND USER DIALOG =====================
export function SuspendUserDialog({ user, suspendGroup, onSuspendGroup, onConfirm, onCancel, loading }: {
  user: User | null; suspendGroup: boolean; onSuspendGroup: (v: boolean) => void
  onConfirm: (suspend: boolean) => void; onCancel: () => void; loading: boolean
}) {
  if (!user) return null

  const isOwner = user.role === 'OWNER'
  const outletSuspended = isOwner && isSuspended(user.outlet.accountType)
  const userSuspended = !user.active
  const isCurrentlySuspended = isOwner ? outletSuspended : userSuspended

  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-white/[0.06]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base flex items-center gap-2">
            {isCurrentlySuspended
              ? <><UserCheck className="h-4 w-4 text-emerald-400" /> Unsuspend {isOwner ? 'Owner' : 'User'}</>
              : <><Ban className="h-4 w-4 text-red-400" /> Suspend {isOwner ? 'Owner' : 'User'}</>
            }
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isCurrentlySuspended
              ? <>Restore <strong>{user.name}</strong>&apos;s access. {isOwner ? 'The outlet and all crew will be able to log in again.' : 'They will be able to log in again.'}</>
              : <>Suspend <strong>{user.name}</strong>. {isOwner ? 'The outlet will be suspended and all crew will be locked out.' : 'They will not be able to log in until unsuspended.'}</>
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        {isOwner && !isCurrentlySuspended && (
          <div className="flex items-center gap-2">
            <Switch checked={suspendGroup} onCheckedChange={onSuspendGroup} id="suspend-group" />
            <Label htmlFor="suspend-group" className="text-xs">Suspend all outlets in group</Label>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(!isCurrentlySuspended) }}
            disabled={loading}
            className={`${!isCurrentlySuspended ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} text-xs`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}{isCurrentlySuspended ? 'Unsuspend' : 'Suspend'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ===================== 5. CHANGE OWNER DIALOG =====================
export function ChangeOwnerDialog({ outlet, selectedNewOwnerId, onNewOwnerChange, onConfirm, onCancel, loading }: {
  outlet: Outlet | null; selectedNewOwnerId: string; onNewOwnerChange: (v: string) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  const currentOwner = outlet?.users.find(u => u.role === 'OWNER')
  const candidates = outlet?.users.filter(u => u.role !== 'OWNER' && u.active) || []

  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><ArrowRightLeft className="h-4 w-4 text-cyan-400" /> Change Owner</DialogTitle>
          <DialogDescription>
            Transfer ownership of <strong>{outlet?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] text-muted-foreground font-mono mb-1">Current Owner</p>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono">OWNER</Badge>
              <p className="text-sm font-medium">{currentOwner?.name || '—'}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{currentOwner?.email}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">New Owner (must be a crew in this outlet)</Label>
            {candidates.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No crew members available. Add a crew user to this outlet first.</p>
            ) : (
              <Select value={selectedNewOwnerId} onValueChange={onNewOwnerChange}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select new owner..." /></SelectTrigger>
                <SelectContent>
                  {candidates.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      <span className="flex items-center gap-2">{u.name} <span className="text-[10px] text-muted-foreground font-mono">{u.email}</span></span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Current owner will be demoted to CREW. The new owner will gain full control of this outlet.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || !selectedNewOwnerId || candidates.length === 0} className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}Transfer Ownership
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== 6. PLAN FORM DIALOG =====================
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
              <Label className="text-xs">Duration (months)</Label>
              <Input type="number" value={planForm.duration} onChange={(e) => onFormChange({ ...planForm, duration: parseInt(e.target.value) || 1 })} className="bg-white/[0.04] border-white/[0.08] font-mono" />
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

// ===================== 7. DELETE PLAN DIALOG =====================
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

// ===================== 8. OUTLET DETAIL DIALOG =====================
export function OutletDetailDialog({
  outlet, plans, onClose, onEditSettings, onManagePermissions
}: {
  outlet: Outlet | null; plans: Plan[]; onClose: () => void
  onEditSettings?: (outlet: Outlet) => void
  onManagePermissions?: (user: User) => void
}) {
  if (!outlet) return null

  const basePlan = isSuspended(outlet.accountType) ? outlet.accountType.replace('suspended:', '') : outlet.accountType
  const planPrice = plans.find(p => p.slug === basePlan)?.price ?? 0
  const settings = outlet.setting

  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-card border-white/[0.06]">
        <DialogHeader><DialogTitle className="text-base">Outlet Details</DialogTitle></DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DetailField label="Name" value={outlet.name} />
            <DetailField label="Plan" value={getPlanLabel(outlet.accountType)} />
            <DetailField label="Address" value={outlet.address || '—'} />
            <DetailField label="Phone" value={outlet.phone || '—'} />
            <DetailField label="Account Type" value={outlet.accountType} />
            <DetailField label="Main Outlet" value={outlet.isMain ? 'Yes' : 'No'} />
            <DetailField label="Group" value={outlet.group?.name || 'Standalone'} />
            <DetailField label="Plan Expires" value={outlet.planExpiresAt ? formatDate(outlet.planExpiresAt) : 'No Expiry'} />
            <DetailField label="Revenue/mo" value={planPrice > 0 ? formatPrice(planPrice) : 'Free'} />
            <DetailField label="Created" value={formatDate(outlet.createdAt)} />
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Settings Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium flex items-center gap-1.5"><Settings className="h-3 w-3 text-muted-foreground" /> Settings</h4>
              {onEditSettings && settings && (
                <Button variant="ghost" size="sm" className="text-[10px] h-6 text-emerald-400" onClick={() => onEditSettings(outlet)}>
                  Edit Settings
                </Button>
              )}
            </div>
            {settings ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">PPN</p>
                  <p className="text-[11px] font-medium">{settings.ppnEnabled ? `${settings.ppnRate}%` : 'Off'}</p>
                </div>
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">Loyalty</p>
                  <p className="text-[11px] font-medium">{settings.loyaltyEnabled ? 'Enabled' : 'Off'}</p>
                </div>
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">Theme</p>
                  <p className="text-[11px] font-medium capitalize">{settings.themePrimaryColor || 'Default'}</p>
                </div>
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">Telegram</p>
                  <p className="text-[11px] font-medium">{settings.telegramBotToken ? 'Configured' : 'Not Set'}</p>
                </div>
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">Discount</p>
                  <p className="text-[11px] font-medium">{settings.manualDiscountEnabled ? 'Manual' : 'Off'}</p>
                </div>
                <div className="p-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[9px] text-muted-foreground font-mono uppercase">Payment</p>
                  <p className="text-[11px] font-medium">{settings.paymentMethods || '—'}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-md bg-white/[0.02] border border-dashed border-white/[0.08]">
                <p className="text-xs text-muted-foreground">No settings configured</p>
                {onEditSettings && (
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 text-emerald-400" onClick={() => onEditSettings(outlet)}>
                    Configure
                  </Button>
                )}
              </div>
            )}
          </div>

          <Separator className="bg-white/[0.06]" />

          {/* Users */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium">Users ({outlet.users.length})</h4>
              {onManagePermissions && (
                <p className="text-[9px] text-muted-foreground">Click lock icon to manage crew permissions</p>
              )}
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {outlet.users.map(u => (
                <div key={u.id} className="flex items-center justify-between p-2 rounded-md bg-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-xs font-medium">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!u.active && <Badge variant="destructive" className="text-[8px] font-mono px-1">SUSPENDED</Badge>}
                    <Badge variant={u.role === 'OWNER' ? 'default' : 'secondary'} className={`text-[9px] font-mono ${u.role === 'OWNER' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}`}>{u.role}</Badge>
                    {onManagePermissions && u.role === 'CREW' && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-emerald-400" onClick={() => onManagePermissions({ ...u, outlet: { id: outlet.id, name: outlet.name, accountType: outlet.accountType, planExpiresAt: outlet.planExpiresAt } } as User)}>
                        <Lock className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ===================== 9. OUTLET FORM DIALOG =====================
export function OutletFormDialog({
  open, isEdit, outlet, outletForm, onFormChange, onConfirm, onCancel, loading, groups
}: {
  open: boolean; isEdit: boolean; outlet: Outlet | null
  outletForm: OutletFormData; onFormChange: (form: OutletFormData) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
  groups: OutletGroup[]
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4 text-emerald-400" /> {isEdit ? 'Edit Outlet' : 'Create Outlet'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update outlet information' : 'Add a new outlet to the system'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input value={outletForm.name} onChange={(e) => onFormChange({ ...outletForm, name: e.target.value })} placeholder="Outlet name" className="bg-white/[0.04] border-white/[0.08]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Address</Label>
            <Input value={outletForm.address} onChange={(e) => onFormChange({ ...outletForm, address: e.target.value })} placeholder="Street address" className="bg-white/[0.04] border-white/[0.08]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={outletForm.phone} onChange={(e) => onFormChange({ ...outletForm, phone: e.target.value })} placeholder="Phone number" className="bg-white/[0.04] border-white/[0.08]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Account Type</Label>
              <Select value={outletForm.accountType} onValueChange={(v) => onFormChange({ ...outletForm, accountType: v })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VALID_ACCOUNT_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{getPlanLabel(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={outletForm.isMain} onCheckedChange={(v) => onFormChange({ ...outletForm, isMain: v })} id="outlet-main" />
              <Label htmlFor="outlet-main" className="text-xs">Main Outlet</Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Group</Label>
              <Select value={outletForm.groupId} onValueChange={(v) => onFormChange({ ...outletForm, groupId: v })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="No group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || !outletForm.name} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== 10. DELETE OUTLET DIALOG =====================
export function DeleteOutletDialog({ outlet, onConfirm, onCancel, loading }: {
  outlet: Outlet | null; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <AlertDialog open={!!outlet} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-white/[0.06]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base flex items-center gap-2"><Trash2 className="h-4 w-4 text-red-400" /> Delete Outlet</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{outlet?.name}</strong>.
            {(outlet?.users?.length ?? 0) > 0 && (
              <span className="block mt-1 text-amber-400 text-xs">
                Warning: This outlet has {outlet?.users?.length} user(s). Delete the users first before removing this outlet.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading || (outlet?.users?.length ?? 0) > 0} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Delete Outlet
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ===================== 11. USER FORM DIALOG =====================
export function UserFormDialog({
  open, isEdit, user, userForm, onFormChange, onConfirm, onCancel, loading, outlets
}: {
  open: boolean; isEdit: boolean; user: User | null
  userForm: UserFormData; onFormChange: (form: UserFormData) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
  outlets: Outlet[]
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-emerald-400" /> {isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Update user information' : 'Add a new user to the system'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={userForm.name} onChange={(e) => onFormChange({ ...userForm, name: e.target.value })} placeholder="Full name" className="bg-white/[0.04] border-white/[0.08]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" value={userForm.email} onChange={(e) => onFormChange({ ...userForm, email: e.target.value })} placeholder="email@example.com" className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">{isEdit ? 'New Password (leave empty to keep)' : 'Password *'}</Label>
              <Input type="text" value={userForm.password} onChange={(e) => onFormChange({ ...userForm, password: e.target.value })} placeholder={isEdit ? 'Leave empty to keep current' : 'Min 6 characters'} className="bg-white/[0.04] border-white/[0.08] font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={userForm.role} onValueChange={(v) => onFormChange({ ...userForm, role: v })}>
                <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="CREW">Crew</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Outlet *</Label>
            <Select value={userForm.outletId} onValueChange={(v) => onFormChange({ ...userForm, outletId: v })}>
              <SelectTrigger className="bg-white/[0.04] border-white/[0.08]"><SelectValue placeholder="Select outlet..." /></SelectTrigger>
              <SelectContent>
                {outlets.map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    <span className="flex items-center gap-2">{o.name} <span className="text-[10px] text-muted-foreground font-mono">({getPlanLabel(o.accountType)})</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || !userForm.name || !userForm.email || (!isEdit && !userForm.password) || !userForm.outletId} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== 12. DELETE USER DIALOG =====================
export function DeleteUserDialog({ user, onConfirm, onCancel, loading }: {
  user: User | null; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <AlertDialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="bg-card border-white/[0.06]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base flex items-center gap-2"><Trash2 className="h-4 w-4 text-red-400" /> Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{user?.name}</strong> ({user?.email}).
            {user?.role === 'OWNER' && (
              <span className="block mt-1 text-amber-400 text-xs">
                Warning: This user is an Owner. If they own a group, they cannot be deleted until the group ownership is transferred.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ===================== 13. OUTLET SETTINGS DIALOG =====================
export function OutletSettingsDialog({
  outlet, settings, settingForm, onFormChange, onConfirm, onCancel, loading
}: {
  outlet: Outlet | null; settings: OutletSetting | null
  settingForm: SettingFormData; onFormChange: (form: SettingFormData) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  if (!outlet) return null

  const updateField = <K extends keyof SettingFormData>(key: K, value: SettingFormData[K]) => {
    onFormChange({ ...settingForm, [key]: value })
  }

  return (
    <Dialog open={!!outlet} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-2xl bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4 text-emerald-400" /> Outlet Settings</DialogTitle>
          <DialogDescription>Configure settings for <strong>{outlet.name}</strong></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="general" className="text-[11px]">
              <CreditCard className="h-3 w-3 mr-1" />General
            </TabsTrigger>
            <TabsTrigger value="receipt" className="text-[11px]">
              <Receipt className="h-3 w-3 mr-1" />Receipt &amp; Print
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-[11px]">
              <Bell className="h-3 w-3 mr-1" />Notifications
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-[11px]">
              <Palette className="h-3 w-3 mr-1" />Theme
            </TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="mt-4 max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment</h4>
              <div className="space-y-1.5">
                <Label className="text-xs">Payment Methods (comma separated)</Label>
                <Input value={settingForm.paymentMethods} onChange={(e) => updateField('paymentMethods', e.target.value)} placeholder="cash, qris, transfer" className="bg-white/[0.04] border-white/[0.08] font-mono text-xs" />
              </div>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Loyalty</h4>
              <div className="flex items-center gap-2">
                <Switch checked={settingForm.loyaltyEnabled} onCheckedChange={(v) => updateField('loyaltyEnabled', v)} id="sett-loyalty" />
                <Label htmlFor="sett-loyalty" className="text-xs">Loyalty Program Enabled</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Points Per Amount</Label>
                  <Input type="number" value={settingForm.loyaltyPointsPerAmount} onChange={(e) => updateField('loyaltyPointsPerAmount', parseFloat(e.target.value) || 0)} className="bg-white/[0.04] border-white/[0.08] font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Point Value</Label>
                  <Input type="number" value={settingForm.loyaltyPointValue} onChange={(e) => updateField('loyaltyPointValue', parseFloat(e.target.value) || 0)} className="bg-white/[0.04] border-white/[0.08] font-mono" />
                </div>
              </div>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tax</h4>
              <div className="flex items-center gap-2">
                <Switch checked={settingForm.ppnEnabled} onCheckedChange={(v) => updateField('ppnEnabled', v)} id="sett-ppn" />
                <Label htmlFor="sett-ppn" className="text-xs">PPN Enabled</Label>
              </div>
              {settingForm.ppnEnabled && (
                <div className="space-y-1.5">
                  <Label className="text-xs">PPN Rate (%)</Label>
                  <Input type="number" value={settingForm.ppnRate} onChange={(e) => updateField('ppnRate', parseFloat(e.target.value) || 0)} className="bg-white/[0.04] border-white/[0.08] font-mono" />
                </div>
              )}
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Discount</h4>
              <div className="flex items-center gap-2">
                <Switch checked={settingForm.manualDiscountEnabled} onCheckedChange={(v) => updateField('manualDiscountEnabled', v)} id="sett-discount" />
                <Label htmlFor="sett-discount" className="text-xs">Manual Discount Enabled</Label>
              </div>
            </div>
          </TabsContent>

          {/* RECEIPT & PRINT TAB */}
          <TabsContent value="receipt" className="mt-4 max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt Details</h4>
              <div className="space-y-1.5">
                <Label className="text-xs">Business Name</Label>
                <Input value={settingForm.receiptBusinessName} onChange={(e) => updateField('receiptBusinessName', e.target.value)} placeholder="Business name" className="bg-white/[0.04] border-white/[0.08]" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input value={settingForm.receiptAddress} onChange={(e) => updateField('receiptAddress', e.target.value)} placeholder="Receipt address" className="bg-white/[0.04] border-white/[0.08]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={settingForm.receiptPhone} onChange={(e) => updateField('receiptPhone', e.target.value)} placeholder="Phone" className="bg-white/[0.04] border-white/[0.08]" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Logo URL</Label>
                  <Input value={settingForm.receiptLogo} onChange={(e) => updateField('receiptLogo', e.target.value)} placeholder="https://..." className="bg-white/[0.04] border-white/[0.08] font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Footer Text</Label>
                <Textarea value={settingForm.receiptFooter} onChange={(e) => updateField('receiptFooter', e.target.value)} placeholder="Thank you message..." className="bg-white/[0.04] border-white/[0.08] text-xs min-h-[50px]" />
              </div>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Print Options</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.receiptDoublePrintEnabled} onCheckedChange={(v) => updateField('receiptDoublePrintEnabled', v)} id="sett-double" />
                  <Label htmlFor="sett-double" className="text-xs">Double Print</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.receiptMerchantCopyEnabled} onCheckedChange={(v) => updateField('receiptMerchantCopyEnabled', v)} id="sett-merchant" />
                  <Label htmlFor="sett-merchant" className="text-xs">Merchant Copy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.receiptCustomerCopyEnabled} onCheckedChange={(v) => updateField('receiptCustomerCopyEnabled', v)} id="sett-customer" />
                  <Label htmlFor="sett-customer" className="text-xs">Customer Copy</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.receiptBatchOrderEnabled} onCheckedChange={(v) => updateField('receiptBatchOrderEnabled', v)} id="sett-batch" />
                  <Label htmlFor="sett-batch" className="text-xs">Batch Order</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="mt-4 max-h-[50vh] overflow-y-auto space-y-4 pr-1">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Telegram Configuration</h4>
              <div className="space-y-1.5">
                <Label className="text-xs">Bot Token</Label>
                <Input value={settingForm.telegramBotToken} onChange={(e) => updateField('telegramBotToken', e.target.value)} placeholder="123456:ABC-DEF..." className="bg-white/[0.04] border-white/[0.08] font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Chat ID</Label>
                <Input value={settingForm.telegramChatId} onChange={(e) => updateField('telegramChatId', e.target.value)} placeholder="-1001234567890" className="bg-white/[0.04] border-white/[0.08] font-mono text-xs" />
              </div>
            </div>
            <Separator className="bg-white/[0.06]" />
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notification Triggers</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyOnTransaction} onCheckedChange={(v) => updateField('notifyOnTransaction', v)} id="sett-notify-tx" />
                  <Label htmlFor="sett-notify-tx" className="text-xs">On Transaction</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyOnCustomer} onCheckedChange={(v) => updateField('notifyOnCustomer', v)} id="sett-notify-cust" />
                  <Label htmlFor="sett-notify-cust" className="text-xs">On New Customer</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyDailyReport} onCheckedChange={(v) => updateField('notifyDailyReport', v)} id="sett-notify-daily" />
                  <Label htmlFor="sett-notify-daily" className="text-xs">Daily Report</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyWeeklyReport} onCheckedChange={(v) => updateField('notifyWeeklyReport', v)} id="sett-notify-weekly" />
                  <Label htmlFor="sett-notify-weekly" className="text-xs">Weekly Report</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyMonthlyReport} onCheckedChange={(v) => updateField('notifyMonthlyReport', v)} id="sett-notify-monthly" />
                  <Label htmlFor="sett-notify-monthly" className="text-xs">Monthly Report</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={settingForm.notifyOnInsight} onCheckedChange={(v) => updateField('notifyOnInsight', v)} id="sett-notify-insight" />
                  <Label htmlFor="sett-notify-insight" className="text-xs">On AI Insight</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* THEME TAB */}
          <TabsContent value="theme" className="mt-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Primary Color</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEME_COLORS.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => updateField('themePrimaryColor', c.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-md border transition-all text-left ${settingForm.themePrimaryColor === c.key ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}
                  >
                    <div className={`h-4 w-4 rounded-full ${c.class}`} />
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== 14. CREW PERMISSION DIALOG =====================
export function CrewPermissionDialog({
  user, permission, pages, onPagesChange, onConfirm, onCancel, loading
}: {
  user: User | null; permission: CrewPermissionData | null
  pages: string[]; onPagesChange: (pages: string[]) => void
  onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  if (!user) return null

  const togglePage = (key: string) => {
    if (pages.includes(key)) {
      onPagesChange(pages.filter(p => p !== key))
    } else {
      onPagesChange([...pages, key])
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md bg-card border-white/[0.06]">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-400" /> Crew Permissions</DialogTitle>
          <DialogDescription>
            Manage page access for <strong>{user.name}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p className="text-[10px] text-muted-foreground">Select which pages this crew member can access:</p>
          <div className="space-y-2">
            {CREW_PAGES.map(page => (
              <div key={page.key} className="flex items-center gap-3 p-2 rounded-md bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.10] transition-colors">
                <Checkbox
                  checked={pages.includes(page.key)}
                  onCheckedChange={() => togglePage(page.key)}
                  id={`perm-${page.key}`}
                />
                <Label htmlFor={`perm-${page.key}`} className="text-xs cursor-pointer flex-1">{page.label}</Label>
                <span className="text-[9px] text-muted-foreground font-mono">{page.key}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">
            {pages.length} of {CREW_PAGES.length} pages enabled
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="text-xs">Cancel</Button>
          <Button onClick={onConfirm} disabled={loading || pages.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
