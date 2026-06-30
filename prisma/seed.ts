import { db } from '../src/lib/db';
import { PrismaClient } from '@prisma/client';

const prisma = db as unknown as PrismaClient;

async function seed() {
  // Clear existing data
  await prisma.transaction.deleteMany();
  await prisma.crew.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.outlet.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.owner.deleteMany();
  await prisma.plan.deleteMany();

  // 1. Create Plans
  const plans = await Promise.all([
    prisma.plan.create({ data: { name: 'Starter', price: 149000, durationDays: 30, maxOutlets: 1, maxCrew: 3, features: JSON.stringify(['Basic POS', '1 Outlet', '3 Crew', 'Daily Report', 'Email Support']), isActive: true } }),
    prisma.plan.create({ data: { name: 'Business', price: 349000, durationDays: 30, maxOutlets: 5, maxCrew: 15, features: JSON.stringify(['Full POS', '5 Outlets', '15 Crew', 'Inventory Management', 'Multi Payment', 'Priority Support', 'Analytics']), isActive: true } }),
    prisma.plan.create({ data: { name: 'Enterprise', price: 749000, durationDays: 30, maxOutlets: 20, maxCrew: 50, features: JSON.stringify(['Full POS', '20 Outlets', '50 Crew', 'Advanced Inventory', 'Multi Payment', 'API Access', 'Dedicated Support', 'Custom Report', 'Multi Branch']), isActive: true } }),
    prisma.plan.create({ data: { name: 'Annual Business', price: 3490000, durationDays: 365, maxOutlets: 5, maxCrew: 15, features: JSON.stringify(['Full POS', '5 Outlets', '15 Crew', 'Inventory Management', 'Multi Payment', 'Priority Support', 'Analytics', '2 Months Free']), isActive: true } }),
  ]);

  // 2. Create Owners
  const owners = await Promise.all([
    prisma.owner.create({ data: { name: 'Andi Pratama', email: 'andi@kopisusu.id', phone: '081234567890', password: 'hashed_123', isActive: true } }),
    prisma.owner.create({ data: { name: 'Sari Dewi', email: 'sari@bakmigurita.com', phone: '082345678901', password: 'hashed_456', isActive: true } }),
    prisma.owner.create({ data: { name: 'Budi Santoso', email: 'budi@minimarket24.com', phone: '083456789012', password: 'hashed_789', isActive: true } }),
    prisma.owner.create({ data: { name: 'Maya Putri', email: 'maya@fashionhub.id', phone: '084567890123', password: 'hashed_abc', isActive: false } }),
    prisma.owner.create({ data: { name: 'Rizky Hidayat', email: 'rizky@ayamgeprek.co', phone: '085678901234', password: 'hashed_def', isActive: true } }),
  ]);

  // 3. Create Branches
  const branches = await Promise.all([
    prisma.branch.create({ data: { name: 'Kopi Susu HQ', address: 'Jl. Sudirman No. 45, Jakarta', phone: '021-5551234', ownerId: owners[0].id, isActive: true } }),
    prisma.branch.create({ data: { name: 'Kopi Susu Bandung', address: 'Jl. Dago No. 12, Bandung', phone: '022-5551234', ownerId: owners[0].id, isActive: true } }),
    prisma.branch.create({ data: { name: 'Bakmi Gurita Pusat', address: 'Jl. Gajah Mada No. 88, Jakarta', phone: '021-5555678', ownerId: owners[1].id, isActive: true } }),
    prisma.branch.create({ data: { name: 'MM24 Regional Jawa', address: 'Jl. Ahmad Yani No. 100, Surabaya', phone: '031-5559012', ownerId: owners[2].id, isActive: true } }),
    prisma.branch.create({ data: { name: 'FashionHub Flagship', address: 'Jl. Thamrin No. 1, Jakarta', phone: '021-5553456', ownerId: owners[3].id, isActive: false } }),
    prisma.branch.create({ data: { name: 'Ayam Geprek Center', address: 'Jl. Gatot Subroto No. 22, Jakarta', phone: '021-5557890', ownerId: owners[4].id, isActive: true } }),
    prisma.branch.create({ data: { name: 'Ayam Geprek Bekasi', address: 'Jl. Harapan Indah No. 55, Bekasi', phone: '021-5558901', ownerId: owners[4].id, isActive: true } }),
  ]);

  // 4. Create Outlets
  const outlets = await Promise.all([
    prisma.outlet.create({ data: { name: 'Kopi Susu Sudirman', address: 'Jl. Sudirman No. 45', branchId: branches[0].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Kopi Susu Senayan', address: 'Jl. Asia Afrika No. 8', branchId: branches[0].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Kopi Susu Dago', address: 'Jl. Dago No. 12', branchId: branches[1].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Bakmi Gurita GM', address: 'Jl. Gajah Mada No. 88', branchId: branches[2].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Bakmi Gurita KG', address: 'Jl. Boulevard Raya No. 33', branchId: branches[2].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'MM24 Juanda', address: 'Jl. Juanda No. 15', branchId: branches[3].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'MM24 Basuki', address: 'Jl. Basuki Rahmat No. 77', branchId: branches[3].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'MM24 Genteng', address: 'Jl. Genteng Besar No. 44', branchId: branches[3].id, status: 'inactive' } }),
    prisma.outlet.create({ data: { name: 'FashionHub Thamrin', address: 'Jl. Thamrin No. 1', branchId: branches[4].id, status: 'suspended' } }),
    prisma.outlet.create({ data: { name: 'Geprek Gatot Subroto', address: 'Jl. Gatot Subroto No. 22', branchId: branches[5].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Geprek Kuningan', address: 'Jl. Kuningan No. 9', branchId: branches[5].id, status: 'active' } }),
    prisma.outlet.create({ data: { name: 'Geprek Harapan Indah', address: 'Jl. Harapan Indah No. 55', branchId: branches[6].id, status: 'active' } }),
  ]);

  // 5. Create Crew
  const crewData = [
    { name: 'Rina Wati', email: 'rina@kopisusu.id', role: 'manager', outletId: outlets[0].id },
    { name: 'Dimas Arya', email: 'dimas@kopisusu.id', role: 'staff', outletId: outlets[0].id },
    { name: 'Fitri Handayani', email: 'fitri@kopisusu.id', role: 'staff', outletId: outlets[1].id },
    { name: 'Joko Widodo', email: 'joko@kopisusu.id', role: 'staff', outletId: outlets[2].id },
    { name: 'Lina Marlina', email: 'lina@bakmi.com', role: 'manager', outletId: outlets[3].id },
    { name: 'Ahmad Fauzi', email: 'ahmad@bakmi.com', role: 'staff', outletId: outlets[3].id },
    { name: 'Nurul Hidayah', email: 'nurul@bakmi.com', role: 'staff', outletId: outlets[4].id },
    { name: 'Siti Aminah', email: 'siti@mm24.com', role: 'manager', outletId: outlets[5].id },
    { name: 'Agus Setiawan', email: 'agus@mm24.com', role: 'staff', outletId: outlets[5].id },
    { name: 'Dewi Lestari', email: 'dewi@mm24.com', role: 'staff', outletId: outlets[6].id },
    { name: 'Bambang Irawan', email: 'bambang@mm24.com', role: 'staff', outletId: outlets[7].id },
    { name: 'Putri Ayu', email: 'putri@fh.id', role: 'manager', outletId: outlets[8].id },
    { name: 'Rendi Saputra', email: 'rendi@geprek.co', role: 'manager', outletId: outlets[9].id },
    { name: 'Yusuf Maulana', email: 'yusuf@geprek.co', role: 'staff', outletId: outlets[9].id },
    { name: 'Indah Permatasari', email: 'indah@geprek.co', role: 'staff', outletId: outlets[10].id },
    { name: 'Fajar Nugroho', email: 'fajar@geprek.co', role: 'staff', outletId: outlets[11].id },
  ];
  await Promise.all(crewData.map(c => prisma.crew.create({ data: { ...c, phone: '08' + String(Math.floor(Math.random() * 9000000000 + 1000000000)), password: 'hashed_' + c.name.toLowerCase().replace(/\s/g, '') } })));

  // 6. Create Subscriptions
  const now = new Date();
  await Promise.all([
    prisma.subscription.create({ data: { ownerId: owners[0].id, planId: plans[1].id, startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1), endDate: new Date(now.getFullYear(), now.getMonth() + 10, 0), status: 'active' } }),
    prisma.subscription.create({ data: { ownerId: owners[1].id, planId: plans[0].id, startDate: new Date(now.getFullYear(), now.getMonth(), 1), endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0), status: 'active' } }),
    prisma.subscription.create({ data: { ownerId: owners[2].id, planId: plans[2].id, startDate: new Date(now.getFullYear(), now.getMonth() - 5, 15), endDate: new Date(now.getFullYear(), now.getMonth() + 6, 14), status: 'active' } }),
    prisma.subscription.create({ data: { ownerId: owners[3].id, planId: plans[0].id, startDate: new Date(now.getFullYear(), now.getMonth() - 3, 1), endDate: new Date(now.getFullYear(), now.getMonth() - 2, 0), status: 'expired' } }),
    prisma.subscription.create({ data: { ownerId: owners[4].id, planId: plans[3].id, startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear() + 1, 0, 0), status: 'active' } }),
  ]);

  // 7. Create Transactions - reduced to last 30 days with fewer per outlet
  const paymentMethods = ['cash', 'qris', 'transfer', 'card'];
  const activeOutlets = outlets.filter(o => o.status === 'active');
  const branchOwnerMap: Record<string, string> = {};
  for (const b of branches) { branchOwnerMap[b.id] = b.ownerId; }
  const outletOwnerMap: Record<string, string> = {};
  for (const o of outlets) { outletOwnerMap[o.id] = branchOwnerMap[o.branchId] || ''; }

  const txCreateMany: { outletId: string; ownerId: string; invoiceNo: string; items: number; total: number; paymentMethod: string; status: string; createdAt: Date }[] = [];

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;

    for (const outlet of activeOutlets) {
      const txCount = Math.floor(Math.random() * 10) + 3; // 3-12 per day
      const ownerId = outletOwnerMap[outlet.id];
      for (let t = 0; t < txCount; t++) {
        const hour = Math.floor(Math.random() * 14) + 8;
        const minute = Math.floor(Math.random() * 60);
        const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
        const items = Math.floor(Math.random() * 6) + 1;
        const total = Math.round((items * (Math.random() * 40000 + 15000)) / 1000) * 1000;
        const pm = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        const st = Math.random() < 0.02 ? 'void' : 'completed';
        txCreateMany.push({
          outletId: outlet.id, ownerId,
          invoiceNo: `INV-${dateStr}-${String(Math.floor(Math.random()*9999)).padStart(4,'0')}`,
          items, total, paymentMethod: pm, status: st, createdAt: txDate,
        });
      }
    }
  }

  // Use createMany for speed
  await prisma.transaction.createMany({ data: txCreateMany });

  console.log('✅ Seed completed!');
  console.log(`Plans: ${plans.length}, Owners: ${owners.length}, Branches: ${branches.length}`);
  console.log(`Outlets: ${outlets.length}, Crew: ${crewData.length}, Transactions: ${txCreateMany.length}`);
}

seed().catch(console.error).finally(() => process.exit(0));