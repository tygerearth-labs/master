'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Shield, Users, Store, Plus, Loader2, RefreshCw,
  LayoutDashboard, CreditCard, ScrollText, Menu, X, Building2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getOriginalPlan, CREW_PAGES } from '@/lib/plan-config'

import type {
  Outlet, User, Plan, Stats, AuditLog, NavPage,
  OutletGroup, OutletSetting, CrewPermissionData,
  OutletFormData, UserFormData, SettingFormData
} from '@/components/admin/types'
import {
  EmptyState, DashboardPage, OutletsPage, UsersPage,
  PlansPage, AuditPage, GroupsPage
} from '@/components/admin/pages'
import {
  PlanChangeDialog, DurationChangeDialog, ResetPasswordDialog,
  SuspendUserDialog, ChangeOwnerDialog, OutletDetailDialog,
  PlanFormDialog, DeletePlanDialog, OutletFormDialog,
  DeleteOutletDialog, UserFormDialog, DeleteUserDialog,
  OutletSettingsDialog, CrewPermissionDialog,
  type PlanFormData
} from '@/components/admin/dialogs'

// ===================== HELPERS =====================
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ===================== NAV ITEMS =====================
const NAV_ITEMS: { id: NavPage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'outlets', label: 'Outlets', icon: <Store className="h-4 w-4" /> },
  { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
  { id: 'plans', label: 'Plans & Pricing', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'groups', label: 'Groups', icon: <Building2 className="h-4 w-4" /> },
  { id: 'audit', label: 'Audit Log', icon: <ScrollText className="h-4 w-4" /> },
]

// ===================== DEFAULT SETTINGS FORM =====================
function defaultSettingForm(): SettingFormData {
  return {
    paymentMethods: 'CASH,QRIS',
    loyaltyEnabled: true, loyaltyPointsPerAmount: 10000, loyaltyPointValue: 100,
    receiptBusinessName: 'Aether POS', receiptAddress: '', receiptPhone: '',
    receiptFooter: 'Terima kasih atas kunjungan Anda!', receiptLogo: '',
    ppnEnabled: false, ppnRate: 11,
    manualDiscountEnabled: false,
    receiptDoublePrintEnabled: false, receiptMerchantCopyEnabled: true,
    receiptCustomerCopyEnabled: true, receiptBatchOrderEnabled: false,
    themePrimaryColor: 'emerald',
    telegramBotToken: '', telegramChatId: '',
    notifyOnTransaction: true, notifyOnCustomer: true,
    notifyDailyReport: true, notifyWeeklyReport: false,
    notifyMonthlyReport: true, notifyOnInsight: true,
  }
}

