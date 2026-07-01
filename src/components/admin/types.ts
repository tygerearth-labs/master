// ===================== SHARED TYPES ====================

export interface OutletOwner {
  id: string; name: string; email: string; role: string; active: boolean; createdAt: string
}

export interface Outlet {
  id: string; name: string; address: string | null; phone: string | null
  accountType: string; isMain: boolean; groupId: string | null
  planExpiresAt: string | null; createdAt: string; updatedAt: string
  users: OutletOwner[]; group?: { id: string; name: string } | null
}

export interface User {
  id: string; name: string; email: string; role: string; active: boolean
  createdAt: string; updatedAt: string
  outlet: { id: string; name: string; accountType: string; planExpiresAt: string | null }
}

export interface Plan {
  id: string; name: string; slug: string; price: number; duration: number
  paymentLink: string | null; features: string; active: boolean
  sortOrder: number; description: string | null; createdAt: string; updatedAt: string
}

export interface PlanRevenueEntry {
  outlets: number; price: number; revenue: number
}

export interface Stats {
  totalOutlets: number; totalUsers: number; totalOwners: number
  totalGroups: number; suspendedOutlets: number; expiringOutlets: number
  planBreakdown: Record<string, number>
  totalMRR: number; totalARR: number
  planRevenue: Record<string, PlanRevenueEntry>
  recentOutlets: { id: string; name: string; accountType: string; planExpiresAt: string | null; createdAt: string; owner: { id: string; name: string; email: string } | null }[]
}

export interface AuditLog {
  id: string; action: string; targetId: string; targetType: string
  details: string | null; performedBy: string; createdAt: string
}

export type NavPage = 'dashboard' | 'outlets' | 'users' | 'plans' | 'audit'
