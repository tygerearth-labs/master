'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

// ===================== STAT CARD =====================
export function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card className="bg-card border-white/[0.06]">
      <CardContent className="p-3.5">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-md ${bg} flex items-center justify-center ${color}`}>{icon}</div>
          <div>
            <p className="text-xl font-bold font-mono">{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ===================== DETAIL FIELD =====================
export function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
      <p className="text-xs font-medium mt-0.5">{value}</p>
    </div>
  )
}