// ===================== MAIN COMPONENT =====================
export default function AdminDashboard() {
  const { toast } = useToast()
  const [page, setPage] = useState<NavPage>('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [groups, setGroups] = useState<OutletGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [outletPage, setOutletPage] = useState(1)
  const [outletTotal, setOutletTotal] = useState(0)
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [searchOutlet, setSearchOutlet] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterAction, setFilterAction] = useState('')
  const [filterEntityType, setFilterEntityType] = useState('')

  // Sidebar mobile state
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ====== EXISTING DIALOG STATES ======
  const [planDialogOutlet, setPlanDialogOutlet] = useState<Outlet | null>(null)
  const [durationDialogOutlet, setDurationDialogOutlet] = useState<Outlet | null>(null)
  const [resetPwUser, setResetPwUser] = useState<User | null>(null)
  const [suspendUser, setSuspendUser] = useState<User | null>(null)
  const [changeOwnerOutlet, setChangeOwnerOutlet] = useState<Outlet | null>(null)
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState<string>('')
  const [detailOutlet, setDetailOutlet] = useState<Outlet | null>(null)
  const [planEditDialog, setPlanEditDialog] = useState<Plan | null>(null)
  const [planCreateDialog, setPlanCreateDialog] = useState(false)
  const [deletePlanDialog, setDeletePlanDialog] = useState<Plan | null>(null)

  // ====== NEW DIALOG STATES ======
  const [outletFormDialog, setOutletFormDialog] = useState<{ open: boolean; isEdit: boolean; outlet: Outlet | null }>({ open: false, isEdit: false, outlet: null })
  const [deleteOutletDialog, setDeleteOutletDialog] = useState<Outlet | null>(null)
  const [userFormDialog, setUserFormDialog] = useState<{ open: boolean; isEdit: boolean; user: User | null }>({ open: false, isEdit: false, user: null })
  const [deleteUserDialog, setDeleteUserDialog] = useState<User | null>(null)
  const [settingsDialog, setSettingsDialog] = useState<Outlet | null>(null)
  const [permissionDialog, setPermissionDialog] = useState<User | null>(null)
  const [groupCreateDialog, setGroupCreateDialog] = useState(false)
  const [deleteGroupDialog, setDeleteGroupDialog] = useState<OutletGroup | null>(null)

  // ====== FORM STATES ======
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [applyToGroup, setApplyToGroup] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState<string>('1')
  const [customMonths, setCustomMonths] = useState('')
  const [customExpiryDate, setCustomExpiryDate] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [suspendGroup, setSuspendGroup] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Plan form
  const [planForm, setPlanForm] = useState<PlanFormData>({ name: '', slug: '', price: 0, duration: 1, paymentLink: '', description: '', active: true, sortOrder: 0, features: '{}' })

  // Outlet form
  const [outletForm, setOutletForm] = useState<OutletFormData>({ name: '', address: '', phone: '', accountType: 'free', isMain: false, groupId: '' })

  // User form
  const [userForm, setUserForm] = useState<UserFormData>({ name: '', email: '', password: '', role: 'CREW', outletId: '' })

  // Settings form
  const [settingsData, setSettingsData] = useState<OutletSetting | null>(null)
  const [settingForm, setSettingForm] = useState<SettingFormData>(defaultSettingForm())

  // Permissions
  const [permissionData, setPermissionData] = useState<CrewPermissionData | null>(null)
  const [permissionPages, setPermissionPages] = useState<string[]>(['pos'])

  // Group form
  const [groupForm, setGroupForm] = useState<{ name: string; ownerId: string }>({ name: '', ownerId: '' })

  // ===================== DATA FETCHING =====================
  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats')
    if (res.ok) { const data = await res.json(); setStats(data) }
  }, [])

  const fetchOutlets = useCallback(async () => {
    const params = new URLSearchParams({ page: outletPage.toString(), limit: '10', search: searchOutlet, plan: filterPlan === 'all' ? '' : filterPlan })
    const res = await fetch(`/api/admin/outlets?${params}`)
    if (res.ok) { const data = await res.json(); setOutlets(data.outlets); setOutletTotal(data.total) }
  }, [outletPage, searchOutlet, filterPlan])

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: userPage.toString(), limit: '10', search: searchUser })
    const res = await fetch(`/api/admin/users?${params}`)
    if (res.ok) { const data = await res.json(); setUsers(data.users); setUserTotal(data.total) }
  }, [userPage, searchUser])

  const fetchPlans = useCallback(async () => {
    const res = await fetch('/api/admin/plans')
    if (res.ok) { const data = await res.json(); setPlans(data.plans || data) }
  }, [])

  const fetchAuditLogs = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAction) params.set('action', filterAction)
    if (filterEntityType) params.set('entityType', filterEntityType)
    const res = await fetch(`/api/admin/audit-logs?${params}`)
    if (res.ok) { const data = await res.json(); setAuditLogs(data.logs) }
  }, [filterAction, filterEntityType])

  const fetchGroups = useCallback(async () => {
    const res = await fetch('/api/admin/groups')
    if (res.ok) { const data = await res.json(); setGroups(data.groups || data) }
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchStats(), fetchOutlets(), fetchUsers(), fetchPlans(), fetchAuditLogs(), fetchGroups()])
    setLoading(false)
  }, [fetchStats, fetchOutlets, fetchUsers, fetchPlans, fetchAuditLogs, fetchGroups])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchStats(), fetchOutlets(), fetchUsers(), fetchPlans(), fetchAuditLogs(), fetchGroups()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const doFetch = async () => { await fetchOutlets() }
    doFetch()
  }, [outletPage, searchOutlet, filterPlan])

  useEffect(() => {
    const doFetch = async () => { await fetchUsers() }
    doFetch()
  }, [userPage, searchUser])

  useEffect(() => {
    const doFetch = async () => { await fetchAuditLogs() }
    doFetch()
  }, [filterAction, filterEntityType])

  // Close sidebar on page change (mobile)
  const handlePageChange = (p: NavPage) => {
    setPage(p)
    setSidebarOpen(false)
  }

  // ===================== EXISTING ACTIONS =====================
  const handleSeed = async () => {
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Seeded', description: data.message }); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleChangePlan = async () => {
    if (!planDialogOutlet) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/outlets/${planDialogOutlet.id}/plan`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: selectedPlan, applyToGroup }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Plan Changed', description: `${planDialogOutlet.name}: ${data.previousPlan} → ${data.newPlan}` }); setPlanDialogOutlet(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleChangeDuration = async () => {
    if (!durationDialogOutlet) return
    setActionLoading(true)
    try {
      let months: number | null = null; let expiresAt: string | null = null
      if (selectedDuration === 'custom_date') {
        if (!customExpiryDate) { toast({ title: 'Error', description: 'Please select an expiry date', variant: 'destructive' }); setActionLoading(false); return }
        expiresAt = customExpiryDate
      } else if (selectedDuration === '0') {
        months = 0
      } else if (selectedDuration === '-1') {
        const parsed = parseInt(customMonths)
        if (!parsed || parsed <= 0) { toast({ title: 'Error', description: 'Custom duration must be at least 1 month', variant: 'destructive' }); setActionLoading(false); return }
        months = parsed
      } else {
        months = parseInt(selectedDuration)
      }
      const res = await fetch(`/api/admin/outlets/${durationDialogOutlet.id}/duration`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months, expiresAt, applyToGroup }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Duration Updated', description: `${durationDialogOutlet.name}: ${data.newExpiresAt ? formatDate(data.newExpiresAt) : 'No Expiry'}` }); setDurationDialogOutlet(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleResetPassword = async () => {
    if (!resetPwUser || newPassword.length < 6) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${resetPwUser.id}/reset-password`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Password Reset', description: data.message }); setResetPwUser(null); setNewPassword('') }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleSuspend = async (suspend: boolean) => {
    if (!suspendUser) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${suspendUser.id}/suspend`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suspend, suspendGroup: suspendUser.role === 'OWNER' ? suspendGroup : false }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: suspend ? 'Suspended' : 'Unsuspended', description: `${suspendUser.name} (${suspendUser.email})` }); setSuspendUser(null); setSuspendGroup(false); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleChangeOwner = async () => {
    if (!changeOwnerOutlet || !selectedNewOwnerId) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/outlets/${changeOwnerOutlet.id}/change-owner`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOwnerId: selectedNewOwnerId }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Owner Changed', description: `${changeOwnerOutlet.name}: ${data.previousOwner?.name || 'None'} → ${data.newOwner.name}` }); setChangeOwnerOutlet(null); setSelectedNewOwnerId(''); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  // ===================== PLAN CRUD =====================
  const handleSavePlan = async () => {
    setActionLoading(true)
    try {
      const isEdit = !!planEditDialog
      const url = isEdit ? `/api/admin/plans/${planEditDialog!.id}` : '/api/admin/plans'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: planForm.name, slug: planForm.slug, price: planForm.price,
          duration: planForm.duration, paymentLink: planForm.paymentLink || null,
          description: planForm.description || null, active: planForm.active,
          sortOrder: planForm.sortOrder, features: planForm.features,
        }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: isEdit ? 'Plan Updated' : 'Plan Created', description: data.name || data.plan?.name }); setPlanEditDialog(null); setPlanCreateDialog(false); fetchPlans() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleDeletePlan = async () => {
    if (!deletePlanDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/plans/${deletePlanDialog.id}`, { method: 'DELETE' })
      if (res.ok) { toast({ title: 'Plan Deleted' }); setDeletePlanDialog(null); fetchPlans() }
      else toast({ title: 'Failed', variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const openPlanEdit = (plan: Plan) => {
    setPlanForm({
      name: plan.name, slug: plan.slug, price: plan.price, duration: plan.duration,
      paymentLink: plan.paymentLink || '', description: plan.description || '',
      active: plan.active, sortOrder: plan.sortOrder, features: plan.features,
    })
    setPlanEditDialog(plan)
  }

  const openPlanCreate = () => {
    setPlanForm({ name: '', slug: '', price: 0, duration: 1, paymentLink: '', description: '', active: true, sortOrder: plans.length, features: '{}' })
    setPlanCreateDialog(true)
  }

  // ===================== OUTLET CRUD =====================
  const handleSaveOutlet = async () => {
    setActionLoading(true)
    try {
      const isEdit = outletFormDialog.isEdit
      const url = isEdit ? `/api/admin/outlets/${outletFormDialog.outlet!.id}` : '/api/admin/outlets'
      const method = isEdit ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: outletForm.name,
        address: outletForm.address || null,
        phone: outletForm.phone || null,
      }
      if (!isEdit) {
        body.accountType = outletForm.accountType
        body.isMain = outletForm.isMain
        body.groupId = outletForm.groupId || null
      }
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: isEdit ? 'Outlet Updated' : 'Outlet Created', description: data.name }); setOutletFormDialog({ open: false, isEdit: false, outlet: null }); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleDeleteOutlet = async () => {
    if (!deleteOutletDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/outlets/${deleteOutletDialog.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Outlet Deleted', description: deleteOutletDialog.name }); setDeleteOutletDialog(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const openOutletCreate = () => {
    setOutletForm({ name: '', address: '', phone: '', accountType: 'free', isMain: false, groupId: '' })
    setOutletFormDialog({ open: true, isEdit: false, outlet: null })
  }

  const openOutletEdit = (outlet: Outlet) => {
    setOutletForm({ name: outlet.name, address: outlet.address || '', phone: outlet.phone || '', accountType: outlet.accountType, isMain: outlet.isMain, groupId: outlet.groupId || '' })
    setOutletFormDialog({ open: true, isEdit: true, outlet })
  }

  // ===================== USER CRUD =====================
  const handleSaveUser = async () => {
    setActionLoading(true)
    try {
      const isEdit = userFormDialog.isEdit
      const url = isEdit ? `/api/admin/users/${userFormDialog.user!.id}` : '/api/admin/users'
      const method = isEdit ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: userForm.name,
        email: userForm.email,
      }
      if (!isEdit) {
        body.password = userForm.password
        body.role = userForm.role
        body.outletId = userForm.outletId
      } else {
        if (userForm.role) body.role = userForm.role
      }
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: isEdit ? 'User Updated' : 'User Created', description: data.name || data.email }); setUserFormDialog({ open: false, isEdit: false, user: null }); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleDeleteUser = async () => {
    if (!deleteUserDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUserDialog.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) { toast({ title: 'User Deleted', description: deleteUserDialog.name }); setDeleteUserDialog(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const openUserCreate = () => {
    setUserForm({ name: '', email: '', password: '', role: 'CREW', outletId: '' })
    setUserFormDialog({ open: true, isEdit: false, user: null })
  }

  const openUserEdit = (user: User) => {
    setUserForm({ name: user.name, email: user.email, password: '', role: user.role, outletId: user.outlet.id })
    setUserFormDialog({ open: true, isEdit: true, user })
  }

  // ===================== SETTINGS =====================
  const handleOpenSettings = async (outlet: Outlet) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/outlets/${outlet.id}/settings`)
      if (res.ok) {
        const data = await res.json()
        const s = data.settings || data
        setSettingsData(s)
        setSettingForm({
          paymentMethods: s.paymentMethods || 'CASH,QRIS',
          loyaltyEnabled: s.loyaltyEnabled ?? true,
          loyaltyPointsPerAmount: s.loyaltyPointsPerAmount ?? 10000,
          loyaltyPointValue: s.loyaltyPointValue ?? 100,
          receiptBusinessName: s.receiptBusinessName || 'Aether POS',
          receiptAddress: s.receiptAddress || '',
          receiptPhone: s.receiptPhone || '',
          receiptFooter: s.receiptFooter || '',
          receiptLogo: s.receiptLogo || '',
          ppnEnabled: s.ppnEnabled ?? false,
          ppnRate: s.ppnRate ?? 11,
          manualDiscountEnabled: s.manualDiscountEnabled ?? false,
          receiptDoublePrintEnabled: s.receiptDoublePrintEnabled ?? false,
          receiptMerchantCopyEnabled: s.receiptMerchantCopyEnabled ?? true,
          receiptCustomerCopyEnabled: s.receiptCustomerCopyEnabled ?? true,
          receiptBatchOrderEnabled: s.receiptBatchOrderEnabled ?? false,
          themePrimaryColor: s.themePrimaryColor || 'emerald',
          telegramBotToken: s.telegramBotToken || '',
          telegramChatId: s.telegramChatId || '',
          notifyOnTransaction: s.notifyOnTransaction ?? true,
          notifyOnCustomer: s.notifyOnCustomer ?? true,
          notifyDailyReport: s.notifyDailyReport ?? true,
          notifyWeeklyReport: s.notifyWeeklyReport ?? false,
          notifyMonthlyReport: s.notifyMonthlyReport ?? true,
          notifyOnInsight: s.notifyOnInsight ?? true,
        })
        setSettingsDialog(outlet)
      }
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleSaveSettings = async () => {
    if (!settingsDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/outlets/${settingsDialog.id}/settings`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingForm),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Settings Saved', description: settingsDialog.name }); setSettingsDialog(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  // ===================== CREW PERMISSIONS =====================
  const handleOpenPermissions = async (user: User) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/permissions`)
      if (res.ok) {
        const data = await res.json()
        const p = data.permissions || data
        setPermissionData(p)
        setPermissionPages(p.pages ? p.pages.split(',').filter(Boolean) : ['pos'])
        setPermissionDialog(user)
      }
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleSavePermissions = async () => {
    if (!permissionDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${permissionDialog.id}/permissions`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages: permissionPages.join(',') }),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Permissions Updated', description: `${permissionDialog.name}: ${permissionPages.join(', ')}` }); setPermissionDialog(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  // ===================== GROUPS =====================
  const handleCreateGroup = async () => {
    if (!groupForm.name || !groupForm.ownerId) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm),
      })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Group Created', description: data.name }); setGroupCreateDialog(false); setGroupForm({ name: '', ownerId: '' }); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  const handleDeleteGroup = async () => {
    if (!deleteGroupDialog) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/groups/${deleteGroupDialog.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) { toast({ title: 'Group Deleted', description: deleteGroupDialog.name }); setDeleteGroupDialog(null); loadAll() }
      else toast({ title: 'Failed', description: data.error, variant: 'destructive' })
    } catch { toast({ title: 'Error', variant: 'destructive' }) }
    setActionLoading(false)
  }

  // ===================== RENDER =====================
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="text-sm text-muted-foreground font-mono">Loading Command Center...</p>
        </div>
      </div>
    )
  }

  const hasNoData = stats && stats.totalOutlets === 0

  // Get all owners for group creation
  const allOwners = users.filter(u => u.role === 'OWNER')

  return (
    <div className="min-h-screen flex bg-background">
      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`
        w-56 border-r border-white/[0.06] bg-card/50 flex flex-col shrink-0 fixed h-full z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-emerald-500/15 flex items-center justify-center">
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight">AetherPOS</h1>
                <p className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase">Command Center</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
                page === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 glow-emerald'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">v0.3.0</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={loadAll} title="Refresh">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 min-w-0 min-h-screen flex flex-col lg:ml-56">
        {/* Top bar */}
        <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold truncate">{NAV_ITEMS.find(n => n.id === page)?.label}</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Manage your AetherPOS infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasNoData && (
              <Button size="sm" onClick={handleSeed} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {actionLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                <span className="hidden sm:inline">Seed Data</span>
                <span className="sm:hidden">Seed</span>
              </Button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {hasNoData ? (
            <EmptyState onSeed={handleSeed} loading={actionLoading} />
          ) : (
            <>
              {page === 'dashboard' && <DashboardPage stats={stats} outlets={outlets} />}
              {page === 'outlets' && (
                <OutletsPage
                  outlets={outlets} total={outletTotal} page={outletPage} search={searchOutlet}
                  filterPlan={filterPlan} plans={plans}
                  onSearch={(v) => { setSearchOutlet(v); setOutletPage(1) }}
                  onFilter={(v) => { setFilterPlan(v); setOutletPage(1) }}
                  onPageChange={setOutletPage}
                  onPlanChange={(o) => { setPlanDialogOutlet(o); setSelectedPlan(getOriginalPlan(o.accountType)); setApplyToGroup(!!o.groupId) }}
                  onDurationChange={(o) => { setDurationDialogOutlet(o); setSelectedDuration('1'); setCustomMonths(''); setCustomExpiryDate(''); setApplyToGroup(!!o.groupId) }}
                  onChangeOwner={(o) => { setChangeOwnerOutlet(o); setSelectedNewOwnerId('') }}
                  onViewDetail={setDetailOutlet}
                  onCreate={openOutletCreate}
                  onEdit={openOutletEdit}
                  onDelete={setDeleteOutletDialog}
                  onEditSettings={handleOpenSettings}
                />
              )}
              {page === 'users' && (
                <UsersPage
                  users={users} total={userTotal} page={userPage} search={searchUser}
                  outlets={outlets}
                  onSearch={(v) => { setSearchUser(v); setUserPage(1) }}
                  onPageChange={setUserPage}
                  onResetPw={(u) => { setResetPwUser(u); setNewPassword('') }}
                  onSuspend={(u) => { setSuspendUser(u); setSuspendGroup(!!(u.outlet as { groupId?: string | null }).groupId) }}
                  onCreate={openUserCreate}
                  onEdit={openUserEdit}
                  onDelete={setDeleteUserDialog}
                  onManagePermissions={handleOpenPermissions}
                />
              )}
              {page === 'plans' && (
                <PlansPage
                  plans={plans}
                  onEdit={openPlanEdit}
                  onCreate={openPlanCreate}
                  onDelete={setDeletePlanDialog}
                />
              )}
              {page === 'groups' && (
                <GroupsPage
                  groups={groups}
                  onCreate={() => { setGroupForm({ name: '', ownerId: '' }); setGroupCreateDialog(true) }}
                  onDelete={setDeleteGroupDialog}
                />
              )}
              {page === 'audit' && (
                <AuditPage
                  logs={auditLogs}
                  filterAction={filterAction}
                  filterEntityType={filterEntityType}
                  onFilterAction={setFilterAction}
                  onFilterEntityType={setFilterEntityType}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] px-4 sm:px-6 lg:px-8 py-3 mt-auto">
          <p className="text-[10px] text-muted-foreground font-mono">
            AetherPOS Command Center · {stats?.totalOutlets ?? 0} outlets · {stats?.totalUsers ?? 0} users
          </p>
        </footer>
      </main>

      {/* ===== EXISTING DIALOGS ===== */}
      <PlanChangeDialog
        outlet={planDialogOutlet} selectedPlan={selectedPlan}
        onPlanChange={setSelectedPlan} applyToGroup={applyToGroup}
        onApplyToGroup={setApplyToGroup} onConfirm={handleChangePlan}
        onCancel={() => setPlanDialogOutlet(null)} loading={actionLoading}
      />
      <DurationChangeDialog
        outlet={durationDialogOutlet} selectedDuration={selectedDuration}
        onDurationChange={setSelectedDuration} customMonths={customMonths}
        onCustomMonths={setCustomMonths} customExpiryDate={customExpiryDate}
        onCustomExpiryDate={setCustomExpiryDate} applyToGroup={applyToGroup}
        onApplyToGroup={setApplyToGroup} onConfirm={handleChangeDuration}
        onCancel={() => setDurationDialogOutlet(null)} loading={actionLoading}
      />
      <ResetPasswordDialog
        user={resetPwUser} newPassword={newPassword}
        onPasswordChange={setNewPassword} onConfirm={handleResetPassword}
        onCancel={() => { setResetPwUser(null); setNewPassword('') }} loading={actionLoading}
      />
      <SuspendUserDialog
        user={suspendUser} suspendGroup={suspendGroup}
        onSuspendGroup={setSuspendGroup} onConfirm={handleSuspend}
        onCancel={() => { setSuspendUser(null); setSuspendGroup(false) }} loading={actionLoading}
      />
      <ChangeOwnerDialog
        outlet={changeOwnerOutlet} selectedNewOwnerId={selectedNewOwnerId}
        onNewOwnerChange={setSelectedNewOwnerId} onConfirm={handleChangeOwner}
        onCancel={() => { setChangeOwnerOutlet(null); setSelectedNewOwnerId('') }} loading={actionLoading}
      />
      <OutletDetailDialog
        outlet={detailOutlet} plans={plans}
        onEditSettings={() => { if (detailOutlet) handleOpenSettings(detailOutlet) }}
        onManagePermissions={(user) => { setDetailOutlet(null); handleOpenPermissions(user) }}
        onClose={() => setDetailOutlet(null)}
      />

      {/* Plan Edit/Create Dialog */}
      <PlanFormDialog
        open={planEditDialog !== null || planCreateDialog}
        isEdit={!!planEditDialog} plan={planEditDialog}
        planForm={planForm} onFormChange={setPlanForm}
        onConfirm={handleSavePlan}
        onCancel={() => { setPlanEditDialog(null); setPlanCreateDialog(false) }}
        loading={actionLoading}
      />
      <DeletePlanDialog
        plan={deletePlanDialog}
        onConfirm={handleDeletePlan}
        onCancel={() => setDeletePlanDialog(null)}
        loading={actionLoading}
      />

      {/* ===== NEW DIALOGS ===== */}
      {/* Outlet CRUD */}
      <OutletFormDialog
        open={outletFormDialog.open} isEdit={outletFormDialog.isEdit}
        outlet={outletFormDialog.outlet} outletForm={outletForm}
        onFormChange={setOutletForm} onConfirm={handleSaveOutlet}
        onCancel={() => setOutletFormDialog({ open: false, isEdit: false, outlet: null })}
        loading={actionLoading} groups={groups}
      />
      <DeleteOutletDialog
        outlet={deleteOutletDialog}
        onConfirm={handleDeleteOutlet}
        onCancel={() => setDeleteOutletDialog(null)}
        loading={actionLoading}
      />

      {/* User CRUD */}
      <UserFormDialog
        open={userFormDialog.open} isEdit={userFormDialog.isEdit}
        user={userFormDialog.user} userForm={userForm}
        onFormChange={setUserForm} onConfirm={handleSaveUser}
        onCancel={() => setUserFormDialog({ open: false, isEdit: false, user: null })}
        loading={actionLoading} outlets={outlets}
      />
      <DeleteUserDialog
        user={deleteUserDialog}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteUserDialog(null)}
        loading={actionLoading}
      />

      {/* Outlet Settings */}
      <OutletSettingsDialog
        outlet={settingsDialog} settings={settingsData}
        settingForm={settingForm} onFormChange={setSettingForm}
        onConfirm={handleSaveSettings}
        onCancel={() => setSettingsDialog(null)}
        loading={actionLoading}
      />

      {/* Crew Permissions */}
      <CrewPermissionDialog
        user={permissionDialog} permission={permissionData}
        pages={permissionPages} onPagesChange={setPermissionPages}
        onConfirm={handleSavePermissions}
        onCancel={() => setPermissionDialog(null)}
        loading={actionLoading}
      />

      {/* Group Create Dialog (simple inline) */}
      {groupCreateDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setGroupCreateDialog(false)}>
          <div className="bg-card border border-white/[0.06] rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold">Create Outlet Group</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Group Name</label>
                <input className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="e.g. RNB Group" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Owner</label>
                <select className="w-full bg-white/[0.04] border border-white/[0.08] rounded-md px-3 py-2 text-sm" value={groupForm.ownerId} onChange={(e) => setGroupForm({ ...groupForm, ownerId: e.target.value })}>
                  <option value="">Select owner...</option>
                  {allOwners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setGroupCreateDialog(false)} className="text-xs">Cancel</Button>
              <Button size="sm" onClick={handleCreateGroup} disabled={actionLoading || !groupForm.name || !groupForm.ownerId} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                {actionLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Group Delete Dialog */}
      {deleteGroupDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteGroupDialog(null)}>
          <div className="bg-card border border-white/[0.06] rounded-lg p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-red-400">Delete Group</h3>
            <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{deleteGroupDialog.name}</strong>? Outlets in this group will become standalone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteGroupDialog(null)} className="text-xs">Cancel</Button>
              <Button size="sm" onClick={handleDeleteGroup} disabled={actionLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs">
                {actionLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
