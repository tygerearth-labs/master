'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">
          AetherPOS{' '}
          <span className="text-emerald-600 dark:text-emerald-400">Webmaster</span>
        </h1>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="h-9 w-9"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  )
}