/**
 * plan-config.ts — Plan Feature Matrix & Constants
 * Adapted from AetherPOS for the Command Center admin panel.
 */

export type AccountType = 'free' | 'pro' | 'enterprise'

export const VALID_ACCOUNT_TYPES: AccountType[] = ['free', 'pro', 'enterprise']

export function getPlanLabel(accountType: string): string {
  if (accountType.startsWith('suspended:')) {
    const original = accountType.replace('suspended:', '')
    return `${getPlanLabel(original)} (Suspended)`
  }
  switch (accountType) {
    case 'free': return 'Free'
    case 'pro': return 'Pro'
    case 'enterprise': return 'Enterprise'
    default: return 'Free'
  }
}

export function isSuspended(accountType: string): boolean {
  return accountType.startsWith('suspended:')
}

export function getOriginalPlan(accountType: string): AccountType {
  if (accountType.startsWith('suspended:')) {
    return accountType.replace('suspended:', '') as AccountType
  }
  return accountType as AccountType
}

export function getPlanBadgeClasses(accountType: string): string {
  if (isSuspended(accountType)) return 'bg-red-500/10 border-red-500/20 text-red-400'
  switch (accountType) {
    case 'pro': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
    case 'enterprise': return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    default: return 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
  }
}

export const PLAN_DURATIONS = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '30 Days (1 Month)', days: 30 },
  { label: '90 Days (3 Months)', days: 90 },
  { label: '180 Days (6 Months)', days: 180 },
  { label: '365 Days (1 Year)', days: 365 },
  { label: 'Custom', days: -1 },
] as const

export interface PlanFeatures {
  maxProducts: number
  maxCategories: number
  productImage: boolean
  maxCrew: number
  crewPermissions: boolean
  maxCustomers: number
  loyaltyProgram: boolean
  maxTransactionsPerMonth: number
  exportExcel: boolean
  maxPromos: number
  auditLog: boolean
  stockMovement: boolean
  dashboardAnalytics: boolean
  aiInsights: boolean
  forecasting: boolean
  maxOutlets: number
  offlineMode: boolean
  multiOutlet: boolean
  bulkUpload: boolean
  transactionSummary: boolean
  apiAccess: boolean
  prioritySupport: boolean
}

export const PLANS: Record<AccountType, PlanFeatures> = {
  free: {
    maxProducts: 50,
    maxCategories: 5,
    productImage: false,
    maxCrew: 2,
    crewPermissions: false,
    maxCustomers: 100,
    loyaltyProgram: true,
    maxTransactionsPerMonth: 500,
    exportExcel: true,
    maxPromos: 2,
    auditLog: true,
    stockMovement: true,
    dashboardAnalytics: true,
    aiInsights: false,
    forecasting: false,
    maxOutlets: 1,
    offlineMode: true,
    multiOutlet: false,
    bulkUpload: false,
    transactionSummary: false,
    apiAccess: false,
    prioritySupport: false,
  },
  pro: {
    maxProducts: -1,
    maxCategories: -1,
    productImage: true,
    maxCrew: -1,
    crewPermissions: true,
    maxCustomers: -1,
    loyaltyProgram: true,
    maxTransactionsPerMonth: -1,
    exportExcel: true,
    maxPromos: -1,
    auditLog: true,
    stockMovement: true,
    dashboardAnalytics: true,
    aiInsights: true,
    forecasting: true,
    maxOutlets: 5,
    offlineMode: true,
    multiOutlet: true,
    bulkUpload: true,
    transactionSummary: true,
    apiAccess: true,
    prioritySupport: true,
  },
  enterprise: {
    maxProducts: -1,
    maxCategories: -1,
    productImage: true,
    maxCrew: -1,
    crewPermissions: true,
    maxCustomers: -1,
    loyaltyProgram: true,
    maxTransactionsPerMonth: -1,
    exportExcel: true,
    maxPromos: -1,
    auditLog: true,
    stockMovement: true,
    dashboardAnalytics: true,
    aiInsights: true,
    forecasting: true,
    maxOutlets: -1,
    offlineMode: true,
    multiOutlet: true,
    bulkUpload: true,
    transactionSummary: true,
    apiAccess: true,
    prioritySupport: true,
  },
}

export function formatLimit(value: number): string {
  return value === -1 ? 'Unlimited' : String(value)
}

// Feature display config for the plan comparison table
export const FEATURE_ROWS: { key: keyof PlanFeatures; label: string; type: 'number' | 'boolean' }[] = [
  { key: 'maxProducts', label: 'Products', type: 'number' },
  { key: 'maxCategories', label: 'Categories', type: 'number' },
  { key: 'productImage', label: 'Product Images', type: 'boolean' },
  { key: 'maxCrew', label: 'Crew Members', type: 'number' },
  { key: 'crewPermissions', label: 'Crew Permissions', type: 'boolean' },
  { key: 'maxCustomers', label: 'Customers', type: 'number' },
  { key: 'loyaltyProgram', label: 'Loyalty Program', type: 'boolean' },
  { key: 'maxTransactionsPerMonth', label: 'Transactions/mo', type: 'number' },
  { key: 'exportExcel', label: 'Export Excel', type: 'boolean' },
  { key: 'maxPromos', label: 'Promos', type: 'number' },
  { key: 'auditLog', label: 'Audit Log', type: 'boolean' },
  { key: 'stockMovement', label: 'Stock Movement', type: 'boolean' },
  { key: 'dashboardAnalytics', label: 'Dashboard Analytics', type: 'boolean' },
  { key: 'aiInsights', label: 'AI Insights', type: 'boolean' },
  { key: 'forecasting', label: 'Forecasting', type: 'boolean' },
  { key: 'maxOutlets', label: 'Outlets', type: 'number' },
  { key: 'offlineMode', label: 'Offline Mode', type: 'boolean' },
  { key: 'multiOutlet', label: 'Multi Outlet', type: 'boolean' },
  { key: 'bulkUpload', label: 'Bulk Upload', type: 'boolean' },
  { key: 'transactionSummary', label: 'Transaction Summary', type: 'boolean' },
  { key: 'apiAccess', label: 'API Access', type: 'boolean' },
  { key: 'prioritySupport', label: 'Priority Support', type: 'boolean' },
]

// Pricing display
export const PLAN_PRICING: Record<AccountType, { price: number; label: string }> = {
  free: { price: 0, label: 'Free' },
  pro: { price: 149000, label: 'Rp 149.000' },
  enterprise: { price: 499000, label: 'Rp 499.000' },
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
}
