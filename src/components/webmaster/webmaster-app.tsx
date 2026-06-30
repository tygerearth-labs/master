'use client'

import { useState, useEffect, useCallback } from 'react'
import { SidebarNav } from './sidebar-nav'
import { OutletListView } from './outlet-list'
import { OutletDetailView } from './outlet-detail'
import { EnterpriseView } from './enterprise-view'
import { PlanSettingsView } from './plan-settings'

export type ViewState =
  | { type: 'list' }
  | { type: 'detail'; outletId: string }
  | { type: 'enterprise' }
  | { type: 'plans' }

export default function WebmasterApp() {
  const [view, setView] = useState<ViewState>({ type: 'list' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarOutlets, setSidebarOutlets] = useState<{ id: string; name: string; address?: string }[]>([])
  const [outletCount, setOutletCount] = useState(0)
  const [enterpriseGroupCount, setEnterpriseGroupCount] = useState(0)
  const [sidebarLoading, setSidebarLoading] = useState(true)

  const fetchSidebarOutlets = useCallback(async () => {
    setSidebarLoading(true)
    try {
      const res = await fetch('/api/webmaster/outlets?limit=100')
      if (res.ok) {
        const json = await res.json()
        setSidebarOutlets((json.records || []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          name: r.name as string,
          address: (r.address as string) || undefined,
        })))
        setOutletCount(json.total || 0)
      }
      const groupRes = await fetch('/api/webmaster/enterprise-groups')
      if (groupRes.ok) {
        const groupJson = await groupRes.json()
        setEnterpriseGroupCount(groupJson.summary?.totalGroups || 0)
      }
    } catch {
      // silent
    } finally {
      setSidebarLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSidebarOutlets()
  }, [fetchSidebarOutlets])

  const refreshSidebar = useCallback(() => {
    fetchSidebarOutlets()
  }, [fetchSidebarOutlets])

  const viewLabel = view.type === 'list' ? 'Outlet'
    : view.type === 'enterprise' ? 'Enterprise'
    : view.type === 'plans' ? 'Plan & Pricing'
    : 'Detail Outlet'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav
        currentView={view}
        onNavigate={setView}
        outlets={sidebarOutlets}
        outletCount={outletCount}
        enterpriseGroupCount={enterpriseGroupCount}
        loading={sidebarLoading}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="ml-3 font-semibold text-sm">{viewLabel}</span>
        </div>

        <div className="p-4 lg:p-6">
          {view.type === 'detail' ? (
            <OutletDetailView
              outletId={view.outletId}
              onBack={() => setView({ type: 'list' })}
              onRefreshSidebar={refreshSidebar}
            />
          ) : view.type === 'enterprise' ? (
            <EnterpriseView />
          ) : view.type === 'plans' ? (
            <PlanSettingsView />
          ) : (
            <OutletListView
              onNavigate={setView}
              onRefreshSidebar={refreshSidebar}
            />
          )}
        </div>
      </main>
    </div>
  )
}