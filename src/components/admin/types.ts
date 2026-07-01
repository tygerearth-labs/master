// ===================== SHARED TYPES ====================

export interface OutletOwner {
  id: string; name: string; email: string; role: string; active: boolean; createdAt: string
  crewPermission?: { pages: string } | null
}

export interface Outlet {
  id: string; name: string; address: string | null; phone: string | null
  accountType: string; isMain: boolean; groupId: string | null
  planExpiresAt: string | null; createdAt: string; updatedAt: string
  users: OutletOwner[]; group?: { id: string; name: string } | null
  setting?: OutletSetting | null
}

export interface User {
  id: string; name: string; email: string; role: string; active: boolean
  createdAt: string; updatedAt: string
  outlet: { id: string; name: string; accountType: string; planExpiresAt: string | null }
  crewPermission?: CrewPermissionData | null
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
  totalProducts: number; totalCustomers: number; totalTransactions: number
  outletsWithSettings: number
  recentOutlets: { id: string; name: string; accountType: string; planExpiresAt: string | null; createdAt: string; owner: { id: string; name: string; email: string } | null }[]
}

export interface AuditLog {
  id: string; action: string; entityType: string; entityId: string | null
  details: string | null; outletId: string; userId: string
  createdAt: string
  user?: { id: string; name: string; email: string } | null
  outlet?: { id: string; name: string } | null
}

export interface OutletSetting {
  id: string; outletId: string
  paymentMethods: string
  loyaltyEnabled: boolean; loyaltyPointsPerAmount: number; loyaltyPointValue: number
  receiptBusinessName: string; receiptAddress: string; receiptPhone: string
  receiptFooter: string; receiptLogo: string
  ppnEnabled: boolean; ppnRate: number
  manualDiscountEnabled: boolean
  receiptDoublePrintEnabled: boolean; receiptMerchantCopyEnabled: boolean
  receiptCustomerCopyEnabled: boolean; receiptBatchOrderEnabled: boolean
  themePrimaryColor: string
  telegramBotToken: string | null; telegramChatId: string | null
  notifyOnTransaction: boolean; notifyOnCustomer: boolean
  notifyDailyReport: boolean; notifyWeeklyReport: boolean
  notifyMonthlyReport: boolean; notifyOnInsight: boolean
  createdAt: string; updatedAt: string
}

export interface CrewPermissionData {
  id: string; userId: string; pages: string; outletId: string
  createdAt: string; updatedAt: string
}

export interface OutletGroup {
  id: string; name: string; ownerId: string; createdAt: string; updatedAt: string
  owner?: { id: string; name: string; email: string } | null
  outlets?: { id: string; name: string; accountType: string }[]
}

export type NavPage = 'dashboard' | 'outlets' | 'users' | 'plans' | 'audit' | 'groups'

// Form data types
export interface OutletFormData {
  name: string; address: string; phone: string; accountType: string; isMain: boolean; groupId: string
}

export interface UserFormData {
  name: string; email: string; password: string; role: string; outletId: string
}

export interface SettingFormData {
  paymentMethods: string
  loyaltyEnabled: boolean; loyaltyPointsPerAmount: number; loyaltyPointValue: number
  receiptBusinessName: string; receiptAddress: string; receiptPhone: string
  receiptFooter: string; receiptLogo: string
  ppnEnabled: boolean; ppnRate: number
  manualDiscountEnabled: boolean
  receiptDoublePrintEnabled: boolean; receiptMerchantCopyEnabled: boolean
  receiptCustomerCopyEnabled: boolean; receiptBatchOrderEnabled: boolean
  themePrimaryColor: string
  telegramBotToken: string; telegramChatId: string
  notifyOnTransaction: boolean; notifyOnCustomer: boolean
  notifyDailyReport: boolean; notifyWeeklyReport: boolean
  notifyMonthlyReport: boolean; notifyOnInsight: boolean
}
