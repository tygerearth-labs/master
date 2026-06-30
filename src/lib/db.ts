import { PrismaClient } from '@prisma/client'
import { neon } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  // Use Neon adapter for optimal serverless connection pooling
  if (databaseUrl && databaseUrl.startsWith('postgres')) {
    const sql = neon(databaseUrl)
    const adapter = new PrismaNeon(sql)
    return new PrismaClient({ adapter })
  }

  // Fallback for local SQLite dev
  return new PrismaClient()
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
