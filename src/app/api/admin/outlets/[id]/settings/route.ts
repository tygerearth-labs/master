import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default outlet settings (returned when no OutletSetting exists)
const DEFAULT_SETTINGS = {
  paymentMethods: 'CASH,QRIS',
  loyaltyEnabled: true,
  loyaltyPointsPerAmount: 10000,
  loyaltyPointValue: 100,
  receiptBusinessName: 'Aether POS',
  receiptAddress: '',
  receiptPhone: '',
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
  receiptLogo: '',
  ppnEnabled: false,
  ppnRate: 11,
  manualDiscountEnabled: false,
  receiptDoublePrintEnabled: false,
  receiptMerchantCopyEnabled: true,
  receiptCustomerCopyEnabled: true,
  receiptBatchOrderEnabled: false,
  themePrimaryColor: 'emerald',
  telegramBotToken: null,
  telegramChatId: null,
  notifyOnTransaction: true,
  notifyOnCustomer: true,
  notifyDailyReport: true,
  notifyWeeklyReport: false,
  notifyMonthlyReport: true,
  notifyOnInsight: true,
}

// GET /api/admin/outlets/[id]/settings — Get outlet settings
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const outlet = await db.outlet.findUnique({ where: { id } })
    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    const setting = await db.outletSetting.findUnique({ where: { outletId: id } })

    if (!setting) {
      // Return default values without creating a record
      return NextResponse.json({ settings: { ...DEFAULT_SETTINGS, outletId: id } })
    }

    return NextResponse.json({ settings: setting })
  } catch (error) {
    console.error('[GET /api/admin/outlets/[id]/settings]', error)
    return NextResponse.json({ error: 'Failed to fetch outlet settings' }, { status: 500 })
  }
}

// PUT /api/admin/outlets/[id]/settings — Update outlet settings (upsert)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const outlet = await db.outlet.findUnique({ where: { id } })
    if (!outlet) {
      return NextResponse.json({ error: 'Outlet not found' }, { status: 404 })
    }

    // Build update data from provided fields
    const data: Record<string, unknown> = {}
    const allowedFields = [
      'paymentMethods', 'loyaltyEnabled', 'loyaltyPointsPerAmount', 'loyaltyPointValue',
      'receiptBusinessName', 'receiptAddress', 'receiptPhone', 'receiptFooter', 'receiptLogo',
      'ppnEnabled', 'ppnRate', 'manualDiscountEnabled',
      'receiptDoublePrintEnabled', 'receiptMerchantCopyEnabled', 'receiptCustomerCopyEnabled',
      'receiptBatchOrderEnabled', 'themePrimaryColor',
      'telegramBotToken', 'telegramChatId',
      'notifyOnTransaction', 'notifyOnCustomer', 'notifyDailyReport',
      'notifyWeeklyReport', 'notifyMonthlyReport', 'notifyOnInsight',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field]
      }
    }

    // Upsert: create if not exists, update if exists
    const setting = await db.outletSetting.upsert({
      where: { outletId: id },
      update: data,
      create: {
        outletId: id,
        ...data,
      },
    })

    // Audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: setting.id,
        outletId: id,
        details: JSON.stringify({ updatedFields: Object.keys(data) }),
        performedBy: 'webmaster',
      },
    })

    return NextResponse.json({ settings: setting })
  } catch (error) {
    console.error('[PUT /api/admin/outlets/[id]/settings]', error)
    return NextResponse.json({ error: 'Failed to update outlet settings' }, { status: 500 })
  }
}
