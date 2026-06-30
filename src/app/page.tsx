'use client'

import { useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { DashboardSidebar, type ViewType } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/Header'
import { DashboardView } from '@/components/dashboard/DashboardView'
import { TransactionView } from '@/components/dashboard/TransactionView'
import { OwnerView } from '@/components/dashboard/OwnerView'
import { OutletView } from '@/components/dashboard/OutletView'
import { BranchView } from '@/components/dashboard/BranchView'
import { CrewView } from '@/components/dashboard/CrewView'
import { PlanPricingView } from '@/components/dashboard/PlanPricingView'

const views: Record<ViewType, React.FC> = {
  dashboard: DashboardView,
  transactions: TransactionView,
  owners: OwnerView,
  outlets: OutletView,
  branches: BranchView,
  crew: CrewView,
  plans: PlanPricingView,
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const ActiveComponent = views[activeView]

  return (
    <SidebarProvider>
      <DashboardSidebar activeView={activeView} onViewChange={setActiveView} />
      <SidebarInset>
        <div className="flex min-h-svh flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 lg:p-6">
            <ActiveComponent />
          </main>
          <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
            © 2025 AetherPOS Webmaster
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}