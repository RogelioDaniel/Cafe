import path from 'node:path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const fallbackDatabaseUrl = `file:${path.join(process.cwd(), 'db', 'custom.db').replaceAll('\\', '/')}`
const databaseUrl = process.env.DATABASE_URL?.trim() || fallbackDatabaseUrl

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: databaseUrl } },
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
