'use client'

import { Store, Database, X, Building2, Tag } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ViewState } from './webmaster-app'

export function SidebarNav({
  currentView,
  onNavigate,
  outlets,
  outletCount,
  enterpriseGroupCount,
  loading,
  open,
  onToggle,
}: {
  currentView: ViewState
  onNavigate: (view: ViewState) => void
  outlets: { id: string; name: string; address?: string }[]
  outletCount: number
  enterpriseGroupCount: number
  loading: boolean
  open: boolean
  onToggle: () => void
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onToggle} />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-600" />
            <span className="font-bold text-sm">Aether Webmaster</span>
          </div>
          <button
            onClick={onToggle}
            className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Main nav items */}
          <button
            onClick={() => { onNavigate({ type: 'list' }); onToggle() }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentView.type === 'list'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Store className="h-4 w-4" />
            <span className="flex-1 text-left">Semua Outlet</span>
            <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {outletCount}
            </span>
          </button>

          <button
            onClick={() => { onNavigate({ type: 'enterprise' }); onToggle() }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentView.type === 'enterprise'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Building2 className="h-4 w-4" />
            <span className="flex-1 text-left">Enterprise</span>
            {enterpriseGroupCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {enterpriseGroupCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { onNavigate({ type: 'plans' }); onToggle() }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              currentView.type === 'plans'
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Tag className="h-4 w-4" />
            <span className="flex-1 text-left">Plan & Pricing</span>
          </button>

          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outlet</p>
          </div>

          {loading && outlets.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-3 py-2 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))
          ) : (
            outlets.map((outlet) => (
              <button
                key={outlet.id}
                onClick={() => { onNavigate({ type: 'detail', outletId: outlet.id }); onToggle() }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  currentView.type === 'detail' && currentView.outletId === outlet.id
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <div className="flex-1 text-left min-w-0">
                  <p className="truncate font-medium">{outlet.name}</p>
                  <p className="text-xs opacity-60 truncate">{outlet.address || 'Tanpa alamat'}</p>
                </div>
              </button>
            ))
          )}
        </nav>

        <div className="border-t p-3">
          <p className="text-xs text-muted-foreground text-center">
            {outletCount} outlet &middot; AetherPOS
          </p>
        </div>
      </aside>
    </>
  )
}