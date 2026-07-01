import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { PLANS } from '@/lib/plan-config'

// POST /api/admin/seed — Seed demo data
export async function POST() {
  try {
    // Check if data already exists
    const existingOutlets = await db.outlet.count()
    if (existingOutlets > 0) {
      return NextResponse.json({ message: 'Data already exists, skipping seed', count: existingOutlets })
    }

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Step 1: Create outlets first (without groupId — we'll add that after creating the group)
    const outlet1 = await db.outlet.create({
      data: {
        name: 'Kopi Kenangan - HQ',
        address: 'Jl. Sudirman No. 1, Jakarta',
        phone: '021-1234567',
        accountType: 'enterprise',
        isMain: true,
        planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })

    const outlet2 = await db.outlet.create({
      data: {
        name: 'Kopi Kenangan - Branch BSD',
        address: 'Jl. BSD City No. 10, Tangerang',
        phone: '021-7654321',
        accountType: 'enterprise',
        isMain: false,
        planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })

    const outlet3 = await db.outlet.create({
      data: {
        name: 'Mie Gacoan - Main',
        address: 'Jl. Dago No. 88, Bandung',
        phone: '022-1112222',
        accountType: 'pro',
        isMain: true,
        planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    const outlet4 = await db.outlet.create({
      data: {
        name: 'Warung Soto Bu Eti',
        address: 'Jl. Pahlawan No. 5, Surabaya',
        phone: '031-3334444',
        accountType: 'free',
        isMain: true,
        planExpiresAt: null,
      },
    })

    const outlet5 = await db.outlet.create({
      data: {
        name: 'Bakso Pak Kumis',
        address: 'Jl. Malioboro No. 22, Yogyakarta',
        phone: '0274-5556666',
        accountType: 'pro',
        isMain: true,
        planExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // expiring soon!
      },
    })

    const outlet6 = await db.outlet.create({
      data: {
        name: 'Es Teh Indonesia - Mall',
        address: 'Jl. Asia Afrika No. 100, Bandung',
        phone: '022-7778888',
        accountType: 'suspended:pro',
        isMain: true,
        planExpiresAt: null,
      },
    })

    const outlet7 = await db.outlet.create({
      data: {
        name: 'Nasi Padang Minang Jaya',
        address: 'Jl. M. Yamin No. 33, Medan',
        phone: '061-9990000',
        accountType: 'free',
        isMain: true,
        planExpiresAt: null,
      },
    })

    const outlet8 = await db.outlet.create({
      data: {
        name: 'Ayam Geprek Bensu',
        address: 'Jl. Gatot Subroto No. 15, Jakarta',
        phone: '021-1122334',
        accountType: 'pro',
        isMain: true,
        planExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    })

    // Step 2: Create users
    const owner1 = await db.user.create({
      data: {
        name: 'Budi Santoso',
        email: 'budi@kopikenangan.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet1.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Siti Aminah',
        email: 'siti@kopikenangan.com',
        password: hashedPassword,
        role: 'CREW',
        outletId: outlet1.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Dewi Lestari',
        email: 'dewi@kopikenangan.com',
        password: hashedPassword,
        role: 'CREW',
        outletId: outlet2.id,
      },
    })

    const owner3 = await db.user.create({
      data: {
        name: 'Raka Pratama',
        email: 'raka@miegacoan.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet3.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Ahmad Fauzi',
        email: 'ahmad@miegacoan.com',
        password: hashedPassword,
        role: 'CREW',
        outletId: outlet3.id,
      },
    })

    const owner4 = await db.user.create({
      data: {
        name: 'Eti Wulandari',
        email: 'eti@warungsoto.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet4.id,
      },
    })

    const owner5 = await db.user.create({
      data: {
        name: 'Kumis Hadi',
        email: 'kumis@baksopak.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet5.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Rina Puspita',
        email: 'rina@baksopak.com',
        password: hashedPassword,
        role: 'CREW',
        outletId: outlet5.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Denny Cahyo',
        email: 'denny@esteh.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet6.id,
      },
    })

    const owner7 = await db.user.create({
      data: {
        name: 'Andi Putra',
        email: 'andi@nasipadang.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet7.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Maya Sari',
        email: 'maya@nasipadang.com',
        password: hashedPassword,
        role: 'CREW',
        outletId: outlet7.id,
      },
    })

    await db.user.create({
      data: {
        name: 'Joko Susanto',
        email: 'joko@ayamgeprek.com',
        password: hashedPassword,
        role: 'OWNER',
        outletId: outlet8.id,
      },
    })

    // Step 3: Create outlet group with ownerId
    const group1 = await db.outletGroup.create({
      data: {
        name: 'Kopi Kenangan Group',
        ownerId: owner1.id,
      },
    })

    // Step 4: Update outlets with groupId
    await db.outlet.update({
      where: { id: outlet1.id },
      data: { groupId: group1.id },
    })

    await db.outlet.update({
      where: { id: outlet2.id },
      data: { groupId: group1.id },
    })

    // Step 5: Seed default plans (Free / Pro / Enterprise)
    const existingPlans = await db.plan.count()
    let plansSeeded = 0
    if (existingPlans === 0) {
      await db.plan.createMany({
        data: [
          {
            name: 'Free',
            slug: 'free',
            price: 0,
            duration: 30,
            features: JSON.stringify(PLANS.free),
            active: true,
            sortOrder: 0,
          },
          {
            name: 'Pro',
            slug: 'pro',
            price: 149000,
            duration: 30,
            features: JSON.stringify(PLANS.pro),
            active: true,
            sortOrder: 1,
          },
          {
            name: 'Enterprise',
            slug: 'enterprise',
            price: 499000,
            duration: 30,
            features: JSON.stringify(PLANS.enterprise),
            active: true,
            sortOrder: 2,
          },
        ],
      })
      plansSeeded = 3
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      outlets: 8,
      users: 12,
      groups: 1,
      plans: plansSeeded,
    })
  } catch (error) {
    console.error('[POST /api/admin/seed]', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
