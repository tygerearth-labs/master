'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Store, Users, Receipt, CreditCard, MapPin, Phone, Calendar, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { CrewTab } from './crew-tab'
import { TransaksiTab } from './transaksi-tab'
import { AkunTab } from './akun-tab'

const planLabel: Record<string, string> = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' }
const planVariant: Record<string, 'default' | 'secondary' | 'outline'> = { free: 'default', pro: 'secondary', enterprise: 'outline' }

function formatDate(val: string): string {
  try {
    return new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return val }
}

export function OutletDetailView({
  outletId,
  onBack,
  onRefreshSidebar,
}: {
  outletId: string
  onBack: () => void
  onRefreshSidebar: () => void
}) {
  const [outlet, setOutlet] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOutlet = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/webmaster/outlets/${outletId}`)
      if (res.ok) {
        const json = await res.json()
        setOutlet(json)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [outletId])

  useEffect(() => { fetchOutlet() }, [fetchOutlet])

  const refreshOutlet = useCallback(() => { fetchOutlet(); onRefreshSidebar() }, [fetchOutlet, onRefreshSidebar])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3"><Skeleton className="h-9 w-9" /><Skeleton className="h-7 w-48" /></div>
        <Card><CardContent className="p-6 space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</CardContent></Card>
      </div>
    )
  }

  if (!outlet) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-muted-foreground">Outlet tidak ditemukan</p>
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Kembali</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate">{String(outlet.name)}</h1>
          <p className="text-sm text-muted-foreground truncate">{String(outlet.address || 'Tanpa alamat')}</p>
        </div>
        <Badge variant={planVariant[String(outlet.accountType)] || 'default'} className="flex-shrink-0">
          <Crown className="h-3 w-3 mr-1" />
          {planLabel[String(outlet.accountType)] || String(outlet.accountType)}
        </Badge>
      </div>

      {/* Outlet Info Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Telepon</p>
              <p className="text-sm font-medium truncate">{String(outlet.phone || '-')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Alamat</p>
              <p className="text-sm font-medium truncate">{String(outlet.address || '-')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Terdaftar</p>
              <p className="text-sm font-medium">{outlet.createdAt ? formatDate(String(outlet.createdAt)) : '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Plan</p>
              <p className="text-sm font-medium">{planLabel[String(outlet.accountType)] || String(outlet.accountType)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="crew">
        <TabsList>
          <TabsTrigger value="crew" className="gap-1.5">
            <Users className="h-4 w-4" /> Crew
          </TabsTrigger>
          <TabsTrigger value="transaksi" className="gap-1.5">
            <Receipt className="h-4 w-4" /> Transaksi
          </TabsTrigger>
          <TabsTrigger value="akun" className="gap-1.5">
            <CreditCard className="h-4 w-4" /> Akun
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crew" className="mt-4">
          <CrewTab outletId={outletId} onRefresh={refreshOutlet} />
        </TabsContent>

        <TabsContent value="transaksi" className="mt-4">
          <TransaksiTab outletId={outletId} />
        </TabsContent>

        <TabsContent value="akun" className="mt-4">
          <AkunTab outletId={outletId} outlet={outlet} onRefresh={refreshOutlet} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
