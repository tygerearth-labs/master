'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Receipt,
  Users,
  Store,
  GitBranch,
  UserCog,
  CreditCard,
} from 'lucide-react'

export type ViewType = 'dashboard' | 'transactions' | 'owners' | 'outlets' | 'branches' | 'crew' | 'plans'

const navItems: { key: ViewType; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transaksi', icon: Receipt },
  { key: 'owners', label: 'Owner', icon: Users },
  { key: 'outlets', label: 'Outlet', icon: Store },
  { key: 'branches', label: 'Branch', icon: GitBranch },
  { key: 'crew', label: 'Crew', icon: UserCog },
  { key: 'plans', label: 'Plan & Pricing', icon: CreditCard },
]

interface DashboardSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export function DashboardSidebar({ activeView, onViewChange }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
            AP
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate">AetherPOS</span>
            <span className="text-xs text-muted-foreground truncate">Webmaster Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={activeView === item.key}
                    tooltip={item.label}
                    onClick={() => onViewChange(item.key)}
                    className={
                      activeView === item.key
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : ''
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}