import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  // ==================== PLANS ====================
  const plans = await Promise.all([
    db.plan.create({
      data: {
        name: 'Free',
        slug: 'free',
        price: 0,
        duration: 1,
        sortOrder: 0,
        active: true,
        description: 'Mulai gratis, tanpa kartu kredit',
        features: JSON.stringify({
          maxOutlets: 1,
          maxProducts: 50,
          maxCrew: 3,
          maxTransactions: 100,
          loyalty: false,
          telegramNotif: false,
          outletTransfer: false,
          promo: false,
          multiOutlet: false,
        }),
      },
    }),
    db.plan.create({
      data: {
        name: 'Pro',
        slug: 'pro',
        price: 149000,
        duration: 1,
        sortOrder: 1,
        active: true,
        description: 'Untuk bisnis yang berkembang',
        paymentLink: 'https://payment.example.com/pro',
        features: JSON.stringify({
          maxOutlets: 3,
          maxProducts: 500,
          maxCrew: 10,
          maxTransactions: -1,
          loyalty: true,
          telegramNotif: true,
          outletTransfer: true,
          promo: true,
          multiOutlet: true,
        }),
      },
    }),
    db.plan.create({
      data: {
        name: 'Enterprise',
        slug: 'enterprise',
        price: 399000,
        duration: 1,
        sortOrder: 2,
        active: true,
        description: 'Solusi lengkap untuk bisnis besar',
        paymentLink: 'https://payment.example.com/enterprise',
        features: JSON.stringify({
          maxOutlets: -1,
          maxProducts: -1,
          maxCrew: -1,
          maxTransactions: -1,
          loyalty: true,
          telegramNotif: true,
          outletTransfer: true,
          promo: true,
          multiOutlet: true,
          prioritySupport: true,
          customBranding: true,
          apiAccess: true,
        }),
      },
    }),
  ]);

  // ==================== OUTLETS ====================
  const outlet1 = await db.outlet.create({
    data: {
      name: 'RNB Coffee - Gatot Subroto',
      address: 'Jl. Gatot Subroto No. 42, Jakarta',
      phone: '+6281212345678',
      accountType: 'enterprise',
      isMain: true,
      planExpiresAt: new Date('2025-12-31'),
    },
  });

  const outlet2 = await db.outlet.create({
    data: {
      name: 'RNB Coffee - Kelapa Gading',
      address: 'Mall Kelapa Gading Lt. 2, Jakarta',
      phone: '+6281212345679',
      accountType: 'enterprise',
      isMain: false,
      planExpiresAt: new Date('2025-12-31'),
    },
  });

  const outlet3 = await db.outlet.create({
    data: {
      name: 'RNB Coffee - Senayan',
      address: 'Jl. Asia Afrika No. 8, Jakarta',
      phone: '+6281212345680',
      accountType: 'pro',
      isMain: false,
      planExpiresAt: new Date('2025-09-15'),
    },
  });

  const outlet4 = await db.outlet.create({
    data: {
      name: 'Warung Sejahtera',
      address: 'Jl. Raya Bogor Km. 28, Bogor',
      phone: '+6285678901234',
      accountType: 'free',
      isMain: true,
    },
  });

  const outlet5 = await db.outlet.create({
    data: {
      name: 'Toko Maju Jaya',
      address: 'Jl. Pasar Baru No. 15, Bandung',
      phone: '+6281345678901',
      accountType: 'pro',
      isMain: true,
      planExpiresAt: new Date('2025-10-20'),
    },
  });

  // ==================== USERS (create owner first for FK) ====================
  const hashedPw = '$2b$10$dummyhashforseeddatadonotuseinprod';

  const owner1 = await db.user.create({
    data: {
      name: 'Ahmad Rizki',
      email: 'ahmad@rnbcoffee.com',
      password: hashedPw,
      role: 'OWNER',
      outletId: outlet1.id,
    },
  });

  // ==================== OUTLET GROUP ====================
  const group1 = await db.outletGroup.create({
    data: {
      name: 'RNB Coffee Group',
      ownerId: owner1.id,
    },
  });

  const users = await Promise.all([
    db.user.create({
      data: {
        name: 'Siti Nurhaliza',
        email: 'siti@rnbcoffee.com',
        password: hashedPw,
        role: 'OWNER',
        outletId: outlet2.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Budi Santoso',
        email: 'budi@rnbcoffee.com',
        password: hashedPw,
        role: 'CREW',
        outletId: outlet1.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Dewi Lestari',
        email: 'dewi@rnbcoffee.com',
        password: hashedPw,
        role: 'CREW',
        outletId: outlet1.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Raka Pratama',
        email: 'raka@rnbcoffee.com',
        password: hashedPw,
        role: 'CREW',
        outletId: outlet2.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Maya Anggraeni',
        email: 'maya@rnbcoffee.com',
        password: hashedPw,
        role: 'CREW',
        outletId: outlet3.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Hendra Wijaya',
        email: 'hendra@warungsejahtera.com',
        password: hashedPw,
        role: 'OWNER',
        outletId: outlet4.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Putri Amelia',
        email: 'putri@tokomajujaya.com',
        password: hashedPw,
        role: 'OWNER',
        outletId: outlet5.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Joko Widodo',
        email: 'joko@tokomajujaya.com',
        password: hashedPw,
        role: 'CREW',
        outletId: outlet5.id,
      },
    }),
  ]);

  // Link outlets to group
  await Promise.all([
    db.outlet.update({ where: { id: outlet1.id }, data: { groupId: group1.id } }),
    db.outlet.update({ where: { id: outlet2.id }, data: { groupId: group1.id } }),
    db.outlet.update({ where: { id: outlet3.id }, data: { groupId: group1.id } }),
  ]);

  // ==================== OUTLET SETTINGS ====================
  await Promise.all([
    db.outletSetting.create({ data: { outletId: outlet1.id } }),
    db.outletSetting.create({ data: { outletId: outlet2.id } }),
    db.outletSetting.create({ data: { outletId: outlet3.id } }),
    db.outletSetting.create({ data: { outletId: outlet4.id } }),
    db.outletSetting.create({ data: { outletId: outlet5.id } }),
  ]);

  // ==================== TRANSACTIONS (Seed data across outlets & dates) ====================
  const paymentMethods = ['CASH', 'QRIS', 'DEBIT'];
  const now = new Date();
  const transactionData: { outletId: string; userId: string; invoiceNumber: string; subtotal: number; total: number; paymentMethod: string; createdAt: Date }[] = [];

  // Helper: create invoice number
  let invCounter = 1000;
  const makeInv = (prefix: string) => {
    invCounter++;
    const d = new Date();
    const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    return `${prefix}-${dateStr}-${String(invCounter).padStart(4, '0')}`;
  };

  // Create transactions across the last 30 days
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // Skip some days randomly for realism
    if (daysAgo > 5 && Math.random() < 0.2) continue;

    const txCount = daysAgo === 0 ? 8 : daysAgo < 7 ? Math.floor(Math.random() * 12) + 5 : Math.floor(Math.random() * 15) + 3;

    for (let i = 0; i < txCount; i++) {
      const outlet = [outlet1, outlet2, outlet3, outlet4, outlet5][Math.floor(Math.random() * 5)];
      const outletUsers = users.filter(u => u.outletId === outlet.id);
      const user = outletUsers.length > 0 ? outletUsers[Math.floor(Math.random() * outletUsers.length)] : owner1;
      const subtotal = Math.floor(Math.random() * 500000) + 15000;
      const taxAmount = outlet.accountType !== 'free' ? Math.round(subtotal * 0.11) : 0;
      const total = subtotal + taxAmount;

      const txDate = new Date(date);
      txDate.setHours(Math.floor(Math.random() * 14) + 7, Math.floor(Math.random() * 60));

      transactionData.push({
        outletId: outlet.id,
        userId: user.id,
        invoiceNumber: makeInv('INV'),
        subtotal,
        total,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        createdAt: txDate,
      });
    }
  }

  // Batch insert transactions
  for (let i = 0; i < transactionData.length; i += 50) {
    const batch = transactionData.slice(i, i + 50);
    await Promise.all(
      batch.map(tx =>
        db.transaction.create({
          data: {
            ...tx,
            paidAmount: tx.total,
            change: 0,
            taxAmount: tx.total - tx.subtotal > 0 ? tx.total - tx.subtotal : 0,
          },
        })
      )
    );
  }

  // ==================== OUTLET TRANSFERS ====================
  const transfers = await Promise.all([
    db.outletTransfer.create({
      data: {
        transferNumber: 'TRF-20250610-0001',
        fromOutletId: outlet1.id,
        toOutletId: outlet2.id,
        status: 'RECEIVED',
        notes: 'Restock kopi arabika',
        createdById: owner1.id,
        outletId: outlet1.id,
        groupId: group1.id,
        receivedById: users[0].id,
        receivedAt: new Date('2025-06-11'),
      },
    }),
    db.outletTransfer.create({
      data: {
        transferNumber: 'TRF-20250612-0002',
        fromOutletId: outlet1.id,
        toOutletId: outlet3.id,
        status: 'IN_TRANSIT',
        notes: 'Stok baru untuk outlet Senayan',
        createdById: owner1.id,
        outletId: outlet1.id,
        groupId: group1.id,
      },
    }),
    db.outletTransfer.create({
      data: {
        transferNumber: 'TRF-20250615-0003',
        fromOutletId: outlet2.id,
        toOutletId: outlet3.id,
        status: 'DRAFT',
        notes: 'Transfer cup & lid',
        createdById: users[0].id,
        outletId: outlet2.id,
        groupId: group1.id,
      },
    }),
    db.outletTransfer.create({
      data: {
        transferNumber: 'TRF-20250608-0004',
        fromOutletId: outlet1.id,
        toOutletId: outlet2.id,
        status: 'CANCELLED',
        notes: 'Dibatalkan - stok cukup',
        createdById: owner1.id,
        outletId: outlet1.id,
        groupId: group1.id,
      },
    }),
    db.outletTransfer.create({
      data: {
        transferNumber: 'TRF-20250605-0005',
        fromOutletId: outlet2.id,
        toOutletId: outlet1.id,
        status: 'RECEIVED',
        notes: 'Return expired items',
        createdById: users[0].id,
        outletId: outlet2.id,
        groupId: group1.id,
        receivedById: owner1.id,
        receivedAt: new Date('2025-06-06'),
      },
    }),
  ]);

  // ==================== TRANSFER ITEMS ====================
  await Promise.all([
    db.transferItem.create({
      data: {
        transferId: transfers[0].id,
        productName: 'Kopi Arabica Gayo 1kg',
        productSku: 'KA-GAYO-001',
        quantity: 10,
        hpp: 85000,
        price: 120000,
        outletId: outlet1.id,
      },
    }),
    db.transferItem.create({
      data: {
        transferId: transfers[0].id,
        productName: 'Cup Paper 12oz (50pcs)',
        productSku: 'CP-12-050',
        quantity: 20,
        hpp: 25000,
        price: 35000,
        outletId: outlet1.id,
      },
    }),
    db.transferItem.create({
      data: {
        transferId: transfers[1].id,
        productName: 'Kopi Robusta Mandailing 1kg',
        productSku: 'KR-MDL-001',
        quantity: 5,
        hpp: 55000,
        price: 80000,
        outletId: outlet1.id,
      },
    }),
    db.transferItem.create({
      data: {
        transferId: transfers[2].id,
        productName: 'Lid Dome 12oz (50pcs)',
        productSku: 'LD-12-050',
        quantity: 15,
        hpp: 15000,
        price: 22000,
        outletId: outlet2.id,
      },
    }),
  ]);

  console.log('✅ Seed completed!');
  console.log(`  Plans: ${plans.length}`);
  console.log(`  Outlets: 5`);
  console.log(`  Users: ${1 + users.length}`);
  console.log(`  Transactions: ${transactionData.length}`);
  console.log(`  Transfers: ${transfers.length}`);
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
